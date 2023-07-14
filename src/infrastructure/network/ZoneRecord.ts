import { Stack } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Role } from 'aws-cdk-lib/aws-iam';
import {
    CrossAccountZoneDelegationRecord,
    IHostedZone,
    PublicHostedZone,
} from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface ZoneRecordProps {
    appName: string;
    stage: string;
    region: string;
    primaryRegion: string;
    parentDomainName: string;
    parentAwsAccount: string;
}

export class ZoneRecord extends Construct {
    hostedZone: IHostedZone;
    certificate: Certificate;

    constructor(scope: Construct, id: string, props: ZoneRecordProps) {
        super(scope, id);

        const domainName = `${props.appName}.${props.parentDomainName}`;

        if (props.region === props.primaryRegion) {
            this.hostedZone = new PublicHostedZone(this, 'hosted-zone', {
                zoneName: domainName,
            });

            const zoneDelegationRoleArn = Stack.of(this).formatArn({
                region: '',
                service: 'iam',
                account: props.parentAwsAccount,
                resource: 'role',
                resourceName: `zone-delegation-${props.stage}`,
            });
            const zoneDelegationRole = Role.fromRoleArn(
                this,
                'zone-delegation-role',
                zoneDelegationRoleArn,
            );

            new CrossAccountZoneDelegationRecord(this, 'zone-delegation-record', {
                delegatedZone: this.hostedZone,
                parentHostedZoneName: props.parentDomainName,
                delegationRole: zoneDelegationRole,
            });
        } else {
            this.hostedZone = PublicHostedZone.fromLookup(this, 'hosted-zone', {
                domainName,
            });
        }

        this.certificate = new Certificate(this, 'certificate', {
            domainName: this.hostedZone.zoneName,
            subjectAlternativeNames: [`*.${this.hostedZone.zoneName}`],
            validation: CertificateValidation.fromDns(this.hostedZone),
        });
    }
}
