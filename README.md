# College Portal - AI-Powered Information & Complaint Management System

A comprehensive web application that provides AI-powered answers to college-related queries using RAG (Retrieval Augmented Generation) and a complete complaint management system.

## 🚀 Features

### 1. AI-Powered Query System
- Ask questions about college rules, schedules, and information
- Answers generated from official documents using RAG
- Real-time chat interface
- Document-grounded responses (no hallucinations)

### 2. Complaint Management
- Students can submit complaints with attachments
- Track complaint status (Pending → In Review → Resolved)
- Admin dashboard for managing complaints
- Reply system for admin-student communication
- Filter and search functionality

### 3. Document Management
- Admin can upload official PDFs (circulars, notices, calendars)
- Automatic text extraction and processing
- Vector database integration for semantic search
- Document storage and management

### 4. Authentication & Authorization
- Student and Admin role-based access
- Secure JWT authentication
- Protected routes and API endpoints

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **PDF-Parse** - PDF text extraction

### AI & Vector Database
- **Google Gemini API** - LLM for answer generation
- **ChromaDB** - Vector database for embeddings
- **RAG Pipeline** - Retrieval Augmented Generation

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- ChromaDB (optional, for vector search)
- Google Gemini API key

### Step 1: Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### Step 2: Set Up Environment Variables

#### Backend (.env)
Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college-portal
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key-here
CHROMADB_URL=http://localhost:8000
```

#### Frontend (.env.local)
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 3: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string and update `MONGODB_URI`

### Step 4: Set Up ChromaDB (Optional)

**Option A: Local ChromaDB**
```bash
# Install ChromaDB
pip install chromadb

# Run ChromaDB server
chroma run --path ./chroma_db
```

**Option B: Skip ChromaDB**
The system will work without ChromaDB, but RAG functionality will be limited. The system will use direct LLM responses.

### Step 5: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `backend/.env`

## 🚀 Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build
npm start

# Run backend
cd backend
npm start
```

## 📱 Usage

### For Students

1. **Register/Login**: Create an account with your email and student ID
2. **Ask Questions**: Use the chat interface to ask about college information
3. **Submit Complaints**: Report issues with attachments
4. **Track Status**: Monitor your complaint status and replies

### For Admins

1. **Login**: Use admin credentials
2. **Upload Documents**: Add official PDFs (circulars, notices)
3. **Manage Complaints**: View, filter, and respond to student complaints
4. **Update Status**: Mark complaints as resolved or rejected

## 🏗 Project Structure

```
CollegePortal/
├── frontend/                 # Next.js frontend
│   ├── app/                 # App router pages
│   │   ├── dashboard/       # Chat interface
│   │   ├── complaints/      # Complaint pages
│   │   └── admin/           # Admin pages
│   ├── components/          # React components
│   └── lib/                 # Utilities & API
├── backend/                 # Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic (RAG)
│   └── middleware/         # Auth middleware
└── uploads/                # Uploaded files
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Query
- `POST /api/query/ask` - Ask a question (requires auth)

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/:id` - Get single complaint
- `PATCH /api/complaints/:id/status` - Update status (admin)
- `POST /api/complaints/:id/reply` - Reply to complaint (admin)

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents/upload` - Upload document (admin)
- `DELETE /api/documents/:id` - Delete document (admin)

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- Input sanitization

## 🎨 UI Features

- Modern, responsive design
- Real-time chat interface
- Status indicators and filters
- File upload support
- Toast notifications
- Loading states

## 🚧 Future Enhancements

- [ ] Voice-based queries
- [ ] WhatsApp chatbot integration
- [ ] Analytics dashboard
- [ ] Auto-tagging of complaints
- [ ] Auto-routing to departments
- [ ] Email/SMS notifications
- [ ] Multi-language support

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for college students and administrators**

