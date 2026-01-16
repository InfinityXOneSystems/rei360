# Global Load Balancer Module

variable "project_id" {}
variable "system_prefix" {}
variable "environment" {}
variable "frontend_service_url" {}
variable "domains" { type = list(string) }

resource "google_compute_global_address" "static_ip" {
  name          = "${var.system_prefix}-lb-ip-${var.environment}"
  address_type  = "EXTERNAL"
  ip_version    = "IPV4"
}

resource "google_compute_backend_service" "frontend_backend" {
  name                            = "${var.system_prefix}-frontend-backend-${var.environment}"
  load_balancing_scheme           = "EXTERNAL"
  protocol                        = "HTTPS"
  session_affinity                = "NONE"
  timeout_sec                     = 30
  enable_cdn                      = var.environment == "prod"
  custom_request_headers          = ["X-Client-Region:{client_region}"]

  log_config {
    enable      = true
    sample_rate = 1.0
  }

  # Backend services would point to Cloud Run services
  # This is a simplified version - actual implementation would use serverless NEGs
}

resource "google_compute_url_map" "url_map" {
  name            = "${var.system_prefix}-url-map-${var.environment}"
  default_service = google_compute_backend_service.frontend_backend.id

  host_rule {
    hosts        = var.domains
    path_matcher = "default"
  }

  path_matcher {
    name            = "default"
    default_service = google_compute_backend_service.frontend_backend.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.frontend_backend.id
    }
  }
}

resource "google_compute_target_https_proxy" "https_proxy" {
  name             = "${var.system_prefix}-https-proxy-${var.environment}"
  url_map          = google_compute_url_map.url_map.id
  ssl_certificates = [google_compute_ssl_certificate.cert.id]
}

resource "google_compute_ssl_certificate" "cert" {
  name        = "${var.system_prefix}-ssl-cert-${var.environment}"
  description = "SSL certificate for REI360"

  # In production, use google_compute_managed_ssl_certificate with Google-managed certs
  # For now, using a placeholder - replace with actual certificate
  certificate = var.environment == "dev" ? file("${path.module}/cert.pem") : null
  private_key = var.environment == "dev" ? file("${path.module}/key.pem") : null

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_global_forwarding_rule" "forwarding_rule" {
  name                  = "${var.system_prefix}-forwarding-rule-${var.environment}"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL"
  port_range            = "443"
  target                = google_compute_target_https_proxy.https_proxy.id
  address               = google_compute_global_address.static_ip.id
}

# HTTP to HTTPS redirect
resource "google_compute_target_http_proxy" "http_proxy" {
  name    = "${var.system_prefix}-http-proxy-${var.environment}"
  url_map = google_compute_url_map.url_map.id
}

resource "google_compute_global_forwarding_rule" "http_forwarding_rule" {
  name                  = "${var.system_prefix}-http-forwarding-rule-${var.environment}"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL"
  port_range            = "80"
  target                = google_compute_target_http_proxy.http_proxy.id
  address               = google_compute_global_address.static_ip.id
}

output "static_ip" {
  value = google_compute_global_address.static_ip.address
}

output "load_balancer_name" {
  value = google_compute_global_forwarding_rule.forwarding_rule.name
}
