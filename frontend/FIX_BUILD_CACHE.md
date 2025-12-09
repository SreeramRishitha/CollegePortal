# Fix Next.js Build Cache Issues

## Problem
Error: `Cannot find module '.next/server/app/not-found_client-reference-manifest.js'`

This happens when the Next.js build cache (`.next` folder) gets corrupted.

## Solution

### Step 1: Delete Build Cache
```powershell
cd frontend
Remove-Item -Recurse -Force .next
```

### Step 2: Restart Dev Server
```powershell
npm run dev
```

The `.next` folder will be automatically regenerated.

## If Problem Persists

### Option 1: Clear All Caches
```powershell
cd frontend
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
npm run dev
```

### Option 2: Full Clean Rebuild
```powershell
cd frontend
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

## Prevention
- Don't manually edit files in `.next` folder
- Don't interrupt the build process
- If you see build errors, clear cache before retrying

