"""
Tool 3: Summarize Interaction
Produces a concise CRM-style summary of the meeting/call.
"""
import json
from langchain_core.tools import tool
from groq import Groq

from app.core.config import get_settings

settings = get_settings()


@tool
def summarize_interaction(interaction_text: str) -> str:
    """
    Generate a concise CRM-style summary of an HCP interaction.
    Takes interaction details or free text and produces a professional summary
    suitable for CRM records and management reporting.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are a CRM summary writer for pharmaceutical field representatives.
Create a concise, professional summary of this HCP interaction for CRM records.

The summary should include:
1. One-line executive summary
2. Key discussion points
3. HCP's response/sentiment
4. Action items
5. Business impact assessment

Keep it under 200 words. Be factual and professional.

Interaction details: "{interaction_text}"

Return the summary as plain text (not JSON)."""

    try:
        response = client.chat.completions.create(
            model=settings.PRIMARY_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500,
        )
        summary = response.choices[0].message.content.strip()
        return json.dumps({
            "status": "success",
            "tool": "summarize_interaction",
            "summary": summary
        })
    except Exception as e:
        return json.dumps({
            "status": "error",
            "tool": "summarize_interaction",
            "error": str(e)
        })
