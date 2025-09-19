import { type ChangeEvent, useState } from 'react';
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>ポモドーロタイマーの設定をカスタマイズできます</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイマー設定 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">タイマー設定</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="workDuration">作業時間（分）</Label>
                <Input
                  id="workDuration"
                  type="number"
                  min={1}
                  max={120}
                  value={formData.workDuration}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('workDuration', parseInt(e.target.value, 10) || 25)
                  }
                />
              </div>

              <div>
                <Label htmlFor="shortBreakDuration">短い休憩（分）</Label>
                <Input
                  id="shortBreakDuration"
                  type="number"
                  min={1}
                  max={30}
                  value={formData.shortBreakDuration}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('shortBreakDuration', parseInt(e.target.value, 10) || 5)
                  }
                />
              </div>

              <div>
                <Label htmlFor="longBreakDuration">長い休憩（分）</Label>
                <Input
                  id="longBreakDuration"
                  type="number"
                  min={1}
                  max={60}
                  value={formData.longBreakDuration}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('longBreakDuration', parseInt(e.target.value, 10) || 15)
                  }
                />
              </div>
            </div>
          </div>

          {/* その他設定 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">その他設定</h3>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={formData.notificationsEnabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('notificationsEnabled', e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="notifications">通知を有効にする</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="wakeLock"
                  checked={formData.wakeLockEnabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('wakeLockEnabled', e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="wakeLock">スクリーンをオンのままにする</Label>
              </div>
            </div>
          </div>

          {/* 統計表示 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">統計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <span>完了したセッション</span>
                  <Badge variant="secondary">{statistics.completedSessions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>総作業時間</span>
                  <Badge variant="secondary">
                    {Math.floor(statistics.totalWorkTime / 60)}時間{statistics.totalWorkTime % 60}分
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>現在のストリーク</span>
                  <Badge variant="secondary">{statistics.streak}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
