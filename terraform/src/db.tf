resource "aws_dynamodb_table" "ar_table" {
  name           = aws_dynamodb_table.ar_table.name
  hash_key       = "pk"
  range_key      = "sk"
  billing_mode   = "PAY_PER_REQUEST"

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "database-${random_string.postfix.result}"
  }

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }
}

resource "aws_backup_vault" "backup_vault" {
  name        = "backup_vault-${random_string.postfix.result}"
}

resource "aws_backup_plan" "backup" {
  name = "backup_plan-${random_string.postfix.result}"

  rule {
    rule_name         = "backup_rule-${random_string.postfix.result}"
    target_vault_name = aws_backup_vault.backup_vault.name
    schedule          = "cron(0 12 * * ? *)"

    lifecycle {
      delete_after = 360
    }
  }
}