# LegalEase RAG - Legal Document Processing Platform

A full-stack application for processing, analyzing, and understanding legal documents using Retrieval-Augmented Generation (RAG). The platform provides document ingestion, summarization, risk analysis, key term extraction, and contract comparison capabilities.

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-FF6B6B?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-FF6B6B?style=for-the-badge)

## 🚀 Features

### User Features
- **Document Upload**: Upload PDF files or paste text directly
- **Document Simplification**: Convert complex legal language into simple, understandable text
- **Document Summarization**: Generate concise summaries with key points
- **Key Terms Extraction**: Identify and explain important legal terms and clauses
- **Risk Analysis**: Identify potential risks and unfavorable clauses
- **Contract Comparison**: Compare two contracts side-by-side to highlight differences

### Admin Features
- **Data Ingestion**: Upload and ingest legal documents into the knowledge base
- **Document Management**: View and manage all ingested documents
- **Bulk Operations**: Process multiple documents efficiently

## 🏗️ Architecture

### Backend
- **Framework**: FastAPI (Python)
- **Vector Database**: ChromaDB Cloud (v2 API)
- **LLM**: Groq (Llama 3.3 70B)
- **Embeddings**: Google Gemini Embedding API (with local fallback support)
- **Document Processing**: PyPDF2 for PDF extraction

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn
- ChromaDB Cloud account
- Groq API key
- Google Gemini API key (optional, for embeddings)
- Admin API key (for admin panel access)

## 🔧 Installation

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file** in the `backend` directory:
   ```env
   # ChromaDB Configuration
   CHROMA_API_KEY=your_chroma_api_key
   CHROMA_TENANT=your_chroma_tenant
   CHROMA_DATABASE=your_database_name
   CHROMA_COLLECTION=legalease_docs

   # Groq LLM Configuration
   GROQ_API_KEY=your_groq_api_key

   # Google Gemini (Optional - for embeddings)
   GEMINI_API_KEY=your_gemini_api_key

   # Admin Configuration
   ADMIN_API_KEY=your_admin_api_key

   # CORS Configuration
   ALLOWED_ORIGINS=*

   # Optional: Local Embeddings
   USE_LOCAL_EMBEDDINGS=false
   LOCAL_EMBED_MODEL_NAME=all-MiniLM-L6-v2
   ```

5. **Run the backend server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 10000
   ```
   
   Or use the development server:
   ```bash
   python main.py
   ```

   The API will be available at `http://127.0.0.1:10000`
   API documentation: `http://127.0.0.1:10000/docs`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file** in the `frontend` directory:
   ```env
   VITE_API_URL=http://127.0.0.1:10000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` (or the port shown in terminal)

5. **Build for production**:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
legal_rag/
├── backend/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── admin_routes.py      # Admin endpoints
│   │   ├── user_routes.py       # User endpoints
│   │   └── task_routes.py       # Document processing endpoints
│   ├── config.py                # Configuration and environment variables
│   ├── deps.py                  # Dependency injection (admin auth)
│   ├── models.py                # Pydantic models
│   ├── rag_utils.py             # Core RAG functionality
│   ├── embedding_cache.py       # Embedding cache management
│   ├── rate_limiter.py          # API rate limiting
│   ├── main.py                  # FastAPI application entry point
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page components
│   │   │   ├── Admin/           # Admin panel pages
│   │   │   └── User/            # User interface pages
│   │   ├── services/            # API service layer
│   │   ├── context/             # React context providers
│   │   └── utils/               # Utility functions
│   ├── public/                  # Static assets
│   └── package.json             # Node.js dependencies
│
└── README.md
```


## Output
https://github.com/user-attachments/assets/be966d9d-eba7-4e23-b091-45efc4042931
<img width="1919" height="386" alt="image" src="https://github.com/user-attachments/assets/632f072a-f05c-469f-89ad-82033dd42aec" />
<img width="926" height="364" alt="Screenshot 2025-12-14 221314" src="https://github.com/user-attachments/assets/426a771f-45b6-416d-a30d-b881e0711a21" />



## 🔌 API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /health` - Health check

### User Endpoints
- `POST /user/upload-file` - Upload a file (PDF or text)
- `POST /user/upload-text` - Upload text directly

### Admin Endpoints (Requires `X-Admin-Token` header)
- `POST /admin/ingest-file` - Admin file ingestion
- `POST /admin/ingest-text` - Admin text ingestion

### Document Processing Endpoints
- `POST /simplify` - Simplify legal document
- `POST /summary` - Summarize document
- `POST /keyterms` - Extract key terms
- `POST /risk-analysis` - Analyze document risks
- `POST /contract-comparison` - Compare two contracts

For detailed API documentation, visit `http://127.0.0.1:10000/docs` when the backend is running.

## 🚢 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Set environment variables** in your hosting platform
2. **Configure build command**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure start command**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. **Update CORS settings** in `.env`:
   ```env
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Set environment variable**:
   ```
   VITE_API_URL=https://your-backend-domain.com
   ```
2. **Build command**:
   ```bash
   npm run build
   ```
3. **Output directory**: `dist`

## 🔐 Security Notes

- **Admin API Key**: Keep your `ADMIN_API_KEY` secure and never commit it to version control
- **API Keys**: Store all API keys in environment variables, never in code
- **CORS**: Configure `ALLOWED_ORIGINS` properly for production
- **HTTPS**: Always use HTTPS in production environments

## 🛠️ Development

### Running in Development Mode

**Backend**:
```bash
cd backend
python main.py
```

**Frontend**:
```bash
cd frontend
npm run dev
```

### Code Structure

- **Backend**: Modular FastAPI application with separate route files
- **Frontend**: Component-based React architecture with TypeScript
- **Lazy Loading**: ChromaDB connection uses lazy loading to prevent startup failures

## 📝 Environment Variables Reference

### Backend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| `CHROMA_API_KEY` | Yes | ChromaDB Cloud API key |
| `CHROMA_TENANT` | Yes | ChromaDB tenant ID |
| `CHROMA_DATABASE` | Yes | ChromaDB database name |
| `CHROMA_COLLECTION` | No | Collection name (default: `legalease_docs`) |
| `GROQ_API_KEY` | Yes | Groq API key for LLM |
| `GEMINI_API_KEY` | No | Google Gemini API key (for embeddings) |
| `ADMIN_API_KEY` | Yes | Admin panel authentication key |
| `ALLOWED_ORIGINS` | No | CORS allowed origins (default: `*`) |
| `USE_LOCAL_EMBEDDINGS` | No | Use local embeddings (default: `false`) |
| `LOCAL_EMBED_MODEL_NAME` | No | Local embedding model name |

### Frontend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API URL (default: `http://127.0.0.1:10000`) |

## 🐛 Troubleshooting

### Backend Issues

**"No open ports detected" error on Render**:
- The app uses lazy loading for ChromaDB connections, which should prevent this issue
- Ensure health check endpoints (`/` and `/health`) are accessible

**ChromaDB connection errors**:
- Verify your API key, tenant, and database name
- Check if the database name is correct (try `default` if unsure)
- Ensure ChromaDB Cloud service is accessible

**Import errors**:
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check Python version (3.8+)

### Frontend Issues

**API connection errors**:
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend server is running

**Build errors**:
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [Groq](https://groq.com/) - Fast LLM inference
- [React](https://react.dev/) - UI library
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Note**: This application processes legal documents. Always review AI-generated content and consult with legal professionals for important decisions.
