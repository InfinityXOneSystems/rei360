# c:\AI\repos\real-estate-intelligence\infra\terraform\environments\staging\variables.tf
variable "project_id" {
  description = "The GCP project ID."
  type        = string
  default     = "infinity-x-one-systems-staging"
}

variable "region" {
  description = "The GCP region."
  type        = string
  default     = "us-central1"
}
