import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import {
    APIGatewayProxyEventPathParameters,
    APIGatewayProxyEventQueryStringParameters,
} from 'aws-lambda';

export interface ValidatorProps<T> {
    schema: JSONSchemaType<T>;
}

export class Validator<T> {
    validate: ValidateFunction<T>;

    constructor(props: ValidatorProps<T>) {
        const ajv = new Ajv();
        this.validate = ajv.compile(props.schema);
    }

    validateRequestBody(body?: string) {
        if (!body) {
            throw new Error();
        }
        return this.validateData(JSON.parse(body));
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
            return data;
        } else {
            console.log(this.validate.errors);
            throw new Error();
        }
    }
}
