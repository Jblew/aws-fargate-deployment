import { mustEnv } from "./utils.ts";

export const region = mustEnv("AWS_REGION");
export const accountId = mustEnv("AWS_ACCOUNT_ID");
