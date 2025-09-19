import { z } from 'zod';

// Push通知ペイロードスキーマ
export const PushNotificationSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(200),
  icon: z.string().url().optional(),
  tag: z.string().default('pomodoro'),
  requireInteraction: z.boolean().default(true),
});

// 時刻指定ポモドーロスキーマ
export const TimeBoundPomodoroSchema = z.object({
  targetTime: z.date(),
  estimatedSets: z.number().int().positive(),
  completedSets: z.number().int().min(0),
  currentPhase: z.enum(['work', 'break', 'longbreak']),
  autoAdvance: z.boolean().default(true),
});

// 基本ポモドーロセッションスキーマ
export const PomodoroSessionSchema = z.object({
  id: z.string().uuid(),
  startTime: z.date(),
  duration: z.number().positive(), // minutes
  type: z.enum(['work', 'shortBreak', 'longBreak']),
  isCompleted: z.boolean().default(false),
  interruptions: z.number().int().min(0).default(0),
});

// 時刻入力フォームスキーマ
export const TimeInputSchema = z
  .object({
    targetTime: z.string().regex(/^([01]?\d|2[0-3]):([0-5]?\d)$/, {
      message: '有効な時刻を入力してください (HH:MM)',
    }),
    notificationMessage: z.string().min(1).max(100).optional(),
  })
  .refine(
    (data) => {
      // 未来の時刻かチェック
      const [hours, minutes] = data.targetTime.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);
      return targetTime > new Date();
    },
    {
      message: '現在時刻より後の時刻を指定してください',
      path: ['targetTime'],
    }
  );

// LocalStorage永続化用スキーマ
export const PomodoroStateSchema = z.object({
  currentSession: PomodoroSessionSchema.nullable(),
  timeBoundSession: TimeBoundPomodoroSchema.nullable(),
  settings: z.object({
    workDuration: z.number().int().min(1).max(120).default(25),
    shortBreakDuration: z.number().int().min(1).max(30).default(5),
    longBreakDuration: z.number().int().min(1).max(60).default(15),
    notificationsEnabled: z.boolean().default(true),
    wakeLockEnabled: z.boolean().default(false),
  }),
  statistics: z.object({
    completedSessions: z.number().int().min(0).default(0),
    totalWorkTime: z.number().int().min(0).default(0), // minutes
    streak: z.number().int().min(0).default(0),
  }),
});

// 型推論（コンパイル時 + ランタイム型安全性）
export type PushNotification = z.infer<typeof PushNotificationSchema>;
export type TimeBoundPomodoro = z.infer<typeof TimeBoundPomodoroSchema>;
export type PomodoroSession = z.infer<typeof PomodoroSessionSchema>;
export type TimeInput = z.infer<typeof TimeInputSchema>;
export type PomodoroState = z.infer<typeof PomodoroStateSchema>;
