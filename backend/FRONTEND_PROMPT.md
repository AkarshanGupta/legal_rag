# Frontend Development Prompt for LegalEase RAG Application

## Project Overview
Create a modern, responsive web application for LegalEase RAG API - a legal document processing and analysis platform. The application must have two distinct interfaces: **Admin Panel** and **User Interface**, with separate authentication and functionality.

## Technical Requirements

### Technology Stack
- **Framework**: React with TypeScript (or Next.js for production-ready setup)
- **Styling**: Tailwind CSS or Material-UI for modern, responsive design
- **State Management**: React Context API or Zustand
- **HTTP Client**: Axios or Fetch API
- **File Upload**: Support for PDF and text files
- **Routing**: React Router (or Next.js routing)

### Environment Configuration
- Support both **localhost** (http://127.0.0.1:10000) and **production** environments
- Use environment variables for API base URL:
  - Development: `http://127.0.0.1:10000`
  - Production: Configurable via environment variable
- Create `.env.local` and `.env.production` files for easy configuration

## API Endpoints Reference

### Base URL Configuration
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000';
```

### Health Check Endpoints
- **GET /** - Root endpoint (health check)
- **GET /health** - Health check endpoint
  - Response: `{ "status": "healthy", "service": "LegalEase RAG API" }`

### General Document Processing Endpoints (User & Admin)
All these endpoints require a `document_id` from ingested documents:

1. **POST /simplify** - Simplify legal document
   - Request Body:
     ```json
     {
       "document_id": "string",
       "output_language": "English" // optional, default: "English"
     }
     ```
   - Response: `{ "result": "string" }`

2. **POST /summary** - Summarize document
   - Request Body: Same as `/simplify`
   - Response: `{ "result": "string" }`

3. **POST /keyterms** or **POST /key-terms** - Extract key terms
   - Request Body: Same as `/simplify`
   - Response: `{ "result": "string" }`

4. **POST /risk-analysis** - Analyze risks in document
   - Request Body: Same as `/simplify`
   - Response: `{ "result": "string" }`

5. **POST /contract-comparison** - Compare two contracts
   - Request Body:
     ```json
     {
       "document_id_1": "string",
       "document_id_2": "string",
       "output_language": "English" // optional
     }
     ```
   - Response: `{ "result": "string" }`

### Admin Endpoints (Require Authentication)
**Important**: All admin endpoints require `X-Admin-Token` header with the admin API key.

1. **POST /admin/ingest-file** - Upload and ingest file
   - Headers: `X-Admin-Token: <admin_api_key>`
   - Request: `multipart/form-data`
     - `file`: File (PDF or text file)
     - `uploader_id`: string (optional)
   - Response:
     ```json
     {
       "document_id": "string",
       "is_new": boolean,
       "message": "string"
     }
     ```

2. **POST /admin/ingest-text** - Ingest text directly
   - Headers: `X-Admin-Token: <admin_api_key>`
   - Request Body:
     ```json
     {
       "text": "string",
       "uploader_id": "string" // optional
     }
     ```
   - Response: Same as `/admin/ingest-file`

### User Endpoints

1. **POST /user/upload-file** - User file upload
   - Request: `multipart/form-data`
     - `file`: File (PDF or text file)
     - `user_id`: string (optional)
   - Response: Same as admin ingest response

2. **POST /user/upload-text** - User text upload
   - Request Body:
     ```json
     {
       "text": "string",
       "user_id": "string" // optional
     }
     ```
   - Response: Same as admin ingest response

## Application Structure

### 1. Admin Interface (`/admin`)

**Features:**
- **Login Page**: Admin authentication using API key
  - Input field for admin API key
  - Store in session/localStorage (secure)
  - Redirect to admin dashboard on success

- **Admin Dashboard** (`/admin/dashboard`):
  - **Data Ingestion Section**:
    - File upload component (drag & drop or file picker)
    - Text input area for direct text ingestion
    - Upload progress indicator
    - Success/error notifications
    - Display uploaded document IDs
    - List of all ingested documents with their IDs

  - **Document Management**:
    - Table/list view of all ingested documents
    - Show document_id, upload date, uploader info
    - Ability to view document details
    - Search/filter functionality

- **Navigation**: 
  - Logout button
  - Link to switch to user interface (if needed)

**UI Requirements:**
- Professional, clean design
- Dark mode support (optional but recommended)
- Responsive layout
- Loading states for all async operations
- Error handling with user-friendly messages
- Toast notifications for success/error

### 2. User Interface (`/` or `/user`)

**Features:**
- **Home Page**:
  - Welcome message
  - Overview of available features
  - Quick access to document upload

- **Document Upload Page** (`/upload`):
  - File upload component
  - Text input option
  - Upload progress
  - Display returned `document_id` after upload
  - Copy document_id button

- **Document Processing Page** (`/process/:documentId`):
  - Input field for document_id (or select from uploaded documents)
  - Language selector (for output language)
  - Action buttons for:
    - Simplify Document
    - Summarize Document
    - Extract Key Terms
    - Risk Analysis
  - Results display area with:
    - Formatted output
    - Copy to clipboard button
    - Download as text file option
    - Loading spinner during processing

- **Contract Comparison Page** (`/compare`):
  - Two document_id input fields
  - Language selector
  - Compare button
  - Side-by-side or unified comparison results
  - Export comparison results

- **My Documents Page** (`/documents`):
  - List of user's uploaded documents
  - Document IDs stored in localStorage
  - Quick actions (process, compare, delete from list)
  - Search functionality

**UI Requirements:**
- Modern, user-friendly design
- Intuitive navigation
- Mobile-responsive
- Smooth animations and transitions
- Clear call-to-action buttons
- Helpful tooltips and instructions
- Loading states and progress indicators

## Design Specifications

### Color Scheme
- Primary: Professional blue (#2563EB or similar)
- Secondary: Complementary colors (green for success, red for errors)
- Background: Light mode (white/light gray) with dark mode option
- Text: High contrast for readability

### Typography
- Headings: Bold, clear font (Inter, Roboto, or similar)
- Body: Readable sans-serif font
- Code/Document IDs: Monospace font

### Components to Build

1. **FileUpload Component**
   - Drag & drop zone
   - File picker button
   - File type validation (PDF, .txt)
   - File size limit indicator
   - Upload progress bar

2. **DocumentCard Component**
   - Display document_id
   - Upload date/time
   - Quick action buttons
   - Status indicators

3. **ProcessingResult Component**
   - Formatted text display
   - Copy button
   - Download button
   - Share options (optional)

4. **LanguageSelector Component**
   - Dropdown with common languages
   - Default: English

5. **LoadingSpinner Component**
   - Animated spinner
   - Optional loading text

6. **ToastNotification Component**
   - Success, error, warning, info variants
   - Auto-dismiss after 3-5 seconds
   - Manual dismiss option

7. **Navigation Component**
   - Responsive navbar
   - Mobile hamburger menu
   - Active route highlighting

## Implementation Details

### API Service Layer
Create a centralized API service file:

```typescript
// api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:10000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API client with token
export const adminApiClient = (token: string) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'X-Admin-Token': token,
    },
  });
};

