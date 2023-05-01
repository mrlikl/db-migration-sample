import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';

export class SecondaryClusterStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // create a reader cluster and instance in us-east-1 
        // in the global db
        const reader_cluster = new rds.CfnDBCluster(this, 'ReaderCluster',
            {
                dbClusterIdentifier: 'readercluster',
                globalClusterIdentifier: 'globaldb',
                engine: 'aurora-postgresql',
                engineMode: 'provisioned',
                engineVersion: '13.10',
                serverlessV2ScalingConfiguration: {
                    maxCapacity: 128,
                    minCapacity: 0.5,
                },
                //For encrypted cross-region replica, kmsKeyId should be explicitly specified
                storageEncrypted: true,
                kmsKeyId: "your-kms-key-id"
            });

        const writer_db_instance = new rds.CfnDBInstance(this, 'ReaderInstance', {
            dbClusterIdentifier: reader_cluster.ref,
            engine: 'aurora-postgresql',
            dbInstanceClass: 'db.serverless',
            dbInstanceIdentifier: 'readerinstance'
        });

    }
}