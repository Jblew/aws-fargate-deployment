import { ecr } from "./ecr.ts";
import { assertNoDuplicates, Resource, resourcesToStack } from "./utils.ts";

const resources: Resource[] = [
  ...ecr,
];
assertNoDuplicates(resources);
const stack = {
  AWSTemplateFormatVersion: "2010-09-09",
  Description:
    "Example CodeBuild on ARM lambda + ECR + ECS + Fargate + ALB stack",
  Resources: resourcesToStack(resources),
};
console.log(JSON.stringify(stack, null, 2));
