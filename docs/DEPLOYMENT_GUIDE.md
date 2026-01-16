# REI360 Deployment Guide

## Prerequisites

- Google Cloud Project (infinity-x-one-systems)
- gcloud CLI installed and authenticated
- Docker & Docker Desktop
- Terraform 1.0+
- Node.js 18+ and pnpm
- Python 3.11+

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/InfinityXOneSystems/rei360-monorepo.git
cd rei360-monorepo
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your local configuration
# For development, most defaults should work
```

### 3. Install Dependencies

```bash
# Install workspace dependencies
pnpm install

# Install Python dependencies for shared SDK
cd shared/utils/python
pip install -r requirements.txt
cd ../../..
```

### 4. Start Local Services

```bash
# Start all containers (databases, message queue, services)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
curl http://localhost:8001/health  # Auth service
curl http://localhost:3001         # Frontend
```

### 5. Development Workflow

```bash
# In separate terminals, start each service:

# Terminal 1: Frontend
cd services/frontend
pnpm run dev

# Terminal 2: Auth service
cd services/backend/auth
python main.py

# Terminal 3: Monitor logs
docker-compose logs -f
```

## GCP Infrastructure Setup

### 1. Create GCP Project

```bash
# Set project ID
export PROJECT_ID=infinity-x-one-systems

# Authenticate with Google Cloud
gcloud auth login
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 2. Create GCS Bucket for Terraform State

```bash
gsutil mb gs://$PROJECT_ID-tfstate
gsutil versioning set on gs://$PROJECT_ID-tfstate

# Update infrastructure/terraform/main.tf with bucket name
```

### 3. Create Secret Manager Secrets

```bash
# Create secrets for production
gcloud secrets create rei360-db-credentials-prod \
    --replication-policy="automatic" \
    --data-file=- << EOF
postgresql://rei360_user:YOUR_PASSWORD@instance:5432/rei360_property
EOF

gcloud secrets create rei360-jwt-secret-prod \
    --replication-policy="automatic" \
    --data-file=- << EOF
your-super-secret-jwt-key-here
EOF

# Add more secrets as needed for other services
gcloud secrets create rei360-google-maps-api-key-prod \
    --replication-policy="automatic" \
    --data-file=- << EOF
YOUR_API_KEY
EOF
```

### 4. Deploy Infrastructure

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -out=tfplan -var="environment=prod" -var="region=us-central1"

# Review the plan, then apply
terraform apply tfplan

# Note the outputs (load balancer IP, service URLs, etc.)
terraform output
```

## Containerization & Deployment

### 1. Build Container Images

```bash
# Build all services
./infrastructure/scripts/build-services.ps1

# Or build specific services
docker build -f services/backend/auth/Dockerfile -t gcr.io/$PROJECT_ID/rei360-auth:latest services/backend/auth
```

### 2. Push to Container Registry

```bash
# Configure Docker to use gcloud
gcloud auth configure-docker

# Push all images
for service in auth data-ingest imagery-processor data-processor property-search valuation-ai voice-agent crm-sync calendar-sync billing frontend; do
    docker push gcr.io/$PROJECT_ID/rei360-$service:latest
done
```

### 3. Deploy Services to Cloud Run

```bash
# Use the master deployment script
./infrastructure/scripts/deploy-all.ps1 -Environment prod -Region us-central1

# Or deploy individual services
gcloud run deploy rei360-auth-prod \
    --image=gcr.io/$PROJECT_ID/rei360-auth:latest \
    --platform=managed \
    --region=us-central1 \
    --memory=512Mi \
    --cpu=1 \
    --service-account=rei360-auth-sa@$PROJECT_ID.iam.gserviceaccount.com \
    --set-env-vars=ENVIRONMENT=prod,GCP_PROJECT_ID=$PROJECT_ID
```

## Post-Deployment Configuration

### 1. Configure DNS

```bash
# Get the load balancer IP
LOAD_BALANCER_IP=$(terraform output load_balancer_ip)

# Point your domains to this IP via your DNS provider:
# - infinityxonesystems.com → $LOAD_BALANCER_IP
# - infinityxoneintelligence.com → $LOAD_BALANCER_IP
# - infinityxai.com → $LOAD_BALANCER_IP

