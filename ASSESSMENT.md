# Notes and HowTo 
This is designed to run as part of a CI/CD pipeline.

## Requirements
### Build
1. docker
2. docker repo ie ECR, Docker Hub or local service like Artifactory

### Deployment
1. node
2. aws-cdk

## Authentication
The credentials for Docker Hub (if used) and AWS need to be set up using
[Credentials](https://docs.docker.com/cloud/ecs-integration/)

# Design and setup

For a simple application like this it is tempting to use [docker compose convert](https://docs.docker.com/engine/reference/commandline/compose_convert/) to simply replicate the docker compose development experience. Sadly this is not really ready for integration into CICD.

I have chosen to use the more robust [AWS CDK](https://aws.amazon.com/cdk/) to create the deployment infrastructure. It offers huge advantages over CloudFormation as the CF is programmatically generated in line with AWS well architected best practice. It is available in multiple languages so sits easily alongside the main language of the project. In this case I have chosen to use Typescript to match the Frontend module.
An alternative would be to use [Pulumi](https://www.pulumi.com), or even [Terraform](https://www.terraform.io), with the promise of cloud portability. I have only seen this happen once and with the use of vendor specific services it needed to be rewritten.

CloudFormation based deployments for AWS offer back validation and restoration if the services are modified by people in the account unlike scripted services.

# CICD
This is easily integrated into a build pipeline. AWS CodePipeline is the simplest as it has all the required authentication available in the environment. Other services like GitLab, Jenkins or Bamboo have secrets management build in, or you can use something like HashiCorp Vault.

Please note that this has not been tested extensively as there were no credentials supplied.