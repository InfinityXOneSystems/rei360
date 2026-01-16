#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deploy REI360 to Cloud Run with custom domain realestateiq360.com

.DESCRIPTION
    Complete deployment pipeline:
    1. Builds Docker image
    2. Pushes to Google Container Registry
    3. Deploys to Cloud Run
    4. Maps custom domain
    5. Configures environment variables
    6. Validates deployment

.PARAMETER Environment
    Deployment environment: development, staging, production

.PARAMETER Region
    GCP region for deployment (default: us-central1)

.PARAMETER Domain
    Custom domain (default: realestateiq360.com)

.EXAMPLE
    .\deploy-rei360-production.ps1 -Environment production

.EXAMPLE
    .\deploy-rei360-production.ps1 -Environment staging -Region us-west1
#>

param(
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'production',

    [string]$Region = 'us-central1',

    [string]$Domain = 'realestateiq360.com',

    [string]$ProjectId = 'infinity-x-one-systems',

    [switch]$SkipBuild,

    [switch]$SkipDomainMapping,

    [switch]$Validate
)

$ErrorActionPreference = 'Stop'
$ServiceName = 'rei360-api'
$Image = "gcr.io/$ProjectId/$ServiceName"
$Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

# Colors
$Colors = @{
    Success = 'Green'
    Error   = 'Red'
    Warning = 'Yellow'
    Info    = 'Cyan'
}

function Write-Step {
    param([string]$Message, [string]$Status = 'info')
    $emoji = @{
        info    = '📋'
        success = '✅'
        error   = '❌'
        warning = '⚠️ '
        build   = '🔨'
        deploy  = '🚀'
        domain  = '🌐'
    }
    Write-Host "`n$($emoji[$Status]) $Message" -ForegroundColor $Colors[$Status]
}

function Test-GcloudAuth {
    Write-Step 'Checking gcloud authentication...' 'info'
    try {
        $account = gcloud config get-value account 2>&1
        if (-not $account) {
            throw 'Not authenticated'
        }
        Write-Host "   Authenticated as: $account" -ForegroundColor Gray
        return $true
    }
    catch {
        Write-Step 'ERROR: gcloud not authenticated. Run: gcloud auth login' 'error'
        return $false
    }
}

function Build-Image {
    Write-Step 'Building Docker image...' 'build'
    Write-Host "   Image: $Image" -ForegroundColor Gray

    try {
        & docker build -t $Image `
            --build-arg ENVIRONMENT=$Environment `
            --label "env=$Environment" `
            --label "timestamp=$Timestamp" `
            .

        if ($LASTEXITCODE -ne 0) {
            throw 'Docker build failed'
        }
        Write-Step 'Docker image built successfully' 'success'
    }
    catch {
        Write-Step "Build failed: $_" 'error'
        throw
    }
}

function Push-Image {
    Write-Step 'Pushing to Container Registry...' 'deploy'
    Write-Host "   Destination: $Image" -ForegroundColor Gray

    try {
        # Configure Docker auth for GCP
        gcloud auth configure-docker --quiet | Out-Null

        # Push image
        & docker push $Image

        if ($LASTEXITCODE -ne 0) {
            throw 'Docker push failed'
        }
        Write-Step 'Image pushed successfully' 'success'
    }
    catch {
        Write-Step "Push failed: $_" 'error'
        throw
    }
}

function Deploy-CloudRun {
    Write-Step 'Deploying to Cloud Run...' 'deploy'
    Write-Host "   Service: $ServiceName" -ForegroundColor Gray
    Write-Host "   Region: $Region" -ForegroundColor Gray
    Write-Host "   Environment: $Environment" -ForegroundColor Gray

    try {
        $envVars = @(
            "ENVIRONMENT=$Environment"
            "GCP_PROJECT_ID=$ProjectId"
            "DOMAIN=$Domain"
            "API_VERSION=1.0.0"
            "LOG_LEVEL=$(if ($Environment -eq 'production') { 'INFO' } else { 'DEBUG' })"
        ) -join ','

        gcloud run deploy $ServiceName `
            --image=$Image `
            --platform=managed `
            --region=$Region `
            --allow-unauthenticated `
            --cpu=2 `
            --memory=512Mi `
            --timeout=3600 `
            --set-env-vars=$envVars `
            --project=$ProjectId

        if ($LASTEXITCODE -ne 0) {
            throw 'Cloud Run deployment failed'
        }

        # Get service URL
        $serviceUrl = gcloud run services describe $ServiceName `
            --region=$Region `
            --format='value(status.url)' `
            --project=$ProjectId

        Write-Step 'Cloud Run deployment successful' 'success'
        Write-Host "   Service URL: $serviceUrl" -ForegroundColor Gray

        return $serviceUrl
    }
    catch {
        Write-Step "Deployment failed: $_" 'error'
        throw
    }
}

