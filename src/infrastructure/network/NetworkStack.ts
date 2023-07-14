import { App, Stack, StackProps } from 'aws-cdk-lib';
import { DomainRecord } from '@infrastructure/network/DomainRecord';
import { ZoneRecord } from '@infrastructure/network/ZoneRecord';

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
    domainRecord: DomainRecord;

    constructor(scope: App, id: string, props: NetworkStackProps) {
        super(scope, id, props);

        const zoneRecord = new ZoneRecord(this, 'zone-record', {
            appName: props.appName,
            stage: props.stage,
            region: props.env.region,
            primaryRegion: props.primaryRegion,
            parentDomainName: props.parentDomainName,
            parentAwsAccount: props.parentAwsAccount,
        });

        this.domainRecord = new DomainRecord(this, 'domain-record', {
            region: props.env.region,
            hostedZone: zoneRecord.hostedZone,
            certificate: zoneRecord.certificate,
        });
    }
}
