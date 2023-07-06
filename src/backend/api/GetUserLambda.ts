import { Database } from '@backend/shared/Database';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserService } from '../service/user/UserService';
import { getLambdaConfig } from '@backend/shared/LambdaConfig';

export interface GetUserLambdaConfig {
    tableName: string;
}

export class GetUserLambda {
    database: Database;
    userService: UserService;

    constructor() {
        const config = getLambdaConfig<GetUserLambdaConfig>();
        this.database = new Database({ tableName: config.tableName });
        this.userService = new UserService({ database: this.database });
    }

    async handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<void>> {
        try {
            await this.userService.getUser({ email: 'test' });
            return {
                statusCode: 201,
            };
        } catch (error) {
            error instanceof Error && console.log(error);
        }
    }
}

export const getUserLambda = new GetUserLambda();
export const handler = getUserLambda.handler.bind(getUserLambda);
