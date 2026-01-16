# c:\AI\repos\real-estate-intelligence\infra\terraform\main.tf
provider "google" {
  project = var.project_id
  region  = var.region
}

terraform {
  backend "gcs" {
    bucket = "infinity-x-one-systems-tfstate"
    prefix = "terraform/state"
  }
}
