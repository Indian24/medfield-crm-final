"""
Tool 2: Edit Interaction
Locates an existing interaction and modifies selected fields.
"""
import json
from langchain_core.tools import tool
from groq import Groq

from app.core.config import get_settings

settings = get_settings()


@tool
def edit_interaction(user_message: str) -> str:
    """
    Edit an existing HCP interaction. Parses the user's edit request to identify
    which fields to change and returns the updates as structured JSON.
    Supports editing by HCP name or interaction ID reference.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are a CRM assistant. The user wants to edit an existing HCP interaction.
Parse their request and return ONLY valid JSON with:
- target_hcp_name: string (the HCP whose interaction to edit, if mentioned)
- target_id: string (interaction ID if mentioned, else "")
- changes: object (only the fields to update, using same field names as the interaction record)

Available fields: hcp_name, interaction_type, interaction_date, interaction_time, attendees,
topics_discussed, materials_shared, samples_distributed, sentiment, outcomes, follow_up_actions

User message: "{user_message}"

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
            "tool": "edit_interaction",
            "data": parsed,
            "summary": f"Edit request parsed for {parsed.get('target_hcp_name', 'interaction')}."
        })
    except Exception as e:
        return json.dumps({
            "status": "error",
            "tool": "edit_interaction",
            "error": str(e)
        })
