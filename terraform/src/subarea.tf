resource "aws_lambda_function" "subareaGetLambda" {
  function_name = "subarea-get-${random_string.postfix.result}"

  filename         = "artifacts/subareaGet.zip"
  source_code_hash = filebase64sha256("artifacts/subareaGet.zip")

  handler = "lambda/subarea/GET/index.handler"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.databaseReadRole.arn

  environment {
    variables = {
      TABLE_NAME  = "${data.aws_ssm_parameter.db_name.value}-${random_string.postfix.result}"
    }
  }
}

resource "aws_lambda_function" "subareaPostLambda" {
  function_name = "subarea-post-${random_string.postfix.result}"

  filename         = "artifacts/subareaPost.zip"
  source_code_hash = filebase64sha256("artifacts/subareaPost.zip")

  handler = "lambda/subarea/POST/index.handler"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.databaseReadRole.arn

  environment {
    variables = {
      TABLE_NAME  = "${data.aws_ssm_parameter.db_name.value}-${random_string.postfix.result}"
    }
  }
}

resource "aws_lambda_alias" "subareaGetLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.subareaGetLambda.function_name
  function_version = aws_lambda_function.subareaGetLambda.version
}

resource "aws_lambda_alias" "subareaPostLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.subareaPostLambda.function_name
  function_version = aws_lambda_function.subareaPostLambda.version
}

resource "aws_api_gateway_resource" "subareaResource" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  parent_id   = aws_api_gateway_rest_api.apiLambda.root_resource_id
  path_part   = "subarea"
}

// Defines the HTTP GET /subarea API
resource "aws_api_gateway_method" "subareaGet" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = aws_api_gateway_resource.subareaResource.id
  http_method   = "GET"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "subareaGetIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.subareaResource.id
  http_method = aws_api_gateway_method.subareaGet.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.subareaGetLambda.invoke_arn
}

// Defines the HTTP POST /subarea API
resource "aws_api_gateway_method" "subareaPost" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = aws_api_gateway_resource.subareaResource.id
  http_method   = "POST"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "subareaPostIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.subareaResource.id
  http_method = aws_api_gateway_method.subareaPost.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.subareaGetLambda.invoke_arn
}

resource "aws_lambda_permission" "subareaGetPermission" {
  statement_id  = "subareaGetPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subareaGetLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/GET/subarea"
}

resource "aws_lambda_permission" "subareaPostPermission" {
  statement_id  = "subareaPostPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subareaPostLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/POST/subarea"
}

//CORS
resource "aws_api_gateway_method" "subarea_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = aws_api_gateway_resource.subareaResource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "subarea_options_200" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.subareaResource.id
  http_method = aws_api_gateway_method.subarea_options_method.http_method
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  depends_on = [aws_api_gateway_method.subarea_options_method]
}

resource "aws_api_gateway_integration" "subarea_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.subareaResource.id
  http_method = aws_api_gateway_method.subarea_options_method.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" : "{\"statusCode\": 200}"
  }
  depends_on = [aws_api_gateway_method.subarea_options_method]
}

resource "aws_api_gateway_integration_response" "subarea_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.subareaResource.id
  http_method = aws_api_gateway_method.subarea_options_method.http_method

  status_code = aws_api_gateway_method_response.subarea_options_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_method_response.subarea_options_200]
}
