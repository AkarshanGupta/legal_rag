from typing import Optional
from pydantic import BaseModel


class TextIngestRequest(BaseModel):
    text: str
    uploader_id: Optional[str] = None


class RAGRequest(BaseModel):
    document_id: str
    output_language: Optional[str] = "English"


class CompareRequest(BaseModel):
    document_id_1: str
    document_id_2: str
    output_language: Optional[str] = "English"


class GenericResponse(BaseModel):
    result: str


class IngestResponse(BaseModel):
    document_id: str
    is_new: bool
    message: str
