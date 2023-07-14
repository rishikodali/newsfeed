import { ZoneRecord } from '@infrastructure/network/ZoneRecord';
import { App, Stack, StackProps } from 'aws-cdk-lib';

export interface NetworkStackProps extends StackProps {
    env: {
        account: string;
        region: string;
    };
    appName: string;
    stage: string;
    primaryRegion: string;
    parentDomainName: string;
    parentAwsAccount: string;
}

export class NetworkStack extends Stack {
    constructor(scope: App, id: string, props: NetworkStackProps) {
        super(scope, id, props);

        new ZoneRecord(this, 'zone-record', {
            appName: props.appName,
            stage: props.stage,
            region: props.env.region,
            primaryRegion: props.primaryRegion,
            parentDomainName: props.parentDomainName,
            parentAwsAccount: props.parentAwsAccount,
        });
    }
}
