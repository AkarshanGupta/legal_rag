from fastapi import APIRouter, HTTPException

from models import RAGRequest, CompareRequest, GenericResponse
from rag_utils import retrieve_context, build_legal_prompt, call_llm

router = APIRouter(tags=["tasks"])

@router.get("/")
def root():
    return {"message": "LegalEase RAG API is running. "}


@router.post("/simplify", response_model=GenericResponse)
def simplify_document(payload: RAGRequest):
    question = "Simplify this legal document and explain the key points in simple language."
    context = retrieve_context([payload.document_id], question)
    if not context:
        raise HTTPException(status_code=404, detail="No chunks found for this document_id.")

    prompt = build_legal_prompt(
        mode="Simplify Language",
        question=question,
        context_chunks=context,
        output_language=payload.output_language or "English",
    )
    answer = call_llm(prompt)
    return GenericResponse(
        result=answer,
        note="Processing complete!"
    )


@router.post("/summary", response_model=GenericResponse)
def summarize_document(payload: RAGRequest):
    question = "Summarize this legal document clearly in bullet points and short paragraphs."
    context = retrieve_context([payload.document_id], question)
    if not context:
        raise HTTPException(status_code=404, detail="No chunks found for this document_id.")

    prompt = build_legal_prompt(
        mode="Document Summary",
        question=question,
        context_chunks=context,
        output_language=payload.output_language or "English",
    )
    answer = call_llm(prompt)
    return GenericResponse(
        result=answer,
        note="Processing complete!"
    )


@router.post("/key-terms", response_model=GenericResponse)
@router.post("/keyterms", response_model=GenericResponse)  # optional alias
def extract_key_terms(payload: RAGRequest):
    question = "Extract and explain the key legal terms, clauses, and obligations in this document."
    context = retrieve_context([payload.document_id], question)
    if not context:
        raise HTTPException(status_code=404, detail="No chunks found for this document_id.")

    prompt = build_legal_prompt(
        mode="Key Terms Extraction",
        question=question,
        context_chunks=context,
        output_language=payload.output_language or "English",
    )
    answer = call_llm(prompt)
    return GenericResponse(
        result=answer,
        note="Processing complete!"
    )


@router.post("/risk-analysis", response_model=GenericResponse)
def risk_analysis(payload: RAGRequest):
    question = (
        "Identify potential risks, unfavorable clauses, and points the user should "
        "negotiate or be careful about in this legal document."
    )
    context = retrieve_context([payload.document_id], question)
    if not context:
        raise HTTPException(status_code=404, detail="No chunks found for this document_id.")

    prompt = build_legal_prompt(
        mode="Risk Analysis",
        question=question,
        context_chunks=context,
        output_language=payload.output_language or "English",
    )
    answer = call_llm(prompt)
    return GenericResponse(
        result=answer,
        note="Processing complete!"
    )


@router.post("/contract-comparison", response_model=GenericResponse)
def contract_comparison(payload: CompareRequest):
    question = (
        "Compare these two contracts.  Highlight similarities, key differences, risks, "
        "and which clauses are more favorable to the user in each contract."
    )
    context = retrieve_context(
        [payload.document_id_1, payload.document_id_2],
        question,
    )
    if not context:
        raise HTTPException(status_code=404, detail="No chunks found for these document_ids.")

    prompt = build_legal_prompt(
        mode="Contract Comparison",
        question=question,
        context_chunks=context,
        output_language=payload.output_language or "English",
    )
    answer = call_llm(prompt)
    return GenericResponse(
        result=answer,
        note="Processing complete!"
    )