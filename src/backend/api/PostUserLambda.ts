import { JSONSchemaType } from 'ajv';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { CreateUserRequest } from '@backend/module/user/UserModel';
import { UserService } from '@backend/module/user/UserService';
import { Database } from '@backend/shared/Database';
import { getLambdaConfig } from '@backend/shared/LambdaConfig';
import { Validator } from '@backend/shared/Validator';

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
        this.validator = new Validator({ schema: $CreateUserRequest });
        this.database = new Database({ tableName: config.tableName });
        this.userService = new UserService({ database: this.database });
    }

    async handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
        try {
            const request = this.validator.validateRequestBody(event.body);
            await this.userService.createUser(request);
            return {
                statusCode: 201,
            };
        } catch (error) {
            error instanceof Error && console.log(error);
            throw new Error();
        }
    }
}

export const postUserLambda = new PostUserLambda();
export const handler = postUserLambda.handler.bind(postUserLambda);
