import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import {
    APIGatewayProxyEventPathParameters,
    APIGatewayProxyEventQueryStringParameters,
} from 'aws-lambda';

export class Validator<T> {
    validate: ValidateFunction<T>;

    constructor(schema: JSONSchemaType<T>) {
        const ajv = new Ajv();
        this.validate = ajv.compile(schema);
    }

    validateRequestBody(body?: string) {
        return this.validateData(body);
    }

    validateParameters(
        parameters?: APIGatewayProxyEventPathParameters | APIGatewayProxyEventQueryStringParameters,
    ): T {
        if (!parameters) {
            throw new Error();
        }
        const request: Record<string, unknown> = {};
        Object.entries(parameters).forEach(([key, value]) => {
            if (!value) return;
            request[key] = value;
            const valueArray = value.split(',');
            if (valueArray.length > 1) {
                request[key] = valueArray;
            }
        });
        return this.validateData(request);
    }

    private validateData(data: unknown): T {
        if (this.validate(data)) {
            return data as T;
        } else {
            console.log(this.validate.errors);
            throw new Error();
        }
    }
}
