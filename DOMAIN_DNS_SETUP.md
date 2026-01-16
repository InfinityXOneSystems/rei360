# REI360 Domain & DNS Configuration
## realestateiq360.com Setup

**Status**: Ready for deployment
**Domain**: realestateiq360.com
**Project**: infinity-x-one-systems (GCP)
**Region**: us-central1

---

## DNS Setup Instructions

### Prerequisites
- Domain registrar: You need to have registered/own `realestateiq360.com`
- DNS hosting: Can use Google Cloud DNS (recommended) or existing registrar

### Option A: Google Cloud DNS (Recommended)

#### 1. Create Cloud DNS Zone
```powershell
# Create DNS zone in GCP
gcloud dns managed-zones create rei360-zone `
  --dns-name="realestateiq360.com." `
  --description="REI360 Production Domain" `
  --project=infinity-x-one-systems

# Get nameservers assigned by GCP
gcloud dns managed-zones describe rei360-zone `
  --project=infinity-x-one-systems `
  --format="value(nameServers)"
```

**Output will show 4 nameservers, e.g.:**
```
ns-123.googledomains.com.
ns-456.googledomains.com.
ns-789.googledomains.com.
ns-999.googledomains.com.
```

#### 2. Update Domain Registrar Nameservers
Login to your domain registrar and update the nameservers to the 4 GCP nameservers above.
⏱️ **Propagation time**: 24-48 hours

---

### Option B: Manual DNS Records (If using existing registrar)

Point your registrar's DNS to Google Cloud Load Balancer or Cloud Run service:

```
Record Type | Name                  | Value
------------|----------------------|----------------------------------
A           | realestateiq360.com   | [Cloud Run Public IP or LB IP]
AAAA        | realestateiq360.com   | [Cloud Run IPv6 or LB IPv6]
CNAME       | www                   | realestateiq360.com.
MX          | @                     | 10 aspmx.l.google.com.
TXT         | @                     | v=spf1 include:_spf.google.com ~all
```

---

## Cloud Run Configuration

### 1. Deploy REI360 API to Cloud Run

```powershell
# From rei360 directory
cd c:\AI\repos\rei360

# Build and push image
$PROJECT_ID = "infinity-x-one-systems"
$SERVICE_NAME = "rei360-api"
$REGION = "us-central1"
$IMAGE = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Build Docker image
docker build -t $IMAGE .

# Push to Google Container Registry
docker push $IMAGE

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME `
  --image=$IMAGE `
  --platform=managed `
  --region=$REGION `
  --allow-unauthenticated `
  --set-env-vars=ENVIRONMENT=production `
  --project=$PROJECT_ID
```

### 2. Map Custom Domain to Cloud Run

```powershell
# After deployment, map domain to Cloud Run service
gcloud run domain-mappings create `
  --service=$SERVICE_NAME `
  --domain=realestateiq360.com `
  --region=$REGION `
  --project=$PROJECT_ID
