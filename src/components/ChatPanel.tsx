import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setInputValue, addMessage, setProcessing, clearChat, type ChatMessage } from '../store/chatSlice';
import { setAiPreview, applyAiPreview } from '../store/interactionSlice';

const API_BASE = "http://127.0.0.1:8000";

const QUICK_ACTIONS = [
  { label: '📝 Log', tool: 'log', hint: 'Log a new interaction' },
  { label: '✏️ Edit', tool: 'edit', hint: 'Edit an interaction' },
  { label: '📋 Summarize', tool: 'summarize', hint: 'Summarize interaction' },
  { label: '🎯 Follow-up', tool: 'followup', hint: 'Suggest next steps' },
  { label: '💭 Sentiment', tool: 'sentiment', hint: 'Analyze sentiment' },
  { label: '🔍 Extract', tool: 'extract', hint: 'Extract entities from text' },
  { label: '✅ Validate', tool: 'validate', hint: 'Check compliance' },
];

export function ChatPanel() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.chat.messages);
  const isProcessing = useAppSelector(state => state.chat.isProcessing);
  const inputValue = useAppSelector(state => state.chat.inputValue);
  const aiPreview = useAppSelector(state => state.interactions.aiPreview);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (toolOverride?: string) => {
    const text = inputValue.trim();
    if (!text && !toolOverride) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text || `[Quick action: ${toolOverride}]`,
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(userMessage));
    dispatch(setInputValue(''));
    dispatch(setProcessing(true));

    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, tool: toolOverride }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        toolUsed: data.tool_used,
        structuredData: data.structured_data,
      };

      dispatch(addMessage(aiMessage));

      // If structured data was extracted, set it as AI preview
      if (data.structured_data && Object.keys(data.structured_data).length > 0) {
        const formFields = ['hcp_name', 'interaction_type', 'interaction_date', 'interaction_time',
          'attendees', 'topics_discussed', 'materials_shared', 'samples_distributed',
          'sentiment', 'outcomes', 'follow_up_actions'];
        const formData: Record<string, any> = {};
        for (const [k, v] of Object.entries(data.structured_data)) {
          if (formFields.includes(k) && v) formData[k] = v;
        }
        if (Object.keys(formData).length > 0) {
          dispatch(setAiPreview(formData));
          dispatch(applyAiPreview());
        }
      }
    } catch (err) {
      console.error('AI chat error', err);
      dispatch(addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      }));
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="crm-panel flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">HCP Interaction Copilot</p>
          </div>
        </div>
        <button
          onClick={() => dispatch(clearChat())}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-b border-border flex gap-1.5 flex-wrap">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.tool}
            onClick={() => {
              if (inputValue.trim()) {
                handleSend(action.tool);
              } else {
                dispatch(setInputValue(`[${action.hint}] `));
              }
            }}
            title={action.hint}
            className="px-2.5 py-1 text-xs rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors font-medium"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2.5 text-sm ${
                msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:mt-1 [&_ol]:mt-1 [&_li]:m-0 [&_strong]:text-inherit">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.toolUsed && msg.role === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground/70 bg-background/50 px-1.5 py-0.5 rounded">
                    🔧 {msg.toolUsed.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <textarea
            className="crm-input flex-1 resize-none min-h-[40px] max-h-[100px]"
            placeholder="Describe your HCP interaction..."
            value={inputValue}
            onChange={e => dispatch(setInputValue(e.target.value))}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isProcessing}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
