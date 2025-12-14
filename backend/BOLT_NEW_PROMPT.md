# Bolt.new Frontend Generation Prompt

Create a modern React + TypeScript web application for LegalEase RAG API with two separate interfaces: Admin Panel and User Interface.

## Backend API
- Base URL: `http://127.0.0.1:10000` (configurable for production)
- API Documentation: http://127.0.0.1:10000/docs

## Core Requirements

### 1. Admin Interface (`/admin`)
**Authentication**: Login page requiring admin API key (stored in localStorage)
**Features**:
- **Data Ingestion**:
  - File upload (PDF/text) with drag & drop
  - Text input area for direct ingestion
  - Shows document_id after successful upload
  - List of all ingested documents

- **Admin Dashboard**: 
  - Document management table
  - Upload history
  - Search/filter documents

### 2. User Interface (`/`)
**Features**:
- **Document Upload** (`/upload`):
  - File upload or text input
  - Display returned document_id
  - Copy document_id button

- **Document Processing** (`/process`):
  - Input document_id
  - Language selector (default: English)
  - Action buttons:
    - Simplify Document → POST `/simplify` with `{document_id, output_language}`
    - Summarize → POST `/summary`
    - Extract Key Terms → POST `/keyterms`
    - Risk Analysis → POST `/risk-analysis`
  - Display formatted results with copy/download options

- **Contract Comparison** (`/compare`):
  - Two document_id inputs
  - POST `/contract-comparison` with `{document_id_1, document_id_2, output_language}`
  - Display comparison results

- **My Documents** (`/documents`):
  - List of uploaded document IDs (stored in localStorage)
  - Quick actions for each document

## API Endpoints

### Health Check
- GET `/` or `/health` → `{status: "healthy", service: "LegalEase RAG API"}`

### Admin Endpoints (require `X-Admin-Token` header)
- POST `/admin/ingest-file`: multipart/form-data (file, uploader_id?)
- POST `/admin/ingest-text`: `{text: string, uploader_id?: string}`
- Response: `{document_id: string, is_new: boolean, message: string}`

### User Endpoints
- POST `/user/upload-file`: multipart/form-data (file, user_id?)
- POST `/user/upload-text`: `{text: string, user_id?: string}`
- Response: Same as admin

### Processing Endpoints
- POST `/simplify`: `{document_id: string, output_language?: string}` → `{result: string}`
- POST `/summary`: Same request/response
- POST `/keyterms`: Same request/response
- POST `/risk-analysis`: Same request/response
- POST `/contract-comparison`: `{document_id_1: string, document_id_2: string, output_language?: string}` → `{result: string}`

## Technical Stack
- React 18+ with TypeScript
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation
- React Context for state management
- Support both localhost (http://127.0.0.1:10000) and production via environment variables

## UI/UX Requirements
- Modern, clean, professional design
- Responsive (mobile, tablet, desktop)
- Loading states for all API calls
- Toast notifications for success/error
- Smooth animations
- Dark mode support (optional)
- Color scheme: Professional blue primary (#2563EB), green for success, red for errors

## Key Components Needed
1. FileUpload: Drag & drop, file picker, progress bar
2. DocumentCard: Display document_id, actions
3. ProcessingResult: Formatted text, copy/download buttons
4. LanguageSelector: Dropdown (default: English)
5. LoadingSpinner: Animated spinner
6. ToastNotification: Success/error/warning messages
7. Navigation: Responsive navbar with mobile menu

## Implementation Details
- Create `api/client.ts` with axios instance
- Environment variable: `REACT_APP_API_URL` (default: http://127.0.0.1:10000)
- Store admin token in localStorage (key: `admin_token`)
- Store user document IDs in localStorage (key: `user_documents`)
- Error handling: Network errors, API errors, validation errors
- All async operations show loading states
- Results display in formatted, readable text area

## File Structure
```
src/
  components/
    FileUpload.tsx
    DocumentCard.tsx
    ProcessingResult.tsx
    LanguageSelector.tsx
    LoadingSpinner.tsx
    ToastNotification.tsx
    Navigation.tsx
  pages/
    Admin/
      AdminLogin.tsx
      AdminDashboard.tsx
    User/
      Home.tsx
      Upload.tsx
      Process.tsx
      Compare.tsx
      Documents.tsx
  services/
    api.ts
  context/
    AppContext.tsx
  utils/
    storage.ts
  App.tsx
  index.tsx
```

## Design Notes
- Use Tailwind CSS utility classes
- Primary buttons: Blue background, white text
- Secondary buttons: Gray border, gray text
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Cards: White background, shadow, rounded corners
- Inputs: Border, focus ring, padding

Make the application production-ready with proper error handling, loading states, and a polished UI that works seamlessly on both localhost and production environments.
