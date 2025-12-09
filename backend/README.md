# Backend API Documentation

## Environment Variables

Required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GEMINI_API_KEY` - Google Gemini API key (optional but recommended)

Optional:
- `PORT` - Server port (default: 5000)
- `CHROMADB_URL` - ChromaDB server URL (default: http://localhost:8000)

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "studentId": "STU12345"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### POST /api/auth/login
Login user.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Get current user (requires auth).

---

### Query

#### POST /api/query/ask
Ask a question (requires auth).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "question": "When is the last date for exam fees?"
}
```

**Response:**
```json
{
  "question": "When is the last date for exam fees?",
  "answer": "According to the official circular...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Complaints

#### GET /api/complaints
Get all complaints (user sees own, admin sees all).

#### POST /api/complaints
Create a complaint (requires auth).

**Body (multipart/form-data):**
- `title`: string
- `description`: string
- `category`: string (general, academic, infrastructure, attendance, certificate, other)
- `attachments`: files (images/PDFs)

#### GET /api/complaints/:id
Get single complaint.

#### PATCH /api/complaints/:id/status
Update complaint status (admin only).

**Body:**
```json
{
  "status": "resolved"
}
```

#### POST /api/complaints/:id/reply
Reply to complaint (admin only).

**Body:**
```json
{
  "reply": "Your complaint has been resolved..."
}
```

---

### Documents

#### GET /api/documents
Get all documents.

#### POST /api/documents/upload
Upload a document (admin only).

**Body (multipart/form-data):**
- `file`: PDF file

#### DELETE /api/documents/:id
Delete a document (admin only).

---

## File Structure

```
backend/
├── index.js              # Main server file
├── models/               # MongoDB models
│   ├── User.js
│   ├── Complaint.js
│   └── Document.js
├── routes/               # API routes
│   ├── auth.js
│   ├── query.js
│   ├── complaints.js
│   └── documents.js
├── middleware/           # Middleware
│   └── auth.js
└── services/            # Business logic
    └── ragService.js    # RAG implementation
```

## Error Handling

All errors return JSON in this format:
```json
{
  "message": "Error message"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

