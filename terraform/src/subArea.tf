#getSubArea
resource "aws_lambda_function" "subAreaGetLambda" {
  function_name = "subArea-get-${random_string.postfix.result}"

  filename         = "artifacts/subAreaGet.zip"
  source_code_hash = filebase64sha256("artifacts/subAreaGet.zip")

  handler = "lambda/subArea/GET/index.handler"
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
      TABLE_NAME  = aws_dynamodb_table.ar_table.name,
      LOG_LEVEL   = "info"
    }
  }
}

resource "aws_lambda_alias" "subAreaGetLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.subAreaGetLambda.function_name
  function_version = aws_lambda_function.subAreaGetLambda.version
}

resource "aws_lambda_permission" "subAreaGetPermission" {
  statement_id  = "subAreaGetPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subAreaGetLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/GET/subArea"
}

#postSubArea
resource "aws_lambda_function" "subAreaPostLambda" {
  function_name = "subArea-post-${random_string.postfix.result}"

  filename         = "artifacts/subAreaPost.zip"
  source_code_hash = filebase64sha256("artifacts/subAreaPost.zip")

  handler = "lambda/subArea/POST/index.handler"
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
      TABLE_NAME  = aws_dynamodb_table.ar_table.name,
      LOG_LEVEL   = "info"
    }
  }
}

resource "aws_lambda_alias" "subAreaPostLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.subAreaPostLambda.function_name
  function_version = aws_lambda_function.subAreaPostLambda.version
}

resource "aws_lambda_permission" "subAreaPostPermission" {
  statement_id  = "subAreaPostPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subAreaPostLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/POST/subArea"
}

#putSubArea
resource "aws_lambda_function" "subAreaPutLambda" {
  function_name = "subArea-put-${random_string.postfix.result}"

  filename         = "artifacts/subAreaPut.zip"
  source_code_hash = filebase64sha256("artifacts/subAreaPut.zip")

  handler = "lambda/subArea/PUT/index.handler"
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
      TABLE_NAME  = aws_dynamodb_table.ar_table.name,
      LOG_LEVEL   = "info"
    }
  }
}

resource "aws_lambda_alias" "subAreaPutLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.subAreaPutLambda.function_name
  function_version = aws_lambda_function.subAreaPutLambda.version
}

resource "aws_lambda_permission" "subAreaPutPermission" {
  statement_id  = "subAreaPutPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subAreaPutLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/PUT/subArea"
}

# Resources - subAreas
module "subAreaResource" {
  source               = "./modules/cors-enabled-api-resource"
  resource_rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_parent_id   = aws_api_gateway_rest_api.apiLambda.root_resource_id
  resource_path_part   = "subArea"
}

// Defines the HTTP GET /subArea API
resource "aws_api_gateway_method" "subAreaGet" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.subAreaResource.resource.id
  http_method   = "GET"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "subAreaGetIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.subAreaResource.resource.id
  http_method = aws_api_gateway_method.subAreaGet.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.subAreaGetLambda.invoke_arn
}

// Defines the HTTP POST /subArea API
resource "aws_api_gateway_method" "subAreaPost" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.subAreaResource.resource.id
  http_method   = "POST"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "subAreaPostIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.subAreaResource.resource.id
  http_method = aws_api_gateway_method.subAreaPost.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.subAreaPostLambda.invoke_arn
}

// Defines the HTTP PUT /subArea API
resource "aws_api_gateway_method" "subAreaPut" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.subAreaResource.resource.id
  http_method   = "PUT"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "subAreaPutIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.subAreaResource.resource.id
  http_method = aws_api_gateway_method.subAreaPut.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.subAreaPutLambda.invoke_arn
}
