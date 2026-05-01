"""
Tool 4: Extract Entities
Pulls out HCP name, product, sentiment, date, follow-up, samples from text.
"""
import json
from langchain_core.tools import tool
from groq import Groq

from app.core.config import get_settings

settings = get_settings()


@tool
def extract_entities(text: str) -> str:
    """
    Extract structured entities from free-text about an HCP interaction.
    Identifies: HCP name, products, sentiment, dates, follow-ups, samples,
    materials, attendees, and action items.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are an NLP entity extraction system for life-science CRM.
Extract ALL entities from the following text. Return ONLY valid JSON with:
- hcp_name: string
- products_mentioned: list of strings
- interaction_type: string (Meeting/Call/Visit/Other)
- interaction_date: string (YYYY-MM-DD or relative like "today")
- sentiment: string (Positive/Neutral/Negative)
- topics: list of strings
- materials_shared: list of strings
- samples_distributed: list of strings
- attendees: list of strings
- action_items: list of strings
- follow_up_date: string (if mentioned)
- key_phrases: list of important phrases

Text: "{text}"

Return ONLY the JSON object."""

    try:
        response = client.chat.completions.create(
            model=settings.PRIMARY_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=800,
        )
        result = response.choices[0].message.content.strip()
        if result.startswith("```"):
            result = result.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        parsed = json.loads(result)
        return json.dumps({
            "status": "success",
            "tool": "extract_entities",
            "entities": parsed
        })
    except Exception as e:
        return json.dumps({
            "status": "error",
            "tool": "extract_entities",
            "error": str(e)
        })
