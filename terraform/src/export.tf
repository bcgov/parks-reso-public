# ============= EXPORT INVOKABLE =============
resource "aws_lambda_function" "exportInvokableLambda" {
  function_name = "export-invokable-${random_string.postfix.result}"

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
      FILE_NAME = "A&R_Export",
      S3_BUCKET_DATA = aws_s3_bucket.bcgov-parks-ar-assets.id,
      JOB_UPDATE_MODULO = 1,
      DISABLE_PROGRESS_UPDATES = false,
      DISABLE_HIGH_ACCURACY_PROGRESS_PERCENTAGE = false
    }
  }
  role = aws_iam_role.exportInvokeRole.arn
}

resource "aws_lambda_alias" "export_invokable_latest" {
  name             = "latest"
  function_name    = aws_lambda_function.exportInvokableLambda.function_name
  function_version = aws_lambda_function.exportInvokableLambda.version
}

# ============= EXPORT GET =============
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
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jkwsuri.value,
      S3_BUCKET_DATA = aws_s3_bucket.bcgov-parks-ar-assets.id,
      EXPORT_FUNCTION_NAME = aws_lambda_function.exportInvokableLambda.function_name
    }
  }
}

resource "aws_lambda_alias" "export_get_latest" {
  name             = "latest"
  function_name    = aws_lambda_function.exportGetLambda.function_name
  function_version = aws_lambda_function.exportGetLambda.version
}

resource "aws_api_gateway_integration" "exportGetIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.exportResource.id
  http_method = aws_api_gateway_method.exportGet.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.exportGetLambda.invoke_arn
}

resource "aws_lambda_permission" "exportGetPermission" {
  statement_id  = "exportGetPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.exportGetLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/GET/export"
}

resource "aws_api_gateway_resource" "exportResource" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  parent_id   = aws_api_gateway_rest_api.apiLambda.root_resource_id
  path_part   = "export"
}

resource "aws_api_gateway_method" "exportGet" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = aws_api_gateway_resource.exportResource.id
  http_method   = "GET"
  authorization = "NONE"
}

//CORS
resource "aws_api_gateway_method" "export_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = aws_api_gateway_resource.exportResource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "export_options_200" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.exportResource.id
  http_method = aws_api_gateway_method.export_options_method.http_method
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  depends_on = [aws_api_gateway_method.export_options_method]
}

resource "aws_api_gateway_integration" "export_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.exportResource.id
  http_method = aws_api_gateway_method.export_options_method.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" : "{\"statusCode\": 200}"
  }
  depends_on = [aws_api_gateway_method.export_options_method]
}

resource "aws_api_gateway_integration_response" "export_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.exportResource.id
  http_method = aws_api_gateway_method.export_options_method.http_method

  status_code = aws_api_gateway_method_response.export_options_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_method_response.export_options_200]
}
