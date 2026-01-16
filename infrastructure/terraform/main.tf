terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "infinity-x-one-systems-tfstate"
    prefix = "rei360-prod"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# ==================== VARIABLES ====================
variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "infinity-x-one-systems"
}

variable "region" {
  description = "Primary GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "system_prefix" {
  description = "System prefix"
  type        = string
  default     = "rei360"
}

# ==================== VPC & NETWORKING ====================
module "vpc" {
  source = "./modules/vpc"

  project_id = var.project_id
  region     = var.region
  system_prefix = var.system_prefix
  environment = var.environment
}

# ==================== DATABASES ====================
module "property_db" {
  source = "./modules/cloud-sql"

  project_id = var.project_id
  region     = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  database_name = "rei360_property"
  db_version = "POSTGRES_15"

  depends_on = [module.vpc]
}

module "vector_db" {
  source = "./modules/cloud-sql"

  project_id = var.project_id
  region     = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  database_name = "rei360_vectors"
  db_version = "POSTGRES_15"

  depends_on = [module.vpc]
}

# ==================== SECRETS ====================
module "secrets" {
  source = "./modules/secrets"

  project_id = var.project_id
  system_prefix = var.system_prefix
  environment = var.environment
}

# ==================== PUB/SUB ====================
module "pubsub" {
  source = "./modules/pub-sub"

  project_id = var.project_id
  system_prefix = var.system_prefix
  environment = var.environment
}

# ==================== SERVICE ACCOUNTS & IAM ====================
module "iam" {
  source = "./modules/iam"

  project_id = var.project_id
  system_prefix = var.system_prefix
  environment = var.environment
  pubsub_topics = module.pubsub.topic_ids
  property_db_instance = module.property_db.instance_name
  vector_db_instance = module.vector_db.instance_name

  depends_on = [module.pubsub, module.property_db, module.vector_db]
}

# ==================== CLOUD RUN SERVICES ====================
module "frontend_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "frontend"
  image = "gcr.io/${var.project_id}/rei360-frontend:latest"
  port = 3000
  memory = "512Mi"
  cpu = "1"
  service_account_email = module.iam.service_account_emails["frontend"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
    VITE_API_BASE = "https://api.realestateiq.com"
  }

  depends_on = [module.iam, module.vpc]
}

module "auth_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "auth"
  image = "gcr.io/${var.project_id}/rei360-auth:latest"
  port = 8000
  memory = "512Mi"
  cpu = "1"
  service_account_email = module.iam.service_account_emails["auth"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
    JWT_EXPIRATION = "86400"
  }

  secrets = {
    JWT_SECRET = module.secrets.secret_names["jwt-secret"]
    DATABASE_URL = module.secrets.secret_names["db-credentials"]
  }

  depends_on = [module.iam, module.vpc, module.secrets]
}

module "data_ingest_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "data-ingest"
  image = "gcr.io/${var.project_id}/rei360-data-ingest:latest"
  port = 8000
  memory = "1Gi"
  cpu = "2"
  service_account_email = module.iam.service_account_emails["data-ingest"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
  }

  secrets = {
    API_KEYS = module.secrets.secret_names["api-keys"]
  }

  depends_on = [module.iam, module.vpc, module.secrets]
}

module "imagery_processor_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "imagery-processor"
  image = "gcr.io/${var.project_id}/rei360-imagery-processor:latest"
  port = 8000
  memory = "1Gi"
  cpu = "2"
  service_account_email = module.iam.service_account_emails["imagery-processor"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
  }

  secrets = {
    GOOGLE_MAPS_API_KEY = module.secrets.secret_names["google-maps-api-key"]
    DATABASE_URL = module.secrets.secret_names["db-credentials"]
  }

  depends_on = [module.iam, module.vpc, module.secrets]
}

module "data_processor_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "data-processor"
  image = "gcr.io/${var.project_id}/rei360-data-processor:latest"
  port = 8000
  memory = "1Gi"
  cpu = "2"
  service_account_email = module.iam.service_account_emails["data-processor"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
  }

  secrets = {
    DATABASE_URL = module.secrets.secret_names["db-credentials"]
  }

  depends_on = [module.iam, module.vpc, module.secrets]
}

module "property_search_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "property-search"
  image = "gcr.io/${var.project_id}/rei360-property-search:latest"
  port = 8000
  memory = "512Mi"
  cpu = "1"
  service_account_email = module.iam.service_account_emails["property-search"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
  }

  secrets = {
    DATABASE_URL = module.secrets.secret_names["db-credentials"]
  }

  depends_on = [module.iam, module.vpc, module.secrets]
}

