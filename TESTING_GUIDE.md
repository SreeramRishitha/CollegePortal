# Testing Guide for College Portal Features

## Prerequisites
1. Backend server running on port 5000
2. Frontend server running on port 3000/3001
3. MongoDB connected
4. Gemini API key configured

## Starting the Servers

### Backend
```powershell
cd backend
npm run dev
```

### Frontend (in a new terminal)
```powershell
cd frontend
npm run dev
```

## Feature Testing

### 1. AI Notice Summarizer + Auto Notifications

#### Test Steps:
1. **Login as Admin**
   - Go to `http://localhost:3001/login`
   - Login with admin credentials

2. **Upload a Notice**
   - Navigate to `/admin/notices`
   - Click "Upload Notice"
   - Fill in:
     - Title: "Fee Payment Notice - Autumn 2026"
     - Select a PDF file (any college notice PDF)
     - Department: Select a department
     - Target Audience: Students
   - Click "Upload"
   - Wait for processing (check status indicator)

3. **Verify Processing**
   - Notice should show "processing" status initially
   - After a few seconds, status should change to "completed"
   - Check that:
     - Summary is generated
     - Deadlines are extracted (if any in the PDF)
     - Tags are assigned
     - QR code is generated

4. **Publish Notice**
   - Click "Publish" button on the notice
   - Notice should be published

5. **Check Notifications (Student View)**
   - Logout and login as a student
   - Check notification bell icon (top right)
   - Should see a notification about the new notice
   - Click notification to view notice

6. **View Notice as Student**
   - Go to `/notices`
   - Should see the uploaded notice with:
     - Summary (TL;DR)
     - Tags
     - Deadlines (if extracted)
     - QR code
     - Download PDF link

#### Expected Results:
- ✅ PDF text extraction works
- ✅ AI generates 2-3 sentence summary
- ✅ Deadlines extracted with dates
- ✅ Tags assigned automatically
- ✅ QR code generated
- ✅ Students receive notifications

---

### 2. Deadline Tracker Dashboard

#### Test Steps:
1. **View Deadlines (Student)**
   - Login as student
   - Go to `/deadlines`
   - Should see all upcoming deadlines
   - Filter by type (fee, exam, hostel, etc.)

2. **Test Calendar Integration**
   - Click "Add to Google Calendar" on any deadline
   - Should open Google Calendar with event details
   - Click "Download ICS" to download calendar file
   - Import ICS file to your calendar app

3. **Create Manual Deadline (Admin)**
   - Login as admin
   - Go to `/admin/deadlines` (if implemented) or use API
   - Create a deadline:
     - Title: "Last Date for Fee Payment"
     - Date: Future date
     - Type: Fee
     - Priority: High
   - Save deadline

4. **Verify Deadline Appears**
   - Login as student
   - Go to `/deadlines`
   - Should see the new deadline
   - Check countdown timer
   - Verify priority color coding

#### Expected Results:
- ✅ Deadlines displayed in chronological order
- ✅ Countdown shows days remaining
- ✅ Google Calendar link works
- ✅ ICS file downloads correctly
- ✅ Priority colors displayed (red for critical, orange for high, etc.)

---

### 3. Predictive Complaint Routing

#### Test Steps:
1. **Submit Complaint (Student)**
   - Login as student
   - Go to `/complaints`
   - Click "Submit Complaint"
   - Test different complaint types:

   **Test Case 1: IT Complaint**
   - Title: "WiFi not working in library"
   - Description: "The internet connection is very slow and keeps disconnecting"
   - Submit

   **Test Case 2: Exam Complaint**
   - Title: "Attendance not updated"
   - Description: "My attendance for last week is showing as absent"
   - Submit

   **Test Case 3: Hostel Complaint**
   - Title: "Room maintenance issue"
   - Description: "The hostel room has a leaking pipe"
   - Submit

   **Test Case 4: Fee Complaint**
   - Title: "Fee payment issue"
   - Description: "I paid my fees but it's not reflecting in the system"
   - Submit

2. **Verify Routing (Admin)**
   - Login as admin
   - Go to `/admin/complaints`
   - Check each complaint:
     - Should show "predictedDepartment"
     - Should show "confidenceScore"
     - Should show "routingStatus" (auto/manual/needs-triage)
   - Verify:
     - WiFi complaint → IT department
     - Attendance complaint → ExamCell
     - Hostel complaint → Hostel department
     - Fee complaint → Accounts

