# CSVファイル形式の説明

## 使い切りURLシステムのCSV形式

### 現在のCSV構造（複数イベント対応）
```csv
ID,Event,URL,Description
event_a_001,EventA,https://play.ttt.games/worlds/machi-saga/events/HW0q5S0tSNm3KVhKO2R5EjrG01t1CLWX5TC0f01dqqw/checkin,イベントA - 使い切りURL #1
event_a_002,EventA,https://play.ttt.games/worlds/machi-saga/events/tib-mg0SDPBQC2dkF7s1A99KWAT_peePYcivUT0Tu9Q/checkin,イベントA - 使い切りURL #2
event_a_003,EventA,https://play.ttt.games/worlds/machi-saga/events/BxETN5IJaJRYCu37bpWu31FL5k_djTu30fgqhfMarUo/checkin,イベントA - 使い切りURL #3
event_b_001,EventB,https://play.ttt.games/worlds/machi-saga/events/sample-b-001-token-here/checkin,イベントB - 使い切りURL #1
event_b_002,EventB,https://play.ttt.games/worlds/machi-saga/events/sample-b-002-token-here/checkin,イベントB - 使い切りURL #2
event_c_001,EventC,https://play.ttt.games/worlds/machi-saga/events/sample-c-001-token-here/checkin,イベントC - 使い切りURL #1
event_c_002,EventC,https://play.ttt.games/worlds/machi-saga/events/sample-c-002-token-here/checkin,イベントC - 使い切りURL #2
```

### 重要なポイント

#### 1. 各URLは異なる必要がある
- **❌ 間違い**: 全て同じURL
- **✅ 正しい**: それぞれ異なる使い切りURL

#### 2. T&Tから提供される実際のURL形式
```
https://play.ttt.games/worlds/machi-saga/events/[UNIQUE_TOKEN]/checkin
```

#### 3. 現在のサンプルURL
- **event_a_001**: 実際のT&TイベントURL（既存）
- **event_a_002-005**: サンプル形式（T&Tから実際のURLを取得する必要）

### T&T側で必要な対応

#### 1. 使い切りURLの生成
T&T側で以下のような使い切りURLを5個生成：
```
https://play.ttt.games/worlds/machi-saga/events/unique-token-1/checkin
https://play.ttt.games/worlds/machi-saga/events/unique-token-2/checkin
https://play.ttt.games/worlds/machi-saga/events/unique-token-3/checkin
https://play.ttt.games/worlds/machi-saga/events/unique-token-4/checkin
https://play.ttt.games/worlds/machi-saga/events/unique-token-5/checkin
```

#### 2. CSVファイルの更新
T&Tから提供された実際のURLでCSVファイルを更新：
```csv
ID,URL,Description
event_a_001,https://play.ttt.games/worlds/machi-saga/events/actual-token-1/checkin,イベントA - 使い切りURL #1
event_a_002,https://play.ttt.games/worlds/machi-saga/events/actual-token-2/checkin,イベントA - 使い切りURL #2
event_a_003,https://play.ttt.games/worlds/machi-saga/events/actual-token-3/checkin,イベントA - 使い切りURL #3
event_a_004,https://play.ttt.games/worlds/machi-saga/events/actual-token-4/checkin,イベントA - 使い切りURL #4
event_a_005,https://play.ttt.games/worlds/machi-saga/events/actual-token-5/checkin,イベントA - 使い切りURL #5
```

### システムの動作（複数イベント対応）

#### 1. ユーザーがイベントを選択（または自動選択）
#### 2. システムが選択されたイベントの未使用URLを取得
#### 3. 選択されたURLにリダイレクト
#### 4. URL使用済みマーク（重複使用防止）

#### イベント選択オプション
- **全イベントから自動選択**: 利用可能なURLから自動で選択
- **イベントA**: EventAのURLから選択
- **イベントB**: EventBのURLから選択  
- **イベントC**: EventCのURLから選択

### CSVアップロード機能

#### 管理画面からのアップロード
1. **管理画面にアクセス**: `/admin-panel.html`
2. **管理者認証**: パスワード `machisaga-admin-2025`
3. **CSVファイル選択**: ファイル選択ボタンでCSVを選択
4. **アップロード実行**: 「📤 CSVアップロード」ボタンをクリック
5. **自動反映**: アップロード後、システムが自動的に新しいURLを読み込み

#### アップロード可能な形式
- **ファイル形式**: `.csv`
- **エンコーディング**: UTF-8
- **最大サイズ**: 10MB（推奨）
- **必須ヘッダー**: `ID,URL,Description`

#### アップロード後の動作
- 既存のCSVファイルが新しいファイルで置き換えられます
- システムが自動的に新しいURLを読み込みます
- 使用状況統計が更新されます
- 管理画面に成功メッセージが表示されます

### 管理画面での確認
- **管理画面**: https://machisaga.vercel.app/admin-panel.html
- **使用状況**: どのURLが使用済みかが分かる
- **統計データ**: 5個中何個使用済みかが表示
- **CSVアップロード**: 新しいCSVファイルをアップロード可能

### 運用上の注意点

#### 1. URLの一意性
- 各URLは必ず異なる必要があります
- 同じURLを複数回使用することはできません
- T&T側で生成された一意のトークンを使用してください

#### 2. ファイル形式
- エンコーディング: UTF-8
- 区切り文字: カンマ（,）
- 改行コード: LF（\n）またはCRLF（\r\n）

#### 3. データの整合性
- ヘッダー行は必須です
- 空行や不正なデータは無視されます
- URLの形式は `https://play.ttt.games/worlds/machi-saga/events/[TOKEN]/checkin` である必要があります

### トラブルシューティング

#### よくある問題
1. **URLが重複している**: 各URLが一意であることを確認
2. **ファイル形式エラー**: CSV形式とエンコーディングを確認
3. **URL形式エラー**: T&Tの正しいURL形式を使用
4. **アップロード失敗**: ファイルサイズと形式を確認

#### 解決方法
1. CSVファイルを再確認
2. 管理画面から「CSVから再読み込み」を実行
3. 必要に応じてURLをリセット
4. アップロード機能で新しいCSVファイルをアップロード

---
**注意**: 現在のCSVファイルはサンプル形式です。実際の運用には、T&Tから提供される実際の使い切りURLに置き換える必要があります。
