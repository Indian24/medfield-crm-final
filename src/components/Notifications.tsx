import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearMessages } from '../store/interactionSlice';

export function Notifications() {
  const dispatch = useAppDispatch();
  const error = useAppSelector(state => state.interactions.error);
  const success = useAppSelector(state => state.interactions.successMessage);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => dispatch(clearMessages()), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  if (!error && !success) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm ${
        error
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-success text-success-foreground'
      }`}>
        {error ? `❌ ${error}` : `✅ ${success}`}
      </div>
    </div>
  );
}
