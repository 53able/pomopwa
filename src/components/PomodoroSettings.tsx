import { type ChangeEvent, useId, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PomodoroState } from '@/schemas/pomodoro';

interface PomodoroSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: PomodoroState['settings'];
  statistics: PomodoroState['statistics'];
  onSettingsUpdate: (settings: Partial<PomodoroState['settings']>) => void;
}

export function PomodoroSettings({
  open,
  onOpenChange,
  settings,
  statistics,
  onSettingsUpdate,
}: PomodoroSettingsProps) {
  const [formData, setFormData] = useState(settings);
  const workDurationId = useId();
  const shortBreakId = useId();
  const longBreakId = useId();
  const notificationsId = useId();
  const wakeLockId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSettingsUpdate(formData);
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: number | boolean) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-card/95 ios-blur">
        <DialogHeader className="text-center">
          <DialogTitle className="ios-title-2">設定</DialogTitle>
          <DialogDescription className="ios-body text-muted-foreground">
            ポモドーロタイマーの設定をカスタマイズできます
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* タイマー設定 */}
          <div className="space-y-6">
            <h3 className="ios-headline">タイマー設定</h3>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={workDurationId} className="ios-body font-medium">
                  作業時間（分）
                </Label>
                <Input
                  id={workDurationId}
                  type="number"
                  min={1}
                  max={120}
                  value={formData.workDuration}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('workDuration', parseInt(e.target.value, 10) || 25)
                  }
                  className="ios-touch-target rounded-xl border-2 bg-input text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={shortBreakId} className="ios-body font-medium">
                  短い休憩（分）
                </Label>
                <Input
                  id={shortBreakId}
                  type="number"
                  min={1}
                  max={30}
                  value={formData.shortBreakDuration}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('shortBreakDuration', parseInt(e.target.value, 10) || 5)
                  }
                  className="ios-touch-target rounded-xl border-2 bg-input text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={longBreakId} className="ios-body font-medium">
                  長い休憩（分）
                </Label>
                <Input
                  id={longBreakId}
                  type="number"
                  min={1}
                  max={60}
                  value={formData.longBreakDuration}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('longBreakDuration', parseInt(e.target.value, 10) || 15)
                  }
                  className="ios-touch-target rounded-xl border-2 bg-input text-lg"
                />
              </div>
            </div>
          </div>

          {/* その他設定 */}
          <div className="space-y-6">
            <h3 className="ios-headline">その他設定</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                <Label htmlFor={notificationsId} className="ios-body font-medium flex-1">
                  通知を有効にする
                </Label>
                <input
                  type="checkbox"
                  id={notificationsId}
                  checked={formData.notificationsEnabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('notificationsEnabled', e.target.checked)
                  }
                  className="ios-touch-target w-6 h-6 rounded-md border-2 border-primary accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                <Label htmlFor={wakeLockId} className="ios-body font-medium flex-1">
                  スクリーンをオンのままにする
                </Label>
                <input
                  type="checkbox"
                  id={wakeLockId}
                  checked={formData.wakeLockEnabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('wakeLockEnabled', e.target.checked)
                  }
                  className="ios-touch-target w-6 h-6 rounded-md border-2 border-primary accent-primary"
                />
              </div>
            </div>
          </div>

          {/* 統計表示 */}
          <Card className="bg-secondary/20 border-0">
            <CardHeader className="pb-4">
              <CardTitle className="ios-headline">統計</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="ios-body">完了したセッション</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary px-3 py-2 rounded-full font-semibold"
                  >
                    {statistics.completedSessions}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="ios-body">総作業時間</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary px-3 py-2 rounded-full font-semibold"
                  >
                    {Math.floor(statistics.totalWorkTime / 60)}時間{statistics.totalWorkTime % 60}分
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="ios-body">現在のストリーク</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary px-3 py-2 rounded-full font-semibold"
                  >
                    {statistics.streak}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto ios-touch-target"
            >
              キャンセル
            </Button>
            <Button type="submit" className="w-full sm:w-auto ios-touch-target shadow-md">
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
