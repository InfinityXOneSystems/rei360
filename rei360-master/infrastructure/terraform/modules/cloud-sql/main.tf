# Cloud SQL Module

variable "project_id" {}
variable "region" {}
variable "system_prefix" {}
variable "environment" {}
variable "database_name" {}
variable "db_version" {}

resource "google_sql_database_instance" "instance" {
  name             = "${var.system_prefix}-${var.database_name}-${var.environment}"
  database_version = var.db_version
  region           = var.region
  deletion_protection = var.environment == "prod" ? true : false

  settings {
    tier              = var.environment == "prod" ? "db-custom-2-8192" : "db-f1-micro"
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = var.environment == "prod"
      backup_location               = var.region
    }

    ip_configuration {
      require_ssl    = var.environment == "prod"
      ipv4_enabled   = true
      private_network = "projects/${var.project_id}/global/networks/default"
    }

    user_labels = {
      environment = var.environment
      system      = var.system_prefix
    }
  }

  depends_on = []
}

resource "google_sql_database" "database" {
  name     = var.database_name
  instance = google_sql_database_instance.instance.name
  charset  = "UTF8"
}

resource "google_sql_user" "default_user" {
  name     = "rei360_user"
  instance = google_sql_database_instance.instance.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "google_sql_database_instance_database_default_charset" "charset" {
  instance = google_sql_database_instance.instance.name
  charset  = "UTF8"
}

# Enable pgvector extension for vector DB
resource "null_resource" "pgvector_extension" {
  count = var.database_name == "rei360_vectors" ? 1 : 0

  provisioner "local-exec" {
    command = "gcloud sql connect ${google_sql_database_instance.instance.name} --user=rei360_user --project=${var.project_id} --quiet << EOF\nCREATE EXTENSION IF NOT EXISTS vector;\nEOF"
  }

  depends_on = [google_sql_user.default_user]
}

output "instance_name" {
  value = google_sql_database_instance.instance.name
}

output "private_ip_address" {
  value = google_sql_database_instance.instance.private_ip_address
}

output "connection_name" {
  value = google_sql_database_instance.instance.connection_name
}
