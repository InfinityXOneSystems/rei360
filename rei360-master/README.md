# REI360 Monorepo - Real Estate IQ 360 Flagship System

Enterprise-grade real estate intelligence platform with AI voice, property valuation, imagery assessment, and autonomous lead generation.

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Global Load Balancer (LB)                    │
│              (SSL Termination, DDoS Protection)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼─────┐      ┌──────▼──────┐      ┌─────▼────┐
   │ Frontend  │      │    Auth     │      │ API GW   │
   │ Service   │      │  Service    │      │ Service  │
   └──────┬────┘      └──────┬──────┘      └─────┬────┘
          │                  │                    │
    ┌─────▼──────────────────▼────────────────────▼──────┐
    │         Cloud Run Services (11 Microservices)      │
    │                                                    │
    │  ┌─────────────────┐    ┌──────────────────┐     │
    │  │ Data Ingest     │    │ Imagery          │     │
    │  │ Service         │    │ Processor        │     │
    │  └────────┬────────┘    └────────┬─────────┘     │
    │           │                      │               │
    │  ┌────────▼──────────────────────▼──────┐        │
    │  │ Data Processor & Vectorization       │        │
    │  └────────┬───────────────────────────┬─┘        │
    │           │                           │           │
    │  ┌────────▼────┐  ┌──────────┐ ┌─────▼────┐    │
    │  │ Property    │  │Valuation │ │ Voice    │    │
    │  │ Search      │  │AI        │ │ Agent    │    │
    │  └─────────────┘  └──────────┘ └──────────┘    │
    │  ┌──────────────────────────────────────────┐   │
    │  │ CRM Sync │ Calendar Sync │ Billing     │   │
    │  └──────────────────────────────────────────┘   │
    └────────────────┬──────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐  ┌────────▼────┐  ┌──────▼──┐
│ Cloud  │  │ Pub/Sub     │  │ Secret  │
│ SQL    │  │ Topics      │  │ Manager │
│ DBs    │  │             │  │         │
└────────┘  └─────────────┘  └─────────┘
```

## 🏗️ Project Structure

```
rei360-monorepo/
├── services/
│   ├── frontend/                    # React/Google Studio frontend
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── Dockerfile
│   │
│   └── backend/
│       ├── auth/                    # OAuth & JWT services
│       ├── data-ingest/             # Scraping & raw data pipeline
│       ├── imagery-processor/       # Google Maps Vision processing
│       ├── data-processor/          # Vectorization & ML prep
│       ├── property-search/         # Semantic search API
│       ├── valuation-ai/            # Vertex AI valuations
│       ├── voice-agent/             # Dialogflow CX integration
│       ├── crm-sync/                # Salesforce/HubSpot sync
│       ├── calendar-sync/           # Google Calendar integration
│       └── billing/                 # Stripe & subscription mgmt
│
├── infrastructure/
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── cloud-run/           # Cloud Run service module
│   │   │   ├── cloud-sql/           # PostgreSQL module
│   │   │   ├── pub-sub/             # Pub/Sub module
│   │   │   ├── secrets/             # Secret Manager module
│   │   │   ├── vpc/                 # VPC & connectors
│   │   │   ├── load-balancer/       # Global LB module
│   │   │   ├── iam/                 # IAM & service accounts
│   │   │   └── monitoring/          # Logging & monitoring
│   │   │
│   │   ├── environments/
│   │   │   ├── dev/                 # Development environment
│   │   │   ├── staging/             # Staging environment
│   │   │   └── prod/                # Production environment
│   │   │
│   │   └── main.tf                  # Root Terraform
│   │
│   └── scripts/
│       ├── deploy-all.ps1           # Master deployment script
│       ├── build-services.ps1       # Build all containers
│       ├── test-services.ps1        # Run integration tests
│       └── destroy-infra.ps1        # Cleanup (dev only)
│
├── shared/
│   ├── utils/
│   │   ├── python/
│   │   │   ├── rei360_sdk/          # Python SDK for services
│   │   │   ├── google_cloud_helpers/
│   │   │   └── requirements.txt
│   │   │
│   │   └── nodejs/
│   │       ├── rei360-sdk/          # TypeScript SDK
│   │       └── package.json
│   │
│   └── constants/
│       ├── api-schemas.json
│       ├── database-schemas.sql
│       └── pubsub-topics.json
│
├── docs/
│   ├── ARCHITECTURE.md              # Detailed architecture
│   ├── SERVICES_SPEC.md             # Each service specification
│   ├── DEPLOYMENT_GUIDE.md          # Step-by-step deployment
│   ├── API_REFERENCE.md             # API contract documentation
│   ├── DATABASE_SCHEMA.md           # DB design
│   └── DEVELOPMENT.md               # Local dev setup
│
├── docker-compose.yml               # Local dev environment
├── .env.example                     # Environment template
├── package.json                     # Root workspace config
├── pnpm-workspace.yaml              # PNPM monorepo config
└── tsconfig.json                    # TypeScript root config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+, Python 3.11+
- Docker & Docker Compose
- Terraform 1.0+
- Google Cloud SDK
- pnpm (workspace manager)

