#!/usr/bin/env pwsh
<#
.SYNOPSIS
Master deployment script for REI360 monorepo to Google Cloud Run

.DESCRIPTION
Orchestrates building, testing, and deploying all services to GCP

.PARAMETER Environment
Environment to deploy to: dev, staging, or prod

.PARAMETER Services
Comma-separated list of services to deploy. If empty, deploys all.

.PARAMETER Region
GCP region for deployment (default: us-central1)

.PARAMETER DryRun
Run without making actual changes
#>

param(
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment = 'dev',

    [string]$Services = '',

    [string]$Region = 'us-central1',

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# Configuration
$PROJECT_ID = 'infinity-x-one-systems'
$SYSTEM_PREFIX = 'rei360'
$REGISTRY = "gcr.io/${PROJECT_ID}"

# Service list
$ALL_SERVICES = @(
    'frontend',
    'auth',
    'data-ingest',
    'imagery-processor',
    'data-processor',
    'property-search',
    'valuation-ai',
    'voice-agent',
    'crm-sync',
    'calendar-sync',
    'billing'
)

# Determine which services to deploy
if ($Services) {
    $SERVICES_TO_DEPLOY = $Services -split ',' | ForEach-Object { $_.Trim() }
} else {
    $SERVICES_TO_DEPLOY = $ALL_SERVICES
}

# Colors for output
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# ==================== FUNCTIONS ====================

function Test-GCPSetup {
    Write-Info "`n📋 Checking GCP setup..."

    try {
        $project = gcloud config get-value project
        if ($project -ne $PROJECT_ID) {
            Write-Error "❌ GCP project not set to $PROJECT_ID (current: $project)"
            exit 1
        }
        Write-Success "✓ GCP project: $project"

        gcloud auth list --filter=status:ACTIVE | Out-Null
        Write-Success "✓ GCP authentication valid"

        $services = gcloud services list --enabled --format="value(name)"
        $requiredServices = @(
            'run.googleapis.com',
            'cloudbuild.googleapis.com',
            'sqladmin.googleapis.com',
            'pubsub.googleapis.com',
            'secretmanager.googleapis.com'
        )

        foreach ($svc in $requiredServices) {
            if ($services -notmatch $svc) {
                Write-Warning "⚠ API not enabled: $svc"
                Write-Info "  Enabling: gcloud services enable $svc"
                if (-not $DryRun) {
                    gcloud services enable $svc
                }
            }
        }
        Write-Success "✓ Required APIs enabled"

    } catch {
        Write-Error "❌ GCP setup check failed: $_"
        exit 1
    }
}

function Build-Services {
    Write-Info "`n🏗️  Building Docker images..."

    foreach ($service in $SERVICES_TO_DEPLOY) {
        Write-Info "  Building $service..."
        $dockerfile = "services/backend/$service/Dockerfile"

        if ($service -eq 'frontend') {
            $dockerfile = "services/frontend/Dockerfile"
        }

        if (-not (Test-Path $dockerfile)) {
            Write-Warning "  ⚠ Dockerfile not found: $dockerfile"
            continue
        }

        $image = "$REGISTRY/$SYSTEM_PREFIX-$service`:latest"
        $cmd = "docker build -f $dockerfile -t $image services/$(if($service -eq 'frontend') { 'frontend' } else { "backend/$service" })"

        if ($DryRun) {
            Write-Info "    [DRY RUN] $cmd"
        } else {
            Invoke-Expression $cmd
            if ($LASTEXITCODE -eq 0) {
                Write-Success "  ✓ Built $service"
            } else {
                Write-Error "  ❌ Failed to build $service"
                exit 1
            }
        }
    }
}

function Push-Images {
    Write-Info "`n📤 Pushing images to Container Registry..."

    # Ensure container registry enabled
    if (-not $DryRun) {
        gcloud auth configure-docker
    }

    foreach ($service in $SERVICES_TO_DEPLOY) {
        Write-Info "  Pushing $service..."
        $image = "$REGISTRY/$SYSTEM_PREFIX-$service`:latest"

        if ($DryRun) {
            Write-Info "    [DRY RUN] docker push $image"
        } else {
            docker push $image
            if ($LASTEXITCODE -eq 0) {
                Write-Success "  ✓ Pushed $service"
            } else {
                Write-Error "  ❌ Failed to push $service"
                exit 1
            }
        }
    }
}

function Deploy-Terraform {
    Write-Info "`n🔧 Deploying infrastructure with Terraform..."

    $terraformDir = "infrastructure/terraform/environments/$Environment"

    if (-not (Test-Path $terraformDir)) {
        Write-Error "❌ Terraform environment directory not found: $terraformDir"
        exit 1
    }

    Push-Location $terraformDir

    try {
        # Initialize Terraform
        if (-not (Test-Path .terraform)) {
            Write-Info "  Initializing Terraform..."
            if (-not $DryRun) {
                terraform init
            }
        }

        # Plan
        Write-Info "  Planning infrastructure..."
        $planFile = "tfplan-$Environment"

        if ($DryRun) {
            Write-Info "    [DRY RUN] terraform plan -out=$planFile"
        } else {
            terraform plan -out=$planFile -var="environment=$Environment" -var="region=$Region"

            # Show plan
            Write-Info "`n📊 Infrastructure changes:"
            terraform show $planFile

            # Ask for confirmation
            $confirm = Read-Host "Proceed with deployment? (yes/no)"
            if ($confirm -ne 'yes') {
                Write-Warning "Deployment cancelled"
                exit 0
            }

            # Apply
            Write-Info "  Applying Terraform..."
            terraform apply $planFile
            Write-Success "✓ Infrastructure deployed"
        }

    } finally {
        Pop-Location
    }
}

function Deploy-Services {
    Write-Info "`n🚀 Deploying services to Cloud Run..."

    foreach ($service in $SERVICES_TO_DEPLOY) {
        Write-Info "  Deploying $service..."

        $image = "$REGISTRY/$SYSTEM_PREFIX-$service`:latest"
        $serviceName = "$SYSTEM_PREFIX-$service-$Environment"

        # Determine port and memory based on service
        $portMap = @{
            'frontend' = '3000'
            'data-ingest' = '8000'
            'imagery-processor' = '8000'
            'data-processor' = '8000'
            'auth' = '8000'
            'property-search' = '8000'
            'valuation-ai' = '8000'
            'voice-agent' = '8000'
            'crm-sync' = '8000'
            'calendar-sync' = '8000'
            'billing' = '8000'
        }

        $memoryMap = @{
            'frontend' = '512Mi'
            'data-ingest' = '1Gi'
            'imagery-processor' = '1Gi'
            'data-processor' = '1Gi'
        }

        $port = $portMap[$service]
        $memory = $memoryMap[$service] ?? '512Mi'

        $cmd = @(
            "gcloud run deploy $serviceName",
            "--image=$image",
            "--platform=managed",
            "--region=$Region",
            "--memory=$memory",
            "--cpu=1",
            "--allow-unauthenticated",
            "--set-env-vars=ENVIRONMENT=$Environment",
            "--service-account=$SYSTEM_PREFIX-$service-sa@$PROJECT_ID.iam.gserviceaccount.com"
        ) -join ' '

        if ($DryRun) {
            Write-Info "    [DRY RUN] $cmd"
        } else {
            Invoke-Expression $cmd
            if ($LASTEXITCODE -eq 0) {
                Write-Success "  ✓ Deployed $service"
            } else {
                Write-Error "  ❌ Failed to deploy $service"
            }
        }
    }
}

function Verify-Deployment {
    Write-Info "`n✅ Verifying deployment..."

    foreach ($service in $SERVICES_TO_DEPLOY) {
        $serviceName = "$SYSTEM_PREFIX-$service-$Environment"

        Write-Info "  Checking $service..."

        if ($DryRun) {
            Write-Info "    [DRY RUN] gcloud run services describe $serviceName --region=$Region"
        } else {
            $serviceInfo = gcloud run services describe $serviceName --region=$Region --format="value(status.url)"

            if ($serviceInfo) {
                Write-Success "  ✓ $service is running"
                Write-Info "    URL: $serviceInfo"

                # Test health endpoint
                try {
                    $response = Invoke-WebRequest -Uri "$serviceInfo/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
                    if ($response.StatusCode -eq 200) {
                        Write-Success "    ✓ Health check passed"
                    }
                } catch {
                    Write-Warning "    ⚠ Health check failed (service may still be initializing)"
                }
            } else {
                Write-Error "  ❌ $service not found"
            }
        }
    }
}

function Show-Summary {
    Write-Success "`n════════════════════════════════════════════════════════════"`
    Write-Success "✅ DEPLOYMENT COMPLETE"
    Write-Success "════════════════════════════════════════════════════════════"

    Write-Info "`n📊 Deployment Summary:"
    Write-Info "  Environment: $Environment"
    Write-Info "  Region: $Region"
    Write-Info "  Project: $PROJECT_ID"
    Write-Info "  Services: $($SERVICES_TO_DEPLOY.Count)"
    Write-Info "  Status: $(if($DryRun) { 'DRY RUN' } else { 'DEPLOYED' })"

    if (-not $DryRun) {
        Write-Info "`n🔗 Service URLs:"
        foreach ($service in $SERVICES_TO_DEPLOY) {
            $serviceName = "$SYSTEM_PREFIX-$service-$Environment"
            $url = gcloud run services describe $serviceName --region=$Region --format="value(status.url)" 2>/dev/null
            if ($url) {
                Write-Info "  $service`: $url"
            }
        }
    }

    Write-Info "`n📚 Next Steps:"
    Write-Info "  1. Monitor logs: gcloud run services logs read [SERVICE_NAME]"
    Write-Info "  2. Configure DNS: Point domains to Load Balancer IP"
    Write-Info "  3. Setup monitoring: Visit Cloud Console Monitoring"
    Write-Info "`n"
}

# ==================== MAIN EXECUTION ====================

Write-Info "
╔════════════════════════════════════════════════════════════╗
║         REI360 MONOREPO DEPLOYMENT ORCHESTRATOR            ║
╚════════════════════════════════════════════════════════════╝
"

if ($DryRun) {
    Write-Warning "🔍 DRY RUN MODE - No changes will be made"
}

Write-Info "Deploying to: $Environment"
Write-Info "Services: $($SERVICES_TO_DEPLOY -join ', ')"
Write-Info ""

# Execute deployment steps
Test-GCPSetup
Build-Services
Push-Images
Deploy-Terraform
Deploy-Services
Verify-Deployment
Show-Summary

Write-Success "✅ Deployment successful!"
