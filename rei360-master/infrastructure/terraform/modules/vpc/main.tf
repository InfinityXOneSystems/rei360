# VPC & Networking Module

variable "project_id" {}
variable "region" {}
variable "system_prefix" {}
variable "environment" {}

resource "google_compute_network" "vpc" {
  name                    = "${var.system_prefix}-vpc-${var.environment}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "${var.system_prefix}-subnet-${var.region}-${var.environment}"
  ip_cidr_range = "10.0.0.0/20"
  region        = var.region
  network       = google_compute_network.vpc.id

  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_logs_enabled    = var.environment == "prod"
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

resource "google_vpc_access_connector" "connector" {
  name          = "${var.system_prefix}-connector-${var.region}-${var.environment}"
  ip_cidr_range = "10.1.0.0/28"
  network       = google_compute_network.vpc.name
  region        = var.region
  min_throughput = var.environment == "prod" ? 300 : 200
  max_throughput = var.environment == "prod" ? 1000 : 300
}

output "vpc_id" {
  value = google_compute_network.vpc.id
}

output "subnet_id" {
  value = google_compute_subnetwork.subnet.id
}

output "vpc_connector_id" {
  value = google_vpc_access_connector.connector.id
}
