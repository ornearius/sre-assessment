#!/bin/bash
BASE_PATH=$(pwd)
# Build the two docker images. Note that normally the names would be parameterized so that
# they are consistent through the entire script and easy to change if required.
docker-compose build

# Tag the images. Normally the version would be passed in or set an an environment variable
# These are set to push to ECR would generally be a better option as it is in platform.
VERSION=1.0.0

docker tag cptodoui "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/cptodoui:$VERSION"
docker tag cptodoui "$AWS_ACCOUNT.ecr.$AWS_REGION.amazonaws.com/cptodoapi:$VERSION"

docker push "coffeesocial/cptodoui:$VERSION"
docker push "coffeesocial/cptodoapi:$VERSION"

cd "$BASE_PATH"/Stack

cdk bootstrap

export VERSION=$VERSION
cdk deploy
