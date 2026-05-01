import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolUsed?: string;
  structuredData?: Record<string, any>;
}

interface ChatState {
  messages: ChatMessage[];
  isProcessing: boolean;
  inputValue: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Hello! I'm your **HCP Interaction Assistant**. I can help you log, edit, and analyze healthcare professional interactions.

**Try saying something like:**
- "Met Dr. Sharma today, discussed Product X, positive response, shared brochure"
- "Summarize my last interaction"
- "Suggest follow-up actions for Dr. Kumar"
- "Check if my interaction with Dr. Patel has all required fields"

I'll extract entities, classify sentiment, and structure the data for you.`,
  timestamp: new Date().toISOString(),
};

const initialState: ChatState = {
  messages: [WELCOME_MESSAGE],
  isProcessing: false,
  inputValue: '',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setInputValue: (state, action: PayloadAction<string>) => {
      state.inputValue = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    clearChat: (state) => {
      state.messages = [WELCOME_MESSAGE];
      state.inputValue = '';
    },
  },
});

export const { setInputValue, addMessage, setProcessing, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
