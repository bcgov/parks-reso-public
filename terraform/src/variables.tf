# variables.tf

variable "target_env" {
  description = "AWS workload account env (e.g. dev, test, prod, sandbox, unclass)"
}

variable "origin_id_assets" {
  description = "Origin id for assets distribution"
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

variable "origin_id" {
  description = "Cloudfront origin name"
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

variable "api_gateway_origin_domain" {
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

variable "enable_auth" {
  description = "Enable public site basic auth"
  default     = false
}

variable "auth_user" {
  description = "Public site basic auth username"
  default     = "username"
}

variable "auth_pass" {
  description = "Public site basic auth password"
  default     = "password"
}

variable "enable_vanity_domain" {
  description = "Enable public vanity domain"
  default     = false
}

variable "vanity_domain" {
  description = "Public vanity domain"
  default     = []
}

variable "vanity_domain_certs_arn" {
  description = "Public vanity domain certs ARN"
  default     = ""
}
