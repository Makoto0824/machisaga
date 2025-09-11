# T&T側リダイレクト設定要求書

## 目的
T&Tイベントページから まちサーガ使い切りURL管理システムへの自動リダイレクト

## 現在の状況
- **T&T URL**: https://play.ttt.games/worlds/machi-saga/events/b-mjFuRIEBL3xROr64xXA3qaSkZ5L926lSWCOXVtH60/checkin
- **状態**: 直接アクセス可能
- **問題**: 使い切りURL管理ができない

## 要求事項

### 1. JavaScriptリダイレクトの追加
T&Tイベントページに以下のJavaScriptコードを追加：

```html
<script>
// まちサーガ自動リダイレクト
(function() {
    // リダイレクト先URL
    const redirectUrl = 'https://machisaga.vercel.app/event-redirect-strategy?target=' + 
                       encodeURIComponent(window.location.href);
    
    // 3秒後にリダイレクト
    setTimeout(function() {
        window.location.href = redirectUrl;
    }, 3000);
    
    // メッセージ表示
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
        ">
            <h3>🏰 まちサーガイベント管理システム</h3>
            <p>3秒後に自動的にリダイレクトします...</p>
            <div id="countdown" style="font-size: 2rem; margin: 1rem 0;">3</div>
            <button onclick="window.location.href='${redirectUrl}'" style="
                background: #4caf50;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
            ">今すぐリダイレクト</button>
        </div>
    `;
    document.body.appendChild(message);
    
    // カウントダウン
    let count = 3;
    const countdownInterval = setInterval(function() {
        count--;
        const countdownEl = document.getElementById('countdown');
        if (countdownEl) countdownEl.textContent = count;
        if (count <= 0) clearInterval(countdownInterval);
    }, 1000);
})();
</script>
```

### 2. メタリダイレクトの追加（代替案）
HTMLヘッダーに以下を追加：

```html
<meta http-equiv="refresh" content="5;url=https://machisaga.vercel.app/event-redirect-strategy?target=https://play.ttt.games/worlds/machi-saga/events/b-mjFuRIEBL3xROr64xXA3qaSkZ5L926lSWCOXVtH60/checkin">
```

### 3. 完全非公開設定（最終手段）
- T&TイベントページをCompletely private に設定
- まちサーガシステム経由でのみアクセス可能にする

## 期待される効果

### ユーザーフロー
1. **T&T URL にアクセス**
2. **3秒間の案内表示**
3. **まちサーガシステムに自動リダイレクト**
4. **使い切りURL自動振り分け**
5. **実際のイベントページ表示**

### 技術的利点
- ✅ 完全な使用状況管理
- ✅ 重複アクセス防止
- ✅ リアルタイム統計
- ✅ ユーザー体験の向上

## 実装優先度
1. **最優先**: JavaScriptリダイレクト
2. **代替**: メタリダイレクト
3. **最終手段**: 完全非公開設定

---
**連絡先**: まちサーガ技術チーム  
**実装希望日**: 可能な限り早急に
