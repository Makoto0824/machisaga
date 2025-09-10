# T&T連携に必要な技術設定要求書

## 概要
まちサーガプロジェクトでT&Tプラットフォームのイベント機能を安全に統合するための技術要件です。

## 🎯 実現したい機能
1. **URL秘匿化**: まちサーガドメインからT&Tイベントページへの安全なアクセス
2. **シームレス認証**: ユーザーがT&T認証をスムーズに完了
3. **自動チェックイン**: プログラム制御によるイベント参加とMSC獲得

## 🔒 セキュリティ要件
- 実際のT&TイベントURLをエンドユーザーに露出させない
- トークン認証による時限付きアクセス制御
- クロスサイトスクリプティング(XSS)対策

## 📋 T&T側に必要な設定

### 1. OAuth/Social Login設定 ⭐ 最重要
```yaml
設定箇所: T&T管理画面 > OAuth設定

許可オリジン:
  本番環境: "https://machisaga.vercel.app"
  開発環境: "http://localhost:8000"
  
許可リダイレクトURI:
  - "https://machisaga.vercel.app/redirect/*"
  - "https://machisaga.vercel.app/auth/callback"
  - "https://machisaga.vercel.app/auth/success"

Google OAuth設定:
  - Client ID: まちサーガ用の専用クライアントID
  - 許可ドメイン: machisaga.vercel.app
  
Apple OAuth設定:
  - Bundle ID: com.machisaga.webapp
  - 許可オリジン: https://machisaga.vercel.app
```

### 2. CORS設定
```yaml
設定箇所: T&Tサーバー設定 > CORS

Headers:
  Access-Control-Allow-Origin: 
    - "https://machisaga.vercel.app"
    - "http://localhost:8000"
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Methods: "GET, POST, OPTIONS"
  Access-Control-Allow-Headers: 
    - "Authorization"
    - "Content-Type" 
    - "X-Requested-With"
```

### 3. iframe埋め込み許可設定
```yaml
設定箇所: T&Tサーバー設定 > セキュリティヘッダー

現在の制限を緩和:
  X-Frame-Options: "ALLOW-FROM https://machisaga.vercel.app"
  # または完全削除
  
  Content-Security-Policy:
    frame-ancestors 'self' https://machisaga.vercel.app http://localhost:8000;
```

## 🔌 API連携 (Optional - 推奨)

### イベント情報API
```typescript
GET /api/events/machi-saga
Response: {
  events: [
    {
      id: "WsDzeA-BjEOjN833J0-tTzRDHnnLLzFMytiCf5gseD4",
      title: "○○イベント",
      description: "イベント説明",
      checkinUrl: "https://play.ttt.games/worlds/machi-saga/events/.../checkin",
      reward: { type: "MSC", amount: 10 }
    }
  ]
}
```

### チェックインAPI  
```typescript
POST /api/events/checkin
Headers: { Authorization: "Bearer {userToken}" }
Body: { 
  eventId: "WsDzeA-BjEOjN833J0-tTzRDHnnLLzFMytiCf5gseD4",
  userId: "user123"
}
Response: {
  success: true,
  reward: { type: "MSC", amount: 10 },
  message: "チェックイン完了！"
}
```

### 認証トークン共有API
```typescript
POST /api/auth/verify-token
Body: { token: "まちサーガ認証トークン" }
Response: {
  valid: true,
  tntToken: "T&T用アクセストークン",
  user: { id: "user123", name: "ユーザー名" }
}
```

## 🚀 実装段階

### Phase 1: 基本連携 (Current)
- [x] トークン認証システム
- [x] iframe埋め込み試行
- [ ] T&T側OAuth設定
- [ ] CORS設定

### Phase 2: API統合 (Next)
- [ ] イベント情報API
- [ ] チェックインAPI  
- [ ] 認証トークン共有

### Phase 3: 最適化 (Future)
- [ ] リアルタイム同期
- [ ] プッシュ通知
- [ ] 分析・レポート

## 📞 連絡事項

### 技術責任者向け
このドキュメントをT&T技術チームと共有し、以下を確認してください：

1. **OAuth設定**: まちサーガドメインの許可登録
2. **CORS設定**: クロスオリジンアクセスの許可  
3. **セキュリティヘッダー**: iframe埋め込みの許可
4. **API提供**: 上記API仕様での連携可能性

### 期待される回答
- 各設定項目の実施可能性 (Yes/No)
- 実施時期の見込み (日程)
- 代替案の提案 (必要に応じて)
- 技術的制約や注意事項

## 🎯 成功基準

実装完了時に以下が動作すること：
1. まちサーガドメインからT&Tイベントページへのアクセス
2. iframe内でのT&T認証完了
3. チェックイン実行とMSC獲得
4. URL秘匿化の維持

---

**作成日**: 2025年9月10日  
**バージョン**: 1.0  
**担当**: まちサーガ技術チーム
