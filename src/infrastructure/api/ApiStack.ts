import { App, Stack, StackProps } from 'aws-cdk-lib';
import { ApiMapping, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { GetUserLambdaConfig } from '@backend/api/GetUserApi';
import { PostUserLambdaConfig } from '@backend/api/PostUserApi';
import { ApiGateway } from '@infrastructure/api/ApiGateway';
import { ApiLambda } from '@infrastructure/api/ApiLambda';
import { DomainRecord } from '@infrastructure/network/DomainRecord';

export interface ApiStackProps extends StackProps {
    env: {
        account: string;
        region: string;
    };
    appName: string;
    table: ITable;
    domainRecord: DomainRecord;
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
            file: 'GetUserApi.ts',
            lambdaConfig: getUserLambdaConfig,
        });
        props.table.grantReadData(getUserLambda.lambdaFunction);

        const postUserLambdaConfig: PostUserLambdaConfig = {
            tableName: this.resolve(props.table.tableName),
        };
        const postUserLambda = new ApiLambda(this, 'post-user-lambda', {
            appName: props.appName,
            functionName: 'post-user',
            file: 'PostUserApi.ts',
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

        new ApiMapping(this, 'regional-api-mapping', {
            api: this.api,
            domainName: props.domainRecord.regionalDomain,
        });

        new ApiMapping(this, 'global-api-mapping', {
            api: this.api,
            domainName: props.domainRecord.globalDomain,
        });
    }
}
