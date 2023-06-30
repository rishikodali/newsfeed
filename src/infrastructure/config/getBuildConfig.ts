import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { BuildConfig } from '@infrastructure/config/BuildConfig';
import { buildOptions } from '@infrastructure/config/Environment';
import { AwsAccountId } from '@shared/Constant';

const CI = !!process.env['CI'];

export async function getBuildConfig(): Promise<BuildConfig> {
    const accountId = await getAwsAccountId();

    const buildConfig = buildOptions[accountId];
    if (!buildConfig) {
        throw new Error(`AWS account '${accountId}' doesn't have a build config`);
    }

    if (CI) {
        buildConfig.local = false;
    }

    return buildConfig;
}

async function getAwsAccountId(): Promise<string> {
    try {
        const sts = new STSClient({});
        const command = new GetCallerIdentityCommand({});
        const response = await sts.send(command);

        if (!response?.Account || !Object.values(AwsAccountId).includes(response.Account)) {
            throw new Error();
        }

        return response.Account;
    } catch (error) {
        throw new Error(`Invalid AWS account. Valid accounts: ${Object.values(AwsAccountId)}`);
    }
}
