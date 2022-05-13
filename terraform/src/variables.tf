variable "target_aws_account_id" {
  description = "AWS workload account id"
}

variable "aws_region" {
  description = "The AWS region things are created in"
  # default     = "ca-central-1"
}

variable "target_env" {
  description = "target environment"
}

data "aws_ssm_parameter" "db_name" {
  name = "/parks-ar-api/db-name"
}

data "aws_ssm_parameter" "s3_bucket_assets" {
  name = "/parks-ar-api/s3-bucket-assets"
}

data "aws_ssm_parameter" "s3_bucket_assets_name" {
  name = "/parks-ar-api/s3-bucket-assets-name"
}

data "aws_ssm_parameter" "origin_id_assets" {
  name = "/parks-ar-api/origin-id-assets"
}
