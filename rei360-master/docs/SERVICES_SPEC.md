# REI360 Services Specification

## Service Architecture Overview

This document provides detailed specifications for each microservice in the REI360 system.

---

## 1. Frontend Service

**Language**: TypeScript/React
**Port**: 3000
**Framework**: Vite + React 18

### Purpose
Serves the Google Studio-based frontend UI, handles OAuth, routes API calls to backend services.

### Key Features
- Server-side rendering for SEO
- OAuth 2.0 integration (Google)
- Real-time property search interface
- Appointment scheduling UI
- AI voice call interface
- Admin dashboard

### Dependencies
- React 18
- Vite 4
- TailwindCSS
- Zustand (state management)
- React Query
- Socket.io (real-time updates)

### Environment Variables
```
VITE_API_BASE=http://localhost:8080
VITE_AUTH_URL=http://localhost:8001
VITE_ENVIRONMENT=development
VITE_GOOGLE_ANALYTICS_ID=G-xxx
```

### Health Endpoint
- `GET /health` → `{ status: 'ok' }`
- `GET /api/health` → Service health status

---

## 2. Auth Service

**Language**: Python
**Port**: 8000
**Framework**: FastAPI + SQLAlchemy

### Purpose
Manages user authentication via OAuth 2.0, JWT token generation/validation, user management.

### Key Features
- Google OAuth 2.0 provider
- JWT token issuance (access + refresh)
- User registration and profile management
- Role-based access control (RBAC)
- MFA support (optional)
- Session management

### Endpoints
```
POST /auth/login                    # Google OAuth login
POST /auth/callback                 # OAuth callback
POST /auth/refresh                  # Refresh JWT token
POST /auth/logout                   # Logout
POST /auth/register                 # Register new user
GET  /auth/user                     # Get current user
GET  /auth/health                   # Health check
```

### Database
- Table: `users` (id, email, oauth_id, profile, created_at, updated_at)
- Table: `roles` (id, name, permissions)
- Table: `user_roles` (user_id, role_id)

---

## 3. Data Ingest Service

**Language**: Python
**Port**: 8000
**Framework**: FastAPI + Playwright

### Purpose
Continuously scrapes and ingests real estate data from public sources (Zillow, Redfin, MLS feeds, etc.). Publishes raw data events to Pub/Sub.

### Key Features
- Multi-source data scraping (configurable)
- Headless browser automation (Playwright)
- Rate limiting and robot detection evasion
- Data validation and deduplication
- Pub/Sub publisher for raw-data-events topic
- Scheduled ingestion via Cloud Tasks

### Endpoints
```
POST /ingest/start                  # Start scraping job
GET  /ingest/status/{job_id}        # Get job status
GET  /ingest/health                 # Health check
```

### Pub/Sub Output
- Topic: `rei360-raw-data-events`
- Schema:
  ```json
  {
    "id": "uuid",
    "source": "zillow|redfin|mls",
    "property_data": { ... },
    "timestamp": "ISO8601"
  }
  ```

---

## 4. Imagery Processor Service

**Language**: Python
**Port**: 8000
**Framework**: FastAPI + Google Vision AI

### Purpose
Processes property imagery from Google Maps Street View API and custom uploads. Uses Vision AI and Vertex AI for analysis (condition assessment, feature extraction).

### Key Features
- Google Maps Street View imagery retrieval
- Image processing and enhancement
- Vision AI text/object detection
- Custom ML model for property condition
- Stores imagery features in vector DB
- Publishes imagery-events to Pub/Sub

### Endpoints
```
POST /imagery/analyze               # Analyze property imagery
GET  /imagery/{property_id}         # Get imagery analysis
GET  /imagery/health                # Health check
```

### Dependencies
- google-maps-services
- google-cloud-vision
- google-cloud-aiplatform
- Pillow (image processing)

---

## 5. Data Processor Service

**Language**: Python
**Port**: 8000
**Framework**: FastAPI + Vertex AI Embeddings

