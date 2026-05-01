"""
Tool 1: Log Interaction
Parses chat or form input, uses LLM to extract structured fields, stores in DB.
"""
import json
from langchain_core.tools import tool
from groq import Groq

from app.core.config import get_settings

settings = get_settings()


@tool
def log_interaction(user_message: str) -> str:
    """
    Log a new HCP interaction from natural language text.
    Extracts structured fields (HCP name, type, sentiment, topics, etc.)
    and returns a JSON object ready for database storage.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    extraction_prompt = f"""You are a CRM data extraction assistant for life-science field representatives.
Extract structured interaction data from the following message. Return ONLY valid JSON with these fields:
- hcp_name: string (the healthcare professional's name, include "Dr." prefix if applicable)
- interaction_type: string (one of: "Meeting", "Call", "Visit", "Other")
- interaction_date: string (YYYY-MM-DD format, use today's date if "today" mentioned)
- interaction_time: string (HH:MM format if mentioned, else "")
- attendees: string (comma-separated names)
- topics_discussed: string (products, clinical data, topics covered)
- materials_shared: string (brochures, studies, literature shared)
- samples_distributed: string (product samples given)
- sentiment: string (one of: "Positive", "Neutral", "Negative")
- outcomes: string (key outcomes and decisions)
- follow_up_actions: string (next steps and follow-up items)

User message: "{user_message}"

Return ONLY the JSON object, no markdown formatting, no explanation."""

    try:
        response = client.chat.completions.create(
            model=settings.PRIMARY_MODEL,
            messages=[{"role": "user", "content": extraction_prompt}],
            temperature=0.1,
            max_tokens=1000,
        )
        result = response.choices[0].message.content.strip()
        # Clean potential markdown wrapping
        if result.startswith("```"):
            result = result.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        parsed = json.loads(result)
        return json.dumps({
            "status": "success",
            "tool": "log_interaction",
            "data": parsed,
            "summary": f"Interaction with {parsed.get('hcp_name', 'HCP')} logged successfully."
        })
    except Exception as e:
        return json.dumps({
            "status": "error",
            "tool": "log_interaction",
            "error": str(e)
        })
