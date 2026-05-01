import React from 'react';

export function CrmHeader() {
  return (
    <header className="bg-crm-header text-crm-header-foreground">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-crm-accent flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">Rx</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">MedField CRM</h1>
            <p className="text-[10px] text-crm-header-foreground/60">Life Sciences • HCP Engagement</p>
          </div>
        </div>
        <nav className="hidden sm:flex items-center gap-1">
          <span className="px-3 py-1.5 text-xs font-medium rounded-md bg-crm-accent/20 text-crm-header-foreground">
            Interactions
          </span>
          <span className="px-3 py-1.5 text-xs text-crm-header-foreground/60 hover:text-crm-header-foreground/80 cursor-default">
            HCPs
          </span>
          <span className="px-3 py-1.5 text-xs text-crm-header-foreground/60 hover:text-crm-header-foreground/80 cursor-default">
            Reports
          </span>
        </nav>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-crm-accent/30 flex items-center justify-center text-xs font-medium">
            FR
          </div>
        </div>
      </div>
    </header>
  );
}
