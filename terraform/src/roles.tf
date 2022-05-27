resource "aws_iam_role" "basicExecutionRole" {
  name = "lambdaExecutionRole-${random_string.postfix.result}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

}

resource "aws_iam_role" "parkRole" {
  name = "lambdaparkRole-${random_string.postfix.result}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

}

resource "aws_iam_role" "databaseReadRole" {
  name = "databaseReadRole-${random_string.postfix.result}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "databaseReadRolePolicy" {
  name = "databaseReadRolePolicy-${random_string.postfix.result}"
  role = aws_iam_role.databaseReadRole.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Effect": "Allow",
        "Action": [
            "dynamodb:BatchGet*",
            "dynamodb:DescribeStream",
            "dynamodb:DescribeTable",
            "dynamodb:Get*",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:BatchWrite*",
            "dynamodb:CreateTable",
            "dynamodb:Delete*",
            "dynamodb:Update*",
            "dynamodb:PutItem"
        ],
        "Resource": "${aws_dynamodb_table.ar_table.arn}"
      }
  ]
}
  EOF
}

resource "aws_iam_role" "exportInvokeRole" {
  name = "exportInvokeRole-${random_string.postfix.result}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "exportInvokeRolePolicy" {
  name        = "exportInvokeRolePolicy-${random_string.postfix.result}"
  role        = aws_iam_role.exportInvokeRole.id

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1464440182000",
            "Effect": "Allow",
            "Action": [
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:PutItem",
                "s3:PutObject"
            ],
            "Resource": [
                "${aws_dynamodb_table.ar_table.arn}",
                "${aws_s3_bucket.bcgov-parks-ar-assets.arn}/*"
            ]
        }
    ]
}
EOF
}

resource "aws_iam_role" "exportGetRole" {
  name = "exportGetRole-${random_string.postfix.result}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "exportGetRolePolicy" {
  name = "exportGetRolePolicy-${random_string.postfix.result}"
  role = aws_iam_role.exportGetRole.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Effect": "Allow",
        "Action": [
            "dynamodb:Query",
            "lambda:InvokeAsync",
            "lambda:InvokeFunction",
            "s3:GetObject"
        ],
        "Resource": [
          "${aws_dynamodb_table.ar_table.arn}",
          "${aws_lambda_function.exportInvokableLambda.arn}",
          "${aws_s3_bucket.bcgov-parks-ar-assets.arn}/*"
        ]
      }
  ]
}
  EOF
}