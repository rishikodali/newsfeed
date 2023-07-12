import { App, Stack, StackProps } from 'aws-cdk-lib';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { GetUserLambdaConfig } from '@backend/api/GetUserLambda';
import { PostUserLambdaConfig } from '@backend/api/PostUserLambda';
import { ApiGateway } from '@infrastructure/api/ApiGateway';
import { ApiLambda } from '@infrastructure/api/ApiLambda';

export interface ApiStackProps extends StackProps {
    env: {
        acccount: string;
        region: string;
    };
    appName: string;
    table: ITable;
}

export class ApiStack extends Stack {
    api: HttpApi;

    constructor(scope: App, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const getUserLambdaConfig: GetUserLambdaConfig = {
            tableName: this.resolve(props.table.tableName),
        };
        const getUserLambda = new ApiLambda(this, 'get-user-lambda', {
            appName: props.appName,
            functionName: 'get-user',
            file: 'GetUserLambda.ts',
            lambdaConfig: getUserLambdaConfig,
        });
        props.table.grantReadData(getUserLambda.lambdaFunction);

        const postUserLambdaConfig: PostUserLambdaConfig = {
            tableName: this.resolve(props.table.tableName),
        };
        const postUserLambda = new ApiLambda(this, 'post-user-lambda', {
            appName: props.appName,
            functionName: 'post-user',
            file: 'PostUserLambda.ts',
            lambdaConfig: postUserLambdaConfig,
        });
        props.table.grantReadWriteData(postUserLambda.lambdaFunction);

        const apiGateway = new ApiGateway(this, 'api-gateway', {
            appName: props.appName,
            routeMap: [
                {
                    path: '/user',
                    method: HttpMethod.POST,
                    lambdaFunction: postUserLambda.lambdaFunction,
                },
                {
                    path: '/user/{email}',
                    method: HttpMethod.GET,
                    lambdaFunction: getUserLambda.lambdaFunction,
                },
            ],
        });
        this.api = apiGateway.api;
    }
}
