#getSubArea
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
      SSO_ISSUER  = data.aws_ssm_parameter.sso_issuer.value,
      SSO_JWKSURI = data.aws_ssm_parameter.sso_jwksuri.value,
      TABLE_NAME  = "${data.aws_ssm_parameter.db_name.value}-${random_string.postfix.result}"
    }
  }
}

resource "aws_lambda_alias" "subareaGetLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.subareaGetLambda.function_name
  function_version = aws_lambda_function.subareaGetLambda.version
}

resource "aws_lambda_permission" "subareaGetPermission" {
  statement_id  = "subareaGetPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subareaGetLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/GET/subarea"
}

#postSubArea
resource "aws_lambda_function" "subareaPostLambda" {
  function_name = "subarea-post-${random_string.postfix.result}"

  filename         = "artifacts/subareaPost.zip"
  source_code_hash = filebase64sha256("artifacts/subareaPost.zip")

  handler = "lambda/subarea/POST/index.handlePost"
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

resource "aws_lambda_alias" "subareaPostLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.subareaPostLambda.function_name
  function_version = aws_lambda_function.subareaPostLambda.version
}

resource "aws_lambda_permission" "subareaPostPermission" {
  statement_id  = "subareaPostPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subareaPostLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/POST/subarea"
}

#lockSubAreaRecord
resource "aws_lambda_function" "subareaRecordLockLambda" {
  function_name = "subarea-record-lock-${random_string.postfix.result}"

  filename         = "artifacts/subareaRecordLock.zip"
  source_code_hash = filebase64sha256("artifacts/subareaRecordLock.zip")

  handler = "lambda/subarea/POST/index.handleLock"
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

resource "aws_lambda_alias" "subareaRecordLockLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.subareaRecordLockLambda.function_name
  function_version = aws_lambda_function.subareaRecordLockLambda.version
}

resource "aws_lambda_permission" "subareaRecordLockPermission" {
  statement_id  = "subareaRecordLockPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subareaRecordLockLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/POST/subarea/lock"
}

#unlockSubAreaRecord
resource "aws_lambda_function" "subareaRecordUnlockLambda" {
  function_name = "subarea-record-unlock-${random_string.postfix.result}"

  filename         = "artifacts/subareaRecordUnlock.zip"
  source_code_hash = filebase64sha256("artifacts/subareaRecordUnlock.zip")

  handler = "lambda/subarea/POST/index.handleUnlock"
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

resource "aws_lambda_alias" "subareaRecordUnlockLambdaLatest" {
  name             = "latest"
  function_name    = aws_lambda_function.subareaRecordUnlockLambda.function_name
  function_version = aws_lambda_function.subareaRecordUnlockLambda.version
}

resource "aws_lambda_permission" "subareaRecordUnlockPermission" {
  statement_id  = "subareaRecordUnlockPermissionInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.subareaRecordUnlockLambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apiLambda.execution_arn}/*/POST/subarea/unlock"
}

# Resources - subareas
module "subareaResource" {
  source               = "./modules/cors-enabled-api-resource"
  resource_rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_parent_id   = aws_api_gateway_rest_api.apiLambda.root_resource_id
  resource_path_part   = "subarea"
}

// Defines the HTTP GET /subarea API
resource "aws_api_gateway_method" "subareaGet" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.subareaResource.resource.id
  http_method   = "GET"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "subareaGetIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.subareaResource.resource.id
  http_method = aws_api_gateway_method.subareaGet.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.subareaGetLambda.invoke_arn
}

// Defines the HTTP POST /subarea API
resource "aws_api_gateway_method" "subareaPost" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.subareaResource.resource.id
  http_method   = "POST"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "subareaPostIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.subareaResource.resource.id
  http_method = aws_api_gateway_method.subareaPost.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.subareaPostLambda.invoke_arn
}

# Resources - lock subareas
module "subareaRecordLockResource" {
  source               = "./modules/cors-enabled-api-resource"
  resource_rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_parent_id   = module.subareaResource.resource.id
  resource_path_part   = "lock"
}

// Defines the HTTP POST /subarea/lock API
resource "aws_api_gateway_method" "subareaRecordLockMethod" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.subareaRecordLockResource.resource.id
  http_method   = "POST"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "subareaRecordLockIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.subareaRecordLockResource.resource.id
  http_method = aws_api_gateway_method.subareaRecordLockMethod.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.subareaRecordLockLambda.invoke_arn
}

# Resources - unlock subareas
module "subareaRecordUnlockResource" {
  source               = "./modules/cors-enabled-api-resource"
  resource_rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_parent_id   = module.subareaResource.resource.id
  resource_path_part   = "unlock"
}

// Defines the HTTP POST /subarea/unlock API
resource "aws_api_gateway_method" "subareaRecordUnlockMethod" {
  rest_api_id   = aws_api_gateway_rest_api.apiLambda.id
  resource_id   = module.subareaRecordUnlockResource.resource.id
  http_method   = "POST"
  authorization = "NONE"
}

// Integrates the APIG to Lambda via POST method
resource "aws_api_gateway_integration" "subareaRecordUnlockIntegration" {
  rest_api_id = aws_api_gateway_rest_api.apiLambda.id
  resource_id = module.subareaRecordUnlockResource.resource.id
  http_method = aws_api_gateway_method.subareaRecordUnlockMethod.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.subareaRecordUnlockLambda.invoke_arn
}
