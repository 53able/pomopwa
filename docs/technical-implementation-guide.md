# 技術実装ガイド
# Pomodoro PWA - Technical Implementation Guide

このドキュメントは、Pomodoro PWAアプリケーションの技術実装詳細を記載したガイドです。
製品要件については [`product-requirements-document.md`](./product-requirements-document.md) を参照してください。

「Vite + vite-plugin-pwa → Vercelにデプロイ → iPhone/Androidでホーム画面から起動」がいちばん軽快で実用です。以下の設計テンプレをそのまま使えます。

## 技術スタック構成

1. プロジェクト作成

```bash
pnpm create vite pomopwa --template react-ts
cd pomopwa
pnpm add -D vite-plugin-pwa
pnpm add tailwindcss autoprefixer postcss
pnpm add class-variance-authority clsx tailwind-merge lucide-react
# TypeScript用の型定義を追加
pnpm add -D @types/web-push @types/serviceworker
# Zodスキーマファースト型システム
pnpm add zod
# Biome（フォーマッター・リンター）
pnpm add -D @biomejs/biome
```

`vite-plugin-pwa` は Workbox を内蔵し、最小設定で PWA 化できます。([vite-pwa-org.netlify.app][1])

2. Vite 設定（PWA + マニフェスト + 自動更新）

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: { navigateFallbackDenylist: [/^\/api\//] }, // APIはSW対象外
      manifest: {
        name: 'Pomodoro PWA',
        short_name: 'Pomodoro',
        start_url: '/',
        display: 'standalone',
        background_color: '#111111',
        theme_color: '#e11d48',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ]
})
```

※ アイコンは「maskable」推奨（円形マスクでも欠けない）。([MDN 웹 문서][2])

3. UI/デザインシステム設定（shadcn/ui + TailwindCSS）

```bash
# TailwindCSS初期化
npx tailwindcss init -p

# shadcn/ui初期化
npx shadcn@latest init

# 必要なコンポーネントを追加
npx shadcn@latest add button progress card badge dialog input
```

```ts
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Pomodoroテーマカラー（PWAマニフェストと統一）
        primary: '#e11d48', // rose-600
        background: '#111111'
      }
    },
  },
  plugins: [],
}
```

shadcn/ui は美しくアクセシブルなコンポーネントをコピー&ペーストで利用でき、バンドルサイズも最適化されます。([shadcn/ui](https://ui.shadcn.com))

4. Biome設定（フォーマッター・リンター）

ESLintの代わりにBiomeを使用します。BiomeはRust製で高速動作し、フォーマッターとリンターが統合されています。

```bash
# Biome初期化
npx @biomejs/biome init

# フォーマット実行
pnpm biome format --write src

# リント実行  
pnpm biome lint src

# チェック（フォーマット + リント）
pnpm biome check --write src
```

```json
// biome.json
{
  "schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "files": {
    "include": ["src/**/*", "*.ts", "*.tsx", "*.js", "*.jsx"],
    "ignore": ["dist/**/*", "node_modules/**/*", "*.d.ts"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn"
      },
      "style": {
        "noParameterAssign": "error",
        "useConst": "error"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noArrayIndexKey": "warn"
      },
      "nursery": {
        "useSortedClasses": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "es5"
    }
  },
  "typescript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always"
    }
  },
  "json": {
    "formatter": {
      "enabled": true
    }
  },
  "organizeImports": {
    "enabled": true
  }
}
```

```json
// package.json（スクリプト追加）
{
  "scripts": {
    "format": "biome format --write .",
    "lint": "biome lint .",
    "check": "biome check --write .",
    "dev": "vite",
    "build": "tsc -b && vite build && pnpm check",
    "preview": "vite preview"
  }
}
```

**VS Code設定**: Biome拡張機能（biomejs.biome）をインストールし、保存時自動フォーマットを有効化：

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

**ESLintからの移行**: 既存のeslint.config.jsは削除し、package.jsonからESLint関連依存関係をアンインストール：

```bash
pnpm remove eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh typescript-eslint globals
rm eslint.config.js
```

Biomeは高速でゼロ設定から始められ、TypeScript・React・JSXを標準サポートしています。([Biome](https://biomejs.dev))

5. TypeScript設定の最適化

```json
// tsconfig.json（追加設定）
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client", "vite-plugin-pwa/client"]
  },
  "include": ["src/**/*", "src/sw.ts"]
}
```

```ts
// vite-env.d.ts（環境変数の型定義）
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VAPID_PUBLIC_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

