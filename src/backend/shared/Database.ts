import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    DeleteCommandInput,
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandInput,
    PutCommand,
    PutCommandInput,
    QueryCommand,
    QueryCommandInput,
    TransactWriteCommand,
    UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';

export type ExistsRequest = { keys: Record<string, unknown>; index?: string };
export type QueryRequest = Omit<QueryCommandInput, 'TableName'>;
export type GetRequest = Omit<GetCommandInput, 'TableName'>;
export type PutRequest<T extends Record<string, NativeAttributeValue>> = Omit<
    PutCommandInput,
    'TableName' | 'Item'
> & { Item: T };
export type UpdateRequest = Omit<UpdateCommandInput, 'TableName'>;
export type DeleteRequest = Omit<DeleteCommandInput, 'TableName'>;
export type WriteTransactionRequest = {
    Put?: Omit<PutCommandInput, 'TableName'>;
    Update?: Omit<UpdateCommandInput, 'TableName'>;
    Delete?: Omit<DeleteCommandInput, 'TableName'>;
}[];

export type QueryResponse<T> = T[];
export type GetResponse<T> = T;

export interface DatabaseProps {
    tableName: string;
}

export class Database {
    client: DynamoDBDocumentClient;
    tableName: string;

    constructor(props: DatabaseProps) {
        const dyanmoDbClient = new DynamoDBClient({});
        this.client = DynamoDBDocumentClient.from(dyanmoDbClient);
        this.tableName = props.tableName;
    }

    async exists(input: ExistsRequest): Promise<boolean> {
        const keys = Object.entries(input.keys);
        const expressionAttributeValues = Object.fromEntries(
            keys.map(([name, value]) => [`:${name}`, value]),
        );
        const keyConditionExpression = keys.map(([name]) => `${name} = :${name}`).join(' and ');
        const projectionExpression = Object.keys(input.keys).join(', ');

        const request = new QueryCommand({
            TableName: this.tableName,
            ExpressionAttributeValues: expressionAttributeValues,
            KeyConditionExpression: keyConditionExpression,
            ProjectionExpression: projectionExpression,
            ...(input.index && { IndexName: input.index }),
        });
        const response = await this.client.send(request);
        return !!response.Items?.length;
    }

    async query<T>(input: QueryRequest): Promise<QueryResponse<T>> {
        const request = new QueryCommand({
            TableName: this.tableName,
            ...input,
        });
        const response = await this.client.send(request);
        return response.Items as QueryResponse<T>;
    }

    async getItem<T>(input: GetRequest): Promise<GetResponse<T>> {
        const request = new GetCommand({
            TableName: this.tableName,
            ...input,
        });
        const response = await this.client.send(request);
        return response.Item as GetResponse<T>;
    }

    async putItem<T extends Record<string, NativeAttributeValue>>(
        input: PutRequest<T>,
    ): Promise<void> {
        const request = new PutCommand({
            TableName: this.tableName,
            ...input,
        });
        await this.client.send(request);
    }

    async deleteItem(input: DeleteRequest): Promise<void> {
        const request = new DeleteCommand({
            TableName: this.tableName,
            ...input,
        });
        await this.client.send(request);
    }

    async writeTransaction(input: WriteTransactionRequest): Promise<void> {
        const transactItems = input.map((transactItem) => {
            return Object.entries(transactItem).map(([requestType, request]) => {
                return {
                    [requestType]: {
                        TableName: this.tableName,
                        ...request,
                    },
                };
            });
        });

        const request = new TransactWriteCommand({ TransactItems: transactItems });
        await this.client.send(request);
    }
}
