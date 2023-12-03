import { defaultSubnetIDs, defaultVPCID } from "./subnets.ts";
import { Ref, res } from "./utils.ts";

export const loadBalancer = res(
  "LB",
  "AWS::ElasticLoadBalancingV2::LoadBalancer",
  {
    Scheme: "internet-facing",
    Type: "application",
    Subnets: defaultSubnetIDs,
  },
);

export const targetGroup = res(
  "LBTargetGroup",
  "AWS::ElasticLoadBalancingV2::TargetGroup",
  {
    Port: 80,
    Protocol: "HTTP",
    TargetType: "ip",
    VpcId: defaultVPCID,
    TargetGroupAttributes: [
      { // default is 300
        Key: "deregistration_delay.timeout_seconds",
        Value: "5",
      },
    ],
  },
);

export const lbListener = res(
  "LBListener",
  "AWS::ElasticLoadBalancingV2::Listener",
  {
    DefaultActions: [
      {
        Type: "forward",
        TargetGroupArn: Ref(targetGroup),
      },
    ],
    LoadBalancerArn: Ref(loadBalancer),
    Port: 80,
    Protocol: "HTTP",
  },
);

export const elb = [
  loadBalancer,
  targetGroup,
  lbListener,
];