```ts
// src/types/global.d.ts（グローバル型定義）
// Base64からUint8Arrayへの変換用ユーティリティ関数
declare global {
  function urlBase64ToUint8Array(base64String: string): Uint8Array
}

export {}
```

6. Zodスキーマファースト型システム

```ts
// src/schemas/pomodoro.ts
import { z } from 'zod'

// Push通知ペイロードスキーマ
export const PushNotificationSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(200),
  icon: z.string().url().optional(),
  tag: z.string().default('pomodoro'),
  requireInteraction: z.boolean().default(true)
})

// 時刻指定ポモドーロスキーマ  
export const TimeBoundPomodoroSchema = z.object({
  targetTime: z.date(),
  estimatedSets: z.number().int().positive(),
  completedSets: z.number().int().min(0),
  currentPhase: z.enum(['work', 'break', 'longbreak']),
  autoAdvance: z.boolean().default(true)
})

// 基本ポモドーロセッションスキーマ
export const PomodoroSessionSchema = z.object({
  id: z.string().uuid(),
  startTime: z.date(),
  duration: z.number().positive(), // minutes
  type: z.enum(['work', 'shortBreak', 'longBreak']),
  isCompleted: z.boolean().default(false),
  interruptions: z.number().int().min(0).default(0)
})

// 時刻入力フォームスキーマ
export const TimeInputSchema = z.object({
  targetTime: z.string().regex(/^([01]?\d|2[0-3]):([0-5]?\d)$/, {
    message: '有効な時刻を入力してください (HH:MM)'
  }),
  notificationMessage: z.string().min(1).max(100).optional()
}).refine(data => {
  // 未来の時刻かチェック
  const [hours, minutes] = data.targetTime.split(':').map(Number)
  const targetTime = new Date()
  targetTime.setHours(hours, minutes, 0, 0)
  return targetTime > new Date()
}, {
  message: '現在時刻より後の時刻を指定してください',
  path: ['targetTime']
})

// LocalStorage永続化用スキーマ
export const PomodoroStateSchema = z.object({
  currentSession: PomodoroSessionSchema.nullable(),
  timeBoundSession: TimeBoundPomodoroSchema.nullable(),
  settings: z.object({
    workDuration: z.number().int().min(1).max(120).default(25),
    shortBreakDuration: z.number().int().min(1).max(30).default(5),
    longBreakDuration: z.number().int().min(1).max(60).default(15),
    notificationsEnabled: z.boolean().default(true),
    wakeLockEnabled: z.boolean().default(false)
  }),
  statistics: z.object({
    completedSessions: z.number().int().min(0).default(0),
    totalWorkTime: z.number().int().min(0).default(0), // minutes
    streak: z.number().int().min(0).default(0)
  })
})

// 型推論（コンパイル時 + ランタイム型安全性）
export type PushNotification = z.infer<typeof PushNotificationSchema>
export type TimeBoundPomodoro = z.infer<typeof TimeBoundPomodoroSchema>
export type PomodoroSession = z.infer<typeof PomodoroSessionSchema>
export type TimeInput = z.infer<typeof TimeInputSchema>
export type PomodoroState = z.infer<typeof PomodoroStateSchema>
```

