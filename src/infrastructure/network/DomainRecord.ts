import { DomainName } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { CfnRecordSet, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface DomainRecordProps {
    region: string;
    hostedZone: IHostedZone;
    certificate: Certificate;
}

export class DomainRecord extends Construct {
    regionalDomain: DomainName;
    regionalRecord: CfnRecordSet;
    globalDomain: DomainName;
    globalRecord: CfnRecordSet;

    constructor(scope: Construct, id: string, props: DomainRecordProps) {
        super(scope, id);

        const regionalDomainName = `${props.region}.${props.hostedZone.zoneName}`;

        this.regionalDomain = new DomainName(this, 'regional-domain', {
            domainName: regionalDomainName,
            certificate: props.certificate,
        });
        this.regionalRecord = new CfnRecordSet(this, 'regional-record', {
            name: regionalDomainName,
            type: 'A',
            aliasTarget: {
                dnsName: this.regionalDomain.regionalDomainName,
                hostedZoneId: this.regionalDomain.regionalHostedZoneId,
            },
            hostedZoneId: props.hostedZone.hostedZoneId,
            setIdentifier: props.region,
            weight: 100,
        });

        const globalDomainName = props.hostedZone.zoneName;
        this.globalDomain = new DomainName(this, 'global-domain', {
            domainName: globalDomainName,
            certificate: props.certificate,
        });
        this.globalRecord = new CfnRecordSet(this, 'global-record', {
            name: globalDomainName,
            type: 'A',
            aliasTarget: {
                dnsName: this.regionalDomain.regionalDomainName,
                hostedZoneId: this.regionalDomain.regionalHostedZoneId,
            },
            hostedZoneId: props.hostedZone.hostedZoneId,
            setIdentifier: props.region,
            region: props.region,
        });
        this.globalRecord.node.addDependency(this.regionalRecord);
    }
}