function Map-CustomDomain {
    Write-Step 'Mapping custom domain...' 'domain'
    Write-Host "   Domain: $Domain" -ForegroundColor Gray
    Write-Host "   Service: $ServiceName" -ForegroundColor Gray

    try {
        # Check if mapping already exists
        $existing = gcloud run domain-mappings describe $Domain `
            --region=$Region `
            --project=$ProjectId 2>&1

        if ($existing) {
            Write-Host "   Domain mapping already exists" -ForegroundColor Yellow
        }
        else {
            gcloud run domain-mappings create `
                --service=$ServiceName `
                --domain=$Domain `
                --region=$Region `
                --project=$ProjectId

            Write-Step 'Custom domain mapped successfully' 'success'
        }

        # Get DNS records needed
        Write-Host "`n   Required DNS Records:" -ForegroundColor Cyan
        Write-Host "   Type: A" -ForegroundColor Gray
        Write-Host "   Name: $Domain" -ForegroundColor Gray
        Write-Host "   Value: [See Cloud Run console]" -ForegroundColor Gray

    }
    catch {
        Write-Step "Domain mapping warning: $_" 'warning'
    }
}

function Validate-Deployment {
    Write-Step 'Validating deployment...' 'info'

    try {
        # Check Cloud Run service
        $service = gcloud run services describe $ServiceName `
            --region=$Region `
            --format='value(status.conditions[0].status)' `
            --project=$ProjectId

        if ($service -eq 'True') {
            Write-Host "   Cloud Run: ✓ Running" -ForegroundColor Green
        }
        else {
            Write-Host "   Cloud Run: ✗ Not Ready" -ForegroundColor Red
        }

        # Check domain mapping
        try {
            $domainMapping = gcloud run domain-mappings describe $Domain `
                --region=$Region `
                --format='value(status.conditions[0].status)' `
                --project=$ProjectId

            if ($domainMapping -eq 'True') {
                Write-Host "   Domain Mapping: ✓ Active" -ForegroundColor Green
            }
            else {
                Write-Host "   Domain Mapping: ⏳ Provisioning (24-48 hours)" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "   Domain Mapping: ⏳ In Progress" -ForegroundColor Yellow
        }

        # Get service details
        $serviceUrl = gcloud run services describe $ServiceName `
            --region=$Region `
            --format='value(status.url)' `
            --project=$ProjectId

        Write-Host "`n   Service URL: $serviceUrl" -ForegroundColor Gray
        Write-Host "   Custom Domain: https://$Domain" -ForegroundColor Gray

        Write-Step 'Validation complete' 'success'

    }
    catch {
        Write-Step "Validation warning: $_" 'warning'
    }
}

function Show-Summary {
    param([string]$ServiceUrl)

    Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ REI360 DEPLOYMENT COMPLETE                            ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

    Write-Host "`n📋 Deployment Summary:" -ForegroundColor Cyan
    Write-Host "   Environment: $Environment" -ForegroundColor Gray
    Write-Host "   Region: $Region" -ForegroundColor Gray
    Write-Host "   Service: $ServiceName" -ForegroundColor Gray
    Write-Host "   Image: $Image" -ForegroundColor Gray

    Write-Host "`n🌐 Access Points:" -ForegroundColor Cyan
    Write-Host "   Cloud Run: $ServiceUrl" -ForegroundColor Green
    Write-Host "   Custom Domain: https://$Domain" -ForegroundColor Green

    Write-Host "`n⏱️  DNS Propagation:" -ForegroundColor Cyan
    Write-Host "   Custom domain will be live in 24-48 hours" -ForegroundColor Yellow
    Write-Host "   Check: https://www.whatsmydns.net/?q=$Domain" -ForegroundColor Gray

    Write-Host "`n📊 Monitoring:" -ForegroundColor Cyan
    Write-Host "   gcloud run services describe $ServiceName --region=$Region" -ForegroundColor Gray
    Write-Host "   gcloud logging read 'resource.type=cloud_run_revision' --limit=50" -ForegroundColor Gray

    Write-Host "`n🔗 Useful Commands:" -ForegroundColor Cyan
    Write-Host "   View logs:" -ForegroundColor Gray
    Write-Host "   gcloud run services logs read $ServiceName --region=$Region --limit=100" -ForegroundColor Gray
    Write-Host "`n   Check domain mapping:" -ForegroundColor Gray
    Write-Host "   gcloud run domain-mappings describe $Domain --region=$Region" -ForegroundColor Gray
    Write-Host "`n   Update environment:" -ForegroundColor Gray
    Write-Host "   gcloud run deploy $ServiceName --update-env-vars=KEY=VALUE --region=$Region" -ForegroundColor Gray
}

# Main execution
try {
    Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  🚀 REI360 PRODUCTION DEPLOYMENT                          ║" -ForegroundColor Green
    Write-Host "║     Domain: realestateiq360.com                           ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

    # Validation
    if (-not (Test-GcloudAuth)) {
        exit 1
    }

    # Build
    if (-not $SkipBuild) {
        Build-Image
        Push-Image
    }

    # Deploy
    $serviceUrl = Deploy-CloudRun

    # Configure domain
    if (-not $SkipDomainMapping) {
        Map-CustomDomain
    }

    # Validate
    if ($Validate) {
        Validate-Deployment
    }

    # Summary
    Show-Summary -ServiceUrl $serviceUrl

}
catch {
    Write-Step "Deployment failed: $_" 'error'
    exit 1
}
