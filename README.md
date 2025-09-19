# Pomodoro PWA

Progressive Web App対応のポモドーロタイマーアプリケーション。集中力向上と時間管理を通じて生産性を最大化するツールです。

## 📱 主な機能

- ⏰ **ポモドーロタイマー**: 25分作業 + 5分休憩のサイクル管理
- 🔔 **Web Push通知**: タイマー完了時の確実な通知
- 📱 **PWA対応**: オフライン動作・ホーム画面からの起動
- 📊 **進捗管理**: 完了セット数と統計情報の表示
- ⚙️ **カスタマイズ**: 時間設定・通知・画面スリープ防止
- 🎯 **時刻指定機能**: 目標時刻まで連続ポモドーロ（拡張機能）

## 🚀 デプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/53able/pomopwa)

本アプリケーションを即座にVercelにデプロイできます。

## 📋 ドキュメント

- **[📋 Product Requirements Document](docs/product-requirements-document.md)** - 製品要件・機能仕様
- **[⚙️ Technical Implementation Guide](docs/technical-implementation-guide.md)** - 技術実装詳細

## 🚀 開発環境セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# プレビュー（本番環境相当）
pnpm preview
```

## 🛠 技術スタック

- **フロントエンド**: React 19 + TypeScript 5.8
- **バンドラー**: Vite 7.1 + vite-plugin-pwa
- **スタイリング**: TailwindCSS + shadcn/ui
- **状態管理**: React Hooks + LocalStorage
- **型安全性**: Zod（スキーマファースト）
- **コード品質**: Biome（フォーマッター・リンター統合）

## 📱 PWA機能

- **オフライン対応**: Service Workerによる完全オフライン動作
- **インストール**: ホーム画面への追加（iOS/Android）
- **通知**: Web Push API対応（iOS 16.4+）
- **パフォーマンス**: 軽量バンドル（< 500KB）

## 🔧 Code Quality & Development

```bash
# コードフォーマット
pnpm format

# リント実行
pnpm lint

# タイプチェック + フォーマット + リント
pnpm check
```

## ⚙️ Vercel設定

本アプリケーションはVercelで最適化されており、`vercel.json`にPWA対応の設定が含まれています。詳細な技術仕様については[Technical Implementation Guide](docs/technical-implementation-guide.md)を参照してください。

---

**Built with ❤️ using React + TypeScript + Vite**
