#!/usr/bin/env node

/**
 * ゲームファイル保護スクリプト
 *
 * v1.0.0で安定化されたゲーム機能のファイルが
 * 変更されていないことをSHA256チェックサムで検証します。
 *
 * 使用方法:
 *   node scripts/protect-game-checksums.js          # チェック実行
 *   node scripts/protect-game-checksums.js --init    # チェックサム初期化
 *   node scripts/protect-game-checksums.js --update  # チェックサム更新
 *
 * バイパス:
 *   ALLOW_GAME_CHANGES=1 git commit -m "..."
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// 保護対象のゲームファイル（v1.0.0安定版）
const PROTECTED_GAME_FILES = [
  'src/features/game/index.ts',
  'src/features/game/components/Card.tsx',
  'src/features/game/components/GameBoard.tsx',
  'src/features/game/components/Ranking.tsx',
  'src/features/game/hooks/useGame.ts',
  'src/features/game/hooks/useSecretGesture.ts',
  'src/features/game/constants/index.ts',
  'src/features/game/types/index.ts',
  'src/app/page.tsx',
  'src/app/m/page.tsx',
  'src/components/ErrorBoundary.tsx',
]

// チェックサム保存ファイル
const CHECKSUM_FILE = path.join(__dirname, '.game-checksums.json')

/**
 * ファイルのSHA256チェックサムを計算
 */
function calculateChecksum(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return crypto.createHash('sha256').update(content).digest('hex')
  } catch {
    return null
  }
}

/**
 * 全保護ファイルの現在のチェックサムを取得
 */
function getCurrentChecksums() {
  const checksums = {}
  for (const file of PROTECTED_GAME_FILES) {
    const filePath = path.join(process.cwd(), file)
    const checksum = calculateChecksum(filePath)
    if (checksum) {
      checksums[file] = checksum
    }
  }
  return checksums
}

/**
 * チェックサムを初期化・更新
 */
function initializeChecksums() {
  const checksums = getCurrentChecksums()
  const data = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    description: 'Hi & Low ゲーム v1.0.0 安定版のファイルチェックサム',
    files: checksums,
  }
  fs.writeFileSync(CHECKSUM_FILE, JSON.stringify(data, null, 2))
  console.log(
    `✅ ゲームファイルのチェックサムを保存しました（${Object.keys(checksums).length}ファイル）`
  )
  return checksums
}

/**
 * 保存されたチェックサムを読み込み
 */
function loadSavedChecksums() {
  if (!fs.existsSync(CHECKSUM_FILE)) {
    return initializeChecksums()
  }

  try {
    const data = JSON.parse(fs.readFileSync(CHECKSUM_FILE, 'utf8'))
    return data.files || data
  } catch {
    console.error('⚠️ チェックサムファイルの読み込みに失敗しました。再初期化します。')
    return initializeChecksums()
  }
}

/**
 * ゲームファイルの整合性をチェック
 */
function checkGameIntegrity() {
  // バイパスチェック
  if (process.env.ALLOW_GAME_CHANGES === '1') {
    console.log('⚠️ ALLOW_GAME_CHANGES=1: ゲームファイル保護をスキップします')
    return []
  }

  const savedChecksums = loadSavedChecksums()
  const currentChecksums = getCurrentChecksums()
  const violations = []

  for (const file of PROTECTED_GAME_FILES) {
    if (savedChecksums[file] && currentChecksums[file]) {
      if (savedChecksums[file] !== currentChecksums[file]) {
        violations.push(file)
      }
    }
  }

  return violations
}

/**
 * エラーメッセージを表示
 */
function showError(violations) {
  console.error('\n' + '='.repeat(60))
  console.error('🚨 保護されたゲームファイルの変更を検出しました！')
  console.error('='.repeat(60))

  console.error('\n変更されたファイル:')
  for (const file of violations) {
    console.error(`  ❌ ${file}`)
  }

  console.error('\n' + '⚠️'.repeat(30))
  console.error('\n🔴 重要な警告:')
  console.error('ゲーム機能のファイルは v1.0.0 で安定化されています。')
  console.error('意図しない変更は許可されていません。')

  console.error('\n📋 対処法:')
  console.error('1. 変更を元に戻す: git checkout -- ' + violations.join(' '))
  console.error('2. 意図的な変更の場合: ALLOW_GAME_CHANGES=1 git commit -m "..."')
  console.error('3. チェックサムの更新: node scripts/protect-game-checksums.js --update')

  console.error('\n' + '⚠️'.repeat(30))
  console.error('')
}

/**
 * メイン処理
 */
function main() {
  const command = process.argv[2]

  if (command === '--init') {
    initializeChecksums()
    return
  }

  if (command === '--update') {
    console.log('⚠️ ゲームファイルのチェックサムを更新します')
    console.log('この操作は意図的な変更の後にのみ実行してください！')
    initializeChecksums()
    return
  }

  // 整合性チェック
  const violations = checkGameIntegrity()

  if (violations.length > 0) {
    showError(violations)
    process.exit(1)
  }

  console.log('✅ ゲームファイルの整合性チェック: OK')
}

// 実行
main()