# Or use Cloud DNS:
gcloud dns record-sets update infinityxonesystems.com \
    --rrdatas=$LOAD_BALANCER_IP \
    --ttl=300 \
    --type=A \
    --zone=rei360-dns
```

### 2. Setup SSL Certificates

```bash
# Create managed SSL certificate
gcloud compute ssl-certificates create rei360-cert-prod \
    --domains=infinityxonesystems.com,infinityxoneintelligence.com,infinityxai.com \
    --global
```

### 3. Configure Databases

```bash
# Connect to Cloud SQL instance
gcloud sql connect rei360-property-db-prod-us-central1 \
    --user=rei360_user

# Create extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

# Import initial schema
\i shared/constants/database-schemas.sql
```

### 4. Populate Secret Manager

```bash
# Create secrets for all services
gcloud secrets create rei360-stripe-key-prod --data-file=- << EOF
sk_live_YOUR_KEY
EOF

gcloud secrets create rei360-crm-credentials-prod --data-file=- << EOF
{
  "salesforce": {
    "client_id": "...",
    "client_secret": "..."
  }
}
EOF
```

## Monitoring & Operations

### 1. View Service Logs

```bash
# Tail logs for a specific service
gcloud run services logs read rei360-auth-prod --limit=50 --follow

# View all logs for all services
gcloud logging read "resource.type=cloud_run_revision" --limit=100
```

### 2. Monitor Performance

```bash
# View Cloud Monitoring dashboard
# https://console.cloud.google.com/monitoring/dashboards
```

### 3. Check Service Status

```bash
# List all Cloud Run services
gcloud run services list

# Get service details
gcloud run services describe rei360-auth-prod --region=us-central1
```

## Scaling & Updates

### 1. Scale Services

```bash
# Increase maximum instances for a service
gcloud run services update rei360-auth-prod \
    --max-instances=20 \
    --region=us-central1

# Set minimum instances (keeps service warm)
gcloud run services update rei360-auth-prod \
    --min-instances=1 \
    --region=us-central1
```

### 2. Update Service Code

```bash
# Build and push new image
docker build -f services/backend/auth/Dockerfile \
    -t gcr.io/$PROJECT_ID/rei360-auth:latest services/backend/auth
docker push gcr.io/$PROJECT_ID/rei360-auth:latest

# Deploy new version
gcloud run deploy rei360-auth-prod \
    --image=gcr.io/$PROJECT_ID/rei360-auth:latest \
    --region=us-central1
```

## Cleanup

### 1. Destroy Terraform Infrastructure

```bash
cd infrastructure/terraform
terraform destroy -var="environment=prod"
```

### 2. Delete Cloud Run Services

```bash
gcloud run services delete rei360-auth-prod --region=us-central1
```

### 3. Delete Databases

```bash
gcloud sql instances delete rei360-property-db-prod-us-central1
gcloud sql instances delete rei360-vectors-db-prod-us-central1
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
gcloud run services logs read rei360-auth-prod --limit=100

# Common issues:
# - Missing environment variables: Check Secret Manager
# - Database connection: Verify VPC connector
# - Service account permissions: Check IAM roles
```

### High Latency

```bash
# Check Cloud SQL performance
gcloud sql operations list --instance=rei360-property-db-prod-us-central1

# Increase instance size if needed
gcloud sql instances patch rei360-property-db-prod-us-central1 \
    --tier=db-custom-4-16384
```

### Cost Overages

```bash
# View billing dashboard
# https://console.cloud.google.com/billing

# Common causes:
# - High data transfer: Enable CDN
# - Unused services: Set min-instances=0
# - Database size: Archive old data to Cloud Storage
```

## Continuous Deployment

### GitHub Actions

The repository includes CI/CD workflows:
- `.github/workflows/build.yml` - Build on every push
- `.github/workflows/deploy.yml` - Deploy on release tags

Configure by setting repository secrets:
```
GCP_PROJECT_ID: infinity-x-one-systems
GCP_REGION: us-central1
```

