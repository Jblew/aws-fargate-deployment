#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"
set -e

source ./config.sh
export AWS_PAGER="" # AWS Cli sometimes uses a pager, which breaks the script. Lets disable it.

# Env SRC_API_S3_BUCKET_NAME must exist
if [ -z "${SRC_API_S3_BUCKET_NAME}" ]; then
    echo "SRC_API_S3_BUCKET_NAME must be set"
    exit 1
fi

aws s3 sync \
    --delete \
    ./api "s3://${SRC_API_S3_BUCKET_NAME}"