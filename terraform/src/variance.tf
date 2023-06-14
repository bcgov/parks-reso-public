# ===========
# getVariance
# ===========
resource "aws_lambda_function" "varianceGetLambda" {
  function_name = "variance-get-${random_string.postfix.result}"

  filename         = "artifacts/varianceGet.zip"
  source_code_hash = filebase64sha256("artifacts/varianceGet.zip")

  handler = "lambda/variance/GET/index.handler"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.databaseReadRole.arn

  environment {
    variables = {
      SSO_ISSUER  = data.aws_ssm_parameter.sso_issuer.value,
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jwksuri.value,
      TABLE_NAME  = aws_dynamodb_table.ar_table.name,
      LOG_LEVEL   = "info"
    }
  }
}

resource "aws_lambda_alias" "varianceGetLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.varianceGetLambda.function_name
  function_version = aws_lambda_function.varianceGetLambda.version
}

resource "aws_lambda_permission" "varianceGetPermission" {
  statement_id  = "varianceGetPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.varianceGetLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/GET/variance"
}

// Defines the HTTP GET /variance API
resource "aws_api_gateway_method" "varianceGet" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.varianceResource.resource.id
  http_method   = "GET"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "varianceGetIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.varianceResource.resource.id
  http_method = aws_api_gateway_method.varianceGet.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.varianceGetLambda.invoke_arn
}

# ============
# postVariance
# ============
resource "aws_lambda_function" "variancePostLambda" {
  function_name = "variance-post-${random_string.postfix.result}"

  filename         = "artifacts/variancePost.zip"
  source_code_hash = filebase64sha256("artifacts/variancePost.zip")

  handler = "lambda/variance/POST/index.handler"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.databaseReadRole.arn

  environment {
    variables = {
      SSO_ISSUER  = data.aws_ssm_parameter.sso_issuer.value,
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jwksuri.value,
      TABLE_NAME  = aws_dynamodb_table.ar_table.name,
      LOG_LEVEL   = "info"
    }
  }
}

resource "aws_lambda_alias" "variancePostLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.variancePostLambda.function_name
  function_version = aws_lambda_function.variancePostLambda.version
}

resource "aws_lambda_permission" "variancePostPermission" {
  statement_id  = "variancePostPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.variancePostLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/POST/variance"
}

// Defines the HTTP POST /variance API
resource "aws_api_gateway_method" "variancePost" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.varianceResource.resource.id
  http_method   = "POST"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "variancePostIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.varianceResource.resource.id
  http_method = aws_api_gateway_method.variancePost.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.variancePostLambda.invoke_arn
}

# ===========
# putVariance
# ===========
resource "aws_lambda_function" "variancePutLambda" {
  function_name = "variance-put-${random_string.postfix.result}"

  filename         = "artifacts/variancePut.zip"
  source_code_hash = filebase64sha256("artifacts/variancePut.zip")

  handler = "lambda/variance/PUT/index.handler"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.databaseReadRole.arn

  environment {
    variables = {
      SSO_ISSUER  = data.aws_ssm_parameter.sso_issuer.value,
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jwksuri.value,
      TABLE_NAME  = aws_dynamodb_table.ar_table.name,
      LOG_LEVEL   = "info"
    }
  }
}

resource "aws_lambda_alias" "variancePutLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.variancePutLambda.function_name
  function_version = aws_lambda_function.variancePutLambda.version
}

resource "aws_lambda_permission" "variancePutPermission" {
  statement_id  = "variancePutPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.variancePutLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/PUT/variance"
}

// Defines the HTTP PUT /variance API
resource "aws_api_gateway_method" "variancePut" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.varianceResource.resource.id
  http_method   = "PUT"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "variancePutIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.varianceResource.resource.id
  http_method = aws_api_gateway_method.variancePut.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.variancePutLambda.invoke_arn
}

# =====================
# Resources - variances
# =====================
module "varianceResource" {
  source               = "./modules/cors-enabled-api-resource"
  resource_rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_parent_id   = aws_api_gateway_rest_api.apiLambda.root_resource_id
  resource_path_part   = "variance"
}