import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BlockPublicAccess, Bucket, IBucket } from 'aws-cdk-lib/aws-s3';

export interface S3BucketProps {
    appName: string;
    account: string;
    region: string;
    primaryRegion: string;
    regions: string[];
}

export class S3Bucket extends Construct {
    bucket: IBucket;

    constructor(scope: Construct, id: string, props: S3BucketProps) {
        super(scope, id);

        const bucketName = `${props.account}-${props.appName}`;

        if (props.region === props.primaryRegion) {
            this.bucket = new Bucket(this, 'bucket', {
                bucketName,
                enforceSSL: true,
                blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
                autoDeleteObjects: true,
                removalPolicy: RemovalPolicy.DESTROY,
            });
        } else {
            this.bucket = Bucket.fromBucketName(this, 'bucket', bucketName);
        }
    }
}
