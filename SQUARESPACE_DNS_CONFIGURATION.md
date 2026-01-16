# REI360 - Squarespace DNS Configuration to Cloud Run

## Overview
Point your Squarespace domain (realestateiq360.com) to Cloud Run frontend using Squarespace DNS settings.

## Step 1: Get Cloud Run IP Address

```powershell
# Get the Cloud Run frontend IP
gcloud run services describe rei360-frontend \
  --region us-central1 \
  --project infinity-x-one-systems \
  --format='get(status.address.url)'
```

**Expected Output**: `https://rei360-frontend-xxxxx-uc.a.run.app`

Or for static IP (if configured):
```powershell
gcloud compute addresses describe rei360-frontend-ip \
  --region us-central1 \
  --project infinity-x-one-systems \
  --format='get(address)'
```

## Step 2: Configure in Squarespace

### 2A. Access Domain Settings
1. Log into Squarespace → **Settings**
2. Navigate to **Domains**
3. Find **realestateiq360.com**
4. Click **DNS Settings**

### 2B. Add DNS Records for Cloud Run

#### Option A: Using CNAME (Recommended for Cloud Run)
If using Cloud Run's native domain (`rei360-frontend-xxxxx-uc.a.run.app`):

1. **Create CNAME Record**:
   - **Type**: CNAME
   - **Subdomain**: `www`
   - **Value**: `rei360-frontend-xxxxx-uc.a.run.app`
   - Click **Save**

2. **Create A Record for Root Domain** (realestateiq360.com):
   - Use **Squarespace's external A record** (they'll provide the IP)
   - OR point to Cloud Run static IP if available

3. **SSL/TLS**: Squarespace will auto-renew; Cloud Run handles SSL on its side

#### Option B: Using A Record (If you have Cloud Run static IP)
```
Type: A
Name: @ (root)
IP: [Cloud Run Static IP - get from gcloud]
TTL: 1 hour

Type: A
Name: www
IP: [Cloud Run Static IP]
TTL: 1 hour
```

#### Optional: Add MX Records (if using email)
```
Type: MX
Hostname: @
Mail Server: aspmx.l.google.com
Priority: 10

Type: MX
Mail Server: alt1.aspmx.l.google.com
Priority: 20
```

### 2C: Verify DNS Propagation

```powershell
# Check CNAME propagation (may take 24-48 hours)
nslookup realestateiq360.com
nslookup www.realestateiq360.com

# Detailed DNS check
$dnsRecords = @(
    'realestateiq360.com',
    'www.realestateiq360.com'
)

foreach ($domain in $dnsRecords) {
    Write-Host "`n? Checking: $domain" -ForegroundColor Cyan
    (Resolve-DnsName -Name $domain -Type A).IPAddress
    (Resolve-DnsName -Name $domain -Type CNAME).Name
}
```

## Step 3: Configure Cloud Run Custom Domain

Once DNS is propagated:

```powershell
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service=rei360-frontend \
  --domain=realestateiq360.com \
  --region=us-central1 \
  --project=infinity-x-one-systems

# Verify mapping
gcloud run domain-mappings list \
  --project=infinity-x-one-systems
```

## Step 4: SSL Certificate (Auto-Managed)

Cloud Run automatically issues and renews SSL certificates via Google Cloud:

```powershell
# Check SSL status
gcloud run domain-mappings describe realestateiq360.com \
  --region us-central1 \
  --project infinity-x-one-systems \
  --format='get(status.conditions)'
```

Expected: `status.conditions[0].status = TRUE` (SSL provisioned)

## Step 5: Test Live Domain

```powershell
# Test HTTP → HTTPS redirect
Invoke-WebRequest -Uri "http://realestateiq360.com" -MaximumRedirection 5

# Test HTTPS endpoint
Invoke-WebRequest -Uri "https://realestateiq360.com" -Headers @{
    'User-Agent' = 'PowerShell'
}

# Check SSL certificate
$cert = [System.Net.ServicePointManager]::FindServicePoint("https://realestateiq360.com").Certificate
Write-Host "SSL Certificate: $($cert.Subject)" -ForegroundColor Green
Write-Host "Issued By: $($cert.Issuer)" -ForegroundColor Green
```

## Troubleshooting

### DNS Not Resolving
```powershell
# Force DNS refresh
ipconfig /flushdns

# Check propagation globally
# Use https://dnschecker.org (realestateiq360.com)
```

### SSL Certificate Pending
- Can take 15-30 minutes after domain mapping
- Check status with `gcloud run domain-mappings describe`
- If stuck, delete and recreate mapping

### Squarespace Domain Not Working
1. Verify Squarespace DNS is set to Custom (not Squarespace Default)
2. Ensure CNAME points to `rei360-frontend-xxxxx-uc.a.run.app`
3. Wait 24-48 hours for DNS propagation
4. Check with `nslookup realestateiq360.com`

## Production Checklist

- [ ] Squarespace DNS configured (CNAME or A record)
- [ ] DNS propagation verified (nslookup shows Cloud Run)
- [ ] Cloud Run domain mapping created
- [ ] SSL certificate provisioned (check status)
- [ ] Test https://realestateiq360.com loads frontend
- [ ] Redirect http → https working
- [ ] API endpoint configured in frontend (.env)
- [ ] CORS headers allow realestateiq360.com
- [ ] Analytics tracking live
- [ ] Error monitoring (Cloud Logging) active

## Quick Deploy Command

Once DNS is ready:

```powershell
# Full deployment
.\deploy-rei360-production.ps1 `
  -Environment production `
  -Domain realestateiq360.com `
  -Region us-central1 `
  -ProjectId infinity-x-one-systems
```

---

**Timeline**:
- DNS Configuration: 10 min
- DNS Propagation: 24-48 hours (check status periodically)
- Cloud Run Mapping: 5 min
- SSL Certificate: 15-30 min after mapping
- **Site Live**: After SSL provisioned

**Contact**: Squarespace support if DNS issues persist
