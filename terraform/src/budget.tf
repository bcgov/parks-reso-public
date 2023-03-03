
resource "aws_budgets_budget" "cost" {

  name              = "parks-reso-public-${var.target_env}-monthly"
  budget_type       = "COST"
  limit_amount      = var.budget_amount
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = formatdate("YYYY-MM-01_12:00", timestamp())

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 75
    threshold_type            = "PERCENTAGE"
    notification_type         = "FORECASTED"
    subscriber_sns_topic_arns = [aws_sns_topic.billing_alert_topic_public.arn]
  }

  cost_filter = {
    TagKeyValue = "user:Project$BC Parks Day Pass Public System"
  }
}


resource "aws_sns_topic" "billing_alert_topic_public" {
  name = "parks-reso-public-billing-alert-topic"
}
