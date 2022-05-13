#Distrubtion and bucket for parks assets such as images
resource "aws_s3_bucket" "bcgov-parks-ar-assets" {
  bucket = "${data.aws_ssm_parameter.s3_bucket_assets.value}-${var.target_env}"
  acl    = "private"

  tags = {
    Name = data.aws_ssm_parameter.s3_bucket_assets_name.value
  }
}

resource "aws_cloudfront_origin_access_identity" "parks-ar-assets-oai" {
  comment = "Cloud front OAI for BC Parks reservations assets delivery"
}

resource "aws_cloudfront_distribution" "s3_assets_distribution" {
  origin {
    domain_name = aws_s3_bucket.bcgov-parks-ar-assets.bucket_regional_domain_name
    origin_id   = data.aws_ssm_parameter.origin_id_assets.value
    origin_path = "/assets"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.parks-ar-assets-oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = data.aws_ssm_parameter.origin_id_assets.value

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["US", "CA", "GB", "DE"]
    }
  }

  tags = {
    Environment = var.target_env
    Name        = "BC Parks AR Assets"
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
