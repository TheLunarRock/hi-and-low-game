# Hi & Low ゲーム - 技術仕様書

> このドキュメントは、アプリケーションを完全に再現するための詳細な技術仕様です。

## 1. プロジェクト概要

| 項目               | 値                                       |
| ------------------ | ---------------------------------------- |
| **名称**           | Hi & Low Game                            |
| **バージョン**     | 1.0.0（ロックダウン済み）                |
| **用途**           | トランプを使ったハイ＆ローカードゲーム   |
| **アーキテクチャ** | フィーチャーベース開発（厳格な境界管理） |
| **ライセンス**     | MIT                                      |

## 1.1 ゲーム概要

**Hi & Low**は、次のカードが現在のカードより「高い」か「低い」かを予想するシンプルなカードゲームです。

### ゲームルール

1. プレイヤーは初期コイン10枚でスタート
2. 1ゲームにつき1コインを消費
3. 次のカードが現在のカードより高い（HIGH）か低い（LOW）かを予想
4. 正解すると連勝数分のコインを獲得
5. 同じ数字（ドロー）の場合はコインが返却される
6. 不正解でも連勝がリセットされるだけで続行可能
7. コインが0になるとゲームオーバー

### カード値の順序

```
A(1) < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J(11) < Q(12) < K(13)
```

## 2. 技術スタック

### 2.1 コアフレームワーク

| パッケージ | バージョン | 用途                              |
| ---------- | ---------- | --------------------------------- |
| Next.js    | ^15.3.3    | Reactフレームワーク（App Router） |
| React      | ^19.1.0    | UIライブラリ                      |
| React DOM  | ^19.1.0    | DOMレンダリング                   |
| TypeScript | ^5.8.3     | 型安全な開発                      |

### 2.2 スタイリング

| パッケージ   | バージョン | 用途                           |
| ------------ | ---------- | ------------------------------ |
| Tailwind CSS | ^3.4.17    | ユーティリティファーストCSS    |
| PostCSS      | ^8.5.3     | CSSプロセッサ                  |
| Autoprefixer | ^10.4.21   | ベンダープレフィックス自動付与 |

### 2.3 状態管理・データ

| パッケージ            | バージョン | 用途                 |
| --------------------- | ---------- | -------------------- |
| Zustand               | ^5.0.5     | 軽量状態管理         |
| @supabase/supabase-js | ^2.49.4    | Supabaseクライアント |

### 2.4 国際化

| パッケージ    | バージョン | 用途                      |
| ------------- | ---------- | ------------------------- |
| i18next       | ^25.2.1    | 国際化フレームワーク      |
| react-i18next | ^16.4.1    | React用i18nバインディング |
| next-i18next  | ^15.4.2    | Next.js用i18n統合         |

### 2.5 テスト

| パッケージ             | バージョン | 用途                         |
| ---------------------- | ---------- | ---------------------------- |
| Vitest                 | ^3.1.4     | ユニットテストフレームワーク |
| @testing-library/react | ^16.3.0    | Reactコンポーネントテスト    |
| Playwright             | ^1.52.0    | E2Eテスト                    |

### 2.6 品質管理

| パッケージ  | バージョン | 用途                   |
| ----------- | ---------- | ---------------------- |
| ESLint      | ^9.28.0    | コード品質チェック     |
| Prettier    | ^3.5.3     | コードフォーマット     |
| Husky       | ^9.1.7     | Git hooks管理          |
| lint-staged | ^16.1.0    | ステージファイルのlint |

## 3. ディレクトリ構造

```
template-v3.0/
├── .claude/                    # Claude Code設定
│   ├── settings.json          # プロジェクト設定（Git管理）
│   └── settings.local.json    # ローカル設定（Git除外）
├── .github/
│   └── workflows/             # GitHub Actions
├── .husky/                    # Git hooks
│   ├── pre-commit            # コミット前チェック
│   └── commit-msg            # コミットメッセージ検証
├── docs/                      # ドキュメント
├── scripts/                   # ユーティリティスクリプト
│   ├── setup.js              # プロジェクトセットアップ
│   ├── check.js              # 品質チェック
│   ├── check-boundaries.js   # 境界違反検出
│   ├── create-feature.js     # フィーチャー作成
│   └── preflight.js          # デプロイ前チェック
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # ルートレイアウト
│   │   └── page.tsx          # ホームページ
│   ├── components/           # 共有コンポーネント
│   │   └── ErrorBoundary.tsx # エラー境界
│   ├── features/             # フィーチャーモジュール
│   │   └── _template/        # フィーチャーテンプレート
│   ├── hooks/                # 共有フック
│   │   ├── useI18n.ts        # 国際化フック
│   │   └── useInfiniteLoopDetector.ts
│   ├── styles/               # グローバルスタイル
│   │   └── globals.css       # Tailwind CSS
│   └── utils/                # ユーティリティ
│       ├── cache/            # キャッシュ機能
│       └── error-handling/   # エラーハンドリング
├── tests/
│   ├── e2e/                  # E2Eテスト
│   │   ├── fixtures/         # テストフィクスチャ
│   │   └── helpers/          # テストヘルパー
│   ├── regression/           # 回帰テスト
│   └── unit/                 # ユニットテスト
├── CLAUDE.md                 # Claude Code実装ガイド
├── PROJECT_INFO.md           # プロジェクト情報
├── SETUP_GUIDE.md            # セットアップガイド
├── package.json              # パッケージ設定
├── tsconfig.json             # TypeScript設定
├── tailwind.config.ts        # Tailwind設定
├── next.config.mjs           # Next.js設定
├── vitest.config.ts          # Vitest設定
└── playwright.config.ts      # Playwright設定
```

## 4. フィーチャーベース開発

### 4.1 フィーチャー構造

```
src/features/[feature-name]/
├── api/              # API関数（公開推奨）
│   └── featureApi.ts
├── components/       # UIコンポーネント（内部使用のみ）
│   └── Component.tsx
├── hooks/            # カスタムフック（内部使用のみ）
│   └── useFeature.ts
├── types/            # 型定義
│   └── index.ts
├── utils/            # ヘルパー関数（内部使用のみ）
├── store/            # 状態管理（内部使用のみ）
├── __tests__/        # テストファイル
└── index.ts          # 公開API（最小限）
```

### 4.2 境界ルール（絶対遵守）

| ルール                 | 説明                                    |
| ---------------------- | --------------------------------------- |
| フック非公開           | `index.ts`からフックを絶対に公開しない  |
| UIコンポーネント非公開 | 各フィーチャーが独自UIを実装            |
| API関数公開            | データ取得は純粋関数として公開          |
| import形式             | `@/features/[name]`のみ使用可能         |
| 内部アクセス禁止       | `/components`、`/hooks`への直接参照禁止 |

### 4.3 正しいindex.tsの例

```typescript
// src/features/[feature-name]/index.ts

// ✅ API関数（公開推奨）
export { getFeatureData, createItem } from './api/featureApi'

// ✅ ドメイン型のみ（公開可）
export type { FeatureItem, FeatureConfig } from './types'

// ❌ フック（公開禁止）
// export { useFeature } from './hooks/useFeature'

// ❌ UIコンポーネント（公開禁止）
// export { FeatureComponent } from './components/FeatureComponent'
```

## 5. 設定ファイル仕様

### 5.1 TypeScript設定（tsconfig.json）

```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": false,
    "noUncheckedIndexedAccess": false,
    "strictPropertyInitialization": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"]
    }
  }
}
```

### 5.2 Next.js設定（next.config.mjs）

```javascript
import bundleAnalyzer from '@next/bundle-analyzer'

const nextConfig = {
  reactStrictMode: true,
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
})

export default process.env.ANALYZE === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig
```

### 5.3 Vitest設定（vitest.config.ts）

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests/e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/features/**/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/features': path.resolve(__dirname, './src/features'),
    },
  },
})
```

### 5.4 Playwright設定（playwright.config.ts）

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 2 : 0,
  workers: process.env.CI === 'true' ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: process.env.CI === 'true' ? 'pnpm build && pnpm start' : 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
})
```

### 5.5 Tailwind CSS設定

**フォント:**

- `font-rounded`: M PLUS Rounded 1c（日本語最適化）
- `font-mono`: Fira Code
- `font-cyber`: Orbitron
- `font-retro`: Press Start 2P

**カラーパレット:**

- Neon: `neon-green`, `neon-pink`, `neon-blue`, `neon-yellow`, `neon-orange`
- Glass: `glass-white`, `glass-black`
- Bauhaus: `bauhaus-red`, `bauhaus-blue`, `bauhaus-yellow`
- Natural: `earth-brown`, `leaf-green`, `sky-blue`, `sand-beige`

**ユーティリティクラス:**

- `.glass`: Glassmorphism背景
- `.glass-dark`: ダークGlassmorphism
- `.neumorphism`: Neumorphismスタイル
- `.neumorphism-inset`: 内側Neumorphism
- `.text-neon`: ネオンテキストエフェクト
- `.text-brutal`: Brutalismテキスト
- `.text-retro`: レトロテキスト
- `.text-gradient`: グラデーションテキスト

**アニメーション:**

- `animate-glitch`: グリッチエフェクト
- `animate-pulse-neon`: ネオン点滅
- `animate-float`: フローティング
- `animate-gradient-shift`: グラデーション移動
- `animate-typing`: タイピングエフェクト

### 5.6 環境変数

