# RDS Serverless v1 to Global Serverless v2 Migration with CDK

This project demonstrates how to migrate an Amazon RDS Aurora Serverless v1 cluster to a Global Aurora Serverless v2 cluster using AWS CDK. The migration process involves upgrading the engine version, converting to Serverless v2, and setting up a global database with multi-region replication.

## Architecture Overview

The migration follows a step-by-step approach to safely upgrade from Serverless v1 to Global Serverless v2:

```
Serverless v1 → Snapshot → Provisioned → Engine Upgrade → Serverless v2 → Global Database
```

## Project Structure

This CDK application consists of three main stacks:

- **ClusterStack** (`lib/cluster-stack.ts`) - Creates the initial Aurora Serverless v1 cluster
- **MigrationStack** (`lib/migration-stack.ts`) - Handles the migration process from v1 to v2
- **SecondaryClusterStack** (`lib/secondary-stack.ts`) - Creates the secondary cluster in a different region for global database

## Prerequisites

- AWS CLI
- AWS CDK
- Sufficient IAM permissions for RDS, CloudFormation, and related services

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd db-migration-sample
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Bootstrap CDK (if not already done):
   ```bash
   cdk bootstrap
   ```

## Migration Process

### Step 1: Deploy Initial Serverless v1 Cluster

Deploy the initial Aurora Serverless v1 cluster:

```bash
cdk deploy ClusterStack
```

This creates a Serverless v1 cluster that serves as the starting point for migration.

### Step 2: Execute Migration Process

Deploy the migration stack to begin the upgrade process:

```bash
cdk deploy MigrationStack
```

The MigrationStack performs the following operations automatically:

1. **Snapshot Creation**: Creates a snapshot of the existing Serverless v1 cluster using a custom resource
2. **Cluster Restoration**: Restores the cluster from snapshot with:
   - Latest minor version (e.g., 11.13 → 11.19)
   - Engine mode set to 'provisioned'
   - Creates a DB instance
3. **Engine Version Upgrade**: Updates to a Serverless v2 compatible version (e.g., 13.10)
4. **Serverless v2 Conversion**: 
   - Changes DB instance class to 'db.serverless'
   - Adds serverlessV2ScalingConfiguration to the cluster
5. **Global Database Creation**: Creates a global database with the writer cluster

### Step 3: Deploy Secondary Cluster

Deploy the secondary cluster in a different region:

```bash
cdk deploy SecondaryClusterStack
```

This creates a read replica cluster in `us-east-1` that will be added to the global database.

## Important Considerations

### Before Each Deployment

Always run `cdk diff` to review changes before deployment:

```bash
cdk diff <StackName>
```

### Resource Management

- **Never comment out cluster or instance resources** - CloudFormation will delete them
- **Avoid changing identifiers** that trigger replacement updates
- **Maintain resource continuity** throughout the migration process


## References

- [AWS::RDS::DBCluster CloudFormation Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbcluster.html)
- [AWS::RDS::DBInstance CloudFormation Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbinstance.html)
- [Aurora Serverless v2 Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html)
- [Aurora Global Database Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html)