### Purpose
Consumes raw data events, transforms/cleans data, generates vector embeddings via Vertex AI, stores in vector DB for RAG and semantic search.

### Key Features
- Pub/Sub subscriber (raw-data-events)
- Data transformation and cleaning
- Vertex AI text embeddings generation
- Image feature embeddings
- Batch processing with error handling
- Publishes processed-data-events

### Endpoints
```
POST /process/transform             # Manual transformation
GET  /process/status                # Processing status
GET  /process/health                # Health check
```

### Vertex AI Integration
```python
from google.cloud import aiplatform

embeddings_model = aiplatform.TextEmbeddingModel.from_pretrained(
    "text-embedding-004"
)
embeddings = embeddings_model.get_embeddings(["text"])
```

---

## 6. Property Search Service

**Language**: Python/Node.js
**Port**: 8000
**Framework**: FastAPI/Express

### Purpose
Provides high-performance semantic search API for properties using vector embeddings. Combines full-text and semantic search.

### Key Features
- Vector similarity search (pgvector)
- Full-text search on property attributes
- Faceted filtering (price, sqft, bedrooms, etc.)
- Semantic search with natural language
- Caching layer (Redis)
- Sub-second response times

### Endpoints
```
GET  /search                        # Search properties
GET  /search/{property_id}          # Get property details
POST /search/semantic               # Semantic search
GET  /search/filters                # Get filter options
GET  /search/health                 # Health check
```

### Query Example
```bash
curl "http://localhost:8005/search?query=waterfront+home+3bed&filters=min_price:500000&limit=10"
```

---

## 7. Valuation AI Service

**Language**: Python
**Port**: 8000
**Framework**: FastAPI + Vertex AI

### Purpose
Provides real-time property valuation using advanced ML models hosted on Vertex AI. Leverages all available data (imagery, location, comparables, market trends).

### Key Features
- Vertex AI custom model predictions
- Multi-factor valuation algorithm
- Comparable sales analysis (AVM)
- Market trend integration
- Confidence intervals
- Historical valuation tracking

### Endpoints
```
POST /valuation/estimate            # Get property valuation
GET  /valuation/{property_id}       # Get valuation history
GET  /valuation/health              # Health check
```

### Request/Response
```json
POST /valuation/estimate
{
  "property_id": "uuid",
  "address": "123 Main St",
  "square_feet": 2500,
  "bedrooms": 3,
  "bathrooms": 2
}

Response:
{
  "estimated_value": 850000,
  "confidence_interval": [820000, 880000],
  "model_id": "rei360-valuation-v2",
  "factors": {...}
}
```

---

## 8. Voice Agent Service

**Language**: Python/Node.js
**Port**: 8000
**Framework**: FastAPI + Dialogflow CX

### Purpose
Manages autonomous AI voice agents for cold calling and inbound call routing. Integrates Dialogflow CX with Text-to-Speech and Speech Recognition.

### Key Features
- Dialogflow CX integration for conversational flows
- Google Cloud Text-to-Speech (WaveNet voices)
- Speech-to-Text for inbound calls
- Vertex AI Gen AI for dynamic responses
- Call recording and transcription
- Human agent handoff routing
- Appointment setting automation

### Endpoints
```
POST /voice/initiate-call           # Start outbound call
POST /voice/inbound-webhook         # Handle inbound calls
GET  /voice/call/{call_id}          # Get call details
POST /voice/transcribe              # Transcribe call audio
GET  /voice/health                  # Health check
```

### Dialogflow Flow
1. Inbound call → Speech-to-Text
2. Dialogflow CX processes intent
3. If simple intent → Automated response (TTS)
4. If complex intent → Vertex AI generates response (TTS)
5. If requires human → Route to agent queue

---

## 9. CRM Sync Service

**Language**: Python
**Port**: 8000
**Framework**: FastAPI

### Purpose
Bi-directional synchronization with Salesforce/HubSpot CRM. Syncs leads, appointments, call records, customer interactions.

### Key Features
- Salesforce/HubSpot API integration
- Lead creation and updates
- Contact synchronization
- Call log ingestion
- Appointment syncing
- Error handling and retry logic
- Pub/Sub subscriber (crm-updates)

