# PowerShell setup script for Windows

Write-Host "🚀 Setting up College Portal..." -ForegroundColor Cyan

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Create .env files if they don't exist
Write-Host "📝 Setting up environment files..." -ForegroundColor Yellow

if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend\.env from example..." -ForegroundColor Green
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "⚠️  Please update backend\.env with your actual values!" -ForegroundColor Red
}

if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "Creating frontend\.env.local..." -ForegroundColor Green
    "NEXT_PUBLIC_API_URL=http://localhost:5000" | Out-File -FilePath "frontend\.env.local" -Encoding utf8
}

# Create upload directories
Write-Host "📁 Creating upload directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "backend\uploads\documents" | Out-Null
New-Item -ItemType Directory -Force -Path "backend\uploads\complaints" | Out-Null

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend\.env with your MongoDB URI and Gemini API key"
Write-Host "2. Start MongoDB (or use Docker: docker-compose up -d mongodb)"
Write-Host "3. Run 'npm run dev' to start the application"
Write-Host ""
Write-Host "For detailed instructions, see SETUP.md" -ForegroundColor Yellow

