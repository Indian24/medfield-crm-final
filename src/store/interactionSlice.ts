import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

export interface Interaction {
  id: string;
  hcp_name: string;
  interaction_type: 'Meeting' | 'Call' | 'Visit' | 'Other';
  interaction_date: string;
  interaction_time: string;
  attendees: string;
  topics_discussed: string;
  materials_shared: string;
  samples_distributed: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  outcomes: string;
  follow_up_actions: string;
  ai_summary: string;
  raw_chat_text: string;
  created_at: string;
  updated_at: string;
}

export interface InteractionFormData {
  hcp_name: string;
  interaction_type: 'Meeting' | 'Call' | 'Visit' | 'Other';
  interaction_date: string;
  interaction_time: string;
  attendees: string;
  topics_discussed: string;
  materials_shared: string;
  samples_distributed: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  outcomes: string;
  follow_up_actions: string;
}

const initialFormState: InteractionFormData = {
  hcp_name: '',
  interaction_type: 'Meeting',
  interaction_date: new Date().toISOString().split('T')[0],
  interaction_time: new Date().toTimeString().slice(0, 5),
  attendees: '',
  topics_discussed: '',
  materials_shared: '',
  samples_distributed: '',
  sentiment: 'Neutral',
  outcomes: '',
  follow_up_actions: '',
};

interface InteractionState {
  items: Interaction[];
  selectedInteraction: Interaction | null;
  form: InteractionFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  aiPreview: Partial<InteractionFormData> | null;
}

const DEMO_INTERACTIONS: Interaction[] = [
  {
    id: '1',
    hcp_name: 'Dr. Priya Sharma',
    interaction_type: 'Meeting',
    interaction_date: '2026-04-28',
    interaction_time: '10:30',
    attendees: 'Dr. Sharma, Nurse Patel, Self',
    topics_discussed: 'Product X efficacy data, Phase III trial results',
    materials_shared: 'Product X brochure, Clinical trial summary',
    samples_distributed: 'Product X starter pack (5 units)',
    sentiment: 'Positive',
    outcomes: 'Dr. Sharma expressed interest in prescribing Product X for suitable patients',
    follow_up_actions: 'Send Phase III full report by email, Schedule follow-up visit in 2 weeks',
    ai_summary: 'Productive meeting with Dr. Sharma. Positive reception to Product X clinical data. Follow-up scheduled.',
    raw_chat_text: '',
    created_at: '2026-04-28T10:30:00Z',
    updated_at: '2026-04-28T10:30:00Z',
  },
  {
    id: '2',
    hcp_name: 'Dr. Rajesh Kumar',
    interaction_type: 'Call',
    interaction_date: '2026-04-30',
    interaction_time: '14:00',
    attendees: 'Dr. Kumar, Self',
    topics_discussed: 'Product Y side effect profile, Dosage guidance',
    materials_shared: 'Prescribing information PDF',
    samples_distributed: '',
    sentiment: 'Neutral',
    outcomes: 'Dr. Kumar needs more data on long-term safety before committing',
    follow_up_actions: 'Prepare long-term safety data summary, Call back next Monday',
    ai_summary: 'Follow-up call with Dr. Kumar regarding Product Y. Neutral response, requesting more safety data.',
    raw_chat_text: '',
    created_at: '2026-04-30T14:00:00Z',
    updated_at: '2026-04-30T14:00:00Z',
  },
  {
    id: '3',
    hcp_name: 'Dr. Anita Desai',
    interaction_type: 'Visit',
    interaction_date: '2026-04-25',
    interaction_time: '09:15',
    attendees: 'Dr. Desai, Dr. Mehra (colleague), Self',
    topics_discussed: 'Product Z for chronic pain management, Comparative efficacy vs competitor',
    materials_shared: 'Product Z clinical data brochure, Comparative study results',
    samples_distributed: 'Product Z trial pack (3 units)',
    sentiment: 'Positive',
    outcomes: 'Dr. Desai agreed to trial Product Z with select patients and provide feedback',
    follow_up_actions: 'Follow up in 3 weeks for patient feedback, Send dosing guidelines',
    ai_summary: 'Clinic visit with Dr. Desai. Positive response to Product Z for chronic pain. Trial agreed.',
    raw_chat_text: '',
    created_at: '2026-04-25T09:15:00Z',
    updated_at: '2026-04-25T09:15:00Z',
  },
  {
    id: '4',
    hcp_name: 'Dr. Vikram Singh',
    interaction_type: 'Meeting',
    interaction_date: '2026-04-22',
    interaction_time: '11:00',
    attendees: 'Dr. Singh, MSL Team, Self',
    topics_discussed: 'Product X real-world evidence, Patient adherence data',
    materials_shared: 'Real-world evidence report',
    samples_distributed: '',
    sentiment: 'Negative',
    outcomes: 'Dr. Singh raised concerns about cost-effectiveness, prefers competitor product',
    follow_up_actions: 'Prepare cost-effectiveness analysis, Schedule follow-up with MSL support',
    ai_summary: 'Meeting with Dr. Singh. Negative sentiment — cost concerns. MSL follow-up needed.',
    raw_chat_text: '',
    created_at: '2026-04-22T11:00:00Z',
    updated_at: '2026-04-22T11:00:00Z',
  },
  {
    id: '5',
    hcp_name: 'Dr. Meena Patel',
    interaction_type: 'Call',
    interaction_date: '2026-04-29',
    interaction_time: '16:30',
    attendees: 'Dr. Patel, Self',
    topics_discussed: 'Product Y dosage for elderly patients, Safety monitoring',
    materials_shared: 'Elderly dosing guideline PDF',
    samples_distributed: 'Product Y starter samples (2 units)',
    sentiment: 'Positive',
    outcomes: 'Dr. Patel will consider Product Y for elderly patients with dose adjustment',
    follow_up_actions: 'Send geriatric dosing webinar invite, Follow up in 1 week',
    ai_summary: 'Phone call with Dr. Patel regarding elderly dosing. Positive outlook with dose adjustments.',
    raw_chat_text: '',
    created_at: '2026-04-29T16:30:00Z',
    updated_at: '2026-04-29T16:30:00Z',
  },
];

