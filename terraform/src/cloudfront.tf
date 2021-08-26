#Public site - bucket containing the static files to serve out
resource "aws_s3_bucket" "bcgov-parks-reso-public" {
  bucket = "${var.s3_bucket}-${var.target_env}"
  acl    = "private"

  tags   = {
    Name = var.s3_bucket_name
  }
}

#bucket to hold cloudfront logs
resource "aws_s3_bucket" "parks-reso-public-logs" {
  bucket = "${var.s3_bucket}-logs-${var.target_env}"
  acl    = "private"

  tags   = {
    Name = "${var.s3_bucket_name} Logs"
  }
}

resource "aws_cloudfront_origin_access_identity" "parks-reso-public-oai" {
  comment = "Cloud front OAI for BC Parks reservations public delivery"
}

#setup a cloudfront distribution to serve out the frontend files from s3 (github actions will push builds there)
resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.bcgov-parks-reso-public.bucket_regional_domain_name
    origin_id   = var.s3_origin_id
    origin_path = "/${var.app_version}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.parks-reso-public-oai.cloudfront_access_identity_path
    }
  }

  # This origin is for setting up the api to be accessible from the front-end domain
  # origin {
  #   domain_name = var.api_gateway_domain
  #   origin_id   = var.api_gateway_origin_id
  # }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.parks-reso-public-logs.bucket_domain_name
    prefix          = "logs"
  }

  # aliases = [ var.domain_name ]
  custom_error_response {
    error_code    = 404
    response_code = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code    = 403
    response_code = 200
    response_page_path = "/index.html"
  }

  ordered_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "POST"]
    cached_methods   = []
    path_pattern           = var.api_gateway_path_pattern
    target_origin_id       = var.api_gateway_origin_id
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = var.s3_origin_id

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
    Name        = "BC Parks DUP Public"
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

#Distrubtion and bucket for parks assets such as images
resource "aws_s3_bucket" "bcgov-parks-reso-assets" {
  bucket = "${var.s3_bucket_assets}-${var.target_env}"
  acl    = "private"

  tags   = {
    Name = var.s3_bucket_assets_name
  }
}

resource "aws_cloudfront_origin_access_identity" "parks-reso-assets-oai" {
  comment = "Cloud front OAI for BC Parks reservations assets delivery"
}

resource "aws_cloudfront_distribution" "s3_assets_distribution" {
   origin {
    domain_name = aws_s3_bucket.bcgov-parks-reso-assets.bucket_regional_domain_name
    origin_id   = "parks-assets-s3-origin"
    origin_path = "/assets/images"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.parks-reso-assets-oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.parks-reso-public-logs.bucket_domain_name
    prefix          = "logs"
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "parks-assets-s3-origin"

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
    Name        = "BC Parks DUP Assets"
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}