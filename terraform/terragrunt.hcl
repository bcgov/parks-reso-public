locals {
  tfc_hostname     = "app.terraform.io"
  tfc_organization = "bcgov"
  project          = "pil3ef"
  environment      = reverse(split("/", get_terragrunt_dir()))[0]
}

generate "remote_state" {
  path      = "backend.tf"
  if_exists = "overwrite"
  contents  = <<EOF
terraform {
  backend "remote" {
    hostname = "${local.tfc_hostname}"
    organization = "${local.tfc_organization}"
    workspaces {
      name = "${local.project}-${local.environment}-public"
    }
  }
}
EOF
}

locals {
  app_version = get_env("app_version", "")
  target_env = get_env("target_env", "")
  s3_bucket = get_env("s3_bucket", "")
  aws_region = get_env("aws_region", "")
  s3_bucket_assets = get_env("s3_bucket_assets", "")
  target_aws_account_id = get_env("target_aws_account_id", "")
  origin_id = get_env("origin_id", "")
  api_gateway_origin_domain = get_env("api_gateway_origin_domain", "")
  api_gateway_origin_id = get_env("api_gateway_origin_id", "")
  api_gateway_path_pattern = get_env("api_gateway_path_pattern", "")
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
provider "aws" {
  region  = local.aws_region

  assume_role {
    role_arn = "arn:aws:iam::$${local.target_aws_account_id}:role/BCGOV_$${local.target_env}_Automation_Admin_Role"
  }
}
EOF
}
