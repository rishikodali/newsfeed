export const Stage = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
};

export const AwsAccountId = {
    DEVELOPMENT: process.env['DEVELOPMENT_AWS_ACCOUNT_ID']!,
    PRODUCTION: process.env['PRODUCTION_AWS_ACCOUNT_ID']!,
};

export const AwsRegion = {
    US_EAST_1: 'us-east-1',
    US_WEST_1: 'us-west-1',
};