3. **Test Low Confidence**
   - Submit a vague complaint: "Something is wrong"
   - Should route to "NeedsTriage" with low confidence

#### Expected Results:
- ✅ Complaints automatically routed to correct department
- ✅ Confidence scores displayed
- ✅ Low confidence complaints marked for manual review
- ✅ Routing metadata visible to admin

---

### 4. QR Code Notice Board Integration

#### Test Steps:
1. **Generate QR Code**
   - As admin, upload a notice (from Feature 1)
   - After processing, notice should have a QR code
   - Click "View QR Code" to see/download QR code

2. **Test Public Notice Page**
   - Copy the public URL from notice (e.g., `/notices/{noticeId}`)
   - Open in browser (can be accessed without login)
   - Should see:
     - Notice title
     - Summary
     - Deadlines
     - Download PDF link
     - "Ask AI about this notice" section

3. **Test Notice-Specific AI Chat**
   - On the notice detail page
   - Scroll to "Ask AI about this notice"
   - Ask questions like:
     - "What is the deadline for this notice?"
     - "Who is this notice for?"
     - "What are the key points?"
   - AI should answer based ONLY on this notice's content

4. **Test QR Code Scanning**
   - Print or display the QR code
   - Scan with phone camera
   - Should open the notice detail page
   - Test the AI chat feature

#### Expected Results:
- ✅ QR code generated for each notice
- ✅ QR code links to public notice page
- ✅ Notice page accessible without login
- ✅ AI chat restricted to that notice's content
- ✅ QR code can be scanned and opens correct page

---

## API Testing (Using Postman/curl)

### Health Check
```bash
GET http://localhost:5000/api/health
```

### Upload Notice
```bash
POST http://localhost:5000/api/notices/upload
Headers:
  Authorization: Bearer {admin_token}
  Content-Type: multipart/form-data
Body:
  file: [PDF file]
  title: "Test Notice"
  department: "CSE"
```

### Get Notices
```bash
GET http://localhost:5000/api/notices
Headers:
  Authorization: Bearer {token}
```

### Get Deadlines
```bash
GET http://localhost:5000/api/deadlines
Headers:
  Authorization: Bearer {token}
```

### Submit Complaint
```bash
POST http://localhost:5000/api/complaints
Headers:
  Authorization: Bearer {token}
Body:
  title: "WiFi issue"
  description: "Internet not working"
```

### Ask Question (with notice context)
```bash
POST http://localhost:5000/api/query/ask
Headers:
  Authorization: Bearer {token}
Body:
  question: "What is the deadline?"
  noticeId: "notice_id_here"
```

---

## Common Issues & Solutions

### Issue: Backend not starting
**Solution:**
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Stop the process
Stop-Process -Id {process_id} -Force
```

### Issue: "Failed to fetch" errors
**Solution:**
1. Check if backend is running: `http://localhost:5000/api/health`
2. Check CORS settings in backend
3. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Issue: MongoDB connection error
**Solution:**
1. Check MongoDB URI in `backend/.env`
2. Verify MongoDB Atlas IP whitelist
3. Check network connectivity

### Issue: Gemini API errors
**Solution:**
1. Verify `GEMINI_API_KEY` in `backend/.env`
2. Check API quota limits
3. Try alternative models (already implemented)

### Issue: QR code not generating
**Solution:**
1. Check `uploads/qrcodes` directory exists
2. Verify file permissions
3. Check QR code generation logs

---

## Success Criteria

All features are working correctly if:
- ✅ Notices upload and process successfully
- ✅ Summaries and deadlines are extracted accurately
- ✅ QR codes are generated and scannable
- ✅ Complaints route to correct departments
- ✅ Deadlines display with calendar integration
- ✅ Notifications are sent to students
- ✅ Notice-specific AI chat works correctly

---

## Next Steps for Production

1. **Email Integration**: Configure SendGrid/SES in `notificationService.js`
2. **WhatsApp Integration**: Configure Twilio in `notificationService.js`
3. **Job Queue**: Implement Bull/Agenda for background processing
4. **OCR Support**: Add Tesseract for scanned PDFs
5. **ML Model**: Train custom classifier for complaint routing
6. **Analytics**: Add tracking for QR scans and notice views
7. **Security**: Add rate limiting and input validation
8. **Testing**: Add unit and integration tests

