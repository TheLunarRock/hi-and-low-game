# Hi & Low ゲーム - 技術仕様書

> このドキュメントは、アプリケーションを完全に再現するための詳細な技術仕様です。

## 1. プロジェクト概要

| 項目               | 値                                       |
| ------------------ | ---------------------------------------- |
| **名称**           | Hi & Low Game                            |
| **バージョン**     | 0.1.0                                    |
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
│   └── useGame.ts         # ゲームロジック
├── types/
│   └── index.ts           # 型定義
└── index.ts               # 公開API
```

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
- 500ms後に判定実行:
  - ドロー（同値）: コイン返却、gameState='draw'、次のラウンドへ
  - 勝利: 連勝数分のコイン獲得、gameState='won'、ハイスコア更新確認、次のラウンドへ
  - 敗北: gameState='lost'または'gameover'（コイン0の場合）

**resetGame(): void**

- ゲーム状態を初期化（コインは維持）

**fullReset(): void**

- ゲーム状態を完全初期化（コインも10枚にリセット）

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
      return JSON.parse(stored) as T
    } catch {
      return defaultValue
    }
  },
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* 静かに失敗 */
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

- 裏面: 青いグラデーション背景 + 🃏絵文字
- 表面: 白背景、左上/中央/右下（回転）にスート表示
- サイズ: w-24 h-36（96px x 144px）

#### GameBoard.tsx - ゲームボード

**構成:**

1. ヘッダー（🃏 Hi & Low）
2. トースト通知（初回アクセス時、右からスライドイン）
3. スコア表示（コイン、連勝、ハイスコア）
4. カード表示エリア（現在のカード → 次のカード）
5. 操作ボタンエリア（HIGH/LOW、状態メッセージ）
6. ランキング

**トースト通知仕様:**

```typescript
// 状態: 'hidden' | 'entering' | 'visible' | 'exiting'
// アニメーション: 右端からスライドイン（500ms）
// 表示時間: 3秒
// メッセージ: "通知：🔥 きょうもハイスコアを更新しよう！"
```

**ボタン状態:**
| gameState | 表示内容 |
| --------- | -------- |
| playing | HIGH/LOWボタン |
| won | "🎉 正解！ +{streak}コイン" |
| draw | "🤝 ドロー！コイン返却" |
| lost | "💥 続ける"ボタン |
| gameover | "💀 ゲームオーバー" + "🔄 最初からやり直す"ボタン |
| revealing | "判定中..." |

#### Ranking.tsx - ランキング表示

**Props:**

```typescript
interface RankingProps {
  readonly entries: readonly RankingEntry[]
  readonly className?: string
  readonly isSecretActivated?: boolean // 微妙な色変化
}
```

**ランクアイコン:**

```typescript
function getRankIcon(rank: number): string {
  if (rank <= 0) return '-'
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return String(rank)
}
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

---

**最終更新**: 2025-02-04
**バージョン**: 3.0.0
