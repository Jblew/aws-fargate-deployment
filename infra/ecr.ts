import { res } from "./utils.ts";

const apiRepository = res("EcrRepositoryApi", "AWS::ECR::Repository", {
  RepositoryName: "aws-fargate-deployment-api",
  EmptyOnDelete: true,
  ImageTagMutability: "MUTABLE",
  RepositoryPolicyText: repositoryPolicy(publicPullPolicyStatement()),
});

export const ecr = [
  apiRepository,
];

export function repositoryPolicy(...statements: object[]) {
  return {
    Version: "2012-10-17",
    Statement: statements,
  };
}

function publicPullPolicyStatement() {
  return {
    Sid: "AllowPublicPull",
    Effect: "Allow",
    Principal: "*",
    Action: [
      "ecr:BatchGetImage",
      "ecr:DescribeImages",
      "ecr:GetDownloadUrlForLayer",
      "ecr:ListImages",
    ],
  };
}

function codebuildPushPolicyStatement() {
  return {
    Sid: "AllowCodeBuildPush",
    Effect: "Allow",
    Principal: {
      Service: "codebuild.amazonaws.com",
    },
    Action: [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:GetAuthorizationToken",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
    ],
    Condition: {
      ArnLike: {
        "aws:SourceArn": { Ref: "" },
      },
    },
  };
}
