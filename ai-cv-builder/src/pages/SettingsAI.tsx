/**
 * AI Settings Page
 * Standalone page for AI configuration
 */
import AISettingsPanel from "@/components/ai/AISettingsPanel";
import AITestConsole from "@/components/ai/AITestConsole";

export default function SettingsAI() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Settings</h1>
        <p className="text-muted-foreground">Configure AI providers and models for different tasks</p>
      </div>
      <AISettingsPanel />
      <AITestConsole />
    </div>
  );
}
