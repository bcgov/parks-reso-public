resource "aws_lambda_function" "export" {
  function_name = "export-${random_string.postfix.result}"

  filename         = "artifacts/exportInvokable.zip"
  source_code_hash = filebase64sha256("artifacts/exportInvokable.zip")

  handler = "lambda/export/invokable/index.handler"
  runtime = "nodejs14.x"
  publish = "true"

  timeout = 45
  memory_size = 2048

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.ar_table.name,
      FILE_PATH = "/tmp/",
      FILE_NAME = "A&R_Export.xlsx",
      S3_BUCKET_DATA = aws_s3_bucket.bcgov-parks-ar-assets.id,
      JOB_UPDATE_MODULO = 1,
      DISABLE_PROGRESS_UPDATES = false,
      DISABLE_HIGH_ACCURACY_PROGRESS_PERCENTAGE = false
    }
  }
  role = aws_iam_role.lambdaExportRole.arn
}

resource "aws_lambda_alias" "export_latest" {
  name             = "latest"
  function_name    = aws_lambda_function.export.function_name
  function_version = aws_lambda_function.export.version
}

resource "aws_lambda_function" "exportGetLambda" {
  function_name = "export-get-${random_string.postfix.result}"

  filename         = "artifacts/exportGet.zip"
  source_code_hash = filebase64sha256("artifacts/exportGet.zip")

  handler = "lambda/export/GET/index.handler"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.exportGetRole.arn

  environment {
    variables = {
      TABLE_NAME  = aws_dynamodb_table.ar_table.name,
      SSO_ISSUER  = data.aws_ssm_parameter.sso_issuer.value
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jkwsuri.value
    }
  }
}


# resource "aws_cloudwatch_event_rule" "export_every_midnight" {
#   name                = "export-every-midnight"
#   description         = "Fires every 12 AM"
#   schedule_expression = "cron(0 7 ? * * *)"
# }

# resource "aws_cloudwatch_event_target" "export_every_midnight" {
#   rule      = aws_cloudwatch_event_rule.export_every_midnight.name
#   target_id = "export"
#   arn       = aws_lambda_function.export.arn
# }

# resource "aws_lambda_permission" "allow_cloudwatch_to_call_export" {
#   statement_id  = "AllowExecutionFromCloudWatch"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.export.function_name
#   principal     = "events.amazonaws.com"
#   source_arn    = aws_cloudwatch_event_rule.export_every_midnight.arn
# }