### Endpoints
```
POST /crm/sync-lead                 # Sync lead to CRM
POST /crm/sync-appointment          # Sync appointment
GET  /crm/status/{lead_id}          # Get sync status
GET  /crm/health                    # Health check
```

### Environment Variables
```
SALESFORCE_CLIENT_ID=xxx
SALESFORCE_CLIENT_SECRET=xxx
SALESFORCE_USERNAME=xxx
SALESFORCE_PASSWORD=xxx
HUBSPOT_API_KEY=xxx
```

---

## 10. Calendar Sync Service

**Language**: Python
**Port**: 8000
**Framework**: FastAPI

### Purpose
Manages appointment scheduling with Google Calendar. Syncs voice agent appointments and team member availability.

### Key Features
- Google Calendar API integration
- Event creation and updates
- Availability checking
- Meeting room reservation
- Timezone handling
- Calendar sharing
- Event notifications

### Endpoints
```
POST /calendar/create-event         # Create calendar event
GET  /calendar/availability        # Check availability
POST /calendar/webhook             # Calendar change webhook
GET  /calendar/health              # Health check
```

---

## 11. Billing Service

**Language**: Node.js
**Port**: 8000
**Framework**: Express + Stripe

### Purpose
Manages subscription plans, payment processing, invoicing, and usage tracking.

### Key Features
- Stripe integration (payments)
- Subscription plan management
- Monthly/annual billing
- Invoice generation
- Usage-based pricing
- Refund handling
- Payment retry logic

### Endpoints
```
POST /billing/create-subscription   # Create subscription
POST /billing/update-plan           # Change subscription plan
GET  /billing/invoice/{invoice_id}  # Get invoice
POST /billing/webhook              # Stripe webhook
GET  /billing/health               # Health check
```

### Pricing Tiers
- **Basic**: $99/month (up to 100 leads/month)
- **Professional**: $299/month (up to 1000 leads/month)
- **Enterprise**: Custom pricing

---

## Cross-Service Communication

### Pub/Sub Topics

| Topic | Publisher | Subscriber | Schema |
|-------|-----------|-----------|--------|
| `rei360-raw-data-events` | Data Ingest | Data Processor | Raw property data |
| `rei360-processed-data-events` | Data Processor | Property Search | Cleaned, vectorized data |
| `rei360-imagery-events` | Imagery Processor | Data Processor | Image features, analysis |
| `rei360-crm-updates` | Voice Agent, Property Search | CRM Sync | Lead updates, call logs |

### Service-to-Service Calls

```
Frontend → Auth (OAuth validation)
Frontend → Property Search (query)
Frontend → Voice Agent (initiate call)
Voice Agent → Calendar Sync (book appointment)
Voice Agent → CRM Sync (create lead)
Data Processor → Property Search (index data)
Data Processor → Imagery Processor (request image processing)
```

---

## Deployment & Operations

### Docker Image Building
```bash
docker build -f services/backend/auth/Dockerfile -t gcr.io/PROJECT/rei360-auth services/backend/auth
```

### Cloud Run Deployment
```bash
gcloud run deploy rei360-auth-prod \
  --image=gcr.io/PROJECT/rei360-auth:latest \
  --platform=managed \
  --region=us-central1 \
  --memory=512Mi
```

### Health Monitoring
All services expose:
- `GET /health` → `{ status: "ok", version: "1.0.0", timestamp: "ISO8601" }`
- Structured logging to Cloud Logging
- Metrics export to Cloud Monitoring

### Error Handling
- All services implement exponential backoff for retries
- Dead letter queues for failed Pub/Sub messages
- Comprehensive error logging with stack traces
- Graceful degradation when dependencies unavailable

---

## Development Notes

- All services must implement `health` endpoints
- All services must export Prometheus-style metrics
- All services should be horizontally scalable (stateless)
- Use environment variables for configuration
- Never hardcode secrets (use Secret Manager)
- Implement circuit breakers for external API calls

