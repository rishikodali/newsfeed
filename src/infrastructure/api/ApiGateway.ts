import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Construct } from 'constructs';

export interface ApiGatewayProps {
    appName: string;
    routeMap: {
        path: string;
        method: HttpMethod;
        lambdaFunction: IFunction;
    }[];
}

export class ApiGateway extends Construct {
    api: HttpApi;

    constructor(scope: Construct, id: string, props: ApiGatewayProps) {
        super(scope, id);

        this.api = new HttpApi(this, 'http-api', {
            apiName: props.appName,
            createDefaultStage: true,
            disableExecuteApiEndpoint: true,
        });

        props.routeMap.forEach((route) => {
            const lambdaIntegration = new HttpLambdaIntegration(
                'lambda-integration',
                route.lambdaFunction,
            );
            this.api.addRoutes({
                path: route.path,
                methods: [route.method],
                integration: lambdaIntegration,
            });
        });
    }
}
