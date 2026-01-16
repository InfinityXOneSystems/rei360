# REI360 Architecture Documentation

## System Overview

REI360 (Real Estate IQ 360) is an enterprise-grade real estate intelligence platform built on Google Cloud Platform with a focus on:

- **Autonomous AI Voice**: Cold calling, appointment setting, inbound routing
- **Advanced Analytics**: Property valuation, imagery assessment, market predictions
- **Data Intelligence**: Multi-source scraping, semantic search, ML predictions
- **Enterprise Integration**: Salesforce/HubSpot CRM sync, Google Calendar, Stripe

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Global Load Balancer + SSL/TLS                │
│      (infinityxonesystems.com, etc.)                   │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼──────┐        ┌──────▼────┐
    │  Frontend  │        │  Auth     │
    │  Service   │        │  Service  │
    │ (Public)   │        │ (Private) │
    └────────────┘        └──────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼──────┐    ┌──────▼────┐    ┌────────▼───┐
    │ Data      │    │ Imagery   │    │ Data       │
    │ Ingest    │    │ Processor │    │ Processor  │
    └────┬──────┘    └──────┬────┘    └────┬───────┘
         │                  │              │
         └──────────┬───────┼──────────────┘
                    │       │
            ┌───────▼───────▼───────┐
            │   Cloud Pub/Sub       │
            │  (Event Backbone)     │
            └───────┬───────────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
  ┌───▼────┐  ┌────▼───┐  ┌─────▼──┐
  │Property│  │Valuation│  │ Voice  │
  │ Search │  │   AI    │  │ Agent  │
  └────────┘  └─────────┘  └────┬───┘
              │                  │
         ┌────▼────┐       ┌─────▼──┐
         │CRM Sync │       │Calendar│
         └─────────┘       │ Sync   │
                           └────────┘
              │
         ┌────▼─────────┐
         │ Databases    │
         │ (PostgreSQL) │
         │ + Vectors    │
         └──────────────┘
```

## Infrastructure Layers

### 1. Network Layer
- **Global Load Balancer**: SSL termination, DDoS protection, traffic routing
- **VPC Network**: Isolated network with private subnets
- **VPC Access Connector**: Enables Cloud Run → Cloud SQL connectivity
- **Cloud Armor**: DDoS & WAF protection

### 2. Compute Layer
- **Cloud Run**: 11 containerized microservices (auto-scaling, 0-10 instances)
- **Cloud Scheduler**: Cron jobs for scheduled tasks
- **Cloud Tasks**: Reliable task queues for asynchronous work

### 3. Data Layer
- **Cloud SQL (PostgreSQL 15)**:
  - `rei360-property`: Real estate property data + derived insights
  - `rei360-vectors`: Vector embeddings for semantic search
  - Features: High Availability, automated backups, read replicas
- **Redis**: Caching layer (optional, for session management)

### 4. Integration Layer
- **Cloud Pub/Sub**: Event-driven messaging backbone
- **Secret Manager**: Secure credential storage (256 secrets)
- **Cloud Functions**: Serverless glue logic

### 5. AI/ML Layer
- **Vertex AI**:
  - Text embeddings (text-embedding-004)
  - Image analysis (Vision AI)
  - Custom ML models
  - Gen AI integration (Gemini 2.0 Flash)
- **Dialogflow CX**: Conversational AI for voice
- **Text-to-Speech**: Natural voice synthesis (WaveNet)

### 6. Observability Layer
- **Cloud Logging**: Centralized log aggregation
- **Cloud Monitoring**: Metrics, dashboards, alerts
- **Cloud Trace**: Distributed tracing
- **Cloud Profiler**: Performance analysis

## Data Flow

### Real Estate Data Pipeline

```
External Sources (Zillow, Redfin, MLS)
         │
         ▼
    Data Ingest Service
         │ (scraping, validation)
         ▼
    Pub/Sub: raw-data-events
         │
    ┌────▼────────────────────┐
    │ Data Processor Service   │
    │ - Clean & normalize      │
    │ - Generate embeddings    │
    │ - Add derived fields     │
    └────┬────────────────────┘
         │
    ┌────┴─────────────────────┐
    │                          │
    ▼                          ▼
Property DB              Vector DB
(Structured Data)        (Embeddings)
    │                          │
    └────────┬─────────────────┘
             │
    ┌────────▼──────────────────┐
    │ Property Search Service    │
    │ (Full-text + Semantic)     │
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────────┐
    │ Valuation AI Service       │
    │ (ML Predictions)           │
    └────────┬──────────────────┘
             │
         Frontend UI
```

### Voice & CRM Pipeline

```
Inbound Call
    │
    ▼
Voice Agent Service
    │
    ├─▶ Speech-to-Text
    ├─▶ Dialogflow CX (NLU)
    ├─▶ Vertex AI (Dynamic Response)
    └─▶ Text-to-Speech (TTS)
         │
    ┌────▼─────────────────┐
    │ Check Availability   │
    │ (Calendar Sync)      │
    └────┬────────────────┘
         │
    ┌────▼─────────────────┐
    │ Create Lead/Appt     │
    │ (CRM Sync)           │
    └──────────────────────┘
