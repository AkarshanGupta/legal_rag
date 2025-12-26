from fastapi import APIRouter, HTTPException

from models import RAGRequest, CompareRequest, GenericResponse, ChatRequest
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


@router.post("/chat", response_model=GenericResponse)
def chat_with_document(payload: ChatRequest):
    """Chat endpoint for asking questions about a specific document"""
    user_question = payload.message
    
    # Retrieve context from the document
    context = retrieve_context([payload.document_id], user_question)
    if not context:
        raise HTTPException(status_code=404, detail="No chunks found for this document_id.")
    
    # Validate that the question is related to the document content
    relevance_check_prompt = f"""You are a strict document relevance validator. Your only job is to determine if a user's question is asking about the document content.

User Question: "{user_question}"

Document Content Summary: {context[0][:500] if context else 'Legal document'}

STRICT RULES:
1. Questions about programming (Python, C++, Java, etc.) = IRRELEVANT
2. Questions about general knowledge (math, science, history, geography) = IRRELEVANT
3. Questions about random topics unrelated to law/documents = IRRELEVANT
4. Questions about the document's content, clauses, terms, obligations, risks = RELEVANT
5. Questions asking for clarification about document sections = RELEVANT

Output ONLY one word: RELEVANT or IRRELEVANT
Do not explain or add any other text."""
    
    relevance_result = call_llm(relevance_check_prompt).strip().upper()
    
    # Check if the question is relevant
    if "IRRELEVANT" in relevance_result:
        return GenericResponse(
            result="I'm specifically designed to answer questions about this document. Please ask me about the document's clauses, terms, obligations, payment terms, risks, or any other legal aspects contained in the document.",
            note="Question is not related to document content"
        )
    
    # Additional safety check: if LLM says RELEVANT but the question seems off-topic based on patterns
    off_topic_keywords = [
        "c++", "python", "java", "javascript", "coding", "programming",
        "math", "algebra", "calculus", "physics", "chemistry",
        "history", "geography", "biology", "astronomy",
        "joke", "funny", "game", "movie", "music", "weather",
        "recipe", "cooking", "sports", "football", "basketball"
    ]
    
    question_lower = user_question.lower()
    if any(keyword in question_lower for keyword in off_topic_keywords):
        return GenericResponse(
            result="I'm specifically designed to answer questions about this document. Please ask me about the document's clauses, terms, obligations, payment terms, risks, or any other legal aspects contained in the document.",
            note="Question is not related to document content"
        )
    
    # Build a prompt that includes the user's question and document context
    prompt = build_legal_prompt(
        mode="Document Q&A",
        question=user_question,
        context_chunks=context,
        output_language=payload.output_language or "English",
    )
    
    # Get response from LLM
    answer = call_llm(prompt)
    
    return GenericResponse(
        result=answer,
        note="Chat response generated!"
    )
