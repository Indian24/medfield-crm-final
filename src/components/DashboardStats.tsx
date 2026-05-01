import React from 'react';
import { useAppSelector } from '../store/hooks';

export function DashboardStats() {
  const items = useAppSelector(state => state.interactions.items);

  const totalInteractions = items.length;
  const positiveCount = items.filter(i => i.sentiment === 'Positive').length;
  const neutralCount = items.filter(i => i.sentiment === 'Neutral').length;
  const negativeCount = items.filter(i => i.sentiment === 'Negative').length;
  const uniqueHCPs = new Set(items.map(i => i.hcp_name)).size;
  const meetingCount = items.filter(i => i.interaction_type === 'Meeting').length;
  const callCount = items.filter(i => i.interaction_type === 'Call').length;

  const stats = [
    { label: 'Total Interactions', value: totalInteractions, icon: '📊', color: 'bg-primary/10 text-primary' },
    { label: 'Unique HCPs', value: uniqueHCPs, icon: '👨‍⚕️', color: 'bg-info/10 text-info' },
    { label: 'Positive Sentiment', value: positiveCount, icon: '😊', color: 'bg-success/10 text-success' },
    { label: 'Meetings / Calls', value: `${meetingCount} / ${callCount}`, icon: '📅', color: 'bg-warning/10 text-warning-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(stat => (
        <div key={stat.label} className="crm-panel p-3.5 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${stat.color}`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground leading-tight">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
