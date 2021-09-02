locals {
  tfc_hostname     = "app.terraform.io"
  tfc_organization = "bcgov"
  aws_region = get_env("aws_region", "")
  target_aws_account_id = get_env("target_aws_account_id", "")
  target_env = get_env("target_env", "")
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