```

This creates an SSL certificate automatically (Let's Encrypt).

---

## Frontend Configuration

### Environment Variables for Production

**File**: `.env.production`
```
VITE_API_URL=https://realestateiq360.com/api
VITE_API_TIMEOUT=30000
VITE_ENVIRONMENT=production
VITE_ANALYTICS_ID=GA-XXXXX
```

### Build and Deploy Frontend

```powershell
# From rei360/services/frontend directory
cd c:\AI\repos\rei360\services\frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Cloud Storage + Cloud CDN
gsutil -m cp -r dist/* gs://realestateiq360-prod/
```

---

## SSL/TLS Certificate

✅ **Automatic**: Cloud Run handles SSL automatically via Google-managed certificates
- Let's Encrypt integration
- Auto-renewal
- Redirects HTTP → HTTPS

---

## Validation Checklist

### DNS Propagation
```powershell
# Test DNS resolution
nslookup realestateiq360.com
# Should return GCP nameserver IP

# Or with nslookup alternative
Resolve-DnsName -Name realestateiq360.com -Type A
```

### HTTPS/SSL Check
```powershell
# Verify certificate
$uri = "https://realestateiq360.com"
$response = Invoke-WebRequest $uri
$cert = $response.BaseResponse.Headers["certificate"]
Write-Host "SSL Certificate valid: $cert"
```

### Application Health Check
```powershell
# Test API endpoint
curl.exe https://realestateiq360.com/health
# Should return: { "status": "healthy" }

# Test frontend
curl.exe https://realestateiq360.com/
# Should return HTML homepage
```

---

## Load Balancer Configuration (Optional - for global traffic)

```powershell
# Create Global Load Balancer (if not using Cloud Run directly)
gcloud compute load-balancers create rei360-lb `
  --global `
  --project=infinity-x-one-systems

# Create backend service
gcloud compute backend-services create rei360-backend `
  --global `
  --protocol=HTTPS `
  --port-name=https `
  --project=infinity-x-one-systems
```

---

## Firewall Rules

```powershell
# Allow HTTPS traffic
gcloud compute firewall-rules create allow-https-rei360 `
  --allow=tcp:443 `
  --target-tags=rei360-app `
  --project=infinity-x-one-systems

# Allow HTTP (redirect to HTTPS)
gcloud compute firewall-rules create allow-http-rei360 `
  --allow=tcp:80 `
  --target-tags=rei360-app `
  --project=infinity-x-one-systems
```

---

## Environment Setup by Stage

### Development (localhost)
```
Domain: localhost:3001 (frontend), localhost:8080 (api)
Database: Local PostgreSQL
Redis: Local Redis
API_URL: http://localhost:8080
```

### Staging (Cloud Run)
```
Domain: staging.realestateiq360.com
Database: Cloud SQL (staging)
Redis: Memory Store (staging)
API_URL: https://staging.realestateiq360.com
SSL: Auto-managed
```

### Production (Cloud Run)
```
Domain: realestateiq360.com
Database: Cloud SQL (HA multi-region)
Redis: Memory Store (HA)
API_URL: https://realestateiq360.com
SSL: Auto-managed
DDoS Protection: Cloud Armor
```

---

## Troubleshooting

### Domain Not Resolving
```powershell
# Check DNS propagation globally
# Use: https://www.whatsmydns.net/?q=realestateiq360.com

# View current Cloud DNS records
gcloud dns record-sets list `
  --zone=rei360-zone `
  --project=infinity-x-one-systems
```

### Cloud Run Service Not Accessible
```powershell
# Check service status
gcloud run services describe rei360-api `
  --region=us-central1 `
  --project=infinity-x-one-systems

# Check domain mapping
gcloud run domain-mappings describe realestateiq360.com `
  --region=us-central1 `
  --project=infinity-x-one-systems
```

### SSL Certificate Issues
```powershell
# View certificate status
gcloud compute ssl-certificates list `
  --project=infinity-x-one-systems

# Describe certificate
gcloud compute ssl-certificates describe rei360-cert `
  --project=infinity-x-one-systems
```

---

## Cost Estimation

| Component | Monthly Cost |
|-----------|-------------|
| Cloud Run (128MB, always on) | ~$9.50 |
| Cloud SQL (db-n1-standard-1) | ~$50-100 |
| Memory Store (1GB) | ~$5 |
| Cloud DNS | ~$0.40 |
| Cloud Storage (CDN) | ~$5-20 |
| Cloud Armor (DDoS) | ~$3-50 |
| **Total** | **~$75-230/month** |

---

## Next Steps

1. ✅ **Confirm domain ownership** (realestateiq360.com)
2. ✅ **Set up Cloud DNS zone** (Option A) or update registrar (Option B)
3. ✅ **Deploy to Cloud Run** (see commands above)
4. ✅ **Map custom domain**
5. ✅ **Wait for DNS propagation** (24-48 hours)
6. ✅ **Verify HTTPS works**
7. ✅ **Configure monitoring/alerts**

---

## Quick Deploy Script

Save as `deploy-production.ps1`:

```powershell
param(
    [string]$Environment = "production",
    [string]$Region = "us-central1"
)

$ProjectId = "infinity-x-one-systems"
$ServiceName = "rei360-api"
$Domain = "realestateiq360.com"
$Image = "gcr.io/$ProjectId/$ServiceName"

Write-Host "🚀 Deploying REI360 to production..." -ForegroundColor Green

# 1. Build
Write-Host "📦 Building Docker image..." -ForegroundColor Cyan
docker build -t $Image .

# 2. Push
Write-Host "📤 Pushing to Container Registry..." -ForegroundColor Cyan
docker push $Image

# 3. Deploy to Cloud Run
Write-Host "🔧 Deploying to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $ServiceName `
  --image=$Image `
  --platform=managed `
  --region=$Region `
  --allow-unauthenticated `
  --set-env-vars="ENVIRONMENT=production" `
  --project=$ProjectId

# 4. Map domain (if not already mapped)
Write-Host "🌐 Mapping custom domain..." -ForegroundColor Cyan
try {
    gcloud run domain-mappings create `
      --service=$ServiceName `
      --domain=$Domain `
      --region=$Region `
      --project=$ProjectId
} catch {
    Write-Host "Domain already mapped" -ForegroundColor Yellow
}

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Access at: https://$Domain" -ForegroundColor Green
```

Run with:
```powershell
.\deploy-production.ps1 -Environment production
```

---

**Last Updated**: January 15, 2026
**Domain Status**: Ready for DNS configuration
