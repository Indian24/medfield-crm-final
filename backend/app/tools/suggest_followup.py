"""
Tool 5: Suggest Follow-up
Generates next best actions and follow-up suggestions.
"""
import json
from langchain_core.tools import tool
from groq import Groq

from app.core.config import get_settings

settings = get_settings()


@tool
def suggest_followup(interaction_context: str) -> str:
    """
    Suggest follow-up actions based on an HCP interaction.
    Generates prioritized next best actions considering the HCP's sentiment,
    topics discussed, and pharma industry best practices.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are a pharmaceutical field sales strategist. Based on this HCP interaction,
suggest the top 5 follow-up actions. For each action provide:
1. Action description
2. Priority (High/Medium/Low)
3. Suggested timeline
4. Expected outcome

Consider: HCP sentiment, products discussed, samples given, clinical data needs,
competitive landscape, and relationship-building opportunities.

Interaction context: "{interaction_context}"

Return ONLY valid JSON with:
- follow_up_actions: list of objects with fields: action, priority, timeline, expected_outcome
- overall_priority: string (High/Medium/Low)
- recommended_next_contact: string (suggested date/timeframe)"""

    try:
        response = client.chat.completions.create(
            model=settings.PRIMARY_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=800,
        )
        result = response.choices[0].message.content.strip()
        if result.startswith("```"):
            result = result.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        parsed = json.loads(result)
        return json.dumps({
            "status": "success",
            "tool": "suggest_followup",
            "data": parsed
        })
    except Exception as e:
        return json.dumps({
            "status": "error",
            "tool": "suggest_followup",
            "error": str(e)
        })
