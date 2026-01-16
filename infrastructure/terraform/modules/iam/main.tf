# IAM Module - Service Accounts & Roles

variable "project_id" {}
variable "system_prefix" {}
variable "environment" {}
variable "pubsub_topics" { type = map(string) }
variable "property_db_instance" { type = string }
variable "vector_db_instance" { type = string }

locals {
  services = [
    "frontend",
    "auth",
    "data-ingest",
    "imagery-processor",
    "data-processor",
    "property-search",
    "valuation-ai",
    "voice-agent",
    "crm-sync",
    "calendar-sync",
    "billing"
  ]
}

# Create service accounts for each service
resource "google_service_account" "service_accounts" {
  for_each = toset(local.services)

  account_id   = "${var.system_prefix}-${each.value}-sa"
  display_name = "Service account for ${var.system_prefix} ${each.value} service"

  depends_on = []
}

# Cloud Run invoker permissions
resource "google_project_iam_member" "cloud_run_invoker" {
  for_each = google_service_account.service_accounts

  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${each.value.email}"
}

# Cloud SQL client permissions
resource "google_project_iam_member" "cloud_sql_client" {
  for_each = google_service_account.service_accounts

  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${each.value.email}"
}

# Pub/Sub publisher permissions
resource "google_pubsub_topic_iam_member" "pubsub_publisher" {
  for_each = var.pubsub_topics

  topic  = each.value
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${google_service_account.service_accounts["data-ingest"].email}"
}

resource "google_pubsub_topic_iam_member" "pubsub_subscriber" {
  for_each = var.pubsub_topics

  topic  = each.value
  role   = "roles/pubsub.subscriber"
  member = "serviceAccount:${google_service_account.service_accounts["data-processor"].email}"
}

# Secret Manager access
resource "google_secret_manager_secret_iam_member" "secret_accessor" {
  for_each = google_service_account.service_accounts

  secret_id = "projects/${var.project_id}/secrets/${var.system_prefix}-*"
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${each.value.email}"
}

# Vertex AI permissions for AI services
resource "google_project_iam_member" "vertex_ai_user" {
  for_each = toset(["imagery-processor", "data-processor", "valuation-ai", "voice-agent"])

  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.service_accounts[each.value].email}"
}

# Google Maps API permissions
resource "google_project_iam_member" "maps_api_user" {
  for_each = toset(["imagery-processor"])

  project = var.project_id
  role    = "roles/cloudmaps.viewer"
  member  = "serviceAccount:${google_service_account.service_accounts[each.value].email}"
}

# Logging permissions
resource "google_project_iam_member" "logging_writer" {
  for_each = google_service_account.service_accounts

  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${each.value.email}"
}

# Monitoring permissions
resource "google_project_iam_member" "monitoring_writer" {
  for_each = google_service_account.service_accounts

  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${each.value.email}"
}

output "service_account_emails" {
  value = { for k, v in google_service_account.service_accounts : k => v.email }
}

output "service_account_ids" {
  value = { for k, v in google_service_account.service_accounts : k => v.unique_id }
}
