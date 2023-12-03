// deno-lint-ignore-file no-explicit-any
import { mustEnv } from "./utils.ts";

const describedSubnets = JSON.parse(mustEnv("AWS_DESCRIBE_SUBNETS"));
// Please use export AWS_DESCRIBE_SUBNETS="$(aws ec2 describe-subnets --output json)"

export const defaultSubnets = describedSubnets.Subnets
  .filter((subnet: any) => subnet.DefaultForAz === true);
export const defaultSubnetIDs = defaultSubnets
  .map((subnet: any) => subnet.SubnetId);

const VPCs: string[] = [];
for (const subnet of defaultSubnets) {
  if (!VPCs.includes(subnet.VpcId)) {
    VPCs.push(subnet.VpcId);
  }
}
if (VPCs.length !== 1) {
  throw new Error(
    "VPCs.length !== 1. All default subnets must be in the same VPC.",
  );
}
export const defaultVPCID = VPCs[0];