module "valuation_ai_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "valuation-ai"
  image = "gcr.io/${var.project_id}/rei360-valuation-ai:latest"
  port = 8000
  memory = "1Gi"
  cpu = "2"
  service_account_email = module.iam.service_account_emails["valuation-ai"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
    VERTEX_AI_LOCATION = var.region
    VERTEX_AI_MODEL = "gemini-2.0-flash-exp"
  }

  secrets = {
    DATABASE_URL = module.secrets.secret_names["db-credentials"]
  }

  depends_on = [module.iam, module.vpc, module.secrets]
}

module "voice_agent_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = "us-east1"  # Voice latency preference
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "voice-agent"
  image = "gcr.io/${var.project_id}/rei360-voice-agent:latest"
  port = 8000
  memory = "1Gi"
  cpu = "2"
  service_account_email = module.iam.service_account_emails["voice-agent"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
    DIALOGFLOW_LOCATION = "us-central1"
  }

  secrets = {
    DATABASE_URL = module.secrets.secret_names["db-credentials"]
  }

  depends_on = [module.iam, module.vpc, module.secrets]
}

module "crm_sync_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "crm-sync"
  image = "gcr.io/${var.project_id}/rei360-crm-sync:latest"
  port = 8000
  memory = "512Mi"
  cpu = "1"
  service_account_email = module.iam.service_account_emails["crm-sync"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
  }

  secrets = {
    SALESFORCE_CREDENTIALS = module.secrets.secret_names["crm-credentials"]
    DATABASE_URL = module.secrets.secret_names["db-credentials"]
  }

  depends_on = [module.iam, module.vpc, module.secrets]
}

module "calendar_sync_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "calendar-sync"
  image = "gcr.io/${var.project_id}/rei360-calendar-sync:latest"
  port = 8000
  memory = "512Mi"
  cpu = "1"
  service_account_email = module.iam.service_account_emails["calendar-sync"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
  }

  secrets = {
    GMAIL_CREDENTIALS = module.secrets.secret_names["gmail-credentials"]
    DATABASE_URL = module.secrets.secret_names["db-credentials"]
  }

  depends_on = [module.iam, module.vpc, module.secrets]
}

module "billing_service" {
  source = "./modules/cloud-run"

  project_id = var.project_id
  region = var.region
  system_prefix = var.system_prefix
  environment = var.environment
  service_name = "billing"
  image = "gcr.io/${var.project_id}/rei360-billing:latest"
  port = 8000
  memory = "512Mi"
  cpu = "1"
  service_account_email = module.iam.service_account_emails["billing"]
  vpc_connector = module.vpc.vpc_connector_id

  env_vars = {
    ENVIRONMENT = var.environment
  }

  secrets = {
    STRIPE_KEY = module.secrets.secret_names["stripe-key"]
    DATABASE_URL = module.secrets.secret_names["db-credentials"]
  }

  depends_on = [module.iam, module.vpc, module.secrets]
}

# ==================== GLOBAL LOAD BALANCER ====================
module "load_balancer" {
  source = "./modules/load-balancer"

  project_id = var.project_id
  system_prefix = var.system_prefix
  environment = var.environment
  frontend_service_url = module.frontend_service.service_url

  domains = [
    "infinityxonesystems.com",
    "infinityxoneintelligence.com",
    "infinityxai.com"
  ]

  depends_on = [module.frontend_service]
}

# ==================== MONITORING ====================
module "monitoring" {
  source = "./modules/monitoring"

  project_id = var.project_id
  system_prefix = var.system_prefix
  environment = var.environment

  services = [
    module.frontend_service.service_name,
    module.auth_service.service_name,
    module.data_ingest_service.service_name,
    module.imagery_processor_service.service_name,
    module.data_processor_service.service_name,
    module.property_search_service.service_name,
    module.valuation_ai_service.service_name,
    module.voice_agent_service.service_name,
    module.crm_sync_service.service_name,
    module.calendar_sync_service.service_name,
    module.billing_service.service_name
  ]
}

# ==================== OUTPUTS ====================
output "frontend_url" {
  value = module.frontend_service.service_url
}

output "load_balancer_ip" {
  value = module.load_balancer.static_ip
}

output "database_endpoints" {
  value = {
    property_db = module.property_db.private_ip_address
    vector_db = module.vector_db.private_ip_address
  }
  sensitive = true
}

output "service_accounts" {
  value = module.iam.service_account_emails
}
