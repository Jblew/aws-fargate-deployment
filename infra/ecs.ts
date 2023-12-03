import { apiRepository } from "./ecr.ts";
import { defaultSubnetIDs } from "./subnets.ts";
import { FnGetAtt, FnJoin, Ref, res } from "./utils.ts";

const cluster = res("EcsCluster", "AWS::ECS::Cluster", {
  ClusterName: "example-aws-fargate-deployment",
});

const apiTaskLogGroup = res("EcsTaskLogGroupApi", "AWS::Logs::LogGroup", {
  LogGroupName: "example-aws-fargate-deployment-api",
  RetentionInDays: 1,
});

const apiExecutionRole = res("IamRoleApiExecution", "AWS::IAM::Role", {
  AssumeRolePolicyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Service: ["ecs-tasks.amazonaws.com"],
        },
        Action: ["sts:AssumeRole"],
      },
    ],
  },
  ManagedPolicyArns: [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
  ],
  Policies: [
    {
      PolicyName: "EcsTaskExecutionPolicy",
      PolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["ecr:GetAuthorizationToken"],
            Resource: "*",
          },
          {
            Effect: "Allow",
            Action: [
              "ecr:BatchCheckLayerAvailability",
              "ecr:GetDownloadUrlForLayer",
              "ecr:BatchGetImage",
            ],
            Resource: FnGetAtt(apiRepository, "Arn"),
          },
          {
            Effect: "Allow",
            Action: [
              "logs:CreateLogStream",
              "logs:PutLogEvents",
            ],
            Resource: FnGetAtt(apiTaskLogGroup, "Arn"),
          },
        ],
      },
    },
  ],
});

const apiTask = res("EcsTaskApi", "AWS::ECS::TaskDefinition", {
  ExecutionRoleArn: Ref(apiExecutionRole),
  Cpu: "256",
  Memory: "512",
  EphemeralStorage: { SizeInGiB: 21 },
  NetworkMode: "awsvpc",
  RequiresCompatibilities: ["FARGATE"],
  RuntimePlatform: { CpuArchitecture: "ARM64", OperatingSystemFamily: "LINUX" },
  ContainerDefinitions: [
    {
      Name: "api",
      Image: FnJoin(":", FnGetAtt(apiRepository, "RepositoryUri"), "latest"),
      PortMappings: [{ ContainerPort: 80, HostPort: 80 }],
      LogConfiguration: {
        LogDriver: "awslogs",
        Options: {
          "awslogs-group": apiTaskLogGroup[1].Properties.LogGroupName,
          "awslogs-region": { "Ref": "AWS::Region" },
          "awslogs-stream-prefix": "ecs-api",
        },
      },
    },
  ],
});

const apiService = res("EcsServiceApi", "AWS::ECS::Service", {
  Cluster: Ref(cluster),
  TaskDefinition: Ref(apiTask),
  DesiredCount: 1,
  LaunchType: "FARGATE",
  NetworkConfiguration: {
    AwsvpcConfiguration: {
      AssignPublicIp: "ENABLED",
      Subnets: defaultSubnetIDs,
    },
  },
});

export const ecsCluster = [
  cluster,
  apiExecutionRole,
  apiTaskLogGroup,
  apiTask,
  apiService,
];
