#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ClusterStack } from '../lib/cluster-stack';
import { MigrationStack } from '../lib/migration-stack';
import { SecondaryClusterStack } from '../lib/secondary-stack';

const app = new cdk.App();

new ClusterStack(app, 'ClusterStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-west-1' },
});

new MigrationStack(app, 'MigrationStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-west-1' },
});

new SecondaryClusterStack(app, 'SecondaryClusterStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
});
