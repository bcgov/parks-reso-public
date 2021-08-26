# resource "aws_acm_certificate" "parks_reso_public_cert" {
#   domain_name       = var.domain_name
#   validation_method = "DNS"

#   tags = {
#     Environment = var.target_env
#     Name        = "Parks public cert"
#   }

#   lifecycle {
#     create_before_destroy = true
#   }
# }
