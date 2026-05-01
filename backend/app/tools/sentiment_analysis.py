"""
Tool 6: Sentiment Analysis
Determines positive/neutral/negative sentiment from conversation text.
"""
import json
from langchain_core.tools import tool
from groq import Groq

from app.core.config import get_settings

settings = get_settings()


@tool
def analyze_sentiment(text: str) -> str:
    """
    Analyze the sentiment of an HCP interaction. Determines whether the HCP's
    response was Positive, Neutral, or Negative, with confidence score and
    supporting evidence from the text.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""You are a sentiment analysis specialist for pharmaceutical CRM.
Analyze the HCP's sentiment from this interaction description.

Return ONLY valid JSON with:
- sentiment: string (exactly one of: "Positive", "Neutral", "Negative")
- confidence: number (0.0 to 1.0)
- indicators: list of strings (key phrases/words that indicate the sentiment)
- reasoning: string (brief explanation of sentiment classification)
- engagement_level: string (High/Medium/Low)
- prescribing_intent: string (Likely/Possible/Unlikely/Unknown)

Text: "{text}"

Return ONLY the JSON object."""

    try:
        response = client.chat.completions.create(
            model=settings.PRIMARY_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500,
        )
        result = response.choices[0].message.content.strip()
        if result.startswith("```"):
            result = result.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        parsed = json.loads(result)
        return json.dumps({
            "status": "success",
            "tool": "sentiment_analysis",
            "data": parsed
        })
    except Exception as e:
        return json.dumps({
            "status": "error",
            "tool": "sentiment_analysis",
            "error": str(e)
        })
