"""
LangGraph HCP Interaction Agent

A multi-tool agent that orchestrates HCP interaction workflows using LangGraph.
Uses Groq's gemma2-9b-it as the primary LLM model.

Agent Graph:
  Input → Router → Tool Execution → Response Formatting → Output
"""
import json
from typing import TypedDict, Annotated, Sequence, Literal
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.core.config import get_settings
from app.tools.log_interaction import log_interaction
from app.tools.edit_interaction import edit_interaction
from app.tools.summarize import summarize_interaction
from app.tools.extract_entities import extract_entities
from app.tools.suggest_followup import suggest_followup
from app.tools.sentiment_analysis import analyze_sentiment
from app.tools.compliance_check import compliance_check

settings = get_settings()

# ---- Agent State ----

class AgentState(TypedDict):
    """State object passed through the LangGraph agent."""
    messages: Annotated[Sequence[BaseMessage], lambda x, y: list(x) + list(y)]
    tool_used: str
    structured_data: dict


# ---- Define Tools ----

ALL_TOOLS = [
    log_interaction,
    edit_interaction,
    summarize_interaction,
    extract_entities,
    suggest_followup,
    analyze_sentiment,
    compliance_check,
]


# ---- Build the Agent ----

def create_hcp_agent():
    """Create and return the LangGraph HCP interaction agent."""

    # Initialize the Groq LLM with tool binding
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.PRIMARY_MODEL,
        temperature=0.2,
        max_tokens=2000,
    )

    llm_with_tools = llm.bind_tools(ALL_TOOLS)

    # ---- Graph Nodes ----

    def router_node(state: AgentState) -> AgentState:
        """
        Router node: Takes user input and decides which tool to call.
        Uses the LLM to understand intent and select appropriate tool.
        """
        system_prompt = """You are an AI assistant for a pharmaceutical CRM system.
Your job is to help field representatives log, edit, and analyze HCP (Healthcare Professional) interactions.

You have access to these tools:
1. log_interaction - Log a new HCP interaction from natural language
2. edit_interaction - Edit/update an existing interaction
3. summarize_interaction - Create a CRM summary of an interaction
4. extract_entities - Extract structured entities from text
5. suggest_followup - Suggest follow-up actions
6. analyze_sentiment - Analyze HCP sentiment
7. compliance_check - Validate interaction completeness

Based on the user's message, select and call the most appropriate tool.
Always provide the user's full message as the tool input."""

        messages = [{"role": "system", "content": system_prompt}] + [
            {"role": "human" if isinstance(m, HumanMessage) else "ai", "content": m.content}
            for m in state["messages"]
            if isinstance(m, (HumanMessage, AIMessage))
        ]

        response = llm_with_tools.invoke(messages)
        return {"messages": [response], "tool_used": "", "structured_data": {}}

    def should_continue(state: AgentState) -> Literal["tools", "respond"]:
        """Determine if we should call a tool or respond directly."""
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return "respond"

    def response_node(state: AgentState) -> AgentState:
        """Format the final response for the user."""
        last_message = state["messages"][-1]

        # Check if the last message is a tool result
        tool_used = state.get("tool_used", "")
        structured_data = state.get("structured_data", {})

        if isinstance(last_message, ToolMessage):
            try:
                result = json.loads(last_message.content)
                tool_used = result.get("tool", "unknown")
                structured_data = result.get("data", result.get("entities", result.get("summary", {})))

                # Format a human-readable response
                if result.get("status") == "success":
                    if isinstance(structured_data, str):
                        response_text = structured_data
                    else:
                        response_text = f"✅ **{tool_used.replace('_', ' ').title()}** completed.\n\n"
                        if isinstance(structured_data, dict):
                            for k, v in structured_data.items():
                                if v:
                                    response_text += f"- **{k.replace('_', ' ').title()}:** {v}\n"
                        elif isinstance(structured_data, list):
                            for item in structured_data:
                                response_text += f"- {item}\n"
                else:
                    response_text = f"❌ Error: {result.get('error', 'Unknown error')}"
            except (json.JSONDecodeError, Exception):
                response_text = last_message.content
                tool_used = "unknown"
        else:
            response_text = last_message.content if hasattr(last_message, "content") else str(last_message)

        return {
            "messages": [AIMessage(content=response_text)],
            "tool_used": tool_used,
            "structured_data": structured_data if isinstance(structured_data, dict) else {},
        }

    # ---- Build Graph ----

    tool_node = ToolNode(ALL_TOOLS)

    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("router", router_node)
    graph.add_node("tools", tool_node)
    graph.add_node("respond", response_node)

    # Set entry point
    graph.set_entry_point("router")

    # Add conditional edges
    graph.add_conditional_edges("router", should_continue, {"tools": "tools", "respond": "respond"})
    graph.add_edge("tools", "respond")
    graph.add_edge("respond", END)

    return graph.compile()


# ---- Run Agent ----

def run_agent(user_message: str, tool_hint: str | None = None) -> dict:
    """
    Run the HCP agent with a user message.

    Args:
        user_message: The user's input text
        tool_hint: Optional hint for which tool to use

    Returns:
        dict with reply, tool_used, and structured_data
    """
    agent = create_hcp_agent()

    # If a tool hint is provided, prepend it to guide the agent
    if tool_hint:
        prefixed = f"[Use the {tool_hint} tool] {user_message}"
    else:
        prefixed = user_message

    initial_state: AgentState = {
        "messages": [HumanMessage(content=prefixed)],
        "tool_used": "",
        "structured_data": {},
    }

    result = agent.invoke(initial_state)

    # Extract final response
    final_messages = result.get("messages", [])
    reply = ""
    for msg in reversed(final_messages):
        if isinstance(msg, AIMessage) and msg.content:
            reply = msg.content
            break

    return {
        "reply": reply or "I processed your request but couldn't generate a response.",
        "tool_used": result.get("tool_used", "unknown"),
        "structured_data": result.get("structured_data", {}),
    }
