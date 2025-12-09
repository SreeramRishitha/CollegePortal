# Architecture Verification

## ✅ YES - The website follows the exact architecture you described!

### Flow 1: User Query → AI Response (RAG Pipeline)

**Path:** `User → Web App → Backend → RAG Engine → Vector DB → LLM → Response`

**Implementation:**
1. **User** asks question in frontend (`/dashboard` page)
2. **Web App** (Frontend) sends POST request to `/api/query/ask`
3. **Backend** (`routes/query.js`) receives request
4. **RAG Engine** (`services/ragService.js`):
   - Calls `generateAnswer(question)`
   - Calls `queryVectorDB(question, 5)` to search vector store
5. **Vector DB** (in-memory or ChromaDB):
   - Searches for relevant document chunks using similarity
   - Returns top 5 most relevant chunks
6. **LLM** (Gemini API):
   - Receives question + context chunks
   - Generates answer using RAG
7. **Response** sent back to user

**Code Location:**
- Frontend: `frontend/app/dashboard/page.tsx` → `queryAPI.ask()`
- Backend Route: `backend/routes/query.js`
- RAG Service: `backend/services/ragService.js` → `generateAnswer()`
- Vector Search: `backend/services/ragService.js` → `queryVectorDB()`
- LLM: `backend/services/ragService.js` → `model.generateContent()`

---

### Flow 2: Admin Document Upload → Processing

**Path:** `Admin → Web App → Backend → Document Processor → Vector DB + Storage`

**Implementation:**
1. **Admin** uploads PDF in frontend (`/admin/documents` page)
2. **Web App** (Frontend) sends POST request to `/api/documents/upload` with file
3. **Backend** (`routes/documents.js`) receives file via Multer
4. **Document Processor** (`services/ragService.js`):
   - `extractTextFromPDF(filePath)` - Extracts text from PDF
   - `splitTextIntoChunks(text)` - Splits into chunks (1000 chars, 200 overlap)
5. **Vector DB** (`addDocumentToVectorDB()`):
   - Stores chunks in in-memory vector store
   - Optionally stores in ChromaDB if available
6. **Storage**:
   - File saved to `uploads/documents/` (file system)
   - Document metadata saved to MongoDB

**Code Location:**
- Frontend: `frontend/app/admin/documents/page.tsx` → `documentAPI.upload()`
- Backend Route: `backend/routes/documents.js` → `POST /upload`
- Document Processing: `backend/services/ragService.js` → `addDocumentToVectorDB()`
- Storage: MongoDB (`models/Document.js`) + File System

---

### Flow 3: Complaint Management

**Path:** `Student → Complaint Page → Backend → MongoDB → Admin Dashboard → Reply → Student Notification`

**Implementation:**
1. **Student** submits complaint in frontend (`/complaints` page)
2. **Complaint Page** (Frontend) sends POST to `/api/complaints` with data
3. **Backend** (`routes/complaints.js`) receives complaint
4. **MongoDB** stores complaint in `Complaint` collection with status "pending"
5. **Admin Dashboard** (`/admin/complaints` page):
   - Fetches all complaints from MongoDB
   - Displays with filters (status, category, search)
6. **Admin Reply**:
   - Admin sends reply via POST `/api/complaints/:id/reply`
   - Backend updates complaint in MongoDB with reply
   - Status updated to "in-review"
7. **Student Notification**:
   - Student sees reply when viewing their complaints
   - Status updates visible in real-time (on page refresh)

**Code Location:**
- Student Frontend: `frontend/app/complaints/page.tsx`
- Admin Frontend: `frontend/app/admin/complaints/page.tsx`
- Backend Route: `backend/routes/complaints.js`
- Database: `backend/models/Complaint.js` (MongoDB)

---

## Architecture Components

### ✅ RAG Engine
- **Location:** `backend/services/ragService.js`
- **Functions:**
  - `extractTextFromPDF()` - PDF text extraction
  - `splitTextIntoChunks()` - Text chunking
  - `queryVectorDB()` - Vector similarity search
  - `generateAnswer()` - RAG answer generation

### ✅ Vector Database
- **Primary:** In-memory vector store (array-based)
- **Optional:** ChromaDB (if installed)
- **Storage:** Document chunks with metadata (source, chunkIndex)

### ✅ LLM Integration
- **Service:** Google Gemini API
- **Model:** gemini-2.0-flash-lite
- **Usage:** Generates answers using RAG context

### ✅ Document Processor
- **PDF Parsing:** pdf-parse library
- **Text Extraction:** Automatic from PDFs
- **Chunking:** 1000 char chunks with 200 char overlap
- **Storage:** MongoDB + File System

### ✅ Complaint System
- **Database:** MongoDB (Complaint model)
- **Status Flow:** pending → in-review → resolved/rejected
- **Features:** Filtering, search, attachments, replies

---

## Data Flow Diagrams

### Query Flow
```
Student → Frontend (Chat UI)
  ↓
POST /api/query/ask
  ↓
Backend (routes/query.js)
  ↓
RAG Service (generateAnswer)
  ↓
Vector DB (queryVectorDB) → Returns relevant chunks
  ↓
LLM (Gemini API) → Generates answer with context
  ↓
Response → Student sees answer
```

### Document Upload Flow
```
Admin → Frontend (Documents Page)
  ↓
POST /api/documents/upload (multipart/form-data)
  ↓
Backend (routes/documents.js)
  ↓
Document Processor (addDocumentToVectorDB)
  ↓
PDF → Text Extraction → Chunking
  ↓
Vector DB (stores chunks) + MongoDB (stores metadata) + File System (stores PDF)
```

### Complaint Flow
```
Student → Frontend (Complaints Page)
  ↓
POST /api/complaints
  ↓
Backend → MongoDB (saves complaint)
  ↓
Admin → Frontend (Admin Dashboard)
  ↓
GET /api/complaints (sees all complaints)
  ↓
POST /api/complaints/:id/reply
  ↓
Backend → MongoDB (updates complaint with reply)
  ↓
Student → Frontend (sees reply in their complaints)
```

---

## ✅ Verification: Architecture Matches 100%

All three flows are implemented exactly as described:
1. ✅ RAG Pipeline with Vector DB
2. ✅ Document Processing with Vector Storage
3. ✅ Complaint Management with MongoDB

The system follows the exact architecture you specified!

