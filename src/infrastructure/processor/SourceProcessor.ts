import { Duration } from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface SourceProcessorProps {
    appName: string;
    deadLetterQueue: Queue;
    source: string;
    lamdbaFile: string;
    lambdaConfig: unknown;
}

export class SourceProcessor extends Construct {
    scheduledQueue: Queue;
    triggeredQueue: Queue;

    constructor(scope: Construct, id: string, props: SourceProcessorProps) {
        super(scope, id);

        this.scheduledQueue = new Queue(this, 'scheduled-queue', {
            queueName: `${props.appName}-scheduled.fifo`,
            contentBasedDeduplication: true,
            retentionPeriod: Duration.days(1),
            visibilityTimeout: Duration.minutes(1),
            deadLetterQueue: {
                maxReceiveCount: 2,
                queue: props.deadLetterQueue,
            },
        });

        this.triggeredQueue = new Queue(this, 'triggered-queue', {
            queueName: `${props.appName}-triggered.fifo`,
            contentBasedDeduplication: true,
            retentionPeriod: Duration.days(1),
            visibilityTimeout: Duration.minutes(1),
            deadLetterQueue: {
                maxReceiveCount: 2,
                queue: props.deadLetterQueue,
            },
        });

        const codeDirectory = join(__dirname, '../../backend/processor');

        new NodejsFunction(this, 'function', {
            functionName: `${props.appName}-${props.source}-processor`,
            entry: join(codeDirectory, props.lamdbaFile),
            architecture: Architecture.ARM_64,
            runtime: Runtime.NODEJS_18_X,
            memorySize: 256,
            timeout: Duration.seconds(10),
            logRetention: RetentionDays.ONE_WEEK,
            bundling: {
                define: {
                    'process.env.CONFIG': JSON.stringify(props.lambdaConfig),
                },
            },
        });
    }
}
