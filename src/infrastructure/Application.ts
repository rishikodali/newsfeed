#!/usr/bin/env node
import 'source-map-support/register';
import { App, Tags } from 'aws-cdk-lib';
import { ApiStack } from '@infrastructure/api/ApiStack';
import { getBuildConfig } from '@infrastructure/config/getBuildConfig';
import { DataStack } from '@infrastructure/data/DataStack';
import { NetworkStack } from '@infrastructure/network/NetworkStack';
import { ProcessorStack } from '@infrastructure/processor/ProcessorStack';

export default execute();

async function execute() {
    const app = new App();

    const config = await getBuildConfig();
    const regions = Object.keys(config.regions);

    regions.forEach((region) => {
        const stackId = `${config.appName}-${region}`;

        const dataStack = new DataStack(app, `${stackId}-data`, {
            env: {
                acccount: config.accountId,
                region,
            },
            appName: config.appName,
            primaryRegion: config.primaryRegion,
            regions,
            local: config.local,
        });

        const networkStack = new NetworkStack(app, `${stackId}-network`, {
            env: {
                account: config.accountId,
                region,
            },
            appName: config.appName,
            stage: config.stage,
            primaryRegion: config.primaryRegion,
            parentDomainName: config.parentDomainName,
            parentAwsAccount: config.secrets.parentAwsAccount,
        });

        new ApiStack(app, `${stackId}-api`, {
            env: {
                account: config.accountId,
                region,
            },
            appName: config.appName,
            table: dataStack.table,
            domainRecord: networkStack.domainRecord,
        });

        new ProcessorStack(app, `${stackId}-processor`, {
            env: {
                account: config.accountId,
                region,
            },
            appName: config.appName,
            table: dataStack.table,
            bucket: dataStack.bucket,
        });
    });

    Tags.of(app).add('STAGE', config.stage);
}
