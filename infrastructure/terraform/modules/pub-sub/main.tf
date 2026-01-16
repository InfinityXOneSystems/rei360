# Pub/Sub Module

variable "project_id" {}
variable "system_prefix" {}
variable "environment" {}

locals {
  topics = [
    "raw-data-events",
    "processed-data-events",
    "imagery-events",
    "crm-updates"
  ]
}

resource "google_pubsub_topic" "topics" {
  for_each = toset(local.topics)

  name                       = "${var.system_prefix}-${each.value}-${var.environment}"
  message_retention_duration = var.environment == "prod" ? "86400s" : "3600s"

  labels = {
    environment = var.environment
    system      = var.system_prefix
  }
}

resource "google_pubsub_subscription" "data_processor_sub" {
  name             = "${var.system_prefix}-data-processor-sub-${var.environment}"
  topic            = google_pubsub_topic.topics["raw-data-events"].name
  ack_deadline_seconds = 60

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.topics["processed-data-events"].id
    max_delivery_attempts = 5
  }
}

output "topic_ids" {
  value = { for k, v in google_pubsub_topic.topics : k => v.id }
}

output "topic_names" {
  value = { for k, v in google_pubsub_topic.topics : k => v.name }
}
