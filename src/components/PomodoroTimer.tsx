import { Pause, Play, Settings, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePomodoro } from '@/hooks/usePomodoro';
import { cn } from '@/lib/utils';

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
    <div className="mx-auto max-w-md space-y-8 p-4">
      <Card className="text-center bg-card/90 ios-blur shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="ios-title-2">ポモドーロタイマー</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onSettingsOpen}
              className="ios-touch-target"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pb-8">
          {/* 現在のフェーズ表示 */}
          <div className="flex justify-center">
            <Badge 
              className={cn(
                'px-6 py-3 text-base font-semibold rounded-full shadow-sm',
                phaseColors[currentPhase]
              )}
            >
              {phaseLabels[currentPhase]}
            </Badge>
          </div>

          {/* タイマー表示 - より大きく、iOS風のフォント */}
          <div className="ios-large-title font-mono text-7xl md:text-8xl tracking-tight text-primary">
            {formatTime()}
          </div>

          {/* 進捗バー - iOS風の丸みと色 */}
          <div className="space-y-3">
            <Progress 
              value={progressValue} 
              className="h-3 bg-secondary rounded-full overflow-hidden"
            />
            <p className="ios-footnote text-muted-foreground">
              {Math.round(progressValue)}% 完了
            </p>
          </div>

          {/* コントロールボタン - iOS風の配置とサイズ */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
            {!isRunning ? (
              <Button 
                onClick={startTimer} 
                size="lg" 
                className="gap-3 shadow-md ios-touch-target w-full sm:w-auto"
              >
                <Play className="h-6 w-6" fill="currentColor" />
                開始
              </Button>
            ) : (
              <Button 
                onClick={stopTimer} 
                size="lg" 
                variant="secondary" 
                className="gap-3 shadow-md ios-touch-target w-full sm:w-auto"
              >
                <Pause className="h-6 w-6" fill="currentColor" />
                一時停止
              </Button>
            )}

            <Button 
              onClick={resetTimer} 
              size="lg" 
              variant="ghost" 
              className="gap-3 ios-touch-target w-full sm:w-auto"
            >
              <Square className="h-5 w-5" fill="currentColor" />
              リセット
            </Button>
          </div>

          {/* 統計表示 - iOS風のセパレーターと配置 */}
          <div className="border-t border-border/50 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="ios-title-1 text-primary font-bold">{completedPomodoros}</p>
                <p className="ios-caption-1 text-muted-foreground">今日のポモドーロ</p>
              </div>
              <div className="space-y-2">
                <p className="ios-title-1 text-primary font-bold">
                  {completedPomodoros % 4}<span className="ios-body text-muted-foreground">/4</span>
                </p>
                <p className="ios-caption-1 text-muted-foreground">セット進捗</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