const initialState: InteractionState = {
  items: DEMO_INTERACTIONS,
  selectedInteraction: null,
  form: initialFormState,
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
  aiPreview: null,
};

const interactionSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    updateFormField: (state, action: PayloadAction<{ field: keyof InteractionFormData; value: string }>) => {
      (state.form as any)[action.payload.field] = action.payload.value;
    },
    resetForm: (state) => {
      state.form = initialFormState;
      state.selectedInteraction = null;
      state.aiPreview = null;
    },
    setAiPreview: (state, action: PayloadAction<Partial<InteractionFormData> | null>) => {
      state.aiPreview = action.payload;
    },
    applyAiPreview: (state) => {
      if (state.aiPreview) {
        state.form = { ...state.form, ...state.aiPreview };
        state.aiPreview = null;
      }
    },
    selectInteraction: (state, action: PayloadAction<string>) => {
      const found = state.items.find(i => i.id === action.payload);
      if (found) {
        state.selectedInteraction = found;
        state.form = {
          hcp_name: found.hcp_name,
          interaction_type: found.interaction_type,
          interaction_date: found.interaction_date,
          interaction_time: found.interaction_time,
          attendees: found.attendees,
          topics_discussed: found.topics_discussed,
          materials_shared: found.materials_shared,
          samples_distributed: found.samples_distributed,
          sentiment: found.sentiment,
          outcomes: found.outcomes,
          follow_up_actions: found.follow_up_actions,
        };
      }
    },
    saveInteraction: (state) => {
      const now = new Date().toISOString();
      if (state.selectedInteraction) {
        const idx = state.items.findIndex(i => i.id === state.selectedInteraction!.id);
        if (idx !== -1) {
          state.items[idx] = {
            ...state.items[idx],
            ...state.form,
            updated_at: now,
          };
        }
        state.successMessage = `Interaction with ${state.form.hcp_name} updated successfully.`;
      } else {
        const newInteraction: Interaction = {
          id: Date.now().toString(),
          ...state.form,
          ai_summary: '',
          raw_chat_text: '',
          created_at: now,
          updated_at: now,
        };
        state.items.unshift(newInteraction);
        state.successMessage = `Interaction with ${state.form.hcp_name} logged successfully.`;
      }
      state.form = initialFormState;
      state.selectedInteraction = null;
      state.aiPreview = null;
    },
    deleteInteraction: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      if (state.selectedInteraction?.id === action.payload) {
        state.selectedInteraction = null;
        state.form = initialFormState;
      }
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setSuccess: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
    },
  },
});

export const {
  updateFormField,
  resetForm,
  setAiPreview,
  applyAiPreview,
  selectInteraction,
  saveInteraction,
  deleteInteraction,
  clearMessages,
  setError,
  setSuccess,
} = interactionSlice.actions;

export default interactionSlice.reducer;
