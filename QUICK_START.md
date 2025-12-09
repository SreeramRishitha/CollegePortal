# Quick Start Guide - Fixing Connection Issues

## Step 1: Stop All Node Processes (if needed)

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Stop the process (replace {PID} with actual process ID)
Stop-Process -Id {PID} -Force

# Or stop all node processes (be careful!)
Get-Process node | Stop-Process -Force
```

## Step 2: Start Backend Server

```powershell
cd backend
npm run dev
```

**Expected Output:**
```
✅ Gemini AI initialized with model: gemini-2.0-flash-lite
ChromaDB not available, using in-memory storage
Server running on port 5000
✅ Connected to MongoDB
```

## Step 3: Start Frontend Server (New Terminal)

```powershell
cd frontend
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.0.4
- Local: http://localhost:3000
```

## Step 4: Verify Backend is Running

Open browser and go to:
```
http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Step 5: Test Frontend

Open browser and go to:
```
http://localhost:3000
```

## Common Fixes

### Fix 1: Port Already in Use
```powershell
# Find and kill process on port 5000
$proc = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($proc) {
    Stop-Process -Id $proc.OwningProcess -Force
    Write-Host "Stopped process on port 5000"
}
```

### Fix 2: MongoDB Connection Error
1. Check `backend/.env` file has correct `MONGODB_URI`
2. Verify MongoDB Atlas IP whitelist includes your IP
3. Check internet connection

### Fix 3: Frontend Can't Connect to Backend
1. Check `frontend/.env.local` has:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
2. Restart frontend server after changing .env files
3. Clear browser cache

### Fix 4: Module Not Found Errors
```powershell
# In backend folder
npm install

# In frontend folder
npm install
```

### Fix 5: Syntax Errors
All syntax errors have been fixed. If you see any:
1. Check Node.js version: `node --version` (should be 14+)
2. Clear node_modules and reinstall:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Health check endpoint works: `http://localhost:5000/api/health`
- [ ] Can login as admin
- [ ] Can login as student
- [ ] Can upload a notice (admin)
- [ ] Can view notices (student)
- [ ] Can submit complaint (student)
- [ ] Can view deadlines (student)

## If Still Having Issues

1. **Check Logs**: Look at terminal output for error messages
2. **Check Environment Variables**: Verify all required env vars are set
3. **Check Dependencies**: Run `npm install` in both backend and frontend
4. **Restart Everything**: Stop all processes and start fresh

## Quick Test Commands

```powershell
# Test backend health
curl http://localhost:5000/api/health

# Test if port is listening
netstat -ano | findstr :5000

# Check Node version
node --version

# Check npm version
npm --version
```