### Local Development

```bash
# Install dependencies across monorepo
pnpm install

# Start local environment (all services)
docker-compose up -d

# Run all services in dev mode
pnpm run dev:all

# Access frontend
# http://localhost:3001
```

### Deployment to Google Cloud

```bash
# Deploy entire infrastructure + services
cd infrastructure/scripts
./deploy-all.ps1 -Environment prod -Region us-central1

# Or deploy specific service
./deploy-all.ps1 -Environment prod -Services "frontend,auth,data-ingest"
```

## 📦 Services

| Service | Language | Purpose | Port |
|---------|----------|---------|------|
| **Frontend** | TypeScript/React | Google Studio UI, OAuth gateway | 3001 |
| **Auth** | Python/FastAPI | OAuth 2.0, JWT tokens | 8001 |
| **Data Ingest** | Python | Web scraping, data collection | 8002 |
| **Imagery Processor** | Python | Google Maps/Vision AI | 8003 |
| **Data Processor** | Python | Vectorization, ML prep | 8004 |
| **Property Search** | Python/FastAPI | Semantic search API | 8005 |
| **Valuation AI** | Python | Vertex AI predictions | 8006 |
| **Voice Agent** | Python/Node.js | Dialogflow CX integration | 8007 |
| **CRM Sync** | Python | Salesforce/HubSpot sync | 8008 |
| **Calendar Sync** | Python | Google Calendar API | 8009 |
| **Billing** | Node.js | Stripe integration | 8010 |

## 🔧 Configuration

All services configured via:
- **Secrets**: Google Secret Manager (production)
- **Environment Variables**: `.env` file (development)
- **Terraform**: `infrastructure/terraform/environments/{env}/`

Example `.env`:
```
ENVIRONMENT=dev
GCP_PROJECT_ID=infinity-x-one-systems
GCP_REGION=us-central1
VITE_API_BASE=http://localhost:8080
DATABASE_URL=postgresql://user:pass@localhost:5432/rei360_dev
GOOGLE_MAPS_API_KEY=xxx
STRIPE_SECRET_KEY=xxx
```

## 📊 Databases

### Cloud SQL (PostgreSQL)
- **Property DB**: Real estate data, derived insights, imagery assessments
- **Vector DB**: Embeddings for RAG, semantic search, image features

```sql
-- Create databases
CREATE DATABASE rei360_property;
CREATE DATABASE rei360_vectors;

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

## 🔌 Integration Points

### Pub/Sub Topics
- `rei360-raw-data-events`: From data-ingest
- `rei360-processed-data-events`: From data-processor
- `rei360-imagery-events`: From imagery-processor
- `rei360-crm-updates`: From voice-agent, property-search

### APIs
- **Google Maps**: Street View, Static Maps imagery
- **Vertex AI**: Text/image embeddings, LLM generation
- **Dialogflow CX**: Conversational AI with voice
- **Stripe**: Payment processing
- **Salesforce/HubSpot**: CRM synchronization

## 🔐 Security

- **IAM**: Least-privilege service accounts per microservice
- **VPC**: Private connectivity via VPC Access Connector
- **Secrets**: All credentials in Secret Manager
- **Cloud Armor**: DDoS protection on Global LB
- **VPC Service Controls**: Perimeter-based security

## 📈 Monitoring

- **Cloud Logging**: Centralized logs for all services
- **Cloud Monitoring**: Metrics, dashboards, alerting
- **Trace**: Distributed tracing across services
- **Profiler**: Performance analysis

## 🚢 Deployment Environments

### Development
- All services in docker-compose locally
- Uses public endpoints (no VPC)
- Hot reloading enabled
- Mock external APIs

### Staging
- Full GCP infrastructure
- Regional Cloud SQL replicas
- Load testing enabled
- Real API credentials (limited)

### Production
- Global Load Balancer with SSL
- Multi-region Cloud SQL (High Availability)
- Auto-scaling (0-10 instances per service)
- Full monitoring, logging, alerting
- DDoS protection via Cloud Armor

## 📚 Documentation

See `docs/` folder for:
- [Architecture Deep Dive](docs/ARCHITECTURE.md)
- [Service Specifications](docs/SERVICES_SPEC.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Local Development](docs/DEVELOPMENT.md)

## 🎯 Next Steps

1. **Local Development**: `pnpm install && docker-compose up && pnpm run dev:all`
2. **GCP Setup**: Run `gcloud auth login && terraform init`
3. **Deploy**: `./infrastructure/scripts/deploy-all.ps1 -Environment prod`
4. **Configure DNS**: Point your domains to Global LB IP

## 📞 Support

For issues or questions:
- Check service logs: `docker logs rei360-{service}`
- Review Cloud Logging: `gcloud logging read "resource.type=cloud_run_revision"`
- Check Terraform state: `terraform show`

---

**Status**: ✅ Monorepo scaffolding complete | 🔧 Services ready for implementation | 🚀 Deployment scripts ready
