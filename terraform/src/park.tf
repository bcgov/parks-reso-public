resource "aws_lambda_function" "parkLambda" {
  function_name = "park"

  filename         = "artifacts/park.zip"
  source_code_hash = filebase64sha256("artifacts/park.zip")

  handler = "lambda/park/index.handler"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  environment {
    variables = {
      TEST_ENV_VAR                   = "mark"
    }
  }

  role = aws_iam_role.parkRole.arn
}

resource "aws_lambda_alias" "parkLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.parkLambda.function_name
  function_version = aws_lambda_function.parkLambda.version
}

resource "aws_api_gateway_resource" "parkResource" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  parent_id   = aws_api_gateway_rest_api.apiLambda.root_resource_id
  path_part   = "park"
}

// Defines the HTTP GET /park API
resource "aws_api_gateway_method" "parkMethod" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = aws_api_gateway_resource.parkResource.id
  http_method   = "GET"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "parkIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = aws_api_gateway_resource.parkResource.id
  http_method = aws_api_gateway_method.parkMethod.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.parkLambda.invoke_arn
}

resource "aws_lambda_permission" "parkPermission" {
  statement_id  = "AllowParksARPassAPIInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.parkLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/GET/park"
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
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_method_response.park_options_200]
}
