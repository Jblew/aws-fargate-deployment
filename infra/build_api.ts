import { mustEnv, res } from "./utils.ts";

const BucketName = mustEnv("SRC_API_S3_BUCKET_NAME");
export const BuildApiS3Bucket = res("BuildApiS3Bucket", "AWS::S3::Bucket", {
  BucketName,
  AccessControl: "Private",
  VersioningConfiguration: {
    Status: "Enabled",
  },
});

export const buildApi = [
  BuildApiS3Bucket,
];
