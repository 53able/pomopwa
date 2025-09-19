/// <reference types="vite/client" />
/// <reference lib="webworker" />
import { z } from 'zod';

declare const self: ServiceWorkerGlobalScope;

// Zodスキーマでランタイム検証
const PushDataSchema = z.object({
  title: z.string().default('Pomodoro'),
  body: z.string().default('時間です！'),
  icon: z.string().default('/icons/icon-192.png'),
  tag: z.string().default('pomodoro'),
  requireInteraction: z.boolean().default(true),
});

self.addEventListener('push', (event: PushEvent) => {
  const rawData = event.data?.json() ?? {};

  // Zodスキーマで検証（不正データは安全にデフォルト値で補完）
  const data = PushDataSchema.parse(rawData);

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      tag: data.tag,
      // renotify: true, // 一部のブラウザでサポートされていない可能性があるためコメントアウト
      requireInteraction: data.requireInteraction,
      // actions: [
      //   { action: 'start-next', title: '次のセッション開始' },
      //   { action: 'dismiss', title: '閉じる' },
      // ], // TypeScriptの型定義でサポートされていない可能性があるためコメントアウト
    })
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList: readonly WindowClient[]) => {
      // 既存のタブがあれば活性化、なければ新規作成
      for (const client of clientList) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow('/');
    })
  );
});
