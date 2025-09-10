# 使い切りURL システム使用ガイド

## 概要
T&T提供の使い切りURLを自動振り分けするシステムです。URL秘匿化の必要がなく、シンプルかつ確実に動作します。

## 🎯 システムの特徴

### ✅ メリット
- **T&T側設定不要**: OAuthやCORS設定の変更が不要
- **確実な動作**: 技術的制約による失敗リスクがない
- **自動振り分け**: 100個のURLから自動的に未使用URLを提供
- **使用状況追跡**: リアルタイムで使用率を監視
- **管理機能**: WebベースでURL管理が可能

### 📋 必要な準備
1. **T&T側**: 使い切りURL×100個を準備
2. **CSV提供**: URLリストをまちサーガに提供
3. **システム設定**: CSVファイルをアップロード

## 🏗️ システム構成

```
📁 machisaga/
├── 📄 event-entry.html          # ユーザー向けエントリーページ
├── 📄 admin-panel.html          # 管理者画面
├── 📁 api/
│   └── 📄 single-use-redirect.mjs   # API エンドポイント
├── 📁 single-use-urls/
│   ├── 📄 url-manager.mjs       # URL管理ロジック
│   ├── 📄 tnt-urls.csv          # T&T提供のURLリスト
│   └── 📄 urls.json             # 使用状況データ
└── 📄 vercel.json               # Vercel設定
```

## 📊 CSVフォーマット

T&T側で準備していただくCSVファイルの形式：

```csv
ID,URL,MSC,Description
event_001,"https://play.ttt.games/worlds/machi-saga/events/xxx1/checkin",10,"まちサーガ黒船イベント"
event_002,"https://play.ttt.games/worlds/machi-saga/events/xxx2/checkin",15,"まちサーガ探索イベント"
event_003,"https://play.ttt.games/worlds/machi-saga/events/xxx3/checkin",10,"まちサーガバトルイベント"
...
event_100,"https://play.ttt.games/worlds/machi-saga/events/xxx100/checkin",20,"まちサーガスペシャルイベント"
```

### カラム説明
- **ID**: 一意の識別子（event_001 〜 event_100）
- **URL**: T&T提供の使い切りURL
- **MSC**: 獲得予定MSCコイン数
- **Description**: イベントの説明

## 🚀 使用方法

### 1. ユーザー向けフロー

#### エントリーページアクセス
```
https://machisaga.vercel.app/event-entry
```

#### 自動処理フロー
1. **「イベントに参加する」ボタンクリック**
2. **未使用URL自動取得**
3. **5秒カウントダウン**
4. **T&Tイベントページが新しいタブで開く**
5. **URL自動的に使用済み状態に変更**

### 2. 管理者向け機能

#### 管理画面アクセス
```
https://machisaga.vercel.app/admin
パスワード: machisaga-admin-2025
```

#### 主要機能
- **📊 使用状況統計**: リアルタイム監視
- **📥 CSV再読み込み**: 新しいURLリストの適用
- **🔄 URL リセット**: 個別または全体リセット
- **📋 使用履歴**: 最近の利用状況確認
- **📊 レポート出力**: CSV形式でエクスポート

## 🔌 API エンドポイント

### URL取得 API
```http
GET /api/single-use-redirect
Response: {
  "success": true,
  "url": "https://play.ttt.games/worlds/machi-saga/events/xxx/checkin",
  "urlId": "event_001",
  "mscAmount": 10,
  "description": "まちサーガ黒船イベント",
  "stats": {
    "total": 100,
    "used": 25,
    "available": 75,
    "usageRate": "25.0"
  }
}
```

### 直接リダイレクト
```http
GET /api/single-use-redirect?redirect=true
→ 302リダイレクト
```

### 管理API（要認証）
```http
POST /api/single-use-redirect
Body: {
  "action": "stats|reset|export|reload",
  "password": "machisaga-admin-2025",
  "urlId": "event_001" // resetの場合のみ
}
```

## 📱 ユーザー体験

### 正常フロー
```
1. QRコード/リンクでエントリーページアクセス
   ↓
2. 使用状況確認（残り枠数表示）
   ↓
3. 「イベントに参加する」ボタンクリック
   ↓
4. 未使用URL自動取得・カウントダウン
   ↓
5. T&Tイベントページが新しいタブで開く
   ↓
6. T&T側でGoogleログイン
   ↓
7. チェックイン完了・MSC獲得
```

### エラーハンドリング
- **満員時**: 「募集枠が満員」メッセージ表示
- **システムエラー**: エラー詳細とリトライ案内
- **ポップアップブロック**: 手動で開くボタン提供

## 🔧 セットアップ手順

### 1. CSVファイル準備
1. T&T側で使い切りURL×100個を準備
2. 上記フォーマットでCSVファイル作成
3. `single-use-urls/tnt-urls.csv` として配置

### 2. 初期化
```bash
# CSVから読み込み（管理画面で実行）
POST /api/single-use-redirect
{
  "action": "reload",
  "password": "machisaga-admin-2025"
}
```

### 3. 動作確認
1. エントリーページにアクセス
2. 統計情報が表示されることを確認
3. テスト参加で動作確認

## 📈 監視・メンテナンス

### 日常監視項目
- **残り枠数**: 20%を下回ったら追加URL準備
- **エラー率**: API呼び出し失敗率監視
- **使用履歴**: 異常な使用パターンの検知

### 定期メンテナンス
- **週次**: 使用状況レポート確認
- **月次**: システムログ分析
- **イベント後**: URL一括リセット

## 🎉 運用開始後の流れ

### Phase 1: 初回展開
1. CSVファイル配置
2. システム初期化
3. 動作テスト完了

### Phase 2: 本格運用
1. QRコード配布/SNS投稿
2. ユーザーアクセス開始
3. リアルタイム監視

### Phase 3: 運用最適化
1. 使用パターン分析
2. ユーザー体験改善
3. 次回イベント準備

## 💡 追加可能な機能

### 今後の拡張案
- **QRコード自動生成**: エントリーURLのQRコード作成
- **通知機能**: 残り枠僅少時のアラート
- **A/Bテスト**: 複数エントリーページの効果測定
- **分析ダッシュボード**: より詳細な使用状況分析

---

**作成日**: 2025年9月10日  
**バージョン**: 1.0  
**担当**: まちサーガ技術チーム
