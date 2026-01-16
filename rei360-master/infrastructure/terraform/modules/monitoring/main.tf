# Monitoring Module

variable "project_id" {}
variable "system_prefix" {}
variable "environment" {}
variable "services" { type = list(string) }

# Monitoring Dashboard
resource "google_monitoring_dashboard" "dashboard" {
  dashboard_json = jsonencode({
    displayName = "${var.system_prefix}-${var.environment}"
    mosaicLayout = {
      columns = 12
      tiles = [
        {
          width  = 6
          height = 4
          widget = {
            title = "Cloud Run Request Count"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type=\"cloud_run_revision\" resource.labels.service_name=~\"${var.system_prefix}-.*\""
                      aggregation = {
                        alignmentPeriod  = "60s"
                        perSeriesAligner = "ALIGN_RATE"
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        {
          xPos   = 6
          width  = 6
          height = 4
          widget = {
            title = "Cloud Run Error Rate"
            xyChart = {
              dataSets = [
                {
                  timeSeriesQuery = {
                    timeSeriesFilter = {
                      filter = "resource.type=\"cloud_run_revision\" metric.type=\"run.googleapis.com/request_count\" metric.labels.response_code_class=\"5xx\""
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    }
  })
}

# Alert Policy - Error Rate
resource "google_monitoring_alert_policy" "error_rate" {
  display_name = "${var.system_prefix}-${var.environment}-high-error-rate"
  combiner     = "OR"

  conditions {
    display_name = "Error rate above 5%"

    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05

      aggregations {
        alignment_period  = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]
}

# Alert Policy - High Latency
resource "google_monitoring_alert_policy" "latency" {
  display_name = "${var.system_prefix}-${var.environment}-high-latency"
  combiner     = "OR"

  conditions {
    display_name = "Request latency above 5s"

    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_latencies\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 5000

      aggregations {
        alignment_period    = "60s"
        per_series_aligner  = "ALIGN_PERCENTILE_95"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]
}

# Notification Channel
resource "google_monitoring_notification_channel" "email" {
  display_name = "REI360 Alert Email"
  type         = "email"
  enabled      = true

  labels = {
    email_address = "ops@infinityxonesystems.com"
  }
}

# Log Sink for Cloud Logging
resource "google_logging_project_sink" "rei360_sink" {
  name        = "${var.system_prefix}-${var.environment}-sink"
  destination = "logging.googleapis.com/projects/${var.project_id}/logs/rei360"

  filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"${var.system_prefix}-.*\""

  unique_writer_identity = true
}

output "dashboard_id" {
  value = google_monitoring_dashboard.dashboard.id
}

output "alert_policy_ids" {
  value = {
    error_rate = google_monitoring_alert_policy.error_rate.id
    latency    = google_monitoring_alert_policy.latency.id
  }
}
