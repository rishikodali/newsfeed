import {
    AwsCustomResource,
    AwsCustomResourcePolicy,
    PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

interface SsmParameterReaderProps {
    readonly parameterName: string;
    readonly region: string;
}

export class SsmParameterReader extends AwsCustomResource {
    value: string;

    constructor(scope: Construct, id: string, props: SsmParameterReaderProps) {
        super(scope, id, {
            onUpdate: {
                action: 'getParameter',
                service: 'SSM',
                parameters: {
                    Name: props.parameterName,
                },
                region: props.region,
                physicalResourceId: PhysicalResourceId.of(id),
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
        });
    }

    public getParameterValue(): string {
        return this.getResponseFieldReference('Parameter.Value').toString();
    }
}
