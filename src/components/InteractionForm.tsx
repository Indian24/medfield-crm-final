import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  updateFormField,
  resetForm,
  saveInteraction,
  type InteractionFormData,
} from '../store/interactionSlice';

const INTERACTION_TYPES = ['Meeting', 'Call', 'Visit', 'Other'] as const;
const SENTIMENTS = ['Positive', 'Neutral', 'Negative'] as const;

export function InteractionForm() {
  const dispatch = useAppDispatch();
  const form = useAppSelector(state => state.interactions.form);
  const selected = useAppSelector(state => state.interactions.selectedInteraction);
  const aiPreview = useAppSelector(state => state.interactions.aiPreview);

  const handleChange = (field: keyof InteractionFormData, value: string) => {
    dispatch(updateFormField({ field, value }));
  };

  const handleSave = () => {
    if (!form.hcp_name.trim()) return;
    dispatch(saveInteraction());
  };

  const handleReset = () => {
    dispatch(resetForm());
  };

  return (
    <div className="crm-panel p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground">
          {selected ? '✏️ Edit Interaction' : '📝 Log New Interaction'}
        </h2>
        {aiPreview && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
            AI-filled
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HCP Name */}
        <div className="md:col-span-2">
          <label className="crm-label">HCP Name *</label>
          <input
            className="crm-input"
            placeholder="e.g., Dr. Priya Sharma"
            value={form.hcp_name}
            onChange={e => handleChange('hcp_name', e.target.value)}
          />
        </div>

        {/* Interaction Type */}
        <div>
          <label className="crm-label">Interaction Type</label>
          <select
            className="crm-input"
            value={form.interaction_type}
            onChange={e => handleChange('interaction_type', e.target.value)}
          >
            {INTERACTION_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Sentiment */}
        <div>
          <label className="crm-label">HCP Sentiment</label>
          <div className="flex gap-2 mt-1">
            {SENTIMENTS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => handleChange('sentiment', s)}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                  form.sentiment === s
                    ? s === 'Positive' ? 'sentiment-badge-positive ring-2 ring-sentiment-positive/30'
                    : s === 'Negative' ? 'sentiment-badge-negative ring-2 ring-sentiment-negative/30'
                    : 'sentiment-badge-neutral ring-2 ring-sentiment-neutral/30'
                    : 'bg-secondary text-muted-foreground hover:bg-accent'
                }`}
              >
                {s === 'Positive' ? '😊' : s === 'Negative' ? '😟' : '😐'} {s}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="crm-label">Date</label>
          <input
            type="date"
            className="crm-input"
            value={form.interaction_date}
            onChange={e => handleChange('interaction_date', e.target.value)}
          />
        </div>

        {/* Time */}
        <div>
          <label className="crm-label">Time</label>
          <input
            type="time"
            className="crm-input"
            value={form.interaction_time}
            onChange={e => handleChange('interaction_time', e.target.value)}
          />
        </div>

        {/* Attendees */}
        <div className="md:col-span-2">
          <label className="crm-label">Attendees</label>
          <input
            className="crm-input"
            placeholder="e.g., Dr. Sharma, Nurse Patel, Self"
            value={form.attendees}
            onChange={e => handleChange('attendees', e.target.value)}
          />
        </div>

        {/* Topics Discussed */}
        <div className="md:col-span-2">
          <label className="crm-label">Topics Discussed</label>
          <textarea
            className="crm-input min-h-[60px] resize-y"
            placeholder="Key topics, products, clinical data discussed..."
            value={form.topics_discussed}
            onChange={e => handleChange('topics_discussed', e.target.value)}
          />
        </div>

        {/* Materials Shared */}
        <div>
          <label className="crm-label">Materials Shared</label>
          <input
            className="crm-input"
            placeholder="Brochures, clinical studies, etc."
            value={form.materials_shared}
            onChange={e => handleChange('materials_shared', e.target.value)}
          />
        </div>

        {/* Samples Distributed */}
        <div>
          <label className="crm-label">Samples Distributed</label>
          <input
            className="crm-input"
            placeholder="Product samples, starter packs..."
            value={form.samples_distributed}
            onChange={e => handleChange('samples_distributed', e.target.value)}
          />
        </div>

        {/* Outcomes */}
        <div className="md:col-span-2">
          <label className="crm-label">Outcomes</label>
          <textarea
            className="crm-input min-h-[60px] resize-y"
            placeholder="Key outcomes and decisions..."
            value={form.outcomes}
            onChange={e => handleChange('outcomes', e.target.value)}
          />
        </div>

        {/* Follow-up Actions */}
        <div className="md:col-span-2">
          <label className="crm-label">Follow-up Actions</label>
          <textarea
            className="crm-input min-h-[60px] resize-y"
            placeholder="Next steps, scheduled follow-ups..."
            value={form.follow_up_actions}
            onChange={e => handleChange('follow_up_actions', e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5 pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={!form.hcp_name.trim()}
          className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selected ? '💾 Update Interaction' : '✅ Save Interaction'}
        </button>
        <button
          onClick={handleReset}
          className="py-2 px-4 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
