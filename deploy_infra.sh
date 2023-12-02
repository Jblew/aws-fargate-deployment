#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"
set -e

source ./config.sh
export AWS_PAGER="" # AWS Cli sometimes uses a pager, which breaks the script. Lets disable it.

./infra/update-stack.sh # Generates infra/stack.cf.json

aws cloudformation deploy \
    --stack-name "${AWS_CF_STACK_NAME}" \
    --template-file infra/stack.cf.json \
    --region "${AWS_REGION}"