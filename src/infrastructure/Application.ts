#!/usr/bin/env node
import 'source-map-support/register';
import { App, Tags } from 'aws-cdk-lib';
import { getBuildConfig } from '@infrastructure/config/getBuildConfig';

export default execute();

async function execute() {
    const app = new App();
    const config = await getBuildConfig();

    Tags.of(app).add('STAGE', config.stage);
}
