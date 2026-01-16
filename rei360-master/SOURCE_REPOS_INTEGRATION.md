# REI360 Monorepo - Source Repository Integration Guide

## Overview

The REI360 monorepo pulls code and components from **5 primary source repositories** in the InfinityXOneSystems organization. This document maps what should be integrated and where.

---

## Source Repositories

### 1️⃣ **Lead-Sniper System** (BACKEND - Primary Data/Logic)

**Repository**: `lead-sniper` / `lead-sniper-system`
**Location**: `c:\AI\repos\lead-sniper`
**GitHub**: https://github.com/InfinityXOneSystems/lead-sniper.git
**Branch**: master
**Current**: lead-sniper (v1 implementation)

**What to Extract**:
- Lead generation logic
- Web scraping pipelines
- Data ingestion services
- Voice agent/Dialogflow integration
- CRM sync (Salesforce/HubSpot)
- Property data enrichment

**Integration Points**:
```
lead-sniper/
├── main.py                         → services/backend/data-ingest/main.py
├── voice_agent/                    → services/backend/voice-agent/
├── crm_sync/                       → services/backend/crm-sync/
├── data_ingestion/                 → services/backend/data-ingest/
├── property_processor/             → services/backend/property-search/
└── requirements.txt                → services/backend/*/requirements.txt
```

**Key Files**:
- `lead_sniper_relay_fastapi.py` - Main FastAPI app
- `voice_agent_handler.py` - Dialogflow CX integration
- `.env` - Environment configuration (to migrate)
- `docker-compose.yml` - Service definitions (merge patterns)

---

### 2️⃣ **Real Estate Intelligence** (FRONTEND - UI/UX)

**Repository**: `real-estate-intelligence`
**Location**: `c:\AI\repos\real-estate-intelligence`
**GitHub**: https://github.com/InfinityXOneSystems/real-estate-intelligence.git
**Branch**: main
**Framework**: React + Vite + TypeScript

**What to Extract**:
- Complete React application
- Vite build configuration
- TypeScript types
- UI components
- API integration layer
- Styling and themes

**Integration Points**:
```
real-estate-intelligence/
├── src/                            → services/frontend/src/
├── public/                         → services/frontend/public/
├── package.json                    → services/frontend/package.json
├── vite.config.ts                  → services/frontend/vite.config.ts
├── tsconfig.json                   → services/frontend/tsconfig.json
└── .env.example                    → services/frontend/.env.example
```

**Key Files**:
- `package.json` - Dependencies
- `vite.config.ts` - Build configuration
- `src/App.tsx` - Main app component
- `src/api/` - API client services

---

### 3️⃣ **Infinity Master System** (AGENTS/ORCHESTRATION)

**Repository**: `infinity-master-system`
**Location**: `c:\AI\repos\infinity-master-system`
**GitHub**: https://github.com/InfinityXOneSystems/agents.git
**Branch**: main
**Purpose**: Autonomous agents, AI orchestration

**What to Extract**:
- Agent frameworks
- LangChain/CrewAI implementations
- Orchestration logic
- AI model integrations
- Autonomous workflows

**Integration Points**:
```
infinity-master-system/
├── agents/                         → services/backend/agents/
├── orchestration/                  → infrastructure/orchestration/
├── ai_models/                      → shared/models/
└── tools/                          → shared/utils/python/
```

**Key Files**:
- `agents/` - Agent definitions
- `orchestration/` - Workflow orchestration
- `requirements.txt` - AI/ML dependencies

---

### 4️⃣ **Manus Core System** (LOCAL ORCHESTRATION)

**Repository**: `manus-core-system`
**Location**: `c:\AI\repos\manus-core-system`
**GitHub**: https://github.com/InfinityXOneSystems/manus-core-system.git
**Branch**: main
**Purpose**: Local machine orchestration, sync, automation

**What to Extract**:
- OmniSync engine (GitHub ↔ GCP ↔ Local)
- Local health monitoring
- Auto-fix agents
- PowerShell utilities
- State management

**Integration Points**:
```
manus-core-system/
├── ManusLocal.psm1                 → infrastructure/scripts/ManusLocal.psm1
├── OmniSync.psm1                   → infrastructure/scripts/OmniSync.psm1
├── sync_engine/                    → infrastructure/sync/
└── monitoring/                     → infrastructure/monitoring/
```

**Key Files**:
- `ManusLocal.psm1` - Local agent tools
- `OmniSync.psm1` - Bidirectional sync
- `sync_engine/` - Firestore sync logic

---

### 5️⃣ **AI Registry** (MODELS/TOOLS)

**Repository**: `ai-registry`
**Location**: `c:\AI\repos\ai-registry`
**GitHub**: https://github.com/InfinityXOneSystems/ai-registry.git
**Branch**: main
**Purpose**: Model registry, AI tools, utilities

**What to Extract**:
- Vertex AI model definitions
- Prompt templates
- ML model configurations
- AI utility functions
- Tool registrations

**Integration Points**:
```
ai-registry/
├── models/                         → shared/models/
├── prompts/                        → shared/prompts/
├── tools/                          → shared/utils/python/
└── config/                         → infrastructure/config/
```

**Key Files**:
- `models/` - Model definitions
- `prompts/` - Prompt templates
- `tools/` - Utility functions

---

## Integration Roadmap

