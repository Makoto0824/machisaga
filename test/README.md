# トークン付きリダイレクトシステム

外部 URL を秘匿化して安全にリダイレクトするシステムです。

## 🎯 要件対応

### 要件 1: 外部 URL の非表示

- ✅ **対応**: 自社ドメイン上の中継ページ（`/redirect/[token]`）
- 外部 URL は完全に隠蔽され、トークン化された URL のみが表示されます

### 要件 2: 秘匿性の確保

- ✅ **対応**: ワンタイム・短期トークン（HMAC-SHA256 署名付き）
- 5 分間の有効期限と暗号学的署名による改ざん防止

### 要件 3: 簡易実装

- ✅ **対応**: iframe 埋め込みによる直接表示
- 複雑なサーバーサイド処理不要でシンプルな実装

## 📁 ファイル構成

```
test/
├── index.html                    # テスト用フロントエンド
├── api/
│   └── generate-token.js         # トークン生成API
├── redirect/
│   └── [token].html             # リダイレクトページ
├── env.example                  # 環境変数サンプル
├── SECURITY.md                  # セキュリティ対策ガイド
└── README.md                    # このファイル
```

## 🚀 使用方法

### 1. 環境設定

```bash
# 環境変数を設定（本番環境では必須）
cp env.example .env
# .envファイルを編集してSECRETを設定
```

### 2. トークン生成

```javascript
// API呼び出し例
const response = await fetch('/api/generate-token?url=https://example.com');
const data = await response.json();

// レスポンス例
{
  "success": true,
  "url": "/redirect/eyJ0YXJnZXRVcmwiOiJodHRwczovL2V4YW1wbGUuY29tIiw...?sig=abc123...",
  "expiresAt": 1703123456789,
  "message": "トークン付きリダイレクトURLを生成しました"
}
```

### 3. リダイレクト

生成された URL にアクセスすると、自動的に外部サイトが iframe 内に表示されます。

## 🔧 API 仕様

### GET /api/generate-token

**パラメータ:**

- `url` (string, required): リダイレクト先の URL

**レスポンス:**

```json
{
  "success": boolean,
  "url": string,        // リダイレクトURL
  "expiresAt": number,  // 有効期限（Unix timestamp）
  "message": string
}
```

### GET /redirect/[token]?sig=[signature]

**パラメータ:**

- `token` (string): Base64 エンコードされたトークン
- `sig` (string): HMAC-SHA256 署名

**動作:**

1. 署名検証
2. 有効期限チェック
3. iframe 内で外部サイト表示

## 🔒 セキュリティ機能

### 暗号学的保護

- **HMAC-SHA256 署名**: トークンの改ざんを防止
- **Base64 エンコード**: トークンの可読性を下げる
- **有効期限**: デフォルト 5 分で自動無効化

### iframe セキュリティ

```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
></iframe>
```

### エラーハンドリング

- 詳細なエラー情報の非表示
- 適切な HTTP ステータスコード
- セキュリティログの記録

## 🧪 テスト方法

### 1. ローカルテスト

```bash
# テストページにアクセス
open http://localhost:8000/test/
```

### 2. クイックテスト

テストページの「クイックテスト」セクションで以下の URL をテストできます：

- Example.com
- HTTPBin HTML
- Google
- GitHub

### 3. 手動テスト

```bash
# トークン生成
curl "http://localhost:8000/test/api/generate-token?url=https://example.com"

# 生成されたURLにアクセス
open "http://localhost:8000/test/redirect/[生成されたトークン]?sig=[署名]"
```

## ⚠️ 制限事項

### 1. X-Frame-Options

外部サイトが`X-Frame-Options: DENY`を設定している場合、iframe 表示ができません。

**対応策:**

- リダイレクト方式への変更
- 外部サイト側での CSP 調整

### 2. CSP（Content Security Policy）

外部サイトの CSP が厳しい場合、表示に影響する可能性があります。

### 3. トークン漏洩リスク

URL の漏洩によりトークンが露出する可能性があります。

**対策:**

- より短い有効期限
- 使用回数制限
- IP 制限

## 🔧 カスタマイズ

### 有効期限の変更

```javascript
// api/generate-token.js
const expiresAt = Date.now() + 10 * 60 * 1000; // 10分に変更
```

### ドメイン制限

```javascript
// 許可ドメインのチェック
const allowedDomains = ["https://example.com", "https://test.com"];
if (!allowedDomains.some((domain) => targetUrl.startsWith(domain))) {
  throw new Error("許可されていないドメインです");
}
```

### レート制限

```javascript
// 簡易レート制限
const rateLimit = new Map();
const clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
const now = Date.now();
const windowMs = 15 * 60 * 1000; // 15分
const maxRequests = 100;

if (rateLimit.has(clientIP)) {
  const requests = rateLimit
    .get(clientIP)
    .filter((time) => now - time < windowMs);
  if (requests.length >= maxRequests) {
    return res.status(429).json({ error: "レート制限に達しました" });
  }
  requests.push(now);
  rateLimit.set(clientIP, requests);
} else {
  rateLimit.set(clientIP, [now]);
}
```

## 📊 監視・ログ

### 推奨監視項目

- トークン生成頻度
- エラー率
- 異常なアクセスパターン
- 有効期限切れトークンの使用試行

### ログ例

```javascript
console.log({
  timestamp: new Date().toISOString(),
  action: "token_generated",
  ip: req.ip,
  userAgent: req.headers["user-agent"],
  targetUrl: targetUrl,
});
```

## 🚀 本番環境での注意点

1. **強力なシークレットキー**: 環境変数で適切に管理
2. **HTTPS 必須**: トークンの盗聴を防止
3. **ログ監視**: セキュリティイベントの監視
4. **レート制限**: 不正利用の防止
5. **定期的な監査**: セキュリティポリシーの見直し

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. 環境変数の設定
2. ネットワーク接続
3. 外部サイトのセキュリティポリシー
4. ブラウザのコンソールエラー

詳細なセキュリティ情報は `SECURITY.md` を参照してください。

---

## 🔐 T&Tプラットフォーム連携

### ログイン要件

まちサーガイベントページへのアクセスには、**T&Tプラットフォームへのログイン**が必要です。

### ログインフロー

1. **トークン検証**: URLトークンの有効性を確認
2. **ログイン案内**: T&Tログインページへの導線を表示
3. **ユーザーログイン**: GoogleまたはAppleアカウントで認証
4. **イベントアクセス**: ログイン完了後にまちサーガイベントへ進む

### T&Tログインページ

```
https://play.ttt.games/auth/signin
```

- **Google認証**: Googleアカウントでログイン/登録
- **Apple認証**: Appleアカウントでログイン/登録
- **利用規約**: T&Tの利用規約およびプライバシーポリシーに同意

### ユーザー体験フロー

1. **QRコード or リンク**: まちサーガイベントへのアクセス
2. **自動リダイレクト**: トークン付きURLで秘匿化されたページに遷移
3. **ログイン案内**: T&Tログインの必要性を説明
4. **新しいタブ**: T&Tログインページが新しいタブで開く
5. **ログイン完了**: GoogleまたはAppleで認証
6. **イベント参加**: まちサーガイベントページで活動

### 技術的実装

- **ログイン状態チェック**: iframe読み込みエラーでログイン状態を判定
- **ユーザーガイダンス**: ステップバイステップのログイン案内
- **エラーハンドリング**: ログイン未完了時の適切なメッセージ表示
