terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.46.0"
    }
  }
}

provider "aws" {
  alias  = "ca"
  region = var.aws_region
}

resource "random_string" "postfix" {
  length           = 8
  special          = false
}

resource "aws_api_gateway_rest_api" "apiLambda" {
  name = "ParksARPassAPI-${random_string.postfix.result}"
  description = "Attendance and Revenue API"
}

resource "aws_api_gateway_deployment" "apideploy" {
  depends_on = [
    aws_api_gateway_integration.parkGetIntegration,
    aws_api_gateway_integration.parkPostIntegration,
    aws_api_gateway_integration.subareaGetIntegration,
    aws_api_gateway_integration.subareaPostIntegration
  ]

  rest_api_id = aws_api_gateway_rest_api.apiLambda.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.apiLambda.body))
  }

  lifecycle {
    create_before_destroy = true
  }

  variables = {
    "timestamp" = timestamp()
  }
}

resource "aws_api_gateway_stage" "api_stage" {
  deployment_id = aws_api_gateway_deployment.apideploy.id
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id

  stage_name = "api"
}

// Tells us what our api endpoint is in the CLI
output "base_url" {
  value = aws_api_gateway_deployment.apideploy.invoke_url
}

resource "aws_iam_policy" "lambda_logging" {
  name        = "lambda_logging-${random_string.postfix.result}"
  path        = "/"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_park_cloudwatch_logs" {
  role       = aws_iam_role.parkRole.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

resource "aws_api_gateway_account" "ARAPIGateway" {
  cloudwatch_role_arn = aws_iam_role.cloudwatch.arn
}

resource "aws_iam_role" "cloudwatch" {
  name = "api_gateway_cloudwatch_global-${random_string.postfix.result}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "cloudwatch" {
  name = "cloudwatch-role-policy-${random_string.postfix.result}"
  role = aws_iam_role.cloudwatch.id

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams",
                "logs:PutLogEvents",
                "logs:GetLogEvents",
                "logs:FilterLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}