```

## Service Dependencies

### Database Access
All backend services connect to PostgreSQL:
```
Service → Cloud SQL Auth (IP Whitelisting + SSL)
        → Property DB (read/write)
        → Vector DB (read, optional write)
```

### API Dependencies
```
Frontend → Auth Service (OAuth, JWT validation)
Frontend → Property Search (semantic queries)
Frontend → Voice Agent (call initiation)
Voice Agent → Valuation AI (property price)
Voice Agent → CRM Sync (lead creation)
Voice Agent → Calendar Sync (appointment booking)
Data Processor → Imagery Processor (image analysis requests)
```

### External APIs
```
Google Maps API (Street View imagery)
Vertex AI API (embeddings, image models, LLM)
Dialogflow CX API (conversation management)
Cloud Text-to-Speech API (voice synthesis)
Salesforce/HubSpot API (CRM integration)
Google Calendar API (scheduling)
Stripe API (payment processing)
```

## Scaling & Performance

### Horizontal Scaling
- **Cloud Run**: Auto-scales 0-10 instances per service based on CPU/memory
- **Cloud SQL**: Read replicas for geographic distribution
- **Caching**: Redis for frequently accessed data

### Performance Optimizations
- **CDN**: Cloud CDN for static assets
- **Connection Pooling**: pgBouncer for database connections
- **Batch Processing**: Pub/Sub for async workloads
- **Vector Search**: pgvector for sub-millisecond semantic search

### Cost Optimization
- **Serverless**: Pay-per-use model (Cloud Run, Pub/Sub)
- **Min Instances**: Set to 0 for non-critical services (cold starts acceptable)
- **Reserved Capacity**: Optional for prod database
- **Data Archival**: Move old data to Cloud Storage

## Security Architecture

### Authentication & Authorization
- **Frontend**: OAuth 2.0 (Google Identity)
- **Backend APIs**: Service-to-service via service account tokens
- **Database**: VPC-scoped, SSL/TLS connections

### Secret Management
- All credentials in Google Secret Manager
- Service accounts have least-privilege IAM roles
- Secrets rotated automatically

### Network Security
- VPC with private subnets
- VPC Access Connector for Cloud Run ↔ Cloud SQL
- Cloud Armor DDoS protection
- VPC Service Controls for perimeter security

### Data Protection
- Encryption at rest (GCP-managed)
- Encryption in transit (TLS 1.3)
- PII handling: GDPR/CCPA compliant
- Audit logging: Cloud Audit Logs

## Disaster Recovery

### Backup & Recovery
- **Cloud SQL**: Automated daily backups, 35-day retention
- **Cloud Storage**: Replicated across regions
- **Code**: GitHub repos with automated deployment
- **Configuration**: Terraform state in GCS

### High Availability
- **Regional Cloud SQL**: Standby replica with automatic failover
- **Multi-Region Frontend**: Global Load Balancer with health checks
- **DNS Failover**: CloudFlare or Cloud DNS with health checks

### RTO/RPO
- **RTO (Recovery Time)**: <5 minutes (automatic failover)
- **RPO (Recovery Point)**: <1 hour (backups)

## Monitoring & Alerting

### Key Metrics
- **Request Latency**: P50, P95, P99
- **Error Rate**: 5xx, 4xx response rates
- **Throughput**: Requests per second per service
- **Database**: Connection pool utilization, query performance
- **Cost**: Monthly GCP spend by service

### Alerts
- High error rate (>5%)
- High latency (P95 > 5s)
- Database connection exhaustion
- Pub/Sub message lag
- Failed deployments

### Dashboards
- Real-time service status
- Error budget tracking
- Cost trends
- User analytics

## Development Workflow

### Local Development
```bash
git clone [monorepo]
pnpm install                      # Install dependencies
cp .env.example .env
docker-compose up -d              # Start services
pnpm run dev:all                  # Start dev servers
```

### Testing
```bash
pnpm run test:all                 # Unit tests
./infrastructure/scripts/test-services.ps1  # Integration tests
```

### Deployment
```bash
# To staging
./infrastructure/scripts/deploy-all.ps1 -Environment staging

# To production
./infrastructure/scripts/deploy-all.ps1 -Environment prod -Services "auth,property-search"
```

## Cost Estimation (Monthly, Production)

| Component | Estimate | Notes |
|-----------|----------|-------|
| Cloud Run | $2,000 | 11 services, auto-scaling |
| Cloud SQL | $800 | 2 instances, HA, backups |
| Cloud Pub/Sub | $300 | 4 topics, 1M+ messages |
| Cloud Storage | $100 | Logs, backups, assets |
| Networking | $200 | Load balancer, data transfer |
| Google Maps API | $1,500 | Street View usage |
| Vertex AI | $500 | Embeddings, predictions |
| Other (monitoring, etc.) | $200 | |
| **TOTAL** | **~$5,600** | Scales with usage |

## Runbooks

See individual service documentation for:
- Deployment procedures
- Scaling guidelines
- Troubleshooting steps
- Incident response

