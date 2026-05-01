import { createFileRoute } from "@tanstack/react-router";
import { Provider } from "react-redux";
import { store } from "../store";
import { CrmHeader } from "../components/CrmHeader";
import { DashboardStats } from "../components/DashboardStats";
import { InteractionForm } from "../components/InteractionForm";
import { ChatPanel } from "../components/ChatPanel";
import { InteractionList } from "../components/InteractionList";
import { Notifications } from "../components/Notifications";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "MedField CRM — Log HCP Interaction" },
      { name: "description", content: "AI-powered CRM for logging healthcare professional interactions in life sciences" },
    ],
  }),
});

function Index() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-background">
        <Notifications />
        <CrmHeader />

        {/* Page Title */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">Log HCP Interaction</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-info/10 text-info">
              AI-Assisted
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Record your interaction using the form or let the AI assistant structure it from natural language.
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3">
          <DashboardStats />
        </div>

        {/* Main Layout */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Form + Interactions */}
            <div className="lg:col-span-7 space-y-5">
              <InteractionForm />
              <InteractionList />
            </div>

            {/* Right: AI Chat */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-4" style={{ height: 'calc(100vh - 200px)' }}>
                <ChatPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Provider>
  );
}
