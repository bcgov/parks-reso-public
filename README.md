# Parks Reservation - Public

Associated repos:
* https://github.com/bcgov/parks-reso-public
* https://github.com/bcgov/parks-reso-admin
* https://github.com/bcgov/parks-reso-api

# Deployment Pipeline

## Github Actions

On push to the Main branch, three actions run:

1. Lint
2. Unit Tests
3. Deploy to dev

The deploy to dev orchestrates deployment to AWS dev.

## Getting environment variables for Actions and Terraform

There are three places where secrets and variables are stored.

### Github

The secrets stored in Github are required for the AWS configuration in Github actions. The variables are as follows:

* AWS_ROLE_TO_ASSUME
* AWS_ACCESS_KEY_ID
* AWS_REGION
* AWS_SECRET_ACCESS_KEY
* TFC_TEAM_TOKEN

These secrets are permanent and will not have to be changed in the future. 

### Terraform

There are a few secrets and variables that must be stored in Terraform Cloud. This is because they are required for provider initilization. This initialization happens before we are able to get variables from Github so they cannot be passed from AWS Parameter store. The variables are as follows:

* target_env
* AWS_SECRET_ACCESS_KEY
* AWS_ACCESS_KEY_ID
* aws_region
* target_aws_account_id

These variables and secrets are permanent and will not have to be changed in the future.

### AWS Parameter Store

These variables are required by Github Actions as well as Terraform. The variables themselves are stored in AWS Parameter Store. These parameters are organized into four categories:

* parks-reso-api/
* parks-reso-admin/
* parks-reso-public/
* parks-reso-shared/

These variables are passed to Terraform Cloud in the following steps:

```
AWS Parameter Store -> Github -> Terragrunt -> *.auto.tfvars -> Terraform Cloud
```

If a variable must be updated, you must update it from AWS Parameter store.

## Setting configEndpoint to true

We run this step to generate env.js which a variable configEndpoint to true. This sets the application to get configurations from the AWS API Gateway instead of assuming ```localhost:3000```.

## Install, build and upload to S3

S3 requires the static files generated from Angular. To get these files we ```npm i``` and ```ng build```. By doing this, a directory named ```dist``` which holds the static version of the site. This dist folder is uploaded to S3.

## Terragrunt and Terraform Cloud

This creates several things in AWS:

* DynamoDB
* Cloudfront Distribution
* Connections among S3, Cloudfront, DynamoDB and API Gateway.

## Deploying to test and prod

Test pipeline is triggered by publishing a release that is marked as a ```pre-release```.

Prod pipeline is triggered by removing the ```pre-release``` tag from a release.

# Config service

Config service is used to alter frontend via DynamoDB. In Dynamo, an item with the PK and SK of config must exist. Within the attributes, you are able to set certain configurations such as ```KEYCLOAK_ENABLED```, ```API_LOCATION```, and ```debugMode```.

This item is request by the front ends upon client connection.