import { loadBalancer } from "./alb.ts";
import { FnGetAtt, res } from "./utils.ts";

const domain = "fargateawsexample.jblew.pl";
const r53Zone = res("MainDomainZone", "AWS::Route53::HostedZone", {
  Name: `${domain}.`,
});

const cloudfrontDistribution = res(
  "MainDomainCFDistro",
  "AWS::CloudFront::Distribution",
  {
    DistributionConfig: {
      Enabled: true,
      DefaultRootObject: "index.html",
      PriceClass: "PriceClass_100",
      DefaultCacheBehavior: {
        CachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad", // 4135ea2d-6df8-44a3-9df3-4b5a84be39ad is managed "CachingDisabled" policy // list: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-caching-disabled
        TargetOriginId: "ALBOrigin",
        ViewerProtocolPolicy: "redirect-to-https",
      },
      Origins: [{
        Id: "ALBOrigin",
        DomainName: FnGetAtt(loadBalancer, "DNSName"),
        CustomOriginConfig: {
          HTTPPort: 80,
          OriginProtocolPolicy: "http-only",
        },
      }],
    },
  },
);

const r53RecordSet = res("MainDomainRecord", "AWS::Route53::RecordSet", {
  Name: `${domain}.`,
  Type: "A",
  HostedZoneId: FnGetAtt(r53Zone, "Id"),
  AliasTarget: {
    HostedZoneId: "Z2FDTNDATAQYW2", // For CloudFront, always use Z2FDTNDATAQYW2, https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-route53-aliastarget.html
    EvaluateTargetHealth: false,
    DNSName: FnGetAtt(cloudfrontDistribution, "DomainName"),
  },
});

export const cloudfront = [
  r53Zone,
  r53RecordSet,
  cloudfrontDistribution,
];
