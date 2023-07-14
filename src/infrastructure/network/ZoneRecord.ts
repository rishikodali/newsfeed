import { Stack } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Role } from 'aws-cdk-lib/aws-iam';
import {
    CrossAccountZoneDelegationRecord,
    IHostedZone,
    PublicHostedZone,
} from 'aws-cdk-lib/aws-route53';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { SsmParameterReader } from '@infrastructure/shared/SsmParmaterReader';

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

            new StringParameter(this, 'hosted-zone-id', {
                parameterName: domainName,
                stringValue: this.hostedZone.hostedZoneId,
            });
        } else {
            const hostedZoneIdReader = new SsmParameterReader(this, 'hosted-zone-id-reader', {
                parameterName: domainName,
                region: props.primaryRegion,
            });
            const hostedZoneId = hostedZoneIdReader.getParameterValue();
            this.hostedZone = PublicHostedZone.fromHostedZoneAttributes(this, 'hosted-zone', {
                hostedZoneId,
                zoneName: domainName,
            });
        }

        this.certificate = new Certificate(this, 'certificate', {
            domainName: this.hostedZone.zoneName,
            subjectAlternativeNames: [`*.${this.hostedZone.zoneName}`],
            validation: CertificateValidation.fromDns(this.hostedZone),
        });
    }
}