```bash
# .env.example
NEXT_PUBLIC_APP_NAME=your-app-name
NODE_ENV=development

# オプション
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 6. ソースコード仕様

### 6.1 ルートレイアウト（src/app/layout.tsx）

```typescript
import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Feature App',
  description: 'Feature-based development template',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="font-rounded">{children}</body>
    </html>
  )
}
```

### 6.2 ホームページ（src/app/page.tsx）

```typescript
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 font-rounded">Next.js App Running</p>
    </main>
  )
}
```

### 6.3 エラー境界（src/components/ErrorBoundary.tsx）

フィーチャー間のエラー伝播を防ぐクラスコンポーネント。

**Props:**

- `children`: ReactNode
- `fallback?`: ReactNode（カスタムフォールバックUI）
- `featureName?`: string（エラー特定用）

**State:**

- `hasError`: boolean
- `error?`: Error

**機能:**

- エラー捕捉とログ出力
- 開発環境でのスタックトレース表示
- カスタマイズ可能なフォールバックUI

### 6.4 国際化フック（src/hooks/useI18n.ts）

**型定義:**

```typescript
type Locale = 'ja' | 'en'
```

**戻り値:**

- `locale`: Locale - 現在のロケール
- `locales`: Locale[] - 利用可能なロケール
- `setLocale`: (newLocale: Locale) => void
- `t`: (key: string) => string - 翻訳関数

**機能:**

- ブラウザ言語設定の自動検出
- localStorage永続化
- next-i18next拡張準備

### 6.5 無限ループ検出（src/hooks/useInfiniteLoopDetector.ts）

開発環境専用の無限ループ検出フック。

**オプション:**

```typescript
interface LoopDetectorOptions {
  name: string // 監視名
  threshold?: number // 警告閾値（デフォルト: 10）
  timeWindow?: number // 監視時間窓（デフォルト: 5000ms）
  customMessage?: string // カスタム警告メッセージ
}
```

**機能:**

- useEffect実行回数の監視
- 異常頻度の検出と警告
- デバッガー停止オプション
- `logExecutionStats()`でグローバル統計表示

### 6.6 キャッシュユーティリティ（src/utils/cache/）

**MemoryCacheクラス:**

```typescript
class MemoryCache<T> implements IMemoryCache<T> {
  get(key: string): T | undefined
  set(key: string, value: T, options?: CacheOptions): void
  has(key: string): boolean
  delete(key: string): boolean
  clear(): void
  getStats(): CacheStats
  deleteByTag(tag: string): number
  cleanup(): number
  size(): number
}
```

**キャッシュストラテジー:**

- `lru`: Least Recently Used
- `lfu`: Least Frequently Used
- `fifo`: First In First Out
- `ttl`: Time To Live

**プリセット:**

- `CachePresets.api`: API応答用（短TTL、LRU）
- `CachePresets.session`: セッション用（長TTL）
- `CachePresets.computation`: 計算結果用（TTLなし、LFU）
- `CachePresets.static`: 静的リソース用（大容量）
- `CachePresets.development`: 開発用（デバッグ有効）

### 6.7 エラーハンドリング（src/utils/error-handling/）

**構造化エラー型:**

```typescript
interface StructuredError {
  code?: string
  message: string
  userMessage?: string
  level: 'critical' | 'error' | 'warning' | 'info'
  category: 'network' | 'database' | 'auth' | 'validation' | 'business' | 'system' | 'unknown'
  context?: Record<string, unknown>
  stack?: string
  timestamp: Date
  originalError?: unknown
}
```

**主要関数:**

- `transformError(error, options)`: エラー変換
- `handleError(error, options)`: エラー処理とログ
- `tryCatch<T>(operation, options)`: Promise用ラッパー
- `aggregateErrors(errors)`: 複数エラー集約

**Supabase統合:**

- `isSupabaseError(error)`: Supabaseエラー判定
- `transformSupabaseError(error)`: Supabaseエラー変換
- `safeSupabaseOperation(operation)`: 安全な操作ラッパー

## 7. コマンド一覧

### 7.1 開発コマンド

| コマンド         | 説明                   |
| ---------------- | ---------------------- |
| `pnpm dev`       | 開発サーバー起動       |
| `pnpm build`     | プロダクションビルド   |
| `pnpm start`     | プロダクションサーバー |
| `pnpm lint`      | ESLintチェック         |
| `pnpm typecheck` | 型チェック             |

### 7.2 テストコマンド

| コマンド               | 説明               |
| ---------------------- | ------------------ |
| `pnpm test`            | ユニットテスト実行 |
| `pnpm test:unit`       | Vitestでテスト     |
| `pnpm test:e2e`        | Playwrightでテスト |
| `pnpm test:coverage`   | カバレッジ測定     |
| `pnpm test:regression` | 回帰テスト         |

### 7.3 品質管理コマンド

| コマンド                | 説明               |
| ----------------------- | ------------------ |
| `pnpm check`            | 包括的品質チェック |
| `pnpm check:boundaries` | 境界違反検出       |
| `pnpm fix:boundaries`   | 境界違反自動修正   |
| `pnpm validate:all`     | 全検証実行         |

### 7.4 フィーチャー開発コマンド

| コマンド                     | 説明                       |
| ---------------------------- | -------------------------- |
| `pnpm create:feature [name]` | フィーチャー作成           |
| `pnpm sc:start`              | セッション開始             |
| `pnpm sc:feature`            | フィーチャー作成ウィザード |
| `pnpm sc:boundaries`         | 境界チェック               |
| `pnpm sc:validate`           | 包括的検証                 |

## 8. 開発ワークフロー

### 8.1 新機能開発フロー

```bash
# 1. セッション開始
pnpm sc:start

# 2. フィーチャー作成
pnpm create:feature user-profile

# 3. 実装（src/features/user-profile/内で作業）

# 4. 境界チェック
pnpm check:boundaries

# 5. テスト
pnpm test

# 6. 検証
pnpm validate:all

# 7. コミット
git add .
git commit -m "feat(user-profile): ユーザープロフィール機能を追加"
```

### 8.2 バグ修正フロー

```bash
# 1. 回帰テスト作成（必須）
# tests/regression/YYYY-MM-DD-NNN-description.test.ts

# 2. テスト失敗確認
pnpm test:regression

# 3. 修正実装

# 4. テスト成功確認
pnpm test:regression

# 5. 全体検証
pnpm validate:all
```

## 9. Git Hooks

### 9.1 pre-commit

- 設定ファイル整合性チェック
- 単一フィーチャーチェック（複数フィーチャー同時コミット防止）
- 境界違反チェック
- ESLint + TypeScript チェック
- ユニットテスト実行

### 9.2 commit-msg

- コミットメッセージ形式検証
- 形式: `type(scope): description`
- 許可されるtype: feat, fix, docs, style, refactor, test, chore

## 10. Claude Code通知システム

### 10.1 概要

Claude Codeがタスク完了時または承認待ち時に、Slack/macOS通知を送信するシステム。

### 10.2 アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│ Claude Code                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Hooks System                                             │ │
│ │ ├─ Stop Event      → タスク完了時に発火                  │ │
│ │ └─ Notification Event → 承認待ち/60秒アイドル時に発火   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│ ~/.claude/slack-notify.sh (通知スクリプト)                   │
└─────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌────────────┐      ┌────────────┐      ┌────────────┐
   │ macOS Sound│      │ macOS      │      │ Slack      │
   │ (afplay)   │      │ Notification│     │ Webhook    │
   └────────────┘      └────────────┘      └────────────┘
```

### 10.3 設定ファイル

#### 10.3.1 グローバル設定（~/.claude/settings.json）

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/[username]/.claude/slack-notify.sh"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/[username]/.claude/slack-notify.sh"
          }
        ]
      }
    ]
  }
}
```

#### 10.3.2 通知スクリプト（~/.claude/slack-notify.sh）

```bash
#!/bin/bash
# Claude Code Notification Script

WEBHOOK_URL="your-slack-webhook-url"  # Slack Webhook URL（オプション）

# プロジェクト名を取得
PROJECT_NAME=$(basename "$(pwd)")

# メッセージ作成
MESSAGE="Claude Code is waiting in *${PROJECT_NAME}*"

# 1. サウンド再生（macOS）
if [[ "$OSTYPE" == "darwin"* ]]; then
  afplay /System/Library/Sounds/Glass.aiff &
fi

# 2. macOS通知
if [[ "$OSTYPE" == "darwin"* ]]; then
  osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\" sound name \"Glass\""
fi

# 3. Slack通知（設定時のみ）
if [ -n "$WEBHOOK_URL" ]; then
  curl -s -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$MESSAGE\"}" > /dev/null 2>&1
fi
```

### 10.4 Hooks イベント仕様

| イベント         | マッチャー               | 発火タイミング               |
| ---------------- | ------------------------ | ---------------------------- |
| **Stop**         | `""` (空文字 = 全マッチ) | Claude Codeタスク完了時      |
| **Notification** | `permission_prompt`      | 承認待ち（ツール使用許可等） |
| **Notification** | `idle_prompt`            | 60秒間アイドル状態継続時     |

### 10.5 セットアップ方法

#### 自動セットアップ（推奨）

```bash
# テンプレートクローン後に実行
pnpm setup:sc

# 対話プロンプト:
# 1. 「通知を設定しますか？ (y/N):」→ y
# 2. 「Webhook URL:」→ Slack Webhook URLを入力（空欄可）
```

#### 手動セットアップ

```bash
# 1. 通知スクリプト作成
mkdir -p ~/.claude
cat > ~/.claude/slack-notify.sh << 'EOF'
#!/bin/bash
PROJECT_NAME=$(basename "$(pwd)")
MESSAGE="Claude Code is waiting in *${PROJECT_NAME}*"
afplay /System/Library/Sounds/Glass.aiff &
osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\" sound name \"Glass\""
EOF
chmod +x ~/.claude/slack-notify.sh

# 2. settings.jsonにhooks追加（手動編集）
```

### 10.6 Slack Webhook設定手順

1. https://api.slack.com/apps にアクセス
2. 「Create New App」→「From scratch」
3. アプリ名とワークスペースを選択
4. 左メニュー「Incoming Webhooks」をクリック
5. 「Activate Incoming Webhooks」をON
6. 「Add New Webhook to Workspace」をクリック
7. 通知先チャンネルを選択
8. 生成されたWebhook URLをコピー

### 10.7 トラブルシューティング

| 問題                      | 原因                                               | 解決策                                   |
| ------------------------- | -------------------------------------------------- | ---------------------------------------- |
| 通知が来ない              | プロジェクトにsettings.local.jsonがありhooksがない | プロジェクト設定にもhooksを追加          |
| Slackのみ来ない           | Webhook URLが未設定または無効                      | URLを確認して再設定                      |
| 音が鳴らない              | macOS以外のOS                                      | Linuxの場合は`paplay`等に変更            |
| Cursor/VSCodeで動作しない | 既知のバグ（Issue #11156）                         | Stopフックは動作、Notificationは修正待ち |

### 10.8 プロジェクト固有設定

プロジェクトに`.claude/settings.local.json`がある場合、hooksを含める必要があります：

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/[username]/.claude/slack-notify.sh"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/[username]/.claude/slack-notify.sh"
          }
        ]
      }
    ]
  },
  "permissions": {
    // 既存の権限設定
  }
}
```

## 11. 前提条件

### 11.1 必須

- Node.js >= 20.19.0
- pnpm >= 8.0.0
- Git

### 10.2 推奨（フル機能使用時）

- Claude Code CLI
- SuperClaude v4.0.8
- MCPサーバー
  - Serena（セマンティック検索）
  - Context7（ドキュメント参照）
  - Sequential-thinking（構造化分析）
  - Morphllm（高速編集）
  - Playwright（E2Eテスト）

## 12. セットアップ手順

```bash
# 1. リポジトリクローン
git clone [repository-url] my-app
cd my-app

# 2. 依存関係インストール
pnpm install

# 3. 環境変数設定
cp .env.example .env.local
# .env.localを編集

# 4. 開発サーバー起動
pnpm dev

# ブラウザで http://localhost:3000 を開く
```

## 13. デプロイ

### 13.1 Vercel（推奨）

```bash
# Vercel CLIでデプロイ
vercel

# または GitHub連携で自動デプロイ
```

### 13.2 ビルド設定

| 設定             | 値             |
| ---------------- | -------------- |
| Build Command    | `pnpm build`   |
| Output Directory | `.next`        |
| Install Command  | `pnpm install` |
| Node.js Version  | 20.x           |

## 14. パフォーマンス指標

| 指標          | 目標値  | 現在値  |
| ------------- | ------- | ------- |
| First Load JS | < 150KB | 102KB   |
| ビルド時間    | < 5秒   | ~2秒    |
| 境界チェック  | < 500ms | < 100ms |
| テスト実行    | < 10秒  | ~1秒    |

## 15. 品質基準

### 15.1 TypeScript品質（97%モード）

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

### 15.2 テストカバレッジ

- グローバル: 90%以上
- フィーチャー単位: 95%以上

