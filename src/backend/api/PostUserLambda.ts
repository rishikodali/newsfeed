import { JSONSchemaType } from 'ajv';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Database } from '@backend/shared/Database';
import { getLambdaConfig } from '@backend/shared/LambdaConfig';
import { Validator } from '@backend/shared/Validator';
import { CreateUserRequest } from '@backend/service/user/User';
import { UserService } from '@backend/service/user/UserService';

export interface PostUserLambdaConfig {
    tableName: string;
}

const $CreateUserRequest: JSONSchemaType<CreateUserRequest> = {
    type: 'object',
    properties: {
        email: { type: 'string' },
    },
    required: ['email'],
    additionalProperties: false,
};

export class PostUserLambda {
    private validator: Validator<CreateUserRequest>;
    private database: Database;
    private userService: UserService;

    constructor() {
        const config = getLambdaConfig<PostUserLambdaConfig>();
        this.validator = new Validator($CreateUserRequest);
        this.database = new Database({ tableName: config.tableName });
        this.userService = new UserService({ database: this.database });
    }

    async handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<void>> {
        try {
            const request = this.validator.validateRequestBody(event.body);
            await this.userService.createUser(request);
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
