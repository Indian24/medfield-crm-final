"""
Tool 7: Compliance/Validation Check
Checks whether required fields are present and prompts for completion.
"""
import json
from langchain_core.tools import tool


REQUIRED_FIELDS = [
    "hcp_name",
    "interaction_type",
    "interaction_date",
    "topics_discussed",
    "sentiment",
    "outcomes",
    "follow_up_actions",
]

RECOMMENDED_FIELDS = [
    "attendees",
    "materials_shared",
    "samples_distributed",
    "interaction_time",
]


@tool
def compliance_check(interaction_data: str) -> str:
    """
    Validate an HCP interaction record for compliance with CRM reporting requirements.
    Checks for missing required fields, recommends additional fields, and ensures
    data quality standards are met. Input should be a JSON string of interaction data.
    """
    try:
        if isinstance(interaction_data, str):
            data = json.loads(interaction_data)
        else:
            data = interaction_data
    except json.JSONDecodeError:
        # If not JSON, treat as free text and check basic presence
        data = {"raw_text": interaction_data}

    missing_required = []
    missing_recommended = []
    warnings = []

    for field in REQUIRED_FIELDS:
        value = data.get(field, "")
        if not value or (isinstance(value, str) and not value.strip()):
            missing_required.append(field)

    for field in RECOMMENDED_FIELDS:
        value = data.get(field, "")
        if not value or (isinstance(value, str) and not value.strip()):
            missing_recommended.append(field)

    # Data quality checks
    if data.get("hcp_name") and not any(
        prefix in data["hcp_name"].lower() for prefix in ["dr.", "dr ", "doctor"]
    ):
        warnings.append("HCP name may be missing professional title (Dr.)")

    if data.get("sentiment") and data["sentiment"] not in ["Positive", "Neutral", "Negative"]:
        warnings.append(f"Invalid sentiment value: {data['sentiment']}")

    if data.get("interaction_type") and data["interaction_type"] not in [
        "Meeting", "Call", "Visit", "Other"
    ]:
        warnings.append(f"Invalid interaction type: {data['interaction_type']}")

    is_compliant = len(missing_required) == 0
    completeness = (
        (len(REQUIRED_FIELDS) - len(missing_required) + len(RECOMMENDED_FIELDS) - len(missing_recommended))
        / (len(REQUIRED_FIELDS) + len(RECOMMENDED_FIELDS))
        * 100
    )

    return json.dumps({
        "status": "success",
        "tool": "compliance_check",
        "data": {
            "compliant": is_compliant,
            "completeness_score": round(completeness, 1),
            "missing_required": missing_required,
            "missing_recommended": missing_recommended,
            "warnings": warnings,
            "total_required": len(REQUIRED_FIELDS),
            "total_recommended": len(RECOMMENDED_FIELDS),
        }
    })