### 15.3 コード品質

- ESLint 9 flat config
- Prettier統合
- 境界違反ゼロトレランス

## 16. Hi & Low ゲーム機能仕様

### 16.1 フィーチャー構造

```
src/features/game/
├── components/
│   ├── Card.tsx           # トランプカード表示
│   ├── GameBoard.tsx      # ゲームボード（メインUI）
│   └── Ranking.tsx        # ランキング表示
├── constants/
│   └── index.ts           # 定数定義
├── hooks/
│   ├── useGame.ts         # ゲームロジック
│   └── useSecretGesture.ts # シークレットジェスチャー
├── types/
│   └── index.ts           # 型定義
└── index.ts               # 公開API
```

**公開API（src/features/game/index.ts）:**

```typescript
'use client'

// コンポーネント（公開）- ページから使用するため必要
export { GameBoard } from './components/GameBoard'

// 型定義（必要な型のみ公開）
export type { RankingEntry } from './types'
```

- `'use client'` ディレクティブ必須（GameBoardがクライアントコンポーネントのため）
- GameBoardのみnamed export（他のコンポーネント・フック・定数は非公開）
- RankingEntry型のみ型エクスポート（テスト用途）

### 16.2 型定義（src/features/game/types/index.ts）

```typescript
// スート（マーク）
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

// カード値（1-13: A-K）
type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

// カード
interface Card {
  readonly suit: Suit
  readonly value: CardValue
}

// プレイヤーの予想
type Guess = 'high' | 'low'

// ゲーム状態
type GameState = 'playing' | 'won' | 'lost' | 'draw' | 'gameover'

// ゲーム結果（将来のAPI拡張用。v1.0.0では未使用）
interface GameResult {
  readonly state: GameState
  readonly currentCard: Card
  readonly nextCard: Card | null
  readonly streak: number
  readonly highScore: number
}

// ランキングエントリ
interface RankingEntry {
  readonly rank: number
  readonly name: string
  readonly score: number
}
```

### 16.3 定数定義（src/features/game/constants/index.ts）

```typescript
// スート一覧
const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']

// スート絵文字
const SUIT_EMOJI: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

// スート色（Tailwind CSS）
const SUIT_COLOR: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
}

// カード値表示
const VALUE_DISPLAY: Record<CardValue, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
}

// ランキングデータ（固定）
const RANKING_DATA: readonly RankingEntry[] = [
  { rank: 1, name: 'RIKI', score: 47 },
  { rank: 2, name: 'Boo', score: 40 },
  { rank: 3, name: 'Itusuki', score: 39 },
  { rank: 4, name: 'MAIKO', score: 33 },
  { rank: 5, name: 'DAI', score: 31 },
]

// 初期コイン数
const INITIAL_COINS = 10

// アニメーション遅延（ミリ秒）
const ANIMATION_DELAY = {
  REVEAL: 500, // カード判定までの遅延
  NEXT_ROUND: 1000, // 次のラウンドへの遷移
}

// ローカルストレージキー
const STORAGE_KEY = {
  HIGH_SCORE: 'hi-and-low-high-score',
  COINS: 'hi-and-low-coins',
}

// トースト通知設定
const TOAST_CONFIG = {
  ENTER_DELAY: 50, // アニメーション開始までの遅延（ms）
  DISPLAY_DURATION: 3000, // 表示時間（ms）
  HIDE_DELAY: 3500, // 非表示までの総時間（ms）
}
```

### 16.4 ゲームロジック（src/features/game/hooks/useGame.ts）

#### 状態管理

| 状態          | 型           | 初期値           | 説明                   |
| ------------- | ------------ | ---------------- | ---------------------- |
| currentCard   | Card \| null | null（後で設定） | 現在のカード           |
| nextCard      | Card \| null | null             | 次のカード             |
| gameState     | GameState    | 'playing'        | ゲーム状態             |
| streak        | number       | 0                | 連勝数                 |
| highScore     | number       | localStorage     | ハイスコア             |
| coins         | number       | localStorage/10  | 所持コイン             |
| isRevealing   | boolean      | false            | カード判定中フラグ     |
| isInitialized | boolean      | false            | クライアント初期化済み |

#### 主要関数

**makeGuess(guess: Guess): void**

- ガード条件: currentCard===null, gameState!=='playing', isRevealing, coins<=0
- 1コイン消費
- 新しいカードを生成してnextCardに設定
- isRevealingをtrueに設定
- ANIMATION_DELAY.REVEAL（500ms）後に判定実行:

```typescript
const isDraw = newCard.value === currentCard.value
const isWin =
  (guess === 'high' && newCard.value > currentCard.value) ||
  (guess === 'low' && newCard.value < currentCard.value)
```

**判定結果と処理:**

| 結果           | 条件                  | コイン変動    | gameState  | 連勝        | 次ラウンド         |
| -------------- | --------------------- | ------------- | ---------- | ----------- | ------------------ |
| ドロー         | 同じ値                | +1（返却）    | 'draw'     | 維持        | 1000ms後に自動遷移 |
| 勝利           | 予想と一致            | +streak+1     | 'won'      | +1          | 1000ms後に自動遷移 |
| 敗北           | 予想と不一致、coins>0 | 0（消費済み） | 'lost'     | 0にリセット | ボタンで手動遷移   |
| ゲームオーバー | 予想と不一致、coins=0 | 0             | 'gameover' | 0にリセット | fullResetで再開    |

**resetGame(): void**

- clearAllTimers → generateRandomCard → 状態リセット（コインは維持）

**fullReset(): void**

- resetGameと同じ + コインをINITIAL_COINS(10)にリセット + localStorage更新

#### SSR対応（Hydration Mismatch防止）

```typescript
// クライアント側でのみカード生成
useEffect(() => {
  setCurrentCard(generateRandomCard())
  setHighScore(safeStorage.get(STORAGE_KEY.HIGH_SCORE, 0))
  setCoins(safeStorage.get(STORAGE_KEY.COINS, INITIAL_COINS))
  setIsInitialized(true)
}, [])
```

#### 安全なlocalStorage操作

```typescript
const safeStorage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue
    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return defaultValue
      const parsed = JSON.parse(stored) as unknown
      // 型チェック: パース結果がデフォルト値と同じ型の場合のみ返す
      return typeof parsed === typeof defaultValue ? (parsed as T) : defaultValue
    } catch {
      // localStorage無効時やパースエラー時はデフォルト値を返す
      return defaultValue
    }
  },
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Quota超過時等は静かに失敗（ゲームの続行を優先）
    }
  },
}
```

#### メモリリーク防止

```typescript
// タイマーRef管理
const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
const isMountedRef = useRef(true)

// クリーンアップ
useEffect(() => {
  isMountedRef.current = true
  return () => {
    isMountedRef.current = false
    clearAllTimers()
  }
}, [])
```

#### 戻り値（useMemoでメモ化）

```typescript
return useMemo(
  () => ({
    currentCard, // Card | null - 現在のカード
    nextCard, // Card | null - 次のカード
    gameState, // GameState - ゲーム状態
    streak, // number - 連勝数
    highScore, // number - ハイスコア
    coins, // number - 所持コイン
    isRevealing, // boolean - カード判定中フラグ
    isInitialized, // boolean - クライアント初期化済み
    makeGuess, // (guess: Guess) => void - 予想を行う
    resetGame, // () => void - 敗北後に続ける
    fullReset, // () => void - コインも初期化してリセット
  }),
  [
    /* 全依存配列 */
  ]
)
```

#### ランダムカード生成

```typescript
function generateRandomCard(): Card {
  // Math.random()を使用（ゲーム用途のため暗号学的安全性不要）
  // eslint-disable-next-line sonarjs/pseudo-random
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)] as Suit
  const value = (Math.floor(Math.random() * 13) + 1) as CardValue
  return { suit, value }
}
```

#### 内部ユーティリティ関数

| 関数名                | 引数 | 説明                                     |
| --------------------- | ---- | ---------------------------------------- |
| generateRandomCard    | なし | ランダムなCardを生成                     |
| clearAllTimers        | なし | revealTimer/transitionTimerを全クリア    |
| transitionToNextRound | Card | 1000ms後に次ラウンドへ遷移               |
| initializeGameState   | なし | タイマークリア+新カード生成+状態リセット |

### 16.5 コンポーネント仕様

#### Card.tsx - トランプカード

**Props:**

```typescript
interface CardProps {
  readonly card: Card | null
  readonly isHidden?: boolean // 裏面表示
  readonly className?: string
}
```

**レンダリング:**

- 裏面（`isHidden=true` または `card=null`）: 青いグラデーション背景（from-blue-600 to-blue-800） + 🃏絵文字
- 表面: 白背景、3つのエリアに分割:
  - 左上: 値（A-K） + スート絵文字（縦並び）
  - 中央: スート絵文字（大きめ text-3xl）
  - 右下: 値 + スート絵文字（`rotate-180`で逆さま表示）
- サイズ: w-24 h-36（96px x 144px）
- スタイル: rounded-lg, border-2 border-gray-300, shadow-lg

**カード表示エリア（GameBoard内）:**

```typescript
<Card card={currentCard} isHidden={currentCard === null} />
<span>→</span>
<Card card={nextCard} isHidden={!isRevealing && nextCard === null} />
```

- 左カード: 現在のカード（常に表）
- 右カード: isRevealing時のみ表示、それ以外は裏面

#### GameBoard.tsx - ゲームボード

**構成（上から順に）:**

1. **ヘッダー** - 🃏アイコン（シークレットジェスチャー対象）+ "Hi & Low" テキスト
2. **トースト通知** - 初回アクセス時、右からスライドイン（fixed overlay）
3. **スコア表示** - 3つのスコアを横並び（gap-6）
   - コイン: 🪙 {coins}（text-yellow-300）
   - 連勝: {streak}（text-white）
   - ハイスコア: {highScore}（text-yellow-400）
4. **カード表示エリア** - 2枚のカード + 矢印（→）
5. **操作ボタンエリア** - min-h-[72px] で高さ固定（状態遷移時のレイアウトジャンプ防止）
6. **ランキング** - max-w-sm で中央配置

**SSR/ローディング状態:**

`isInitialized === false` の間は専用ローディング画面を表示（Hydration mismatch回避）:

```typescript
if (!isInitialized) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center
                    bg-gradient-to-b from-green-800 to-green-900">
      <span className="text-4xl">🃏</span>
      <p className="mt-4 text-xl text-white">Loading...</p>
    </div>
  )
}
```

**トースト通知仕様:**

```typescript
// 状態: 'hidden' | 'entering' | 'visible' | 'exiting'
// TOAST_CONFIG.ENTER_DELAY(50ms)後に 'visible' へ遷移
// TOAST_CONFIG.DISPLAY_DURATION(3000ms)後に 'exiting' へ遷移
// TOAST_CONFIG.HIDE_DELAY(3500ms)後に 'hidden' へ遷移
// アニメーション: translateX で右端からスライドイン/アウト（500ms ease-out）
// 位置: fixed right-4 top-4 z-50
// スタイル: bg-yellow-500, font-bold, text-white, rounded-lg, shadow-lg
// メッセージ: "通知：🔥 きょうもハイスコアを更新しよう！"
// トリガー: isInitialized が true になった時（useEffect）
```

