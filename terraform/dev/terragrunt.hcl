terraform {
  source = "../src"
}
include {
  path = find_in_parent_folders()
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

generate "dev_tfvars" {
  path              = "dev.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
app_version = "${local.app_version}"
target_env = "${local.target_env}"
s3_bucket = "${local.s3_bucket}"
aws_region = "${local.aws_region}"
s3_bucket_assets = "${local.s3_bucket_assets}"
target_aws_account_id = "${local.target_aws_account_id}"
origin_id = "${local.origin_id}"
api_gateway_origin_domain = "${local.api_gateway_origin_domain}"
api_gateway_origin_id = "${local.api_gateway_origin_id}"
api_gateway_path_pattern = "${local.api_gateway_path_pattern}"
EOF
}
