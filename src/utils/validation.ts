import type { z } from 'zod';
import { PushNotificationSchema, TimeInputSchema } from '../schemas/pomodoro';

// 型安全なLocalStorageヘルパー
export function safeParseStoredState<T>(key: string, schema: z.ZodSchema<T>): T | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return schema.parse(parsed);
  } catch {
    // 無効なデータは削除
    localStorage.removeItem(key);
    return null;
  }
}

// Push通知ペイロードの検証
export function validatePushData(data: unknown): z.infer<typeof PushNotificationSchema> {
  return PushNotificationSchema.parse(data);
}

// フォーム入力の検証（エラーメッセージ付き）
export function validateTimeInput(data: unknown) {
  const result = TimeInputSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  return {
    success: true,
    data: result.data,
  };
}