```ts
// src/utils/validation.ts
import { z } from 'zod'
import { PushNotificationSchema, TimeInputSchema } from '../schemas/pomodoro'

// 型安全なLocalStorageヘルパー
export function safeParseStoredState<T>(
  key: string, 
  schema: z.ZodSchema<T>
): T | null {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null
    
    const parsed = JSON.parse(stored)
    return schema.parse(parsed)
  } catch {
    // 無効なデータは削除
    localStorage.removeItem(key)
    return null
  }
}

// Push通知ペイロードの検証
export function validatePushData(data: unknown): PushNotification {
  return PushNotificationSchema.parse(data)
}

// フォーム入力の検証（エラーメッセージ付き）
export function validateTimeInput(data: unknown) {
  const result = TimeInputSchema.safeParse(data)
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors
    }
  }
  return {
    success: true,
    data: result.data
  }
}
```

Zod により**ランタイム検証 + コンパイル時型推論**の両方が実現され、データの整合性とDeveloper Experience が大幅に向上します。([Zod](https://zod.dev))

7. サービスワーカーで Push 通知を受け取る（TypeScript）
   `/src/sw.ts`（vite-plugin-pwa の TypeScript対応）

```ts
/// <reference types="vite/client" />
/// <reference lib="webworker" />
import { z } from 'zod'

declare const self: ServiceWorkerGlobalScope

// Zodスキーマでランタイム検証
const PushDataSchema = z.object({
  title: z.string().default('Pomodoro'),
  body: z.string().default('時間です！'),
  icon: z.string().default('/icons/icon-192.png'),
  tag: z.string().default('pomodoro'),
  requireInteraction: z.boolean().default(true)
})

type PushData = z.infer<typeof PushDataSchema>

self.addEventListener('push', (event: ExtendableEvent) => {
  const rawData = event.data?.json() ?? {}
  
  // Zodスキーマで検証（不正データは安全にデフォルト値で補完）
  const data = PushDataSchema.parse(rawData)
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      tag: data.tag,
      renotify: true,
      requireInteraction: data.requireInteraction,
      actions: [
        { action: 'start-next', title: '次のセッション開始' },
        { action: 'dismiss', title: '閉じる' }
      ]
    })
  )
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // 既存のタブがあれば活性化、なければ新規作成
      for (const client of clientList) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow('/')
    })
  )
})
```

Push/通知APIの基本。通知はユーザー許可が必要です（許可はユーザー操作の直後に要求するのが必須）。([MDN 웹 문서][3])

8. アプリ側で権限取得 & 購読

```ts
// クリックで「通知ON」→ Push購読を作る
async function enablePush(reg: ServiceWorkerRegistration) {
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
  })

  await fetch('/api/save-subscription', { method: 'POST', body: JSON.stringify(sub) })
}
```

※ `Notification.requestPermission()` は「ボタンを押した直後」のようなユーザー操作内で呼ぶ。([MDN 웹 문서][4])

9. iOSでの注意（超重要）

* iOS 16.4 以降、**ホーム画面に追加したWebアプリ**なら Web Push が使えます（Safariから追加が必要）。([WebKit][5])
* 追加手順：Safariでサイトを開く → 共有 → **ホーム画面に追加**。([CDC][6])
* バックグラウンドでJSタイマーは止まりがち。確実に鳴らしたい時は **Push通知**を使うか、画面点灯を維持します（下記 Wake Lock）。([MDN 웹 문서][3])

10. 画面スリープ防止（Wake Lock）

```ts
// Wake Lock APIの型定義
interface WakeLockSentinel {
  released: boolean
  type: 'screen'
  release(): Promise<void>
}

interface NavigatorWakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>
}

declare global {
  interface Navigator {
    wakeLock?: NavigatorWakeLock
  }
}

let sentinel: WakeLockSentinel | null = null

export async function keepAwake(on: boolean): Promise<void> {
  if (on && 'wakeLock' in navigator) {
    try {
      sentinel = await navigator.wakeLock!.request('screen')
      console.log('Wake Lock activated')
    } catch (error) {
      console.warn('Wake Lock failed:', error)
    }
  } else if (sentinel && !sentinel.released) {
    try {
      await sentinel.release()
      sentinel = null
      console.log('Wake Lock released')
    } catch (error) {
      console.warn('Wake Lock release failed:', error)
    }
  }
}
```

Wake Lock API で画面の自動スリープを抑止できます（HTTPS必須、対応ブラウザで）。([MDN 웹 문서][7])

11. 指定時刻までのポモドーロ機能（拡張機能）

特定の時刻まで25分+5分のポモドーロサイクルを自動実行する機能。「17:00の会議まで集中したい」などのシナリオに対応。

```ts
// src/services/timeBoundPomodoro.ts
import { z } from 'zod'
import { TimeBoundPomodoroSchema, PushNotificationSchema } from '../schemas/pomodoro'

// Zodスキーマから型を推論
type TimeBoundPomodoro = z.infer<typeof TimeBoundPomodoroSchema>
type PushNotification = z.infer<typeof PushNotificationSchema>

// QStash API レスポンススキーマ
const QStashResponseSchema = z.object({
  messageId: z.string(),
  url: z.string(),
  deduplicated: z.boolean().optional()
})

// 連続ポモドーロセッションの予約（型安全）
async function scheduleSequentialPomodoros(
  targetTime: Date, 
  subscription: PushSubscription
): Promise<string[]> {
  const totalMinutes = (targetTime.getTime() - Date.now()) / (1000 * 60)
  const fullSets = Math.floor(totalMinutes / 30) // 25分作業+5分休憩
  const messageIds: string[] = []
  
  // 各セット完了通知をQStashで予約（Zodで型安全）
  for (let i = 0; i < fullSets; i++) {
    const notifyTime = new Date(Date.now() + (i + 1) * 30 * 60 * 1000)
    const isWorkEnd = (i % 2 === 0) // 偶数：作業終了、奇数：休憩終了
    
    // Zodスキーマで通知ペイロードを構築
    const notification = PushNotificationSchema.parse({
      title: isWorkEnd ? '作業完了！' : '休憩終了',
      body: isWorkEnd ? '5分休憩しましょう' : '次のセットを開始',
      tag: `pomodoro-set-${i + 1}`
    })
    
    const response = await fetch('/api/schedule-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        delayMs: notifyTime.getTime() - Date.now(),
        ...notification
      })
    })
    
    // レスポンスもZodで検証
    const result = QStashResponseSchema.parse(await response.json())
    messageIds.push(result.messageId)
  }
  
  // 最終目標時刻の通知
  const finalNotification = PushNotificationSchema.parse({
    title: '目標時刻到達！',
    body: `設定時刻 ${targetTime.toLocaleTimeString()} になりました`,
    tag: 'pomodoro-final'
  })
  
  const finalResponse = await fetch('/api/schedule-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription,
      delayMs: targetTime.getTime() - Date.now(),
      ...finalNotification
    })
  })
  
  const finalResult = QStashResponseSchema.parse(await finalResponse.json())
  messageIds.push(finalResult.messageId)
  
  return messageIds // 予約されたメッセージIDを返却
}
```

### UI設計
- **時刻入力**: `<input type="time">` でモバイル最適化
- **予想表示**: 「17:00まで約7セット」の事前計算
- **進捗表示**: 「3/7セット完了」のリアルタイム更新
- **端数処理**: 最後のセットが30分未満の場合の調整

この機能により、長時間の集中でも構造化された休憩が自動管理され、燃え尽きを防げます。

12. Vercel デプロイ

* ViteプロジェクトのデプロイはそのままOK。`vercel --prod` またはGit連携。([Vercel][8])
* PWA/Service Worker に必要なヘッダ調整例（`vercel.json`）：

```json
{
  "headers": [
    { "source": "/sw.js", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/manifest.webmanifest", "headers": [{ "key": "Content-Type", "value": "application/manifest+json" }] },
    { "source": "/(.*)", "headers": [{ "key": "Permissions-Policy", "value": "screen-wake-lock=(self)" }] }
  ]
}
```

`vite-plugin-pwa` の Vercel向けガイドに準拠（ヘッダ例あり）。Wake Lock は Permissions-Policy の制御対象です。([vite-pwa-org.netlify.app][9])

---

## 「必ず鳴らす」ための通知アーキテクチャ（おすすめ）

### A. サーバからWeb Pushを送る（VAPID）

* 送信側は `web-push` を使う（Node）。VAPID鍵を生成して環境変数に保存。([npm][10])

```bash
npx web-push generate-vapid-keys
# 公開鍵→ VITE_VAPID_PUBLIC_KEY / 秘密鍵→ サーバの環境変数
```

* VercelのAPI Routeで送信:

```ts
// /api/push.ts
import webPush from 'web-push'

webPush.setVapidDetails('mailto:you@example.com', process.env.VAPID_PUBLIC!, process.env.VAPID_PRIVATE!)

export async function POST(req: Request) {
  const { subscription, title, body } = await req.json()
  await webPush.sendNotification(subscription, JSON.stringify({ title, body }))
  return new Response('ok')
}
```

VAPID/Pushの仕組みはMDNのチュートリアルが分かりやすい。([MDN 웹 문서][11])

### B. 「○分後に鳴らしたい」を確実化（QStashで遅延HTTP）

Vercel 単体の Cron は**分単位の正確スケジュールが難しい**（Hobbyは時間内のどこかで実行）。短い遅延は **Upstash QStash** に任せると、**N分後に /api/push を叩く**が容易です。([Vercel][12])

* 例：25分後に通知を予約

```bash
curl -X POST https://qstash.upstash.io/v2/publish/https://<your>.vercel.app/api/push \
  -H "Authorization: Bearer $QSTASH_TOKEN" \
  -H "Upstash-Delay: 25m" \
  -H "Content-Type: application/json" \
  -d '{"subscription": <保存した購読>, "title":"集中おわり", "body":"5分休憩！"}'
```

QStashは遅延配信やリトライ等をHTTPで扱えます。([Upstash: Serverless Data Platform][13])

---

## 体験を上げる実装メモ

### 基本PWA体験
* **自動更新**：`registerType:'autoUpdate'` でSWを静かに更新。([vite-pwa-org.netlify.app][1])
* **オフライン対応**：`workbox` の `runtimeCaching` に API除外・静的資産の戦略を定義。([vite-pwa-org.netlify.app][14])
* **UI/操作**：開始/一時停止に合わせて `keepAwake(true/false)`、通知許可はボタン押下時だけ要求。([MDN 웹 문서][7])
* **iOSの導線**：初回に「Safari → 共有 → ホーム画面に追加」を軽くガイド表示。([CDC][6])

### 拡張機能の体験向上
* **時刻指定の直感性**：現在時刻から自動計算された「あと○セット」表示で分かりやすく
* **進捗の可視化**：shadcn/ui の Progress コンポーネントで現在セット/総セット数を表示
* **モード切替**：通常ポモドーロ ⇔ 時刻指定モードをタブで直感的に切替
* **エラー処理**：過去時刻設定時の警告、ネットワークエラー時の再試行機能

### Zodスキーマファーストの開発体験向上
* **型安全性の向上**：コンパイル時 + ランタイム型チェックでバグ削減
* **自動バリデーション**：フォーム入力・API レスポンス・LocalStorage復元を統一的に検証
* **優れたDX**: `z.infer<typeof Schema>`でスキーマから型を自動推論
* **堅牢なデータ処理**：不正データを安全にデフォルト値で補完 (`z.default()`)
* **分かりやすいエラー**：Zodのエラーメッセージで開発・デバッグ効率向上

---

## 仕上げチェックリスト

### 基本機能
* [ ] PWAインストール可（`manifest`/`service worker`/HTTPS）。([vite-pwa-org.netlify.app][1])
* [ ] アイコンが**maskable**で綺麗。([MDN 웹 문서][2])
* [ ] Wake Lockが効く（対応ブラウザ）。([MDN 웹 문서][7])
* [ ] iOSは**ホーム画面アプリ**でPush可。([WebKit][5])
* [ ] 遅延PushはQStashで予約。([Upstash: Serverless Data Platform][15])
* [ ] Vercelにデプロイ済。([Vercel][8])

### TypeScript + Zod設定
* [ ] tsconfig.json strict設定完了
* [ ] 型定義ライブラリインストール（@types/web-push, @types/serviceworker）
* [ ] vite-env.d.ts で環境変数型定義
* [ ] src/types/global.d.ts でグローバル型定義
* [ ] Service Worker（src/sw.ts）TypeScript化完了
* [ ] Zodスキーマ定義完了（src/schemas/pomodoro.ts）
* [ ] Push通知ペイロード Zod検証実装
* [ ] 時刻入力フォーム Zod バリデーション実装
* [ ] LocalStorage データ復元 Zod検証実装
* [ ] QStash APIレスポンス Zod検証実装

### UI/UXシステム
* [ ] shadcn/ui初期化完了（`npx shadcn@latest init`）
* [ ] 必要コンポーネント追加済（button, progress, card, badge, dialog, input）
* [ ] TailwindCSS設定でテーマカラー統一（primary: #e11d48）
* [ ] レスポンシブ対応済（モバイルファースト）

### 拡張機能
* [ ] 基本ポモドーロタイマー（25分+5分）実装済
* [ ] 指定時刻までのポモドーロ機能実装済
* [ ] 時刻入力UI（`<input type="time">`）動作確認
* [ ] 予想セット数表示（「17:00まで約7セット」）
* [ ] 連続通知予約機能（QStash連携）動作確認

この形なら、**画面ONのまま集中**でも、**バックグラウンドでも確実に通知**でもいけます。実装進めるなら、最小の雛形をここで一気に書き切ることもできますよ。

[1]: https://vite-pwa-org.netlify.app/guide/?utm_source=chatgpt.com "Getting Started | Guide - Vite PWA - Netlify"
[2]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons?utm_source=chatgpt.com "Define your app icons - Progressive web apps - MDN"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Push_API?utm_source=chatgpt.com "Push API - Web - MDN - Mozilla"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API?utm_source=chatgpt.com "Notifications API - Web - MDN - Mozilla"
[5]: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/?utm_source=chatgpt.com "Web Push for Web Apps on iOS and iPadOS"
[6]: https://www.cdc.gov/niosh/mining/tools/installpwa.html?utm_source=chatgpt.com "How to Install a PWA | Mining"
[7]: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API?utm_source=chatgpt.com "Screen Wake Lock API - MDN Web Docs - Mozilla"
[8]: https://vercel.com/docs/frameworks/frontend/vite?utm_source=chatgpt.com "Vite on Vercel"
[9]: https://vite-pwa-org.netlify.app/deployment/vercel?utm_source=chatgpt.com "Vercel | Deployment - Vite PWA - Netlify"
[10]: https://www.npmjs.com/package/web-push?utm_source=chatgpt.com "web-push"
[11]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push?utm_source=chatgpt.com "Make PWAs re-engageable using Notifications and Push APIs ..."
[12]: https://vercel.com/docs/cron-jobs/manage-cron-jobs?utm_source=chatgpt.com "Managing Cron Jobs"
[13]: https://upstash.com/docs/qstash/api/publish?utm_source=chatgpt.com "Publish a Message - Upstash Documentation"
[14]: https://vite-pwa-org.netlify.app/workbox/generate-sw?utm_source=chatgpt.com "generateSW | Workbox - Vite PWA - Netlify"
[15]: https://upstash.com/docs/qstash/api/schedules/create?utm_source=chatgpt.com "Create Schedule - Upstash Documentation"
