from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException

from deps import verify_admin
from models import IngestResponse, TextIngestRequest
from rag_utils import extract_text_from_upload, ingest_document

router = APIRouter(prefix="/admin", tags=["admin"])



@router.post("/ingest-file", response_model=IngestResponse)
def admin_ingest_file(
    file: UploadFile = File(...),
    uploader_id: Optional[str] = Form(None),
    _: bool = Depends(verify_admin),
):
    text = extract_text_from_upload(file)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not read any text from uploaded file.")

    try:
        result = ingest_document(
            full_text=text,
            uploader_type="admin",
            uploader_id=uploader_id,
            extra_metadata={"source_filename": file.filename or "unknown"},
        )
        return IngestResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {e}")


@router.post("/ingest-text", response_model=IngestResponse)
def admin_ingest_text(
    payload: TextIngestRequest,
    _: bool = Depends(verify_admin),
):
    try:
        result = ingest_document(
            full_text=payload.text,
            uploader_type="admin",
            uploader_id=payload.uploader_id,
            extra_metadata={"source": "admin_text"},
        )
        return IngestResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {e}")