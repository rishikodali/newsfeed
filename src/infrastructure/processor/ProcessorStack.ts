import { SourceProcessor } from '@infrastructure/processor/SourceProcessor';
import { App, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Queue } from 'aws-cdk-lib/aws-sqs';

export interface ProcessorStackProps extends StackProps {
    appName: string;
    table: ITable;
    bucket: IBucket;
}

export class ProcessorStack extends Stack {
    constructor(scope: App, id: string, props: ProcessorStackProps) {
        super(scope, id, props);

        const deadLetterQueue = new Queue(this, 'dead-letter-queue', {
            queueName: `${props.appName}-dead-letter.fifo`,
            contentBasedDeduplication: true,
            retentionPeriod: Duration.days(10),
            visibilityTimeout: Duration.minutes(1),
        });

        new SourceProcessor(this, 'hackernews-processor', {
            appName: props.appName,
            deadLetterQueue,
            source: 'hackernews',
            lamdbaFile: 'HackerNewsProcessor.ts',
            lambdaConfig: {},
        });
    }
}
