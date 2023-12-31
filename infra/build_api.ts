import { apiRepository } from "./ecr.ts";
import { FnGetAtt, mustEnv, Ref, res } from "./utils.ts";

const BucketName = mustEnv("SRC_API_S3_BUCKET_NAME");
export const BuildApiS3Bucket = res("BuildApiS3Bucket", "AWS::S3::Bucket", {
  BucketName,
  AccessControl: "Private",
  VersioningConfiguration: {
    Status: "Enabled",
  },
});

const CodeBuildServiceRole = res(
  "BuildApiCodeBuildServiceRole",
  "AWS::IAM::Role",
  {
    RoleName: "BuildApiCodeBuildServiceRole",
    AssumeRolePolicyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: ["codebuild.amazonaws.com"],
          },
          Action: ["sts:AssumeRole"],
        },
      ],
    },
    Policies: [
      {
        PolicyName: "CodeBuildServiceRolePolicy",
        PolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
              ],
              Resource: "arn:aws:logs:*:*:*",
            },
            {
              Effect: "Allow",
              Action: [
                "s3:GetObject",
                "s3:GetObjectVersion",
              ],
              Resource: [
                `arn:aws:s3:::${BucketName}/*`,
              ],
            },
            {
              Effect: "Allow",
              Action: [
                "s3:ListBucket",
              ],
              Resource: [
                `arn:aws:s3:::${BucketName}`,
              ],
            },
            {
              Effect: "Allow",
              Action: [
                "s3:ListAllMyBuckets",
              ],
              Resource: "*",
            },
            {
              Effect: "Allow",
              Action: [
                "codebuild:CreateReportGroup",
                "codebuild:CreateReport",
                "codebuild:UpdateReport",
                "codebuild:BatchPutTestCases",
              ],
              Resource: "*",
            },
            {
              Effect: "Allow",
              Action: [
                "ecr:GetAuthorizationToken",
              ],
              Resource: "*",
            },
            {
              Effect: "Allow",
              Action: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:BatchCheckLayerAvailability",
                "ecr:CompleteLayerUpload",
                "ecr:GetAuthorizationToken",
                "ecr:InitiateLayerUpload",
                "ecr:PutImage",
                "ecr:UploadLayerPart",
              ],
              Resource: FnGetAtt(apiRepository, "Arn"),
            },
          ],
        },
      },
    ],
  },
);

const CodeBuildProject = res(
  "BuildApiCodeBuildProject",
  "AWS::CodeBuild::Project",
  {
    Name: "BuildApiCodeBuildProject",
    Source: {
      Type: "S3",
      Location: `${BucketName}/src.zip`,
    },
    Environment: {
      //   Type: "ARM_LAMBDA_CONTAINER",
      //   ComputeType: "BUILD_LAMBDA_1GB",
      //   Image: "aws/codebuild/amazonlinux-aarch64-lambda-standard:nodejs18", // aarch64 = ARM
      Type: "ARM_CONTAINER", // Slower startup
      ComputeType: "BUILD_GENERAL1_SMALL",
      Image: "aws/codebuild/amazonlinux2-aarch64-standard:2.0", // EC2 and lambda use different images (https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-available.html)
      PrivilegedMode: true,
      EnvironmentVariables: [
        {
          Type: "PLAINTEXT",
          Name: "REPOSITORY_URI",
          Value: FnGetAtt(apiRepository, "RepositoryUri"),
        },
      ],
    },
    ConcurrentBuildLimit: 1,
    Artifacts: { Type: "NO_ARTIFACTS" },
    ServiceRole: Ref(CodeBuildServiceRole),
  },
);

export const buildApi = [
  BuildApiS3Bucket,
  CodeBuildServiceRole,
  CodeBuildProject,
];