// API methods
export const healthCheck = () => apiClient.get('/health');
export const uploadFile = (file: File, userId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (userId) formData.append('user_id', userId);
  return apiClient.post('/user/upload-file', formData);
};
// ... more methods
```

### State Management
- Store admin token securely (consider httpOnly cookies for production)
- Store user's document IDs in localStorage
- Manage loading states globally
- Handle errors centrally

### Error Handling
- Network errors: Show user-friendly message
- API errors: Display error message from API response
- Validation errors: Highlight form fields
- Timeout handling: Retry mechanism or clear error message

### Performance Optimization
- Lazy load routes
- Optimize bundle size
- Image optimization (if any)
- Debounce search inputs
- Cache API responses where appropriate

## Testing Requirements
- Test all endpoints with mock data
- Test file upload functionality
- Test error scenarios
- Test responsive design on multiple devices
- Test admin authentication flow

## Deployment Considerations
- Build for production with environment variables
- Configure CORS on backend if needed
- Use HTTPS in production
- Set up proper error logging
- Consider adding analytics (optional)

## Additional Features (Nice to Have)
- Document preview before processing
- History of processing requests
- Export results as PDF
- Print functionality
- Keyboard shortcuts
- Accessibility features (ARIA labels, keyboard navigation)
- Multi-language UI support

## Getting Started Checklist
1. Set up React/Next.js project
2. Install dependencies (axios, react-router, tailwindcss, etc.)
3. Create API service layer
4. Build authentication flow (admin)
5. Create admin interface
6. Create user interface
7. Add error handling and loading states
8. Style and polish UI
9. Test all functionality
10. Deploy to production

---

**Note**: Make sure the backend CORS settings allow requests from your frontend domain. The backend should have `ALLOWED_ORIGINS` configured to include your frontend URL in production.
