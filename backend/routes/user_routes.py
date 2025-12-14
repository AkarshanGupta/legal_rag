from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from models import IngestResponse, TextIngestRequest
from rag_utils import extract_text_from_upload, ingest_document

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/upload-file", response_model=IngestResponse)
def user_upload_file(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
):
    text = extract_text_from_upload(file)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not read any text from uploaded file.")

    try:
        result = ingest_document(
            full_text=text,
            uploader_type="user",
            uploader_id=user_id,
            extra_metadata={"source_filename": file.filename or "unknown"},
        )
        return IngestResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {e}")


@router.post("/upload-text", response_model=IngestResponse)
def user_upload_text(
    payload: TextIngestRequest,
):
    try:
        result = ingest_document(
            full_text=payload.text,
            uploader_type="user",
            uploader_id=payload.uploader_id,
            extra_metadata={"source": "user_text"},
        )
        return IngestResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {e}")