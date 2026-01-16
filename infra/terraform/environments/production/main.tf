# c:\AI\repos\real-estate-intelligence\infra\terraform\environments\production\main.tf
module "vertex_ai" {
  source      = "../../modules/vertex_ai"
  project_id  = var.project_id
  region      = var.region
  environment = "production"
}

module "google_workspace" {
  source      = "../../modules/google_workspace"
  project_id  = var.project_id
  region      = var.region
  environment = "production"
}
