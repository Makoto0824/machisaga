# CSVファイル形式の説明

## 使い切りURLシステムのCSV形式

### 現在のCSV構造
```csv
ID,URL
event_a_001,https://play.ttt.games/worlds/machi-saga/events/HW0q5S0tSNm3KVhKO2R5EjrG01t1CLWX5TC0f01dqqw/checkin
event_a_002,https://play.ttt.games/worlds/machi-saga/events/tib-mg0SDPBQC2dkF7s1A99KWAT_peePYcivUT0Tu9Q/checkin
event_a_003,https://play.ttt.games/worlds/machi-saga/events/BxETN5IJaJRYCu37bpWu31FL5k_djTu30fgqhfMarUo/checkin
event_a_004,https://play.ttt.games/worlds/machi-saga/events/J0s5_USkI1T9oC3iLBJUeWlyGOMpsjOuYvQv6PH5L0E/checkin
event_a_005,https://play.ttt.games/worlds/machi-saga/events/VEz4hbZrAGm5PYIgIEyPS_2BFSNYAtITYnFeI3y4CRg/checkin
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
ID,URL
event_a_001,https://play.ttt.games/worlds/machi-saga/events/actual-token-1/checkin
event_a_002,https://play.ttt.games/worlds/machi-saga/events/actual-token-2/checkin
event_a_003,https://play.ttt.games/worlds/machi-saga/events/actual-token-3/checkin
event_a_004,https://play.ttt.games/worlds/machi-saga/events/actual-token-4/checkin
event_a_005,https://play.ttt.games/worlds/machi-saga/events/actual-token-5/checkin
```

### システムの動作

#### 1. ユーザーがイベントボタンをクリック
#### 2. システムが未使用のURLを選択（例：event_a_002）
#### 3. 選択されたURLにリダイレクト
#### 4. URL使用済みマーク（重複使用防止）

### 管理画面での確認
- **管理画面**: https://machisaga.vercel.app/admin
- **使用状況**: どのURLが使用済みかが分かる
- **統計データ**: 5個中何個使用済みかが表示

---
**注意**: 現在のCSVファイルはサンプル形式です。実際の運用には、T&Tから提供される実際の使い切りURLに置き換える必要があります。
