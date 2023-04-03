resource "aws_dynamodb_table" "ar_config_table" {
  name           = "config-${random_string.postfix.result}"
  hash_key       = "pk"
  billing_mode   = "PAY_PER_REQUEST"
  table_class    = "STANDARD_INFREQUENT_ACCESS"

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
}

resource "aws_backup_plan" "backup" {
  name = "backup_plan-config-${random_string.postfix.result}"

  rule {
    rule_name         = "backup_rule-config-${random_string.postfix.result}"
    target_vault_name = aws_backup_vault.backup_vault.name
    schedule          = "cron(0 12 * * ? *)"

    lifecycle {
      delete_after = 360
    }
  }
}