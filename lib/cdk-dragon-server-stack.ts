import * as cdk from '@aws-cdk/core';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import * as ecrdeploy from 'cdk-ecr-deployment';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';

export class CdkDragonServerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
      
    const ecrRepoName = 'ikegps/dragon-server'
    const imageTag = '1.0.0'

    const ecrRepo = new ecr.Repository(this, 'EcrRepo', {
      repositoryName: ecrRepoName,
    });

    const dockerImage = new DockerImageAsset(this, 'DockerImage', {
      directory: 'src/dragon-server',
    });
    
    new ecrdeploy.ECRDeployment(this, 'DeployDockerImage', {
      src: new ecrdeploy.DockerImageName(dockerImage.imageUri),
      dest: new ecrdeploy.DockerImageName(`${this.account}.dkr.ecr.${this.region}.amazonaws.com/${ecrRepoName}:${imageTag}`),
    });

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 3 
    });

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc: vpc
    });
    
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'DragonServerServiceTask', {
      family: 'DragonServerServiceTask'
    });

    const container = taskDefinition.addContainer('app', {
      image: ecs.ContainerImage.fromEcrRepository(ecrRepo, imageTag)
    });
    container.addPortMappings({ containerPort: 8080 })
    
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
      cluster: cluster,
      cpu: 256,
      desiredCount: 1,
      taskDefinition: taskDefinition,
      memoryLimitMiB: 512,
      publicLoadBalancer: true
    });
  }
}
