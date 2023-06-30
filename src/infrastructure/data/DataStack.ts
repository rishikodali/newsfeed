import { App, Stack, StackProps } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { DynamoDbTable } from '@infrastructure/data/DynamoDbTable';
import { S3Bucket } from '@infrastructure/data/S3Bucket';

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
    bucket: IBucket;

    constructor(scope: App, id: string, props: DataStackProps) {
        super(scope, id, props);

        const dynamoDbTable = new DynamoDbTable(this, 'dynamodb-table', {
            appName: props.appName,
            region: props.env.region,
            primaryRegion: props.primaryRegion,
            regions: props.regions,
        });
        this.table = dynamoDbTable.table;

        const s3Bucket = new S3Bucket(this, 's3-bucket', {
            appName: props.appName,
            account: props.env.acccount,
            region: props.env.region,
            primaryRegion: props.primaryRegion,
            regions: props.regions,
        });
        this.bucket = s3Bucket.bucket;
    }
}
