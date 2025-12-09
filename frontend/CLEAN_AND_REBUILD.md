# Complete Clean and Rebuild Instructions

## Step 1: Stop All Running Servers
Press `Ctrl+C` in all terminal windows running the dev servers.

## Step 2: Clean Build Cache
```powershell
cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Write-Host "✅ Cache cleared!"
```

## Step 3: Restart Frontend
```powershell
npm run dev
```

## Step 4: If Still Having Issues - Full Clean
```powershell
cd frontend

# Delete all caches
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue

# Reinstall dependencies (optional, only if needed)
# Remove-Item -Recurse -Force node_modules
# npm install

# Start dev server
npm run dev
```

## Step 5: Verify Backend is Running
In a separate terminal:
```powershell
cd backend
npm run dev
```

## Expected Output
Frontend should show:
```
▲ Next.js 14.0.4
- Local: http://localhost:3000
✓ Ready in X.Xs
```

Backend should show:
```
✅ Gemini AI initialized with model: gemini-2.0-flash-lite
Server running on port 5000
✅ Connected to MongoDB
```

## Test the Website
1. Open: http://localhost:3000
2. Should see the landing page
3. Click "Login" or "Register"
4. Test all features

