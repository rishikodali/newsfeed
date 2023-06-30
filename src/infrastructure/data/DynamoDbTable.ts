import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';

export interface DynamoDbTableProps {
    appName: string;
    region: string;
    primaryRegion: string;
    regions: string[];
}

export class DynamoDbTable extends Construct {
    table: ITable;

    constructor(scope: Construct, id: string, props: DynamoDbTableProps) {
        super(scope, id);

        const tableName = props.appName;

        if (props.region === props.primaryRegion) {
            const replicationRegions = props.regions.filter(
                (region) => region !== props.primaryRegion,
            );

            const table = new Table(this, 'global-table', {
                tableName,
                replicationRegions,
                partitionKey: { name: 'pk', type: AttributeType.STRING },
                sortKey: { name: 'sk', type: AttributeType.STRING },
                billingMode: BillingMode.PAY_PER_REQUEST,
                removalPolicy: RemovalPolicy.DESTROY,
            });

            table.addGlobalSecondaryIndex({
                indexName: 'ReverseIndex',
                partitionKey: { name: 'sk', type: AttributeType.STRING },
                sortKey: { name: 'pk', type: AttributeType.STRING },
            });

            this.table = table;
        } else {
            this.table = Table.fromTableName(this, 'regional-table', tableName);
        }
    }
}