**ボタン状態（GameButtons内部コンポーネント）:**

GameBoard内部に定義された`GameButtons`コンポーネントが状態に応じたUIを描画する。

```typescript
function GameButtons({
  gameState, isRevealing, coins, streak,
  onHigh, onLow, onReset, onFullReset,
}: { ... }): React.JSX.Element
```

| gameState | 条件                      | 表示内容                                          | スタイル                          |
| --------- | ------------------------- | ------------------------------------------------- | --------------------------------- |
| gameover  | -                         | "💀 ゲームオーバー" + "🔄 最初からやり直す"ボタン | bg-purple-500                     |
| playing   | !isRevealing && coins > 0 | "⬆️ HIGH" / "⬇️ LOW" ボタン                       | bg-red-500 / bg-blue-500          |
| won       | -                         | "🎉 正解！ +{streak}コイン"                       | bg-yellow-500/20, text-yellow-400 |
| draw      | -                         | "🤝 ドロー！コイン返却"                           | bg-blue-500/20, text-blue-300     |
| lost      | -                         | "💥 続ける"ボタン                                 | bg-yellow-500                     |
| (default) | isRevealing等             | "判定中..."                                       | text-white                        |

**判定優先順序:** gameover → playing → won → draw → lost → default

#### Ranking.tsx - ランキング表示

**Props:**

```typescript
interface RankingProps {
  readonly entries: readonly RankingEntry[]
  readonly className?: string
  readonly isSecretActivated?: boolean // 微妙な色変化
}
```

**ランクアイコン（getRankIcon関数）:**

```typescript
function getRankIcon(rank: number): string {
  if (rank <= 0) return '-'
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return String(rank)
}
```

**レイアウト:**

```
┌─────────────────────────────────────┐
│ 🏆 ランキング（text-lg, text-gray-800）│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🥇 RIKI                     47 │ │  ← bg-white, rounded-md, shadow-sm
│ │ 🥈 Boo                      40 │ │     名前: text-gray-700
│ │ 🥉 Itusuki                  39 │ │     スコア: text-blue-600, font-bold
│ │  4 MAIKO                    33 │ │
│ │  5 DAI                      31 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
背景: bg-gray-100（通常）/ bg-blue-100（シークレット活性化時）
遷移: transition-colors duration-300
```

### 16.6 UI/UXデザイン

#### カラーパレット

| 要素             | 色                                   |
| ---------------- | ------------------------------------ |
| 背景             | green-800 → green-900 グラデーション |
| ヘッダーテキスト | white                                |
| コイン           | yellow-300                           |
| ハイスコア       | yellow-400                           |
| 連勝             | white                                |
| HIGHボタン       | red-500                              |
| LOWボタン        | blue-500                             |
| 続けるボタン     | yellow-500                           |
| リセットボタン   | purple-500                           |
| トースト         | yellow-500                           |
| ランキング背景   | gray-100/gray-50                     |

#### アニメーション

| 要素           | アニメーション                        |
| -------------- | ------------------------------------- |
| ボタンホバー   | scale-95 + shadow-xl                  |
| トースト       | translateX スライド（500ms ease-out） |
| 状態メッセージ | 背景色 + 透明度変化                   |

### 16.7 データ永続化

**localStorage キー:**

- `hi-and-low-high-score`: ハイスコア（number）
- `hi-and-low-coins`: 所持コイン（number）

**初期化:**

- ハイスコア: 0
- コイン: 10

### 16.8 ページ構成（src/app/page.tsx）

```typescript
export default function Home(): React.JSX.Element {
  return (
    <FeatureErrorBoundary featureName="game">
      <GameBoard />
    </FeatureErrorBoundary>
  )
}
```

### 16.9 回帰テスト

| ID             | ファイル                   | テスト内容                                              |
| -------------- | -------------------------- | ------------------------------------------------------- |
| 2025-02-04-001 | game-edge-cases.test.ts    | localStorage エラー、コイン計算、ランキングエッジケース |
| 2025-02-04-002 | hydration-mismatch.test.ts | SSR/Hydration対策パターン                               |
| 2025-02-04-003 | timer-cleanup.test.ts      | タイマークリーンアップ、isMountedRef                    |
| 2025-02-06-001 | secret-gesture.test.ts     | シークレットジェスチャーのタイマー管理・状態追跡        |

## 17. シークレットジェスチャー機能仕様

### 17.1 概要

ヘッダーの🃏アイコンに隠されたシークレットログイン機能。特定のジェスチャーシーケンスを完了すると、メッセンジャーページ（`/m`）に遷移する。

**秘匿性要件:**

- ポインタースタイル変更なし
- 長押し中の視覚変化なし
- エラー時は静かにリセット（ユーザーへの通知なし）
- 唯一の視覚フィードバック: ランキング背景色の微妙な変化

### 17.2 ジェスチャーシーケンス

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: 長押し（3秒）                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 🃏アイコンを3秒間長押し                                       │
│ → isActivated = true                                         │
│ → ランキング背景が bg-gray-100 → bg-blue-100 に変化          │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    タップ受付ウィンドウ開始（2秒間）
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: 連続タップ（1秒以内に3回）                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 🃏アイコンを1秒以内に3回タップ                                │
│ → router.push('/m') で遷移                                   │
└─────────────────────────────────────────────────────────────┘
```

### 17.3 タイミング設定（SECRET_CONFIG）

| 設定                | 値     | 説明                          |
| ------------------- | ------ | ----------------------------- |
| LONG_PRESS_DURATION | 3000ms | 長押し判定時間                |
| TAP_WINDOW          | 2000ms | 長押し完了後のタップ受付時間  |
| TAP_TIMEOUT         | 1000ms | 3回タップを完了すべき制限時間 |
| REQUIRED_TAPS       | 3      | 必要なタップ回数              |
| DESTINATION         | '/m'   | 遷移先パス                    |

### 17.4 状態遷移図

```
                    ┌──────────────┐
                    │   初期状態    │
                    │isActivated:F │
                    └──────┬───────┘
                           │
                    onPressStart()
                           │
                    ┌──────▼───────┐
                    │  長押し中     │
                    │ タイマー開始  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         3秒前に離す   3秒経過      アンマウント
              │            │            │
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │リセット  │  │活性化    │  │クリーン  │
        │(静かに) │  │isActiv:T│  │アップ   │
        └─────────┘  └────┬────┘  └─────────┘
                          │
                   タップ受付開始
                   (2秒ウィンドウ)
                          │
              ┌───────────┼───────────┐
              │           │           │
         2秒タイムアウト  タップ検出   1秒以内に3回
              │           │           │
              ▼           ▼           ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │リセット  │  │カウント  │  │ 遷移    │
        │(静かに) │  │ +1      │  │ → /m   │
        └─────────┘  └─────────┘  └─────────┘
```

### 17.5 フック実装（useSecretGesture.ts）

#### 戻り値インターフェース

```typescript
interface SecretGestureState {
  /** ランキング色変化用フラグ */
  isActivated: boolean
  /** 長押し開始ハンドラー（onPointerDown用） */
  onPressStart: () => void
  /** 長押し終了ハンドラー（onPointerUp/Leave/Cancel用） */
  onPressEnd: () => void
  /** タップハンドラー（onClick用） */
  onTap: () => void
}
```

#### 内部状態（Ref）

| Ref                | 型                            | 用途                          |
| ------------------ | ----------------------------- | ----------------------------- |
| isActivatedRef     | boolean                       | クロージャー問題回避          |
| isMountedRef       | boolean                       | アンマウント後のstate更新防止 |
| longPressTimerRef  | ReturnType<typeof setTimeout> | 長押しタイマー                |
| tapWindowTimerRef  | ReturnType<typeof setTimeout> | タップ受付ウィンドウタイマー  |
| tapTimeoutTimerRef | ReturnType<typeof setTimeout> | タップ完了タイムアウト        |
| tapCountRef        | number                        | タップカウント                |
| firstTapTimeRef    | number \| null                | 最初のタップ時刻              |
| justActivatedRef   | boolean                       | 長押し完了直後のclick無視用   |

#### 重要な実装パターン

**1. クロージャー問題の回避**

```typescript
// 問題: setTimeoutのコールバック内でstateが古い値を参照
// 解決: refで最新値を追跡
const isActivatedRef = useRef(false)
isActivatedRef.current = isActivated

// コールバック内では isActivatedRef.current を参照
```

**2. 長押し完了後のclick誤検知防止**

```typescript
// 問題: 長押し完了時にonPointerUpとonClickが両方発火
// 解決: justActivatedRefフラグで最初のclickを無視
const justActivatedRef = useRef(false)

// 長押し完了時
justActivatedRef.current = true
setIsActivated(true)

// onTap内
if (justActivatedRef.current) {
  justActivatedRef.current = false
  return // 長押し終了のclickを無視
}
```

**3. 重複タイマー防止**

```typescript
const onPressStart = useCallback(() => {
  // 前のタイマーをクリア（重複防止）
  if (longPressTimerRef.current !== null) {
    clearTimeout(longPressTimerRef.current)
  }
  // 新しいタイマー開始
  longPressTimerRef.current = setTimeout(...)
}, [])
```

**4. メモリリーク防止**

```typescript
useEffect(() => {
  isMountedRef.current = true
  return () => {
    isMountedRef.current = false
    clearAllTimers()
  }
}, [])
```

### 17.6 イベントハンドリング（GameBoard.tsx）

```typescript
<span
  className="select-none text-3xl"
  style={{ touchAction: 'none' }}  // タッチスクロール防止
  onPointerDown={(e) => {
    e.preventDefault()  // デフォルト動作防止
    onPressStart()
  }}
  onPointerUp={onPressEnd}
  onPointerLeave={onPressEnd}   // 領域外に出た場合
  onPointerCancel={onPressEnd}  // システムキャンセル
  onClick={(e) => {
    e.preventDefault()
    onTap()
  }}
  role="presentation"  // アクセシビリティ
>
  🃏
</span>
```

**PointerEvents API採用理由:**

- マウス・タッチ・ペン入力を統一的に処理
- touch-action: noneでスクロール競合を防止
- クロスブラウザ対応

### 17.7 視覚フィードバック（Ranking.tsx）

```typescript
<div
  className={`rounded-lg p-4 transition-colors duration-300 ${
    isSecretActivated ? 'bg-blue-100' : 'bg-gray-100'
  } ${className}`}
