import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import {Port} from "aws-cdk-lib/aws-ec2";

const UiImage = `${process.env.AWS_ACCOUNT}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/cptodoui:${process.env.VERSION}`;
const ApiImage = `${process.env.AWS_ACCOUNT}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/cptodoapi:${process.env.VERSION}`;

export class StackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "ToDoVpc", {
      maxAzs: 2 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, "ToDoCluster", {
      vpc: vpc
    });

    cluster.addDefaultCloudMapNamespace({
      name: "service.local"
    })

    const uiService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'Frontend', {
      serviceName: 'web',
      cloudMapOptions: {name: 'web'},
      cluster: cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry(UiImage),
      },
      listenerPort: 80,
      publicLoadBalancer: true
    });

    uiService.service.connections.allowFromAnyIpv4(Port.tcp(3000), 'ToDo inbound')

    const scalableTarget = uiService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 5,
    });

    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 60,
    });

    const apiService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'Backend', {
      serviceName: 'api',
      cloudMapOptions: {name: 'api'},
      cluster: cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry(ApiImage),
      },
      listenerPort: 80,
      publicLoadBalancer: false
    });

    apiService.service.connections.allowFrom(uiService.service, Port.tcp(80))

  }
}
