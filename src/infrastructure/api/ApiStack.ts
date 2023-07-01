import { App, Stack, StackProps } from 'aws-cdk-lib';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { ApiGateway } from '@infrastructure/api/ApiGateway';
import { ApiLambda } from '@infrastructure/api/ApiLambda';

export interface ApiStackProps extends StackProps {
    env: {
        acccount: string;
        region: string;
    };
    appName: string;
}

export class ApiStack extends Stack {
    api: HttpApi;

    constructor(scope: App, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const postUserLambda = new ApiLambda(this, 'post-user-lambda', {
            appName: props.appName,
            functionName: 'post-user',
            file: 'PostUserLambda.ts',
            environmentVariables: {},
        });

        const apiGateway = new ApiGateway(this, 'api-gateway', {
            appName: props.appName,
            routeMap: [
                {
                    path: '/user/{user}',
                    method: HttpMethod.POST,
                    lambdaFunction: postUserLambda.lambdaFunction,
                },
            ],
        });
        this.api = apiGateway.api;
    }
}