>
```

| 状態           | 背景色      | 意味                         |
| -------------- | ----------- | ---------------------------- |
| 通常           | bg-gray-100 | デフォルト状態               |
| アクティベート | bg-blue-100 | タップ受付中（秘匿的な変化） |

### 17.8 遷移先ページ（src/app/m/page.tsx）

```typescript
export default function MessengerPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-800 to-blue-900 px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="...">← 戻る</Link>
        <h1 className="text-2xl font-bold text-white">フレンド</h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="text-6xl">💬</div>
        <p className="mt-4 text-xl text-white">メッセンジャー</p>
        <p className="mt-2 text-sm text-blue-200">（実装予定）</p>
      </div>
    </div>
  )
}
```

### 17.9 エラーハンドリング

| シナリオ                     | 挙動                   |
| ---------------------------- | ---------------------- |
| 長押し中に指を離す           | 静かにリセット         |
| タップ受付時間（2秒）超過    | 静かにリセット         |
| 3回タップ制限時間（1秒）超過 | 静かにリセット         |
| コンポーネントアンマウント   | 全タイマークリア       |
| router.push失敗              | Next.jsの404ページ表示 |

### 17.10 テスト仕様

**回帰テスト: 2025-02-06-001-secret-gesture.test.ts**

```typescript
describe('Regression: シークレットジェスチャー', () => {
  // タイマー管理
  it('should have proper timer cleanup on unmount pattern')
  it('should prevent duplicate timers on rapid press')

  // クロージャー問題
  it('should track latest value with useRef pattern')

  // マウント状態追跡
  it('should prevent state update after unmount')

  // ジェスチャーフロー
  it('should complete gesture sequence: long press → activate → tap 3 times')
  it('should reset on tap timeout')
})
```

## 18. ゲーム機能ロックダウン仕様（v1.0.0）

### 18.1 概要

v1.0.0でゲーム機能の全ファイルを安定化し、3層の保護メカニズムで変更を防止する。

| 項目                     | 値                  |
| ------------------------ | ------------------- |
| **安定化バージョン**     | v1.0.0              |
| **安定化日**             | 2026-02-07          |
| **保護対象ファイル数**   | 11                  |
| **ロックダウンテスト数** | 65                  |
| **デプロイ先**           | Vercel (Production) |

### 18.2 3層保護アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Git Tag v1.0.0                                  │
│ → いつでも git checkout v1.0.0 で安定版に復元可能        │
├─────────────────────────────────────────────────────────┤
│ Layer 2a: パス保護（check-protected-features.js）        │
│ → .claude/protected-features.json で保護パスを定義       │
│ → コミット時に保護パス内のファイル変更を検出・ブロック   │
├─────────────────────────────────────────────────────────┤
│ Layer 2b: チェックサム保護（protect-game-checksums.js）   │
│ → 11ファイルのSHA256チェックサムを検証                    │
│ → 内容の改変を検出・ブロック                              │
├─────────────────────────────────────────────────────────┤
│ Layer 3: ロックダウンテスト（65テストケース）             │
│ → 定数値・API表面・ゲームロジックの変更を検出             │
│ → テスト失敗 = コミット不可（pre-commit hook）            │
└─────────────────────────────────────────────────────────┘
```

### 18.3 保護対象ファイル一覧

| ファイル                                      | 役割                     | SHA256保護 | パス保護 |
| --------------------------------------------- | ------------------------ | ---------- | -------- |
| `src/features/game/index.ts`                  | 公開API                  | Yes        | Yes      |
| `src/features/game/components/Card.tsx`       | カード表示               | Yes        | Yes      |
| `src/features/game/components/GameBoard.tsx`  | ゲームボード             | Yes        | Yes      |
| `src/features/game/components/Ranking.tsx`    | ランキング               | Yes        | Yes      |
| `src/features/game/hooks/useGame.ts`          | ゲームロジック           | Yes        | Yes      |
| `src/features/game/hooks/useSecretGesture.ts` | シークレットジェスチャー | Yes        | Yes      |
| `src/features/game/constants/index.ts`        | 定数定義                 | Yes        | Yes      |
| `src/features/game/types/index.ts`            | 型定義                   | Yes        | Yes      |
| `src/app/page.tsx`                            | ゲームエントリ           | Yes        | Yes      |
| `src/app/m/page.tsx`                          | メッセンジャー           | Yes        | Yes      |
| `src/components/ErrorBoundary.tsx`            | エラー境界               | Yes        | Yes      |

### 18.4 パス保護設定（.claude/protected-features.json）

```json
{
  "protectedFeatures": [
    {
      "name": "game",
      "description": "Hi & Low カードゲーム機能（v1.0.0で安定化済み）",
      "paths": [
        "src/features/game/",
        "src/app/page.tsx",
        "src/app/m/",
        "src/components/ErrorBoundary.tsx"
      ],
      "protection": "strict",
      "allowFlags": ["--allow-game-changes"]
    }
  ],
  "globalSettings": {
    "strictMode": true,
    "emergencyBypass": "--emergency-override"
  }
}
```

### 18.5 チェックサム保護スクリプト（scripts/protect-game-checksums.js）

**コマンド:**

| コマンド                   | 説明                           |
| -------------------------- | ------------------------------ |
| `pnpm protect:game`        | チェックサム検証実行           |
| `pnpm protect:game:init`   | チェックサム初期化             |
| `pnpm protect:game:update` | 意図的変更後のチェックサム更新 |
| `pnpm check:protected`     | パス保護チェック実行           |

**チェックサム保存先:** `scripts/.game-checksums.json`

**バイパス方法:**

| 方法                                              | 用途                           |
| ------------------------------------------------- | ------------------------------ |
| `ALLOW_GAME_CHANGES=1 git commit`                 | チェックサム保護のスキップ     |
| コミットメッセージに `--allow-game-changes`       | パス保護のスキップ             |
| コミットメッセージに `--emergency-override`       | 全保護のスキップ（緊急時のみ） |
| `node scripts/protect-game-checksums.js --update` | チェックサム再計算             |

### 18.6 pre-commitフック実行順序

```
1. protect-config.js              # 設定ファイル保護（既存）
2. check-protected-features.js    # パス保護（v1.0.0追加）
3. protect-game-checksums.js      # チェックサム保護（v1.0.0追加）
4. 単一フィーチャーチェック        # 複数フィーチャー同時コミット防止（既存）
5. check:boundaries               # 境界違反検出（既存）
6. lint-staged                    # ESLint + Prettier（既存）
7. test:unit                      # 全テスト実行（既存）
```

### 18.7 ロックダウンテスト仕様

#### 2026-02-07-001: 定数ロック（20テスト）

| テスト対象      | 検証内容                                               |
| --------------- | ------------------------------------------------------ |
| SUITS           | 4スートの順序と値                                      |
| SUIT_EMOJI      | 各スートの絵文字マッピング                             |
| SUIT_COLOR      | Tailwind CSSクラスマッピング                           |
| VALUE_DISPLAY   | A-K（13枚）の表示文字                                  |
| RANKING_DATA    | 5名のランキング（名前・スコア・順序）                  |
| INITIAL_COINS   | 初期値10                                               |
| ANIMATION_DELAY | REVEAL=500ms, NEXT_ROUND=1000ms                        |
| STORAGE_KEY     | HIGH_SCORE, COINS のキー文字列                         |
| TOAST_CONFIG    | ENTER_DELAY=50, DISPLAY_DURATION=3000, HIDE_DELAY=3500 |

#### 2026-02-07-002: API表面ロック（13テスト）

| テスト対象     | 検証内容                                               |
| -------------- | ------------------------------------------------------ |
| エクスポート   | GameBoardのみ（1つ）                                   |
| GameBoard      | 関数型コンポーネントであること                         |
| 内部漏洩防止   | useGame, useSecretGesture, Card, Ranking, 定数が非公開 |
| RankingEntry型 | rank, name, score の3プロパティ構造                    |

#### 2026-02-07-003: ゲームロジックロック（32テスト）

| テスト対象       | 検証内容                                                          |
| ---------------- | ----------------------------------------------------------------- |
| 勝敗判定         | HIGH/LOW予想と結果の組み合わせ（6パターン）                       |
| コイン計算       | 消費・獲得・返却・ゲームオーバー（9パターン）                     |
| 状態遷移         | won/lost/draw/gameover（4パターン）                               |
| カード型         | CardValue, Suit, Card, Guess, GameState の構造（5パターン）       |
| シークレット設定 | 3000ms長押し, 2000msタップ窓, 1000msタイムアウト, 3タップ, /m遷移 |
| ストレージ       | キー文字列の一致（2パターン）                                     |

### 18.8 意図的な変更手順

ゲーム機能を意図的に変更する場合の手順：

```bash
# 1. 変更を実施
# 2. チェックサムを更新
node scripts/protect-game-checksums.js --update

# 3. ロックダウンテストを更新（値が変わった場合）
# tests/regression/2026-02-07-*.test.ts を修正

# 4. パス保護をバイパスしてコミット
git commit -m "feat(game): 機能改善 --allow-game-changes"

# 5. タグを更新（必要に応じて）
git tag -a v1.1.0 -m "v1.1.0: ゲーム機能更新"
```

## 19. デプロイ情報

### 19.1 Vercel設定

| 項目                  | 値                      |
| --------------------- | ----------------------- |
| **プロジェクト名**    | hi-and-low-game         |
| **プラットフォーム**  | Vercel                  |
| **ビルドコマンド**    | `pnpm build`            |
| **出力ディレクトリ**  | `.next`                 |
| **Node.jsバージョン** | 20.x                    |
| **リージョン**        | iad1 (Washington, D.C.) |

### 19.2 ページ構成

| ルート                              | 種別    | 説明                                 |
| ----------------------------------- | ------- | ------------------------------------ |
| `/`                                 | Static  | ゲームメインページ                   |
| `/m`                                | Dynamic | トーク一覧（メッセンジャートップ）   |
| `/m/login`                          | Dynamic | ログインページ                       |
| `/m/signup`                         | Dynamic | サインアップページ                   |
| `/m/chat/[conversationId]`          | Dynamic | チャットページ                       |
| `/m/chat/[conversationId]/settings` | Dynamic | グループ設定ページ                   |
| `/m/friends`                        | Dynamic | フレンド一覧                         |
| `/m/friends/add`                    | Dynamic | フレンド追加（QRコード＋コード入力） |
| `/m/profile`                        | Dynamic | プロフィール・設定                   |
| `/m/search`                         | Dynamic | メッセージ検索                       |
| `/m/admin`                          | Dynamic | 管理パネル（admin限定）              |
| `/m/group/create`                   | Dynamic | グループ作成                         |
| `/m/group/invite/[code]`            | Dynamic | グループ招待リンク                   |
| `/m/add/[friendCode]`               | Dynamic | URL経由フレンド追加                  |
| `/_not-found`                       | Static  | 404ページ                            |

### 19.3 パフォーマンス

| 指標                   | 値                   |
| ---------------------- | -------------------- |
| First Load JS (shared) | 102 kB               |
| ビルド時間             | ~3.6秒（コンパイル） |
| 静的ページ生成         | 5ページ              |

## 20. メッセンジャー機能（LINE風チャットアプリ）

ゲームのシークレットジェスチャー（S17参照）経由でアクセス可能なLINE風メッセージングアプリ。
Supabaseをバックエンドとして使用し、リアルタイム通信・認証・ストレージを実装。

### 20.1 Supabaseプロジェクト

| 項目                   | 値                                            |
| ---------------------- | --------------------------------------------- |
| **プロジェクトID**     | `cyoitqodgybqybciokbx`                        |
| **リージョン**         | ap-northeast-1（東京）                        |
| **認証方式**           | Email/Password                                |
| **Realtime有効**       | messages, conversations, conversation_members |
| **ストレージバケット** | `message-images`                              |

### 20.2 データベーススキーマ

#### 20.2.1 profiles テーブル

