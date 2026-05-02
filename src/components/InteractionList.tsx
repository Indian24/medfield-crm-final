import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectInteraction, deleteInteraction } from '../store/interactionSlice';

export function InteractionList() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(state => state.interactions.items);
  const selected = useAppSelector(state => state.interactions.selectedInteraction);

  if (items.length === 0) {
    return (
      <div className="crm-panel p-6 text-center">
        <p className="text-muted-foreground text-sm">No interactions logged yet. Use the form or AI assistant to log your first HCP interaction.</p>
      </div>
    );
  }

  return (
    <div className="crm-panel">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Recent Interactions</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{items.length} record{items.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {items.map(item => (
          <div
            key={item.id}
            className={`p-4 hover:bg-accent/50 cursor-pointer transition-colors ${
              selected?.id === item.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
            }`}
            onClick={() => dispatch(selectInteraction(item.id))}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground truncate">{item.hcp_name}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    item.sentiment === 'Positive' ? 'sentiment-badge-positive' :
                    item.sentiment === 'Negative' ? 'sentiment-badge-negative' :
                    'sentiment-badge-neutral'
                  }`}>
                    {item.sentiment}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {item.interaction_type} • {item.interaction_date}
                  </span>
                </div>
                {item.topics_discussed && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.topics_discussed}</p>
                )}
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  dispatch(deleteInteraction(item.id));
                }}
                className="text-muted-foreground/50 hover:text-destructive text-xs transition-colors p-1"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
