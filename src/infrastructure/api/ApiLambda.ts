import { join } from 'path';
import { Duration } from 'aws-cdk-lib';
import { Architecture, IFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface ApiLambdaProps {
    appName: string;
    functionName: string;
    file: string;
    lambdaConfig: unknown;
}

export class ApiLambda extends Construct {
    lambdaFunction: IFunction;

    constructor(scope: Construct, id: string, props: ApiLambdaProps) {
        super(scope, id);

        const codeDirectory = join(__dirname, '../../backend/api');

        this.lambdaFunction = new NodejsFunction(this, 'function', {
            functionName: `${props.appName}-${props.functionName}`,
            entry: join(codeDirectory, props.file),
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
