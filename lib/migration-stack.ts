import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as _lambda from 'aws-cdk-lib/aws-lambda';

export class MigrationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Step-1 Create Snapshot
    const params = {
      DBClusterIdentifier: 'serverless-test', //cluster name from ClusterStack
      DBClusterSnapshotIdentifier: 'serverless-test-snapshot'
    };

    const create_snapshot = new cr.AwsCustomResource(this, "CreateSnapshot", {
      onUpdate: {
        service: "RDS",
        action: "createDBClusterSnapshot",
        parameters: params,
        physicalResourceId: cr.PhysicalResourceId.fromResponse('Path')
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
      installLatestAwsSdk: true
    });


    /* Step-2
        Create a new writer cluster from snapshot and
        a writer instance
    */
    const writer_cluster = new rds.CfnDBCluster(this, 'WriterCluster',
      {
        dbClusterIdentifier: 'writercluster',
        engine: 'aurora-postgresql',
        engineMode: 'provisioned',
        engineVersion: '11.19',
        snapshotIdentifier: params.DBClusterSnapshotIdentifier,
        port: 5432
      });

    const writer_db_instance = new rds.CfnDBInstance(this, 'WriterInstance', {
      dbClusterIdentifier: writer_cluster.ref,
      engine: 'aurora-postgresql',
      dbInstanceClass: 'db.t3.medium',
      dbInstanceIdentifier: 'writerinstance'
    });

    //Step-3 Update writer cluster to v2 compatible version
    // const writer_cluster = new rds.CfnDBCluster(this, 'WriterCluster',
    //     {
    //         dbClusterIdentifier: 'writercluster',
    //         engine: 'aurora-postgresql',
    //         engineMode: 'provisioned',
    //         engineVersion: '13.10',
    //         snapshotIdentifier: params.DBClusterSnapshotIdentifier,
    //     });

    // const writer_db_instance = new rds.CfnDBInstance(this, 'WriterInstance', {
    //   dbClusterIdentifier: writer_cluster.ref,
    //   engine: 'aurora-postgresql',
    //   dbInstanceClass: 'db.t3.medium',
    //   dbInstanceIdentifier: 'writerinstance'
    // });


    //Step-4 Change to serverless 

    // const writer_cluster = new rds.CfnDBCluster(this, 'WriterCluster',
    //     {
    //         dbClusterIdentifier: 'writercluster',
    //         engine: 'aurora-postgresql',
    //         // Keep the engine mode unchanged here
    //         engineMode: 'provisioned',
    //         engineVersion: '13.10',
    //         snapshotIdentifier: params.DBClusterSnapshotIdentifier,
    //         serverlessV2ScalingConfiguration: {
    //             maxCapacity: 128,
    //             minCapacity: 0.5,
    //         }
    //     });

    // const writer_db_instance = new rds.CfnDBInstance(this, 'WriterInstance', {
    //     dbClusterIdentifier: writer_cluster.ref,
    //     engine: 'aurora-postgresql',
    //     dbInstanceClass: 'db.serverless',
    //     dbInstanceIdentifier: 'writerinstance'
    // });

    // Step 5 - Create global db with the writer cluster 

    // const global_cluster = new rds.CfnGlobalCluster(this, 'GlobalCluster', {
    //   globalClusterIdentifier: 'globaldb',
    //   sourceDbClusterIdentifier: writer_cluster.ref
    // });

  }
}