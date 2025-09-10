// まちサーガ - トークン付きリダイレクトシステム設定
// 複数の隠したいURLを一元管理

// 対象URL設定（10個のプライベートURL）
const TARGET_URLS = {
    // イベント系
    'event1': 'https://play.ttt.games/worlds/machi-saga/events/WsDzeA-BjEOjN833J0-tTzRDHnnLLzFMytiCf5gseD4/checkin',
    'event2': 'https://play.ttt.games/worlds/machi-saga/events/second-event-id/checkin',
    'event3': 'https://play.ttt.games/worlds/machi-saga/events/third-event-id/checkin',
    
    // 店舗系
    'shop1': 'https://kurofune-kashiten.com/members-only-page',
    'shop2': 'https://kushikatsu-masuya.com/special-discount',
    'shop3': 'https://mobara-shop3.com/vip-access',
    
    // キャンペーン系
    'campaign1': 'https://machi-saga-campaign.com/summer-special',
    'campaign2': 'https://machi-saga-campaign.com/winter-bonus',
    
    // パートナー系
    'partner1': 'https://local-partner1.com/collaboration-page',
    'partner2': 'https://local-partner2.com/exclusive-content'
};

// 表示名設定（管理者向け）
const TARGET_NAMES = {
    'event1': 'メインイベント - チェックイン',
    'event2': 'サブイベント - 限定コンテンツ',
    'event3': 'スペシャルイベント - VIP体験',
    'shop1': '黒船菓子店 - メンバー限定',
    'shop2': '串かつ枡や - 特別割引',
    'shop3': '茂原店舗3 - VIPアクセス',
    'campaign1': '夏季限定キャンペーン',
    'campaign2': '冬季ボーナス企画',
    'partner1': 'パートナー店舗1 - コラボ',
    'partner2': 'パートナー店舗2 - 限定コンテンツ'
};

// デフォルト設定
const CONFIG = {
    defaultTarget: 'event1',
    tokenExpiry: 5 * 60 * 1000, // 5分
    secretKey: 'machisaga-secret-key-2025',
    maxRedirectAttempts: 3,
    timeoutDuration: 10000 // 10秒
};

// ES6モジュール形式でのエクスポート（使用時）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TARGET_URLS, TARGET_NAMES, CONFIG };
}

// ブラウザ環境での使用（グローバル変数）
if (typeof window !== 'undefined') {
    window.MACHISAGA_CONFIG = { TARGET_URLS, TARGET_NAMES, CONFIG };
    console.log('まちサーガ設定読み込み完了:', {
        targetCount: Object.keys(TARGET_URLS).length,
        defaultTarget: CONFIG.defaultTarget,
        tokenExpiry: CONFIG.tokenExpiry / 1000 / 60 + '分'
    });
}
