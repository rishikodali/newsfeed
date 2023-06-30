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
    regions: {
        [region: string]: RegionalConfig;
    };
    secrets: SecretConfig;
}

interface RegionalConfig {}

interface SecretConfig {}
