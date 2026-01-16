# c:\AI\repos\real-estate-intelligence\infra\terraform\modules\vertex_ai\main.tf
resource "google_project_service" "vertex_ai" {
  service = "aiplatform.googleapis.com"
}

# Add Vertex AI resources here (e.g., datasets, models, endpoints)
