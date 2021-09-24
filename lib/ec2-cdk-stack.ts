import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import { WindowsVersion } from '@aws-cdk/aws-ec2';

export class Ec2CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const vpc = new ec2.Vpc(this, 'MyVPC',{
      natGateways:0,
      subnetConfiguration:[{
        cidrMask:24,
        name: "subnet1",
        subnetType:ec2.SubnetType.PUBLIC
      }]
    });

    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup',{
      vpc,
      description:'allow rdp 3389'
      ,allowAllOutbound:true
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(3389),'rdp');

    const role=new iam.Role(this,'ec2Role',{
      assumedBy:new iam.ServicePrincipal('ec2.amazonaws.com')
    });

    const ami = new ec2.WindowsImage(WindowsVersion.WINDOWS_SERVER_2016_ENGLISH_64BIT_SQL_2012_SP4_ENTERPRISE);

    const ec2Instance = new ec2.Instance(this, 'myec2instance',{
      vpc,
      instanceType:ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage:ami,
      securityGroup:securityGroup,
      role:role
    });

    new cdk.CfnOutput(this, 'Ip',{value:ec2Instance.instancePublicIp});

  }
}