### Phase 1: Backend Integration (Week 1)
1. Extract lead-sniper data-ingest logic
2. Copy property search/valuation logic
3. Migrate voice agent integration
4. Set up CRM sync module

### Phase 2: Frontend Integration (Week 1)
1. Copy real-estate-intelligence React app
2. Update API endpoint configuration
3. Adjust build pipeline for monorepo

### Phase 3: Orchestration (Week 2)
1. Extract agents from infinity-master-system
2. Integrate AI model orchestration
3. Setup LangChain/CrewAI pipelines

### Phase 4: Sync & Automation (Week 2-3)
1. Integrate Manus OmniSync engine
2. Setup local health monitoring
3. Configure auto-fix agents

### Phase 5: AI Tools (Week 3)
1. Register models from ai-registry
2. Setup Vertex AI integration
3. Add prompt templates

---

## Current Integration Status

### ✅ Completed
- Monorepo scaffolding (11 services)
- Terraform infrastructure
- Docker Compose setup
- Shared SDK boilerplate
- Auth service example

### 🔄 In Progress
- Backend code extraction (lead-sniper)
- Frontend integration (real-estate-intelligence)

### ⏳ Pending
- AI agent orchestration (infinity-master-system)
- Manus sync integration (manus-core-system)
- Model registry (ai-registry)
- Complete service implementation
- End-to-end testing

---

## Source Code Extraction Commands

### Extract Backend Code
```bash
# Copy lead-sniper data processing
cp -r c:\AI\repos\lead-sniper\*.py c:\AI\repos\rei360-monorepo\services\backend\data-ingest\

# Copy voice agent code
cp -r c:\AI\repos\lead-sniper\voice_agent\* c:\AI\repos\rei360-monorepo\services\backend\voice-agent\

# Copy CRM integration
cp -r c:\AI\repos\lead-sniper\crm_sync\* c:\AI\repos\rei360-monorepo\services\backend\crm-sync\
```

### Extract Frontend Code
```bash
# Copy React application
cp -r c:\AI\repos\real-estate-intelligence\src c:\AI\repos\rei360-monorepo\services\frontend\
cp c:\AI\repos\real-estate-intelligence\package.json c:\AI\repos\rei360-monorepo\services\frontend\
cp c:\AI\repos\real-estate-intelligence\vite.config.ts c:\AI\repos\rei360-monorepo\services\frontend\
cp c:\AI\repos\real-estate-intelligence\tsconfig.json c:\AI\repos\rei360-monorepo\services\frontend\
```

### Extract Infrastructure Code
```bash
# Copy Manus scripts
cp c:\AI\repos\manus-core-system\ManusLocal.psm1 c:\AI\repos\rei360-monorepo\infrastructure\scripts\
cp c:\AI\repos\manus-core-system\OmniSync.psm1 c:\AI\repos\rei360-monorepo\infrastructure\scripts\

# Copy AI models
cp -r c:\AI\repos\ai-registry\models c:\AI\repos\rei360-monorepo\shared\
```

---

## Dependency Management

### Python Dependencies
- Lead-sniper: FastAPI, Uvicorn, Pydantic, Google Cloud SDKs
- Infinity Master: LangChain, CrewAI, OpenAI, Anthropic
- AI Registry: Vertex AI, scikit-learn, pandas

### Node Dependencies
- Real Estate Intelligence: React, Vite, TypeScript, Axios
- Frontend Build: @vitejs/plugin-react, TailwindCSS

### PowerShell Dependencies
- Manus: Google Cloud SDK, Git, Docker

---

## Database Schema Integration

### From lead-sniper
- Property data tables
- Lead tracking schema
- User authentication schema
- CRM integration mappings

### From real-estate-intelligence
- UI state management
- Cached property data
- User preferences

### From ai-registry
- Model versioning schema
- Prompt templates
- Metric tracking

---

## Environment Variable Consolidation

Merge from all source repos:
```
# From lead-sniper
GOOGLE_CLOUD_PROJECT=infinity-x-one-systems
GOOGLE_MAPS_API_KEY=...
DIALOGFLOW_PROJECT_ID=...
CRM_API_KEY=...

# From real-estate-intelligence
VITE_API_URL=http://localhost:8080
VITE_ENVIRONMENT=development

# From ai-registry
VERTEX_AI_REGION=us-central1
VERTEX_AI_PROJECT=infinity-x-one-systems
```

All consolidated in: `c:\AI\repos\rei360-monorepo\.env.example`

---

## Testing Integration

After extracting code from each source:

1. **Unit Tests**: Verify extracted code compiles
2. **Integration Tests**: Test service-to-service communication
3. **End-to-End Tests**: Test complete workflows
4. **Load Tests**: Verify performance with full dataset

---

## Rollback Procedure

If integration fails:
1. Keep source repos in separate branches
2. Use Git history to revert changes
3. Run: `git reset --hard <commit-hash>`

---

## Next Steps

1. **Read this document** ← You are here
2. **Extract backend code** → services/backend/
3. **Integrate frontend** → services/frontend/
4. **Test locally** → docker-compose up
5. **Deploy to GCP** → terraform apply
6. **Monitor & iterate** → Cloud Logging + Monitoring

---

**Last Updated**: January 15, 2026
**Status**: Ready for integration
**Monorepo**: https://github.com/InfinityXOneSystems/rei360
