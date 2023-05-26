resource "aws_lambda_function" "parkGetLambda" {
  function_name = "park-get-${random_string.postfix.result}"

  filename         = "artifacts/parkGet.zip"
  source_code_hash = filebase64sha256("artifacts/parkGet.zip")

  handler = "lambda/park/GET/index.handler"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.databaseReadRole.arn

  environment {
    variables = {
      TABLE_NAME  = aws_dynamodb_table.ar_table.name,
      SSO_ISSUER  = data.aws_ssm_parameter.sso_issuer.value,
      SSO_ORIGIN  = data.aws_ssm_parameter.sso_origin.value,
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jwksuri.value,
      LOG_LEVEL   = "info"
    }
  }
}

resource "aws_lambda_function" "parkPostLambda" {
  function_name = "park-post-${random_string.postfix.result}"

  filename         = "artifacts/parkPost.zip"
  source_code_hash = filebase64sha256("artifacts/parkPost.zip")

  handler = "lambda/park/POST/index.handler"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.databaseReadRole.arn

  environment {
    variables = {
      SSO_ISSUER  = data.aws_ssm_parameter.sso_issuer.value,
      SSO_ORIGIN  = data.aws_ssm_parameter.sso_origin.value,
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jwksuri.value,
      SSO_URL = data.aws_ssm_parameter.sso_origin.value,
      SSO_CLIENT_ID = data.aws_ssm_parameter.keycloak_client_id.value,
      TABLE_NAME  = aws_dynamodb_table.ar_table.name,
      LOG_LEVEL   = "info"
    }
  }
}

resource "aws_lambda_alias" "parkGetLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.parkGetLambda.function_name
  function_version = aws_lambda_function.parkGetLambda.version
}

resource "aws_lambda_alias" "parkPostLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.parkPostLambda.function_name
  function_version = aws_lambda_function.parkPostLambda.version
}

resource "aws_api_gateway_resource" "parkResource" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  parent_id   = aws_api_gateway_rest_api.apiLambda.root_resource_id
  path_part   = "park"
}

// Defines the HTTP GET /park API
resource "aws_api_gateway_method" "parkGet" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = aws_api_gateway_resource.parkResource.id
  http_method   = "GET"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "parkGetIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.parkResource.id
  http_method = aws_api_gateway_method.parkGet.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.parkGetLambda.invoke_arn
}

// Defines the HTTP POST /park API
resource "aws_api_gateway_method" "parkPost" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = aws_api_gateway_resource.parkResource.id
  http_method   = "POST"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "parkPostIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.parkResource.id
  http_method = aws_api_gateway_method.parkPost.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.parkPostLambda.invoke_arn
}

resource "aws_lambda_permission" "parkGetPermission" {
  statement_id  = "parkGetPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.parkGetLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/GET/park"
}

resource "aws_lambda_permission" "parkPostPermission" {
  statement_id  = "parkPostPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.parkGetLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/POST/park"
}

//CORS
resource "aws_api_gateway_method" "park_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = aws_api_gateway_resource.parkResource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "park_options_200" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.parkResource.id
  http_method = aws_api_gateway_method.park_options_method.http_method
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  depends_on = [aws_api_gateway_method.park_options_method]
}

resource "aws_api_gateway_integration" "park_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.parkResource.id
  http_method = aws_api_gateway_method.park_options_method.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" : "{\"statusCode\": 200}"
  }
  depends_on = [aws_api_gateway_method.park_options_method]
}

resource "aws_api_gateway_integration_response" "park_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.parkResource.id
  http_method = aws_api_gateway_method.park_options_method.http_method

  status_code = aws_api_gateway_method_response.park_options_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_method_response.park_options_200]
}
