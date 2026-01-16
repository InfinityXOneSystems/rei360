#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick sync prompts to AI Studio via clipboard
    
.EXAMPLE
    .\studio_sync.ps1 -Prompt "property_analysis"
    .\studio_sync.ps1 -Prompt "market_trends" -OpenBrowser
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Prompt,
    
    [Parameter(Mandatory=$false)]
    [switch]$OpenBrowser
)

$promptsDir = "$PSScriptRoot\..\prompts"
$promptFile = "$promptsDir\$Prompt.txt"

if (-not (Test-Path $promptFile)) {
    Write-Host "❌ Prompt not found: $Prompt" -ForegroundColor Red
    Write-Host "`nAvailable prompts:" -ForegroundColor Yellow
    Get-ChildItem $promptsDir -Filter *.txt | ForEach-Object {
        Write-Host "   - $($_.BaseName)" -ForegroundColor Cyan
    }
    exit 1
}

# Read and copy to clipboard
$content = Get-Content $promptFile -Raw
Set-Clipboard $content

Write-Host "✅ Prompt copied to clipboard!" -ForegroundColor Green
Write-Host "📄 File: $Prompt.txt" -ForegroundColor Gray
Write-Host "📏 Length: $($content.Length) characters" -ForegroundColor Gray

Write-Host "`n🚀 Next:" -ForegroundColor Cyan
Write-Host "   1. Open AI Studio (Ctrl+click below)" -ForegroundColor Gray
Write-Host "   2. Paste (Ctrl+V)" -ForegroundColor Gray
Write-Host "   3. Run and iterate!" -ForegroundColor Gray

if ($OpenBrowser) {
    Write-Host "`n🌐 Opening AI Studio..." -ForegroundColor Yellow
    Start-Process "https://aistudio.google.com/prompts/new_chat"
}

Write-Host "`n🔗 AI Studio: " -NoNewline -ForegroundColor Gray
Write-Host "https://aistudio.google.com/prompts/new_chat" -ForegroundColor Blue
