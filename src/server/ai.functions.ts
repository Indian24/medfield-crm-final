import { createServerFn } from '@tanstack/react-start';

// AI processing server function - processes chat messages and returns structured data
// In production, this calls the Python FastAPI backend. In demo mode, it uses built-in logic.

interface AiChatRequest {
  message: string;
  tool?: string;
  interaction_id?: string;
}

interface AiChatResponse {
  reply: string;
  tool_used: string;
  structured_data?: Record<string, any>;
}

// Simulated AI processing for demo mode (when Python backend is not running)
function processWithBuiltInAI(message: string, tool?: string): AiChatResponse {
  const lowerMsg = message.toLowerCase();

  // Extract entities from natural language
  const extractEntities = (text: string) => {
    const data: Record<string, any> = {};

    // HCP Name extraction
    const drMatch = text.match(/(?:dr\.?|doctor)\s+([a-z]+(?:\s+[a-z]+)?)/i);
    if (drMatch) data.hcp_name = `Dr. ${drMatch[1].charAt(0).toUpperCase() + drMatch[1].slice(1)}`;

    // Interaction type
    if (/\bmet\b|meeting|visited/i.test(text)) data.interaction_type = 'Meeting';
    else if (/\bcall(?:ed)?\b|phone/i.test(text)) data.interaction_type = 'Call';
    else if (/\bvisit/i.test(text)) data.interaction_type = 'Visit';
    else data.interaction_type = 'Meeting';

    // Sentiment
    if (/positive|interested|enthusiastic|receptive|good|great|excited/i.test(text)) data.sentiment = 'Positive';
    else if (/negative|resistant|skeptical|concerned|worried|refused/i.test(text)) data.sentiment = 'Negative';
    else data.sentiment = 'Neutral';

    // Products/Topics
    const productMatch = text.match(/(?:product|drug|medication)\s+([a-z0-9]+)/i);
    if (productMatch) data.topics_discussed = `${productMatch[0]}, efficacy and safety profile`;
    else if (/discussed|talked about|covered/i.test(text)) {
      const afterDiscussed = text.match(/(?:discussed|talked about|covered)\s+(.+?)(?:,|\.|$)/i);
      if (afterDiscussed) data.topics_discussed = afterDiscussed[1].trim();
    }

    // Materials
    if (/brochure|pamphlet|leaflet|material|literature/i.test(text)) {
      data.materials_shared = text.match(/(?:shared|gave|left|provided)\s+(.+?)(?:,|\.|$)/i)?.[1]?.trim() || 'Product brochure';
    }

    // Samples
    if (/sample|starter\s*pack/i.test(text)) {
      data.samples_distributed = text.match(/(?:sample|starter\s*pack)s?\s*(?:of\s+)?(.+?)(?:,|\.|$)/i)?.[1]?.trim() || 'Product samples';
    }

    // Follow-up
    if (/follow.?up|next\s+(?:week|month|visit)|schedule|call\s+back/i.test(text)) {
      const fuMatch = text.match(/follow.?up\s+(.+?)(?:\.|$)/i) || text.match(/(next\s+(?:week|month|monday|tuesday|wednesday|thursday|friday))/i);
      data.follow_up_actions = fuMatch?.[1]?.trim() || 'Schedule follow-up visit';
    }

    // Date
    if (/today/i.test(text)) data.interaction_date = new Date().toISOString().split('T')[0];
    else if (/yesterday/i.test(text)) {
      const d = new Date(); d.setDate(d.getDate() - 1);
      data.interaction_date = d.toISOString().split('T')[0];
    }

    data.interaction_time = new Date().toTimeString().slice(0, 5);
    return data;
  };

  // Tool: Sentiment Analysis
  if (tool === 'sentiment' || (!tool && /sentiment|how did .+ feel|what was .+ reaction/i.test(lowerMsg))) {
    const entities = extractEntities(message);
    const sentiment = entities.sentiment || 'Neutral';
    const confidence = sentiment === 'Neutral' ? '65%' : '85%';
    return {
      reply: `**Sentiment Analysis** 🎯\n\n**Detected Sentiment:** ${sentiment}\n**Confidence:** ${confidence}\n\n**Indicators found:**\n${
        sentiment === 'Positive' ? '- Positive language patterns detected\n- Interest/enthusiasm keywords found' :
        sentiment === 'Negative' ? '- Negative or resistant language detected\n- Concern/skepticism indicators found' :
        '- No strong positive or negative indicators\n- Neutral/informational tone'
      }\n\nThis sentiment has been applied to the interaction form.`,
      tool_used: 'sentiment_analysis',
      structured_data: { sentiment, confidence },
    };
  }

  // Tool: Suggest Follow-up
  if (tool === 'followup' || (!tool && /suggest|recommend|next\s+step|what\s+should\s+I\s+do|follow.?up|next\s+action|what.?s\s+next/i.test(lowerMsg))) {
    const entities = extractEntities(message);
    const name = entities.hcp_name || 'the HCP';
    return {
      reply: `**Suggested Follow-up Actions** 📋\n\nBased on the interaction analysis, here are recommended next steps:\n\n1. **Schedule Follow-up Visit** — Book a meeting with ${name} within 2 weeks to maintain engagement\n2. **Send Clinical Data** — Email relevant Phase III trial results and safety data\n3. **Coordinate with MSL** — Arrange a Medical Science Liaison visit for detailed clinical discussion\n4. **Sample Replenishment** — Check if ${name} needs additional product samples\n5. **Update CRM Notes** — Document key talking points and ${name}'s specific concerns\n\n**Priority:** High — Follow up within 5 business days`,
      tool_used: 'suggest_followup',
      structured_data: {
        follow_up_actions: `1. Schedule follow-up with ${name} in 2 weeks\n2. Send clinical trial data via email\n3. Coordinate MSL visit\n4. Check sample needs`,
        priority: 'High',
        timeline: '5 business days',
      },
    };
  }

  // Tool: Summarize
  if (tool === 'summarize' || (!tool && /summarize|summary|recap/i.test(lowerMsg))) {
    const entities = extractEntities(message);
    const name = entities.hcp_name || 'the HCP';
    return {
      reply: `**Interaction Summary** 📝\n\n**HCP:** ${name}\n**Type:** ${entities.interaction_type || 'Meeting'}\n**Date:** ${entities.interaction_date || 'Today'}\n**Sentiment:** ${entities.sentiment || 'Neutral'}\n\n**Key Points:**\n- Discussed ${entities.topics_discussed || 'product information and clinical data'}\n- ${entities.materials_shared ? `Shared: ${entities.materials_shared}` : 'No materials shared'}\n- ${entities.samples_distributed ? `Samples: ${entities.samples_distributed}` : 'No samples distributed'}\n\n**Outcome:** ${entities.outcomes || 'Productive discussion, further follow-up needed'}\n**Follow-up:** ${entities.follow_up_actions || 'Schedule next touchpoint'}`,
      tool_used: 'summarize_interaction',
      structured_data: entities,
    };
  }

  // Tool: Extract Entities
  if (tool === 'extract' || (!tool && /extract|parse|identify|entities/i.test(lowerMsg))) {
    const entities = extractEntities(message);
    return {
      reply: `**Extracted Entities** 🔍\n\n${Object.entries(entities).map(([k, v]) => `- **${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:** ${v}`).join('\n')}\n\nI've identified these fields from your text. Would you like me to apply them to the form?`,
      tool_used: 'extract_entities',
      structured_data: entities,
    };
  }

  // Tool: Compliance/Validation
  if (tool === 'validate' || (!tool && /validate|compliance|missing\s+field|required\s+field/i.test(lowerMsg))) {
    const entities = extractEntities(message);
    const missing: string[] = [];
    if (!entities.hcp_name) missing.push('HCP Name');
    if (!entities.topics_discussed) missing.push('Topics Discussed');
    if (!entities.follow_up_actions) missing.push('Follow-up Actions');
    if (!entities.outcomes) missing.push('Outcomes');
    if (!entities.materials_shared) missing.push('Materials Shared');

    const isCompliant = missing.length === 0;
    return {
      reply: `**Compliance Check** ${isCompliant ? '✅' : '⚠️'}\n\n${
        isCompliant
          ? 'All required fields are present. The interaction record is compliant and ready to save.'
          : `**Missing Required Fields:**\n${missing.map(f => `- ❌ ${f}`).join('\n')}\n\nPlease provide the missing information to ensure compliance with reporting requirements.`
      }\n\n**Fields Validated:**\n- HCP Name ${entities.hcp_name ? '✅' : '❌'}\n- Interaction Type ${entities.interaction_type ? '✅' : '❌'}\n- Topics Discussed ${entities.topics_discussed ? '✅' : '❌'}\n- Follow-up Actions ${entities.follow_up_actions ? '✅' : '❌'}`,
      tool_used: 'compliance_validation',
      structured_data: { compliant: isCompliant, missing_fields: missing },
    };
  }

  // Tool: Log Interaction (default for natural language about meetings)
  if (tool === 'log' || /\bmet\b|meeting|called|visited|discussed|spoke|talked/i.test(lowerMsg)) {
    const entities = extractEntities(message);
    return {
      reply: `**Interaction Logged** ✅\n\nI've extracted the following from your message:\n\n${Object.entries(entities).map(([k, v]) => `- **${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:** ${v}`).join('\n')}\n\n📋 The extracted data has been applied to the form. Please review and click **Save** to confirm, or edit any fields as needed.`,
      tool_used: 'log_interaction',
      structured_data: entities,
    };
  }

  // Tool: Edit Interaction
  if (tool === 'edit' || /\bedit\b|update|change|modify/i.test(lowerMsg)) {
    const entities = extractEntities(message);
    return {
      reply: `**Edit Interaction** ✏️\n\nI've identified the following changes:\n\n${Object.entries(entities).map(([k, v]) => `- **${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:** ${v}`).join('\n')}\n\nThe form has been updated with these changes. Review and save when ready.`,
      tool_used: 'edit_interaction',
      structured_data: entities,
    };
  }

  // Default: general help
  return {
    reply: `I can help you with HCP interactions! Here's what I can do:\n\n🔹 **Log** — Tell me about a meeting/call and I'll structure it\n🔹 **Edit** — Update an existing interaction\n🔹 **Summarize** — Get a concise summary\n🔹 **Follow-up** — Get recommended next steps\n🔹 **Sentiment** — Analyze HCP sentiment\n🔹 **Validate** — Check for missing required fields\n🔹 **Extract** — Pull entities from free text\n\nJust type naturally, or use the quick action buttons!`,
    tool_used: 'general_help',
  };
}

export const processAiChat = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as AiChatRequest)
  .handler(async ({ data }): Promise<AiChatResponse> => {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    // Try to call the Python FastAPI backend first
    try {
      const response = await fetch(`${backendUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        return await response.json() as AiChatResponse;
      }
    } catch {
      // Backend not available, fall back to built-in processing
    }

    // Built-in AI processing (demo mode)
    return processWithBuiltInAI(data.message, data.tool);
  });
