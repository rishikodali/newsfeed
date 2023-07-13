import { DomainName } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Stack } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Role } from 'aws-cdk-lib/aws-iam';
import { CrossAccountZoneDelegationRecord, PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface DomainRecordProps {
    appName: string;
    stage: string;
    domainName: string;
    parentAwsAccount: string;
}

export class DomainRecord extends Construct {
    globalDomainName: DomainName;

    constructor(scope: Construct, id: string, props: DomainRecordProps) {
        super(scope, id);

        const hostedZone = new PublicHostedZone(this, 'hosted-zone', {
            zoneName: `${props.appName}.${props.domainName}`,
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
            delegatedZone: hostedZone,
            parentHostedZoneName: props.domainName,
            delegationRole: zoneDelegationRole,
        });

        const certificate = new Certificate(this, 'certificate', {
            domainName: hostedZone.zoneName,
            validation: CertificateValidation.fromDns(hostedZone),
        });

        this.globalDomainName = new DomainName(this, 'domain-name', {
            domainName: hostedZone.zoneName,
            certificate,
        });
    }
}
