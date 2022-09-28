#getFiscalYearEnd
resource "aws_lambda_function" "fiscalYearEndGetLambda" {
  function_name = "fiscalYearEnd-get-${random_string.postfix.result}"

  filename         = "artifacts/fiscalYearEndGet.zip"
  source_code_hash = filebase64sha256("artifacts/fiscalYearEndGet.zip")

  handler = "lambda/fiscalYearEnd/GET/index.handler"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.databaseReadRole.arn

  environment {
    variables = {
      SSO_ISSUER  = data.aws_ssm_parameter.sso_issuer.value,
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jwksuri.value,
      TABLE_NAME  = "${data.aws_ssm_parameter.db_name.value}-${random_string.postfix.result}"
    }
  }
}

resource "aws_lambda_alias" "fiscalYearEndGetLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.fiscalYearEndGetLambda.function_name
  function_version = aws_lambda_function.fiscalYearEndGetLambda.version
}

resource "aws_lambda_permission" "fiscalYearEndGetPermission" {
  statement_id  = "fiscalYearEndGetPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fiscalYearEndGetLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/GET/fiscalYearEnd"
}

# fiscalYearEndLock
resource "aws_lambda_function" "fiscalYearEndLockLambda" {
  function_name = "fiscalYearEnd-lock-${random_string.postfix.result}"

  filename         = "artifacts/fiscalYearEndLock.zip"
  source_code_hash = filebase64sha256("artifacts/fiscalYearEndLock.zip")

  handler = "lambda/fiscalYearEnd/POST/index.lockFiscalYear"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.databaseReadRole.arn

  environment {
    variables = {
      SSO_ISSUER  = data.aws_ssm_parameter.sso_issuer.value,
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jwksuri.value,
      TABLE_NAME  = "${data.aws_ssm_parameter.db_name.value}-${random_string.postfix.result}"
    }
  }
}

resource "aws_lambda_alias" "fiscalYearEndLockLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.fiscalYearEndLockLambda.function_name
  function_version = aws_lambda_function.fiscalYearEndLockLambda.version
}

resource "aws_lambda_permission" "fiscalYearEndLockPermission" {
  statement_id  = "fiscalYearEndLockPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fiscalYearEndLockLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/POST/fiscalYearEnd/lock"
}

# fiscalYearEndUnlock
resource "aws_lambda_function" "fiscalYearEndUnlockLambda" {
  function_name = "fiscalYearEnd-unlock-${random_string.postfix.result}"

  filename         = "artifacts/fiscalYearEndUnlock.zip"
  source_code_hash = filebase64sha256("artifacts/fiscalYearEndUnlock.zip")

  handler = "lambda/fiscalYearEnd/POST/index.unlockFiscalYear"
  runtime = "nodejs14.x"
  timeout = 30
  publish = "true"

  memory_size = 128

  role = aws_iam_role.databaseReadRole.arn

  environment {
    variables = {
      SSO_ISSUER  = data.aws_ssm_parameter.sso_issuer.value,
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jwksuri.value,
      TABLE_NAME  = "${data.aws_ssm_parameter.db_name.value}-${random_string.postfix.result}"
    }
  }
}

resource "aws_lambda_alias" "fiscalYearEndUnlockLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.fiscalYearEndUnlockLambda.function_name
  function_version = aws_lambda_function.fiscalYearEndUnlockLambda.version
}

resource "aws_lambda_permission" "fiscalYearEndUnlockPermission" {
  statement_id  = "fiscalYearEndUnlockPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fiscalYearEndUnlockLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/POST/fiscalYearEnd/unlock"
}

# Resources - fiscalYearEnd
module "fiscalYearEndResource" {
  source               = "./modules/cors-enabled-api-resource"
  resource_rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_parent_id   = aws_api_gateway_rest_api.apiLambda.root_resource_id
  resource_path_part   = "fiscalYearEnd"
}

// Defines the HTTP GET /fiscalYearEnd API
resource "aws_api_gateway_method" "fiscalYearEndGet" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.fiscalYearEndResource.resource.id
  http_method   = "GET"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "fiscalYearEndGetIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.fiscalYearEndResource.resource.id
  http_method = aws_api_gateway_method.fiscalYearEndGet.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.fiscalYearEndGetLambda.invoke_arn
}

# Resources - fiscalYearEndLock
module "fiscalYearEndLockResource" {
  source               = "./modules/cors-enabled-api-resource"
  resource_rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_parent_id   = module.fiscalYearEndResource.resource.id
  resource_path_part   = "lock"
}

// Defines the HTTP POST /fiscalYearEnd Lock API
resource "aws_api_gateway_method" "fiscalYearEndLockMethod" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.fiscalYearEndLockResource.resource.id
  http_method   = "POST"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "fiscalYearEndLockIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.fiscalYearEndLockResource.resource.id
  http_method = aws_api_gateway_method.fiscalYearEndLockMethod.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.fiscalYearEndLockLambda.invoke_arn
}

# Resources - fiscal year end unlock
module "fiscalYearEndUnlockResource" {
  source               = "./modules/cors-enabled-api-resource"
  resource_rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_parent_id   = module.fiscalYearEndResource.resource.id
  resource_path_part   = "unlock"
}

// Defines the HTTP POST /fiscalYearEnd unlock API
resource "aws_api_gateway_method" "fiscalYearEndUnlockMethod" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.fiscalYearEndUnlockResource.resource.id
  http_method   = "POST"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "fiscalYearEndUnlockIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.fiscalYearEndUnlockResource.resource.id
  http_method = aws_api_gateway_method.fiscalYearEndUnlockMethod.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.fiscalYearEndUnlockLambda.invoke_arn
}
