#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkDragonServerStack } from '../lib/cdk-dragon-server-stack';

const app = new cdk.App();

const env = {account: '872203653859', region: 'ap-southeast-2'};

new CdkDragonServerStack(app, 'CdkDragonServerStack', {env: env});