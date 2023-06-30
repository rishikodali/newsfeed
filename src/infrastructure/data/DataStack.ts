import { App, Stack, StackProps } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDbTable } from '@infrastructure/data/DynamoDbTable';

export interface DataStackProps extends StackProps {
    env: {
        acccount: string;
        region: string;
    };
    appName: string;
    primaryRegion: string;
    regions: string[];
    local: boolean;
}

export class DataStack extends Stack {
    table: ITable;

    constructor(scope: App, id: string, props: DataStackProps) {
        super(scope, id, props);

        const replicationRegions = props.regions.filter((region) => region !== props.primaryRegion);

        const dynamoDbTable = new DynamoDbTable(this, 'dynamodb-table', {
            appName: props.appName,
            region: props.env.region,
            primaryRegion: props.primaryRegion,
            replicationRegions,
        });
        this.table = dynamoDbTable.table;
    }
}
