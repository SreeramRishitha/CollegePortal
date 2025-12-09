# Frontend Documentation

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client
- **React Icons** - Icon library

## Project Structure

```
frontend/
├── app/                  # Next.js App Router
│   ├── page.tsx         # Home page
│   ├── login/           # Login page
│   ├── register/        # Register page
│   ├── dashboard/       # Chat interface
│   ├── complaints/      # Complaint pages
│   └── admin/           # Admin pages
├── components/          # React components
│   └── Layout.tsx       # Main layout with navigation
├── lib/                 # Utilities
│   ├── api.ts          # API client
│   └── auth.ts         # Auth utilities
└── public/              # Static assets
```

## Pages

### Home (`/`)
Landing page with feature overview and login/register links.

### Login (`/login`)
User login page.

### Register (`/register`)
User registration page. Supports both student and admin roles.

### Dashboard (`/dashboard`)
AI chat interface for asking questions.

### Complaints (`/complaints`)
- View all user complaints
- Submit new complaints
- Track complaint status
- View admin replies

### Admin Complaints (`/admin/complaints`)
Admin dashboard for:
- Viewing all complaints
- Filtering and searching
- Updating status
- Replying to complaints

### Admin Documents (`/admin/documents`)
Admin page for:
- Uploading PDF documents
- Viewing uploaded documents
- Deleting documents

## Components

### Layout
Main layout component with:
- Navigation bar
- Role-based menu items
- User info and logout

## API Integration

All API calls are handled through `lib/api.ts`:
- `authAPI` - Authentication endpoints
- `queryAPI` - AI query endpoints
- `complaintAPI` - Complaint endpoints
- `documentAPI` - Document endpoints

## Authentication

Authentication is handled via:
- JWT tokens stored in localStorage
- Protected routes
- Automatic token injection in API requests

## Styling

- TailwindCSS for all styling
- Custom color scheme in `tailwind.config.js`
- Responsive design (mobile-first)

## Environment Variables

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Running

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Customization

### Colors
Edit `tailwind.config.js` to change the color scheme.

### API URL
Update `NEXT_PUBLIC_API_URL` in `.env.local` or `next.config.js`.

