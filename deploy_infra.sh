#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"
set -e

## Note that this update-stack might not be needed at all
# As not AWS CloudFormation has GitSync with GithubSupport (https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/git-sync.html#)
# So alternative approach is to just generate .cf.json file, push it to deployment branch
# and wait for CloudFormation to update the stack

source ./config.sh
export AWS_PAGER="" # AWS Cli sometimes uses a pager, which breaks the script. Lets disable it.

export AWS_DESCRIBE_SUBNETS="$(aws ec2 describe-subnets --output json)"

./infra/update-stack.sh # Generates infra/stack.cf.json

aws cloudformation deploy \
    --stack-name "${AWS_CF_STACK_NAME}" \
    --template-file infra/stack.cf.json \
    --region "${AWS_REGION}" \
    --capabilities CAPABILITY_NAMED_IAM

tput bel || echo "No bell"