| カラム         | 型          | デフォルト  | NOT NULL | 制約                            |
| -------------- | ----------- | ----------- | -------- | ------------------------------- |
| `id`           | uuid        | -           | YES      | PK, FK → auth.users(id) CASCADE |
| `display_name` | text        | -           | YES      | -                               |
| `avatar_text`  | text        | `'?'`       | YES      | -                               |
| `avatar_color` | text        | `'#3B82F6'` | YES      | -                               |
| `friend_code`  | text        | -           | YES      | UNIQUE                          |
| `is_admin`     | boolean     | `false`     | YES      | -                               |
| `created_at`   | timestamptz | `now()`     | YES      | -                               |
| `updated_at`   | timestamptz | `now()`     | YES      | トリガーで自動更新              |

**インデックス**: `idx_profiles_friend_code(friend_code)`

#### 20.2.2 friendships テーブル

| カラム       | 型          | デフォルト          | NOT NULL | 制約                      |
| ------------ | ----------- | ------------------- | -------- | ------------------------- |
| `id`         | uuid        | `gen_random_uuid()` | YES      | PK                        |
| `user_id`    | uuid        | -                   | YES      | FK → profiles(id) CASCADE |
| `friend_id`  | uuid        | -                   | YES      | FK → profiles(id) CASCADE |
| `created_at` | timestamptz | `now()`             | YES      | -                         |

**制約**: `UNIQUE(user_id, friend_id)`, `CHECK(user_id != friend_id)`
**インデックス**: `idx_friendships_user_id`, `idx_friendships_friend_id`
**データモデル**: 双方向（A→B追加時にB→Aも同時作成）

#### 20.2.3 conversations テーブル

| カラム        | 型          | デフォルト          | NOT NULL | 制約                           |
| ------------- | ----------- | ------------------- | -------- | ------------------------------ |
| `id`          | uuid        | `gen_random_uuid()` | YES      | PK                             |
| `type`        | text        | -                   | YES      | CHECK: `'direct'` or `'group'` |
| `name`        | text        | -                   | NO       | グループ名（direct時はNULL）   |
| `icon_text`   | text        | -                   | NO       | グループアイコン文字           |
| `icon_color`  | text        | -                   | NO       | グループアイコン色             |
| `invite_code` | text        | -                   | NO       | UNIQUE, グループ招待コード     |
| `created_by`  | uuid        | -                   | NO       | FK → profiles(id) SET NULL     |
| `created_at`  | timestamptz | `now()`             | YES      | -                              |
| `updated_at`  | timestamptz | `now()`             | YES      | トリガーで自動更新             |

**インデックス**: `idx_conversations_invite_code`, `idx_conversations_type`

#### 20.2.4 conversation_members テーブル

| カラム            | 型          | デフォルト          | NOT NULL | 制約                           |
| ----------------- | ----------- | ------------------- | -------- | ------------------------------ |
| `id`              | uuid        | `gen_random_uuid()` | YES      | PK                             |
| `conversation_id` | uuid        | -                   | YES      | FK → conversations(id) CASCADE |
| `user_id`         | uuid        | -                   | YES      | FK → profiles(id) CASCADE      |
| `last_read_at`    | timestamptz | `now()`             | YES      | 既読管理用                     |
| `joined_at`       | timestamptz | `now()`             | YES      | -                              |

**制約**: `UNIQUE(conversation_id, user_id)`
**インデックス**: `idx_conversation_members_conversation`, `idx_conversation_members_user`

#### 20.2.5 messages テーブル

| カラム            | 型          | デフォルト          | NOT NULL | 制約                           |
| ----------------- | ----------- | ------------------- | -------- | ------------------------------ |
| `id`              | uuid        | `gen_random_uuid()` | YES      | PK                             |
| `conversation_id` | uuid        | -                   | YES      | FK → conversations(id) CASCADE |
| `sender_id`       | uuid        | -                   | YES      | FK → profiles(id) CASCADE      |
| `content`         | text        | -                   | NO       | テキスト本文                   |
| `image_url`       | text        | -                   | NO       | 画像URL                        |
| `reply_to_id`     | uuid        | -                   | NO       | FK → messages(id) SET NULL     |
| `is_deleted`      | boolean     | `false`             | YES      | ソフトデリート                 |
| `created_at`      | timestamptz | `now()`             | YES      | -                              |

**制約**: `CHECK(content IS NOT NULL OR image_url IS NOT NULL OR is_deleted = TRUE)`
**インデックス**: `idx_messages_conversation(conversation_id, created_at DESC)`, `idx_messages_sender`, `idx_messages_reply_to WHERE reply_to_id IS NOT NULL`

#### 20.2.6 message_reactions テーブル

| カラム       | 型          | デフォルト          | NOT NULL | 制約                      |
| ------------ | ----------- | ------------------- | -------- | ------------------------- |
| `id`         | uuid        | `gen_random_uuid()` | YES      | PK                        |
| `message_id` | uuid        | -                   | YES      | FK → messages(id) CASCADE |
| `user_id`    | uuid        | -                   | YES      | FK → profiles(id) CASCADE |
| `emoji`      | text        | -                   | YES      | CHECK: `'👍'` or `'✅'`   |
| `created_at` | timestamptz | `now()`             | YES      | -                         |

**制約**: `UNIQUE(message_id, user_id, emoji)`
**インデックス**: `idx_message_reactions_message`

### 20.3 データベース関数

#### `generate_friend_code() → text`

8文字のランダム文字列を生成。紛らわしい文字（`I`,`l`,`O`,`0`,`1`）を除外。

```sql
chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
```

#### `handle_new_user() → trigger` (SECURITY DEFINER)

`auth.users` INSERT時に自動実行。ユニークなフレンドコードを生成し、profilesに新規レコードを作成。

- `display_name`: `raw_user_meta_data->>'display_name'` またはデフォルト`'ユーザー'`
- フレンドコードはLOOPでユニーク性を保証

#### `handle_updated_at() → trigger`

UPDATE時に`updated_at`を`now()`に更新。profiles, conversationsに適用。

#### `is_conversation_member(conv_id uuid) → boolean` (SECURITY DEFINER, STABLE)

指定した会話に`auth.uid()`がメンバーとして参加しているか判定。RLSポリシーの再帰回避に使用。

#### `user_conversation_ids() → SETOF uuid` (SECURITY DEFINER, STABLE)

`auth.uid()`が参加する全会話IDを返す。conversation_members SELECTポリシーで使用。

### 20.4 トリガー

| トリガー名                 | テーブル        | イベント      | 関数                |
| -------------------------- | --------------- | ------------- | ------------------- |
| `on_auth_user_created`     | `auth.users`    | AFTER INSERT  | `handle_new_user`   |
| `on_profiles_updated`      | `profiles`      | BEFORE UPDATE | `handle_updated_at` |
| `on_conversations_updated` | `conversations` | BEFORE UPDATE | `handle_updated_at` |

### 20.5 RLSポリシー

全テーブルでRLS有効。管理者（`is_admin = true`）はSELECTで全データ閲覧可能。

#### profiles

| ポリシー名            | 操作   | 条件                 |
| --------------------- | ------ | -------------------- |
| `profiles_select_all` | SELECT | `true`（全員閲覧可） |
| `profiles_insert_own` | INSERT | `auth.uid() = id`    |
| `profiles_update_own` | UPDATE | `auth.uid() = id`    |

#### friendships

| ポリシー名               | 操作   | 条件                                             |
| ------------------------ | ------ | ------------------------------------------------ |
| `friendships_select_own` | SELECT | `auth.uid() = user_id OR auth.uid() = friend_id` |
| `friendships_insert_own` | INSERT | `auth.uid() = user_id OR auth.uid() = friend_id` |
| `friendships_delete_own` | DELETE | `auth.uid() = user_id OR auth.uid() = friend_id` |

#### conversations

| ポリシー名                    | 操作   | 条件                                     |
| ----------------------------- | ------ | ---------------------------------------- |
| `conversations_select_member` | SELECT | `is_conversation_member(id) OR is_admin` |
| `conversations_insert_auth`   | INSERT | `auth.uid() IS NOT NULL`                 |
| `conversations_update_member` | UPDATE | `is_conversation_member(id)`             |

#### conversation_members

| ポリシー名                        | 操作   | 条件                                                       |
| --------------------------------- | ------ | ---------------------------------------------------------- |
| `conversation_members_select`     | SELECT | `conversation_id IN (user_conversation_ids()) OR is_admin` |
| `conversation_members_insert`     | INSERT | `auth.uid() IS NOT NULL`                                   |
| `conversation_members_update_own` | UPDATE | `auth.uid() = user_id`                                     |
| `conversation_members_delete_own` | DELETE | `auth.uid() = user_id`                                     |

#### messages

| ポリシー名               | 操作   | 条件                                                         |
| ------------------------ | ------ | ------------------------------------------------------------ |
| `messages_select_member` | SELECT | `is_conversation_member(conversation_id) OR is_admin`        |
| `messages_insert_member` | INSERT | `auth.uid() = sender_id AND is_conversation_member(conv_id)` |
| `messages_update_delete` | UPDATE | `is_conversation_member(conversation_id) OR is_admin`        |

#### message_reactions

| ポリシー名                | 操作   | 条件                                                         |
| ------------------------- | ------ | ------------------------------------------------------------ |
| `reactions_select_member` | SELECT | メッセージ所属会話のメンバー（`is_conversation_member`経由） |
| `reactions_insert_member` | INSERT | `auth.uid() = user_id` かつ会話メンバー                      |
| `reactions_delete_own`    | DELETE | `auth.uid() = user_id`                                       |

### 20.6 Realtime Publication

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;
```

### 20.7 フィーチャー構造

```
src/features/messenger/
├── api/
│   ├── auth.ts            # 認証API（signUp, login, logout, getCurrentUser, getProfile, updateProfile）
│   ├── friends.ts         # フレンドAPI（getFriends, addFriendByCode, getProfileByFriendCode, removeFriend）
│   ├── conversations.ts   # 会話API（getConversations, createDirectConversation, createGroupConversation等）
│   ├── messages.ts        # メッセージAPI（getMessages, sendMessage, deleteMessage, markAsRead）
│   ├── reactions.ts       # リアクションAPI（addReaction, removeReaction）
│   └── storage.ts         # ストレージAPI（uploadImage）
├── components/
│   ├── AuthProvider.tsx   # 認証コンテキスト（AuthProvider + useAuthContext）
│   └── ProfileAvatar.tsx  # アバター表示コンポーネント
├── hooks/
│   ├── useAuth.ts         # 認証状態管理フック
│   ├── useConversations.ts # 会話一覧フック
│   └── useMessages.ts     # メッセージ管理フック
├── utils/
│   └── dateFormat.ts      # 日付フォーマットユーティリティ
├── constants/
│   └── index.ts           # 定数定義
├── types/
│   └── index.ts           # 型定義
└── index.ts               # 公開API
```

### 20.8 型定義

```typescript
// Database Row Types（Supabase自動生成型から取得）
type Profile = Database['public']['Tables']['profiles']['Row']
type Friendship = Database['public']['Tables']['friendships']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type ConversationMember = Database['public']['Tables']['conversation_members']['Row']
type Message = Database['public']['Tables']['messages']['Row']
type MessageReaction = Database['public']['Tables']['message_reactions']['Row']

