# Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 2. Set Up Environment Variables

#### Backend
Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college-portal
JWT_SECRET=your-super-secret-jwt-key-change-this
GEMINI_API_KEY=your-gemini-api-key
```

#### Frontend
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start MongoDB

**Option A: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Update `MONGODB_URI` in `backend/.env`

### 4. Get Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `backend/.env`

### 5. Run the Application

```bash
# Run both frontend and backend
npm run dev
```

Or separately:
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 First Steps

1. **Register an Admin Account**
   - Go to http://localhost:3000/register
   - Select "Admin" role
   - Register with your email

2. **Upload Documents**
   - Login as admin
   - Go to "Documents" page
   - Upload PDF files (circulars, notices, etc.)

3. **Test AI Chat**
   - Login as student
   - Go to Dashboard
   - Ask questions about uploaded documents

4. **Submit a Complaint**
   - Go to Complaints page
   - Submit a test complaint
   - Login as admin to respond

## 🔧 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, whitelist your IP address

### Gemini API Error
- Verify API key is correct
- Check API quota/limits
- System will work without it (limited functionality)

### ChromaDB Not Working
- ChromaDB is optional
- System uses in-memory fallback
- To use ChromaDB: `pip install chromadb && chroma run --path ./chroma_db`

### Port Already in Use
- Change `PORT` in `backend/.env`
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

## 📚 Next Steps

- Read full [README.md](./README.md) for detailed documentation
- Customize UI colors in `frontend/tailwind.config.js`
- Add more features as needed

