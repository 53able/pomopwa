import { Pause, Play, Settings, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePomodoro } from '@/hooks/usePomodoro';

type TimerPhase = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroTimerProps {
  onSettingsOpen: () => void;
}

const phaseLabels: Record<TimerPhase, string> = {
  work: '作業時間',
  shortBreak: '短い休憩',
  longBreak: '長い休憩',
};

const phaseColors: Record<TimerPhase, string> = {
  work: 'bg-primary text-primary-foreground',
  shortBreak: 'bg-green-500 text-white',
  longBreak: 'bg-blue-500 text-white',
};

export function PomodoroTimer({ onSettingsOpen }: PomodoroTimerProps) {
  const {
    currentPhase,
    isRunning,
    completedPomodoros,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
    progress,
  } = usePomodoro();

  const progressValue = progress();

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <Card className="text-center">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold text-2xl">Pomodoro Timer</CardTitle>
            <Button variant="outline" size="icon" onClick={onSettingsOpen}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 現在のフェーズ表示 */}
          <div className="flex justify-center">
            <Badge className={phaseColors[currentPhase]}>{phaseLabels[currentPhase]}</Badge>
          </div>

          {/* タイマー表示 */}
          <div className="font-bold font-mono text-6xl tracking-wider">{formatTime()}</div>

          {/* 進捗バー */}
          <div className="space-y-2">
            <Progress value={progressValue} className="h-2" />
            <p className="text-muted-foreground text-sm">{Math.round(progressValue)}% 完了</p>
          </div>

          {/* コントロールボタン */}
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button onClick={startTimer} size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                開始
              </Button>
            ) : (
              <Button onClick={stopTimer} size="lg" variant="outline" className="gap-2">
                <Pause className="h-5 w-5" />
                一時停止
              </Button>
            )}

            <Button onClick={resetTimer} size="lg" variant="outline" className="gap-2">
              <Square className="h-5 w-5" />
              リセット
            </Button>
          </div>

          {/* 統計表示 */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-bold text-2xl text-primary">{completedPomodoros}</p>
                <p className="text-muted-foreground text-sm">今日のポモドーロ</p>
              </div>
              <div>
                <p className="font-bold text-2xl text-primary">{completedPomodoros % 4}/4</p>
                <p className="text-muted-foreground text-sm">セット進捗</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
