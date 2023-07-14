export interface BuildOptions {
    [accountId: string]: BuildConfig;
}

export interface BuildConfig extends CommonConfig, GlobalConfig {}

export interface CommonConfig {
    appName: string;
    local: boolean;
}

export interface GlobalConfig {
    stage: string;
    accountId: string;
    primaryRegion: string;
    parentDomainName: string;
    secrets: SecretConfig;
    regions: {
        [region: string]: RegionalConfig;
    };
}

interface RegionalConfig {}

interface SecretConfig {
    parentAwsAccount: string;
}
