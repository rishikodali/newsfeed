#!/usr/bin/env node
import 'source-map-support/register';
import { App, Tags } from 'aws-cdk-lib';
import { getBuildConfig } from '@infrastructure/config/getBuildConfig';
import { DataStack } from '@infrastructure/data/DataStack';
import { ApiStack } from '@infrastructure/api/ApiStack';

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

        new ApiStack(app, `${stackId}-api`, {
            env: {
                acccount: config.accountId,
                region,
            },
            appName: config.appName,
            table: dataStack.table,
        });
    });

    Tags.of(app).add('STAGE', config.stage);
}
