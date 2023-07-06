import { Database } from '@backend/shared/Database';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserService } from '../service/user/UserService';

export class PostUserLambda {
    database: Database;
    userService: UserService;

    constructor() {
        const tableName = '';
        this.database = new Database({ tableName });
        this.userService = new UserService({ database: this.database });
    }

    async handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<void>> {
        try {
            await this.userService.createUser({ email: 'test' });
            return {
                statusCode: 201,
            };
        } catch (error) {
            error instanceof Error && console.log(error);
        }
    }
}

export const postUserLambda = new PostUserLambda();
export const handler = postUserLambda.handler.bind(postUserLambda);
