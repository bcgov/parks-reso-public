resource "aws_lambda_function" "export" {
  function_name = "export"

  filename         = "artifacts/export.zip"
  source_code_hash = filebase64sha256("artifacts/export.zip")

  handler = "lambda/export/index.handler"
  runtime = "nodejs14.x"
  publish = "true"

  timeout = 45
  memory_size = 2048

  environment {
    variables = {
      TABLE_NAME = data.aws_ssm_parameter.db_name.value,
      FILE_PATH = "/env/",
      FILE_NAME = "A&R_Export.xlsx",
      S3_BUCKET_DATA = aws_s3_bucket.bcgov-parks-ar-assets.id
    }
  }
  role = aws_iam_role.lambdaExportRole.arn
}

resource "aws_lambda_alias" "export_latest" {
  name             = "latest"
  function_name    = aws_lambda_function.export.function_name
  function_version = aws_lambda_function.export.version
}

resource "aws_cloudwatch_event_rule" "export_every_midnight" {
  name                = "export-every-midnight"
  description         = "Fires every 12 AM"
  schedule_expression = "cron(0 7 ? * * *)"
}

resource "aws_cloudwatch_event_target" "export_every_midnight" {
  rule      = aws_cloudwatch_event_rule.export_every_midnight.name
  target_id = "export"
  arn       = aws_lambda_function.export.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_export" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.export.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.export_every_midnight.arn
}
