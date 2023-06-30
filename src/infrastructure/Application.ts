#!/usr/bin/env node
import 'source-map-support/register';
import { App, Tags } from 'aws-cdk-lib';
import { getBuildConfig } from '@infrastructure/config/getBuildConfig';
import { DataStack } from '@infrastructure/data/DataStack';

export default execute();

async function execute() {
    const app = new App();

    const config = await getBuildConfig();
    const regions = Object.keys(config.regions);

    regions.forEach((region) => {
        const stackId = `${config.appName}-${region}`;

        new DataStack(app, `${stackId}-data`, {
            env: {
                acccount: config.accountId,
                region,
            },
            appName: config.appName,
            primaryRegion: config.primaryRegion,
            regions,
            local: config.local,
        });
    });

    Tags.of(app).add('STAGE', config.stage);
}
