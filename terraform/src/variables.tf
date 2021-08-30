# variables.tf

variable "target_env" {
  description = "AWS workload account env (e.g. dev, test, prod, sandbox, unclass)"
}

variable "target_aws_account_id" {
  description = "AWS workload account id"
}

variable "aws_region" {
  description = "The AWS region things are created in"
}

variable "s3_bucket" {
  description = "S3 Bucket containing static web files for CloudFront distribution"
  type        = string
  default     = "parks-reso-public"
}

variable "s3_bucket_name" {
  description = "Human readable S3 bucket name for labels"
  type        = string
  default     = "BC Parks Day Pass Public"
}

variable "s3_bucket_assets" {
  description = "S3 Bucket containing static web files for CloudFront distribution"
  type        = string
}

variable "s3_bucket_assets_name" {
  description = "Human readable S3 bucket name for labels"
  type        = string
  default     = "BC Parks Day Pass Assets"
}

variable "s3_origin_id" {
  description = "S3 Origin Id"
  type        = string
}

variable "budget_amount" {
  description = "The amount of spend for the budget. Example: enter 100 to represent $100"
  default     = "100.0"
}

variable "budget_tag" {
  description = "The Cost Allocation Tag that will be used to build the monthly budget. "
  default     = "Project=BC Parks Day Pass Public System"
}

variable "common_tags" {
  description = "Common tags for created resources"
  default = {
    Application = "BC Parks Day Pass Public"
  }
}
variable "app_version" {
  description = "app version to deploy"
  type        = string
}

variable "domain_name" {
  description = "Domain name for CloudFront distribution"
  type        = string
}

variable "api_gateway_domain" {
  description = "Domain name for the current api gateway endpoint"
  type        = string
}

variable "api_gateway_origin_id" {
  description = "Origin id for api gateway"
  type        = string
  default     = "api-gateway"
}

variable "api_gateway_path_pattern" {
  description = "path for api gateway"
  type        = string
  default     = "/dev/*"
}
