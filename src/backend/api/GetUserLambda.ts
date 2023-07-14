import { JSONSchemaType } from 'ajv';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { GetUserRequest } from '@backend/module/user/UserModel';
import { UserService } from '@backend/module/user/UserService';
import { Database } from '@backend/shared/Database';
import { getLambdaConfig } from '@backend/shared/LambdaConfig';
import { Validator } from '@backend/shared/Validator';

export interface GetUserLambdaConfig {
    tableName: string;
}

const $GetUserRequest: JSONSchemaType<GetUserRequest> = {
    type: 'object',
    properties: {
        email: { type: 'string' },
    },
    required: ['email'],
    additionalProperties: false,
};

export class GetUserLambda {
    private validator: Validator<GetUserRequest>;
    private database: Database;
    private userService: UserService;

    constructor() {
        const config = getLambdaConfig<GetUserLambdaConfig>();
        this.validator = new Validator({ schema: $GetUserRequest });
        this.database = new Database({ tableName: config.tableName });
        this.userService = new UserService({ database: this.database });
    }

    async handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
        try {
            console.log(event);
            const request = this.validator.validateParameters(event.pathParameters);
            const result = await this.userService.getUser(request);
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (error) {
            error instanceof Error && console.log(error);
            throw new Error();
        }
    }
}

export const getUserLambda = new GetUserLambda();
export const handler = getUserLambda.handler.bind(getUserLambda);