// Insert/Update Types
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type MessageUpdate = Database['public']['Tables']['messages']['Update']
// 他テーブルも同様にInsert型を定義

// ドメイン型
type ConversationType = 'direct' | 'group'
type ReactionEmoji = '👍' | '✅'

interface ConversationWithDetails {
  readonly conversation: Conversation
  readonly members: readonly (ConversationMember & { readonly profile: Profile })[]
  readonly latestMessage: Message | null
  readonly unreadCount: number
}

interface MessageWithDetails {
  readonly message: Message
  readonly sender: Profile
  readonly reactions: readonly (MessageReaction & { readonly user: Profile })[]
  readonly replyTo: (Message & { readonly sender: Profile }) | null
}

interface AuthState {
  readonly user: Profile | null
  readonly isLoading: boolean
  readonly isAuthenticated: boolean
}

interface SignUpFormData {
  readonly email: string
  readonly password: string
  readonly displayName: string
}

interface LoginFormData {
  readonly email: string
  readonly password: string
}
```

### 20.9 定数定義

| 定数名                   | 値                                                                                  | 説明                   |
| ------------------------ | ----------------------------------------------------------------------------------- | ---------------------- |
| `AVATAR_COLORS`          | `['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6','#EC4899','#06B6D4','#F97316']` | アバター色（8色）      |
| `MESSAGE_MAX_LENGTH`     | `2000`                                                                              | メッセージ最大文字数   |
| `IMAGE_MAX_SIZE_MB`      | `10`                                                                                | 画像最大MB             |
| `IMAGE_MAX_SIZE_BYTES`   | `10485760`                                                                          | 画像最大バイト         |
| `ALLOWED_IMAGE_TYPES`    | `['image/jpeg','image/png','image/gif','image/webp']`                               | 許可画像MIME           |
| `MESSAGES_PER_PAGE`      | `50`                                                                                | ページネーション数     |
| `CONVERSATIONS_PER_PAGE` | `50`                                                                                | 会話ページネーション数 |
| `SOUND_SEND`             | `'/sounds/send.wav'`                                                                | 送信音パス             |
| `SOUND_RECEIVE`          | `'/sounds/receive.wav'`                                                             | 受信音パス             |
| `REACTION_EMOJIS`        | `['👍','✅']`                                                                       | リアクション絵文字     |
| `DATE_TIMEZONE`          | `'Asia/Tokyo'`                                                                      | タイムゾーン           |
| `FRIEND_CODE_LENGTH`     | `8`                                                                                 | フレンドコード長       |
| `MESSAGE_IMAGES_BUCKET`  | `'message-images'`                                                                  | ストレージバケット名   |

### 20.10 公開API関数

#### 認証API（api/auth.ts）

| 関数             | 引数                    | 戻り値                 | 説明                                |
| ---------------- | ----------------------- | ---------------------- | ----------------------------------- |
| `signUp`         | `SignUpFormData`        | `{ profile: Profile }` | 登録＋プロフィール取得（500ms待機） |
| `login`          | `email, password`       | `{ profile: Profile }` | ログイン＋プロフィール取得          |
| `logout`         | -                       | `void`                 | ログアウト                          |
| `getCurrentUser` | -                       | `Profile \| null`      | 現在ユーザーのプロフィール取得      |
| `getProfile`     | `userId`                | `Profile \| null`      | プロフィール取得                    |
| `updateProfile`  | `userId, ProfileUpdate` | `Profile`              | プロフィール更新                    |

#### フレンドAPI（api/friends.ts）

| 関数                     | 引数                 | 戻り値            | 説明                               |
| ------------------------ | -------------------- | ----------------- | ---------------------------------- |
| `getFriends`             | `userId`             | `Profile[]`       | フレンド一覧（or条件で双方向取得） |
| `addFriendByCode`        | `userId, friendCode` | `Profile`         | フレンドコードで追加（双方向作成） |
| `getProfileByFriendCode` | `friendCode`         | `Profile \| null` | フレンドコードからプロフィール検索 |
| `removeFriend`           | `userId, friendId`   | `void`            | フレンド削除（双方向削除）         |

**addFriendByCodeのバリデーション**:

1. フレンドコード存在確認 → Error: `"フレンドコードが見つかりません"`
2. 自分自身チェック → Error: `"自分自身をフレンドに追加できません"`
3. 既存フレンドチェック → Error: `"既にフレンドです"`
4. 双方向フレンドシップ作成（2レコード: `userId→friendId` + `friendId→userId`）

#### 会話API（api/conversations.ts）

| 関数                       | 引数                                           | 戻り値                      | 説明                         |
| -------------------------- | ---------------------------------------------- | --------------------------- | ---------------------------- |
| `getConversations`         | `userId`                                       | `ConversationWithDetails[]` | 会話一覧（updated_at DESC）  |
| `getConversation`          | `conversationId`                               | `Conversation \| null`      | 会話詳細取得                 |
| `createDirectConversation` | `userId, friendId`                             | `Conversation`              | DM作成（既存あれば返却）     |
| `createGroupConversation`  | `userId, name, iconText, iconColor, memberIds` | `Conversation`              | グループ作成＋招待コード生成 |
| `joinGroupByInviteCode`    | `userId, inviteCode`                           | `Conversation`              | 招待コードでグループ参加     |
| `leaveConversation`        | `userId, conversationId`                       | `void`                      | 会話から退出                 |
| `updateGroup`              | `conversationId, updates`                      | `Conversation`              | グループ情報更新             |

**getConversationsの処理**:

1. `conversation_members`から自分の会話ID取得
2. `conversations`を`updated_at DESC`で取得（limit 50）
3. メンバー＋プロフィールをJOIN取得
4. 各会話に対して最新メッセージ・未読数を計算

**未読数の計算**: `messages WHERE created_at > last_read_at AND sender_id != userId` のCOUNT

#### メッセージAPI（api/messages.ts）

| 関数            | 引数                                                        | 戻り値                 | 説明                                                            |
| --------------- | ----------------------------------------------------------- | ---------------------- | --------------------------------------------------------------- |
| `getMessages`   | `conversationId, cursor?`                                   | `MessageWithDetails[]` | メッセージ取得（カーソルページネーション）                      |
| `sendMessage`   | `conversationId, senderId, content?, imageUrl?, replyToId?` | `Message`              | メッセージ送信＋updated_at更新                                  |
| `deleteMessage` | `messageId`                                                 | `void`                 | ソフトデリート（is_deleted=true, content=null, image_url=null） |
| `markAsRead`    | `conversationId, userId`                                    | `void`                 | last_read_atを現在時刻に更新                                    |

**getMessagesの処理**:

1. `messages`にsender(profiles)とreactions(message_reactions+profiles)をJOIN
2. `created_at DESC`で取得、limit 50
3. cursor指定時は`created_at < cursor`でフィルタ
4. `reply_to_id`が存在するメッセージの返信先を別クエリで取得（PostgREST self-referencing FK非対応のため）
5. 結果を昇順（時系列）に並べ替えて返す

#### リアクションAPI（api/reactions.ts）

| 関数             | 引数                       | 戻り値            | 説明             |
| ---------------- | -------------------------- | ----------------- | ---------------- |
| `addReaction`    | `messageId, userId, emoji` | `MessageReaction` | リアクション追加 |
| `removeReaction` | `messageId, userId, emoji` | `void`            | リアクション削除 |

#### ストレージAPI（api/storage.ts）

| 関数          | 引数           | 戻り値   | 説明                          |
| ------------- | -------------- | -------- | ----------------------------- |
| `uploadImage` | `file, userId` | `string` | 画像アップロード、公開URL返却 |

**パス**: `{userId}/{timestamp}.{ext}` → `message-images`バケット

### 20.11 内部フック（非公開）

#### useAuth

**状態**: `user`, `isLoading`, `isAuthenticated`, `error`
**メソッド**: `signUp`, `login`, `logout`, `updateProfile`, `clearError`

**初期化処理**:

1. `supabase.auth.getUser()`で現在セッション確認
2. `supabase.auth.onAuthStateChange()`でリアルタイム監視
3. `SIGNED_IN` → profilesテーブルから取得
4. `SIGNED_OUT` → user = null

**signUp処理**:

1. `supabase.auth.signUp()` → 1000ms待機（トリガーのプロフィール作成待ち）
2. avatarColor指定時 → profilesテーブル更新
3. プロフィール取得して状態更新

#### useConversations

**パラメータ**: `userId: string | null`
**状態**: `conversations`, `isLoading`, `error`
**メソッド**: `refresh`

**Realtimeチャネル**: `'conversations-realtime'`

- INSERT on messages → 一覧再取得
- UPDATE on conversations → 一覧再取得

#### useMessages

**パラメータ**: `conversationId: string | null, userId: string | null`
**状態**: `messages`, `isLoading`, `error`, `hasMore`
**メソッド**: `loadMore`, `send`

**Realtimeチャネル**: `'messages-${conversationId}'`

- INSERT on messages → `buildRealtimeMsg()`でMessageWithDetails構築 → 追加 → 他ユーザーなら`markAsRead`
- UPDATE on messages → `applyMsgUpdate()`で更新
- ANY on message_reactions → 全メッセージ再取得

**ページネーション**: 最古メッセージの`created_at`をcursorとして使用。`hasMore = messages.length >= MESSAGES_PER_PAGE`

### 20.12 内部コンポーネント（非公開）

#### AuthProvider（公開例外）

`useAuth`フックから認証状態を取得し、`AuthContext.Provider`でwrap。
`useAuthContext()`でコンテキスト取得（Provider外では Error throw）。

#### ProfileAvatar

**Props**: `text: string, color: string, size?: 'sm' | 'md' | 'lg'`

| サイズ | クラス              |
| ------ | ------------------- |
| `sm`   | `w-8 h-8 text-xs`   |
| `md`   | `w-10 h-10 text-sm` |
| `lg`   | `w-16 h-16 text-xl` |

### 20.13 日付フォーマットユーティリティ

全てAsia/Tokyoタイムゾーン固定。

| 関数                     | 用途                     | 出力例                                           |
| ------------------------ | ------------------------ | ------------------------------------------------ |
| `formatMessageTime`      | メッセージ時刻（HH:MM）  | `"14:30"`                                        |
| `formatDateSeparator`    | 日付セパレータ           | `"2026年2月13日(木)"`                            |
| `formatConversationTime` | 会話一覧時刻（相対表示） | 今日→`"14:30"`, 昨日→`"昨日"`, それ以前→`"2/13"` |
| `isSameDay`              | 同日判定                 | `true / false`                                   |

### 20.14 ページ構成

#### 20.14.1 レイアウト（`src/app/m/layout.tsx`）

```
AuthProvider
  └── MessengerLayoutInner
      ├── Global Realtime Subscription（通知・バッジ）
      ├── Auth Guard（非公開ページでの認証チェック）
      ├── Children（各ページ）
      └── BottomNavigation（条件付き表示）
