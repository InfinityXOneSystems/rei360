# Cloud Run Service Module

variable "project_id" {}
variable "region" {}
variable "system_prefix" {}
variable "environment" {}
variable "service_name" {}
variable "image" {}
variable "port" {}
variable "memory" {}
variable "cpu" {}
variable "service_account_email" {}
variable "vpc_connector" {}
variable "env_vars" { type = map(string) default = {} }
variable "secrets" { type = map(string) default = {} }

resource "google_cloud_run_service" "service" {
  name     = "${var.system_prefix}-${var.service_name}-${var.environment}"
  location = var.region

  template {
    spec {
      service_account_name = var.service_account_email

      containers {
        image = var.image
        ports {
          container_port = var.port
        }

        resources {
          limits = {
            memory = var.memory
            cpu    = var.cpu
          }
        }

        dynamic "env" {
          for_each = var.env_vars
          content {
            name  = env.key
            value = env.value
          }
        }

        dynamic "env" {
          for_each = var.secrets
          content {
            name = env.key
            value_from {
              secret_key_ref {
                name = env.value
                key  = "latest"
              }
            }
          }
        }
      }

      timeout_seconds = 3600
    }

    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = var.vpc_connector
        "run.googleapis.com/vpc-access-egress"    = "all"
      }
    }
  }

  autogenerate_revision_name = true

  traffic {
    percent          = 100
    latest_revision  = true
  }
}

resource "google_cloud_run_service_iam_member" "public" {
  count   = var.service_name == "frontend" ? 1 : 0
  service = google_cloud_run_service.service.name
  role    = "roles/run.invoker"
  member  = "allUsers"
  location = var.region
}

resource "google_cloud_run_service_iam_member" "internal" {
  count   = var.service_name != "frontend" ? 1 : 0
  service = google_cloud_run_service.service.name
  role    = "roles/run.invoker"
  member  = "serviceAccount:${var.service_account_email}"
  location = var.region
}

output "service_url" {
  value = google_cloud_run_service.service.status[0].url
}

output "service_name" {
  value = google_cloud_run_service.service.name
}
