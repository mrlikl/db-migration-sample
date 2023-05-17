import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class ClusterStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'VPC',); 
        
        const db_cluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
            engine: rds.DatabaseClusterEngine.auroraPostgres(
                { version: rds.AuroraPostgresEngineVersion.VER_11_13 }),
            vpc: vpc,
            credentials: { username: 'clusteradmin' },
            clusterIdentifier: 'serverless-test',
            defaultDatabaseName: 'demos',
        });
    }
}