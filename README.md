# Migrating RDS DB from Serverless v1 to a Global Serverless v2 via CDK

The high level work-flow would require upgrading the engine version to a serverless v2 supported version and then adding it to a global DB. 

The demo includes 3 stacks - ClusterStack, MigrationStack and SecondaryClusterStack

ClusterStack has a Serverless v1 Cluster and it can be directly deployed. 

MigrationStack has the resources to snapshot the v1 cluster as well as the steps to create a global db from it. 

Steps:
1. Create the snapshot of existing cluster using a custom resource
2. Restore the cluster from snapshot to the latest minor version and engine mode as 'provisioned' (In the demo the source cluster version was 11.13 which was restored to 11.19). An instance is also created in this step
3. Update the engine version to a serverless v2 compatible version (13.10 in demo), the instance is kept as such. 
4. Change to serverless by changing the dbInstanceClass of the instance to 'db.serverless' and adding serverlessV2ScalingConfiguration to the cluster 
5. Create global db with the writer cluster 

SecondaryClusterStack has a cluster and an instance will be deployed in a different region (us-east-1 in demo), that will be added to the global db

In all the steps make sure to keep the cluster resource and instance, if it is commented then CloudFormation will delete the resource. Also the identifiers and properties that trigger a replacement update must not be changed. 

Before every update, run ```cdk diff``` to check the changes that will arise during the deployment. 

References:
1. AWS::RDS::DBCluster - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbcluster.html
2. AWS::RDS::DBInstance - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbinstance.html