import { BuildOptions, CommonConfig } from '@infrastructure/config/BuildConfig';
import { AwsAccountId, AwsRegion, Stage } from '@shared/Constant';

const commonConfig: CommonConfig = {
    appName: 'newsfeed',
    local: true,
};

export const buildOptions: BuildOptions = {
    [AwsAccountId.DEVELOPMENT]: {
        ...commonConfig,
        stage: Stage.DEVELOPMENT,
        accountId: AwsAccountId.DEVELOPMENT,
        primaryRegion: AwsRegion.US_EAST_1,
        regions: {
            [AwsRegion.US_EAST_1]: {},
            [AwsRegion.US_WEST_1]: {},
        },
        secrets: {
            parentAwsAccount: process.env['PARENT_AWS_ACCOUNT']!,
        },
        domainName: process.env['DEVELOPMENT_DOMAIN_NAME']!,
    },
};
