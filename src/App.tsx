import { useState } from 'react';
import { PomodoroSettings } from '@/components/PomodoroSettings';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { usePomodoro } from '@/hooks/usePomodoro';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, statistics, updateSettings } = usePomodoro();

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      {/* iOS Safe Area対応のコンテナ */}
      <div className="container mx-auto px-4 py-safe-area-top pb-safe-area-bottom">
        <div className="min-h-screen min-h-[100dvh] flex flex-col justify-center items-center">
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
    </div>
  );
}

export default App;
