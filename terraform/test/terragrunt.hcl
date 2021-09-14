terraform {
  source = "../src"
}
include {
  path = find_in_parent_folders()
}

locals {
  app_version = get_env("app_version", "")
  s3_bucket = get_env("s3_bucket", "")
  s3_bucket_assets = get_env("s3_bucket_assets", "")
  origin_id = get_env("origin_id", "")
  api_gateway_origin_domain = get_env("api_gateway_origin_domain", "")
  api_gateway_origin_id = get_env("api_gateway_origin_id", "")
  api_gateway_path_pattern = get_env("api_gateway_path_pattern", "")
  origin_id_assets = get_env("origin_id_assets", "")
}

generate "test_tfvars" {
  path              = "test.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
app_version = "${local.app_version}"
s3_bucket = "${local.s3_bucket}"
s3_bucket_assets = "${local.s3_bucket_assets}"
origin_id = "${local.origin_id}"
api_gateway_origin_domain = "${local.api_gateway_origin_domain}"
api_gateway_origin_id = "${local.api_gateway_origin_id}"
api_gateway_path_pattern = "${local.api_gateway_path_pattern}"
origin_id_assets = "${local.origin_id_assets}"
EOF
}