```

**公開パス**（認証不要）: `/m/login`, `/m/signup`, `/m/add/*`, `/m/group/invite/*`
**BottomNav非表示**: ログイン・サインアップ・チャットページ

**BottomNavigation タブ**:

| パス         | ラベル   | アイコン | マッチング |
| ------------ | -------- | -------- | ---------- |
| `/m`         | トーク   | 🗨️       | exact      |
| `/m/friends` | フレンド | 👥       | prefix     |
| `/m/profile` | マイ     | 👤       | prefix     |

**グローバル通知サブスクリプション**:

- チャネル: `'global-notifications'`
- INSERT on messages → `refreshAndNotify()` → バッジ更新 + ブラウザ通知
- UPDATE on conversations → `refreshAndNotify()` → バッジ更新
- ブラウザ通知: `new Notification(senderName, { body, icon: '/icon-192.png', tag: 'messenger-message' })`
- PWAバッジ: `navigator.setAppBadge(totalUnread)` / `navigator.clearAppBadge()`

#### 20.14.2 トーク一覧（`src/app/m/page.tsx`）

**ルート**: `/m`

**UI構成**:

1. **ヘッダー**: タイトル「トーク」+ 検索アイコン + 新規チャットボタン
2. **通知バナー**: 通知許可状態に応じて表示
   - `'default'` → 「通知を有効にしますか？」+ 許可ボタン
   - `'denied'` → ブロック解除手順（iPhone/PC）
3. **会話リスト**: `ConversationItem`コンポーネント
   - アバター（色+テキスト2文字）
   - 表示名（DM: 相手名, グループ: グループ名）
   - 最終メッセージプレビュー（削除済み→「メッセージが削除されました」, 画像→「📷 画像」）
   - 相対時刻（今日: HH:MM, 昨日, M/D）
   - 未読バッジ（青, 最大99+）
4. **新規チャットモーダル**: フレンド選択 + 「グループを作成」ボタン

**Realtime**: `'talk-list-refresh'`チャネルで会話一覧の自動更新

#### 20.14.3 ログイン（`src/app/m/login/page.tsx`）

**ルート**: `/m/login`

**UI**: グラデーション背景（blue-500→blue-700）、フォームカード、email/password入力、エラー表示
**処理**: `login()` → 成功時 `/m` へ遷移

#### 20.14.4 サインアップ（`src/app/m/signup/page.tsx`）

**ルート**: `/m/signup`

**2段階フォーム**:

1. **認証情報**: email + password
2. **プロフィール**: display_name（max 20文字）+ アバター色選択（AVATAR_COLORS）+ プレビュー

**処理**: `signUp()` → 成功時 `/m` へ遷移

#### 20.14.5 チャット（`src/app/m/chat/[conversationId]/page.tsx`）

**ルート**: `/m/chat/{conversationId}`

**UI構成**:

1. **ヘッダー**: 戻るボタン + 会話名 + 設定アイコン（グループのみ）
2. **メッセージエリア**: スクロール可能、上部に「もっと読む」ボタン
3. **メッセージバブル**: `MessageBubble`コンポーネント
   - 送信者アバター（左）、送信者名（グループのみ）、本文、時刻、リアクション
   - 返信先プレビュー（青ボーダー、引用メッセージ）
   - 画像表示（タップでフルスクリーンプレビュー）
   - コンテキストメニュー（長押し500ms or 右クリック）
4. **返信バー**: 返信時にメッセージ入力上部に表示
5. **入力バー**: 画像ボタン + textarea + 送信ボタン

**カラーパレット**:

- チャット背景: `bg-[#8CABD9]`
- 送信メッセージ: `bg-[#A8D97A]`（右寄せ）
- 受信メッセージ: `bg-white`（左寄せ）

**コンテキストメニュー**: リアクション選択 + 返信 + 削除（自分のメッセージのみ）

**サウンド**: 送信時`send.wav`、受信時`receive.wav`

**Realtime**: `'messages-${conversationId}'`チャネル

- INSERT → メッセージ追加 + サウンド + 既読マーク
- UPDATE → メッセージ内容更新
- message_reactions ANY → 全メッセージ再取得

#### 20.14.6 グループ設定（`src/app/m/chat/[conversationId]/settings/page.tsx`）

**ルート**: `/m/chat/{conversationId}/settings`

**セクション**:

1. グループアイコン + グループ名
2. 招待リンク（コピー機能付き）
3. メンバー一覧（追加ボタン付き）
4. メンバー追加モーダル（フレンドから選択、既存メンバー除外）
5. グループ退出ボタン（確認ダイアログ付き）

#### 20.14.7 フレンド一覧（`src/app/m/friends/page.tsx`）

**ルート**: `/m/friends`

**UI**: フレンドリスト（アバター + 名前 + メッセージアイコン）
**操作**: フレンドタップ → `createDirectConversation()` → チャットへ遷移

#### 20.14.8 フレンド追加（`src/app/m/friends/add/page.tsx`）

**ルート**: `/m/friends/add`

**2セクション**:

1. **マイQRコード**: QRコード（180x180, level M）+ フレンドコード + コピーボタン
   - QRコードURL: `${origin}/m/add/{friend_code}`
2. **コードで追加**: 入力フィールド（max 20文字）+ 追加ボタン

#### 20.14.9 プロフィール（`src/app/m/profile/page.tsx`）

**ルート**: `/m/profile`

**表示モード**: アバター + 名前 + フレンドコード + 編集ボタン + 通知トグル + ログアウト
**編集モード**: 名前入力（max 20）+ 色選択（AVATAR_COLORS）+ 保存/キャンセル
**管理者パネルリンク**: `is_admin = true`の場合のみ表示

**通知トグル**: `NotificationToggle`コンポーネント（iOS PWA対応ガイド付き）

#### 20.14.10 メッセージ検索（`src/app/m/search/page.tsx`）

**ルート**: `/m/search`

**検索フロー**:

1. 検索入力（自動フォーカス）
2. 300msデバウンス
3. 2文字以上で検索実行
4. `messages`テーブルの`content`をilike検索（最大50件）
5. 結果にハイライト表示

#### 20.14.11 管理パネル（`src/app/m/admin/page.tsx`）

**ルート**: `/m/admin`（`is_admin = true`のみアクセス可能）

**ダッシュボード**:

- 統計カード: ユーザー数・会話数・メッセージ数
- 会話リスト: タイプフィルタ（Group/DM）、メンバー数表示
- メッセージパネル: 選択した会話の全メッセージ表示、削除機能

#### 20.14.12 グループ作成（`src/app/m/group/create/page.tsx`）

**ルート**: `/m/group/create`

**フォーム**: グループ名（required, max 30）+ アイコンテキスト（1-2文字, auto: name.slice(0,2)）+ 色選択 + フレンド選択（チェックボックス）
**処理**: `createGroupConversation()` → チャットへ遷移

#### 20.14.13 グループ招待（`src/app/m/group/invite/[code]/page.tsx`）

**ルート**: `/m/group/invite/{code}`（認証不要）

**状態**: loading → not-found / error / loaded
**loaded時のアクション**: 未ログイン→ログインリンク、既にメンバー→チャットリンク、参加可能→参加ボタン

#### 20.14.14 URL経由フレンド追加（`src/app/m/add/[friendCode]/page.tsx`）

**ルート**: `/m/add/{friendCode}`（認証不要）

**UI**: ターゲットプロフィールカード + 追加ボタン
**チェック**: 未ログイン→ログインリンク、自分自身→メッセージ表示、追加済み→成功メッセージ（1.5秒後にフレンド一覧へ遷移）

### 20.15 通知システム

#### ブラウザ通知

```typescript
function showBrowserNotification(title: string, body: string): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    tag: 'messenger-message',
  })
  notification.onclick = () => {
    window.focus()
    notification.close()
  }
}
```

**発火条件**: 他ユーザーからのメッセージINSERT（自分の送信メッセージは除外）
**タイトル**: 送信者名（キャッシュされた会話データから検索）
**本文**: 画像→「📷 画像」、テキスト→メッセージ内容

#### PWAバッジ

```typescript
function updateAppBadge(count: number): void {
  if (!('setAppBadge' in navigator)) return
  if (count > 0) {
    void (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }).setAppBadge(count)
  } else {
    void (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge()
  }
}
```

**更新タイミング**: メッセージINSERT時・会話UPDATE時に全未読数を再計算

#### 通知権限バナー

| 状態            | 表示                                                        |
| --------------- | ----------------------------------------------------------- |
| `'default'`     | 青バナー: 「通知を有効にしますか？」+ 許可ボタン            |
| `'denied'`      | 琥珀バナー: ブロック解除手順（iPhone設定 / PCブラウザ設定） |
| `'granted'`     | 非表示                                                      |
| `'unsupported'` | 非表示                                                      |

#### iOS PWA制限事項

- HTTPS必須（開発環境HTTP不可）
- iOS 16.4+
- 「ホーム画面に追加」経由でインストール必須
- 通知設定はiOS設定アプリから変更

### 20.16 サウンドエフェクト

| ファイル              | 用途             | 再生タイミング                   |
| --------------------- | ---------------- | -------------------------------- |
| `/sounds/send.wav`    | メッセージ送信音 | `sendMessage()`成功時            |
| `/sounds/receive.wav` | メッセージ受信音 | 他ユーザーからのメッセージ受信時 |

再生方法: `new Audio(path).play()` （失敗時はサイレント）

### 20.17 マイグレーション一覧

| バージョン       | 名前                               | 概要                                                         |
| ---------------- | ---------------------------------- | ------------------------------------------------------------ |
| `20260213144729` | `create_profiles_table`            | profilesテーブル＋RLS＋関数＋トリガー                        |
| `20260213144739` | `create_friendships_table`         | friendshipsテーブル＋RLS                                     |
| `20260213144813` | `create_conversations_and_members` | conversations＋conversation_members＋RLS                     |
| `20260213144826` | `create_messages_table`            | messagesテーブル＋RLS＋Realtime                              |
| `20260213144836` | `create_message_reactions_table`   | message_reactionsテーブル＋RLS＋Realtime                     |
| `20260213165421` | `fix_function_search_path`         | 全関数にSET search_path = ''追加                             |
| `20260213171820` | `fix_rls_policies`                 | friendships INSERT双方向化＋RLSバグ修正                      |
| `20260213172513` | `fix_rls_infinite_recursion`       | `is_conversation_member()`関数導入＋RLS再帰修正              |
| `20260213172529` | `optimize_messages_rls_policies`   | messages/reactions RLSを`is_conversation_member`使用に最適化 |
| `20260213172922` | `fix_conversation_members_select`  | `user_conversation_ids()`関数導入＋メンバーSELECT修正        |
| `20260213173344` | `add_conversations_to_realtime`    | conversations＋conversation_membersをRealtime追加            |

### 20.18 RLS設計の注意点

PostgRESTにおけるRLSポリシーの再帰問題を解決するために`SECURITY DEFINER`関数を使用:

1. **conversation_members SELECT** → **conversation_members参照** = 再帰
   → `user_conversation_ids()` SECURITY DEFINER関数で回避
2. **conversations SELECT** → **conversation_members参照** → **conversation_members SELECT RLS** = 再帰
   → `is_conversation_member()` SECURITY DEFINER関数で回避
3. **messages SELECT** → **conversation_members参照** → 同上
   → `is_conversation_member()` SECURITY DEFINER関数で回避

---

**最終更新**: 2026-02-13
**バージョン**: 5.0.0（メッセンジャー機能追加）
