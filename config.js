// まちサーガ - トークン付きリダイレクトシステム設定
// 複数の隠したいURLを一元管理

// 対象URL設定（9個のまちサーガイベントURL）
const TARGET_URLS = {
    // まちサーガイベント（MSC報酬順）
    'event_1msc': 'https://play.ttt.games/worlds/machi-saga/events/b-mjFuRIEBL3xROr64xXA3qaSkZ5L926lSWCOXVtH60/checkin',
    'event_4msc': 'https://play.ttt.games/worlds/machi-saga/events/iZP-oFgwKs-rwFFVToqXkV488vnDHjyxIPF_hZ5y8MM/checkin',
    'event_6msc': 'https://play.ttt.games/worlds/machi-saga/events/x2pNQFx8ChWMoYPfgrXopstCgZ9HMF8JCPpNXmyXpn0/checkin',
    'event_8msc': 'https://play.ttt.games/worlds/machi-saga/events/Ti0h_WV3B8OiAXAi-vxtodyw6wAyT35MHRGcsCBuh0g/checkin',
    'event_10msc': 'https://play.ttt.games/worlds/machi-saga/events/17VlTOfDKjp6tqoAnuXxlgvsE4wRofg2Hz1i_rr_5Fc/checkin',
    'event_12msc': 'https://play.ttt.games/worlds/machi-saga/events/MyKXAlK_qOWpn9hKrZEWrQKypMoE8Ess9C1PhKBXg0A/checkin',
    'event_14msc': 'https://play.ttt.games/worlds/machi-saga/events/CrXfZStcu7XMtyDI77JE5lKlk7RYsZVcF5Xdk2XyiB0/checkin',
    'event_16msc': 'https://play.ttt.games/worlds/machi-saga/events/in7B9olSOc9H-W7yoxpV3T9WFJQwgM9vYUVrkKyHgBU/checkin',
    'event_21msc': 'https://play.ttt.games/worlds/machi-saga/events/WsDzeA-BjEOjN833J0-tTzRDHnnLLzFMytiCf5gseD4/checkin'
};

// 表示名設定（管理者向け）
const TARGET_NAMES = {
    'event_1msc': 'まちサーガイベント - 1 MSC報酬',
    'event_4msc': 'まちサーガイベント - 4 MSC報酬',
    'event_6msc': 'まちサーガイベント - 6 MSC報酬',
    'event_8msc': 'まちサーガイベント - 8 MSC報酬',
    'event_10msc': 'まちサーガイベント - 10 MSC報酬',
    'event_12msc': 'まちサーガイベント - 12 MSC報酬',
    'event_14msc': 'まちサーガイベント - 14 MSC報酬',
    'event_16msc': 'まちサーガイベント - 16 MSC報酬',
    'event_21msc': 'まちサーガイベント - 21 MSC報酬'
};

// デフォルト設定
const CONFIG = {
    defaultTarget: 'event_21msc', // 最高報酬のイベントをデフォルト
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
