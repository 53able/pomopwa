import { useState } from 'react';
import { PomodoroSettings } from '@/components/PomodoroSettings';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { usePomodoro } from '@/hooks/usePomodoro';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, statistics, updateSettings } = usePomodoro();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <PomodoroTimer onSettingsOpen={() => setSettingsOpen(true)} />
        <PomodoroSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={settings}
          statistics={statistics}
          onSettingsUpdate={updateSettings}
        />
      </div>
    </div>
  );
}

export default App;
