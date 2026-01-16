# Secret Manager Module

variable "project_id" {}
variable "system_prefix" {}
variable "environment" {}

locals {
  secrets = [
    "db-credentials",
    "jwt-secret",
    "api-keys",
    "google-maps-api-key",
    "stripe-key",
    "crm-credentials",
    "gmail-credentials"
  ]
}

resource "google_secret_manager_secret" "secrets" {
  for_each = toset(local.secrets)

  secret_id = "${var.system_prefix}-${each.value}-${var.environment}"

  replication {
    automatic = true
  }

  labels = {
    environment = var.environment
    system      = var.system_prefix
  }
}

resource "google_secret_manager_secret_iam_member" "cloudbuild" {
  for_each = google_secret_manager_secret.secrets

  secret_id = each.value.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

data "google_project" "project" {
  project_id = var.project_id
}

output "secret_names" {
  value = { for k, v in google_secret_manager_secret.secrets : k => v.name }
}

output "secret_ids" {
  value = { for k, v in google_secret_manager_secret.secrets : k => v.id }
}
