# Project Structure

## Complete File Tree

```
CollegePortal/
├── frontend/                    # Next.js Frontend Application
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── not-found.tsx       # 404 page
│   │   ├── login/              # Login page
│   │   │   └── page.tsx
│   │   ├── register/           # Registration page
│   │   │   └── page.tsx
│   │   ├── dashboard/           # AI Chat interface
│   │   │   └── page.tsx
│   │   ├── complaints/          # Complaint management
│   │   │   └── page.tsx
│   │   └── admin/              # Admin pages
│   │       ├── complaints/      # Admin complaint dashboard
│   │       │   └── page.tsx
│   │       └── documents/      # Document management
│   │           └── page.tsx
│   ├── components/             # React components
│   │   └── Layout.tsx         # Main layout component
│   ├── lib/                   # Utilities and helpers
│   │   ├── api.ts             # API client (Axios)
│   │   └── auth.ts            # Authentication utilities
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.js     # TailwindCSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── README.md              # Frontend documentation
│
├── backend/                    # Express.js Backend API
│   ├── models/                # MongoDB Models (Mongoose)
│   │   ├── User.js           # User model
│   │   ├── Complaint.js      # Complaint model
│   │   └── Document.js       # Document model
│   ├── routes/                # API Routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── query.js          # AI query routes
│   │   ├── complaints.js     # Complaint routes
│   │   └── documents.js     # Document routes
│   ├── middleware/            # Express middleware
│   │   └── auth.js           # JWT authentication
│   ├── services/              # Business logic
│   │   └── ragService.js     # RAG implementation
│   ├── uploads/               # Uploaded files (gitignored)
│   │   ├── documents/        # PDF documents
│   │   └── complaints/       # Complaint attachments
│   ├── index.js              # Main server file
│   ├── package.json          # Backend dependencies
│   ├── .env.example          # Environment variables template
│   ├── .gitignore            # Git ignore rules
│   └── README.md             # Backend documentation
│
├── uploads/                   # Upload directory (gitignored)
│
├── package.json               # Root package.json
├── docker-compose.yml         # Docker Compose configuration
├── .gitignore                 # Root gitignore
├── README.md                  # Main project documentation
├── SETUP.md                   # Quick setup guide
└── PROJECT_STRUCTURE.md       # This file

```

## Key Directories Explained

### Frontend (`frontend/`)

- **`app/`**: Next.js 14 App Router pages
  - Each subdirectory represents a route
  - `page.tsx` files are the actual pages
- **`components/`**: Reusable React components
- **`lib/`**: Utility functions and API clients

### Backend (`backend/`)

- **`models/`**: Mongoose schemas for MongoDB
- **`routes/`**: Express route handlers
- **`middleware/`**: Custom Express middleware
- **`services/`**: Business logic (RAG, document processing)
- **`uploads/`**: File storage (created at runtime)

## Data Flow

### 1. User Authentication Flow
```
User → Frontend (login page) → API (/api/auth/login) → MongoDB → JWT Token → Frontend (localStorage)
```

### 2. AI Query Flow
```
User Question → Frontend → API (/api/query/ask) → RAG Service → Vector Store → Gemini API → Answer → Frontend
```

### 3. Document Upload Flow
```
Admin Upload → Frontend → API (/api/documents/upload) → PDF Parser → Text Extraction → Chunking → Vector Store
```

### 4. Complaint Flow
```
Student Submit → Frontend → API (/api/complaints) → MongoDB → Admin View → Admin Reply → Student Notification
```

## Technology Stack

### Frontend
- Next.js 14 (React Framework)
- TypeScript
- TailwindCSS
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT
- Multer (File uploads)
- PDF-Parse
- Google Gemini API

### AI/ML
- RAG (Retrieval Augmented Generation)
- In-memory vector store (with optional ChromaDB)
- Text similarity search
- Document chunking

## Environment Variables

### Backend (`backend/.env`)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GEMINI_API_KEY` - Google Gemini API key
- `CHROMADB_URL` - ChromaDB URL (optional)

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'admin',
  studentId: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Complaints Collection
```javascript
{
  title: String,
  description: String,
  category: String,
  status: 'pending' | 'in-review' | 'resolved' | 'rejected',
  submittedBy: ObjectId (ref: User),
  reply: String (optional),
  attachments: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Documents Collection
```javascript
{
  filename: String,
  originalName: String,
  path: String,
  size: Number,
  uploadedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | No | - | Register user |
| POST | `/api/auth/login` | No | - | Login user |
| GET | `/api/auth/me` | Yes | Any | Get current user |
| POST | `/api/query/ask` | Yes | Any | Ask AI question |
| GET | `/api/complaints` | Yes | Any | Get complaints |
| POST | `/api/complaints` | Yes | Any | Create complaint |
| PATCH | `/api/complaints/:id/status` | Yes | Admin | Update status |
| POST | `/api/complaints/:id/reply` | Yes | Admin | Reply to complaint |
| GET | `/api/documents` | Yes | Any | Get documents |
| POST | `/api/documents/upload` | Yes | Admin | Upload document |
| DELETE | `/api/documents/:id` | Yes | Admin | Delete document |

