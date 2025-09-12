/**
 * KV (Redis) 接続テスト用API
 * デバッグと動作確認用
 */

import kvURLManager from '../single-use-urls/kv-url-manager.mjs';

export default async function handler(req, res) {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { action } = req.query;

        switch (action) {
            case 'status':
                // KV接続状態を確認
                const status = await kvURLManager.checkKVStatus();
                return res.status(200).json({
                    success: true,
                    action: 'status',
                    result: status,
                    timestamp: new Date().toISOString()
                });

            case 'stats':
                // 統計情報を取得
                const stats = await kvURLManager.getStats();
                return res.status(200).json({
                    success: true,
                    action: 'stats',
                    result: stats,
                    timestamp: new Date().toISOString()
                });

            case 'load':
                // CSVからデータを読み込み
                const loadedCount = await kvURLManager.loadFromCSV();
                return res.status(200).json({
                    success: true,
                    action: 'load',
                    result: { loadedCount },
                    timestamp: new Date().toISOString()
                });

            case 'test-write':
                // テスト用データを書き込み
                const { kv } = await import('@vercel/kv');
                const testKey = `test:${Date.now()}`;
                const testData = {
                    message: 'KV接続テスト成功',
                    timestamp: new Date().toISOString(),
                    random: Math.random()
                };
                
                await kv.set(testKey, testData);
                const retrievedData = await kv.get(testKey);
                
                return res.status(200).json({
                    success: true,
                    action: 'test-write',
                    result: {
                        written: testData,
                        retrieved: retrievedData,
                        key: testKey
                    },
                    timestamp: new Date().toISOString()
                });

            case 'recent':
                // 最近の使用履歴を取得
                const recent = await kvURLManager.getRecentUsage(5);
                return res.status(200).json({
                    success: true,
                    action: 'recent',
                    result: recent,
                    timestamp: new Date().toISOString()
                });

            case 'getNextURL':
                // 次の利用可能なURLを取得（イベント指定可能）
                const eventId = req.query.event;
                const nextURL = await kvURLManager.getNextAvailableURL(null, eventId);
                return res.status(200).json({
                    success: true,
                    action: 'getNextURL',
                    result: { 
                        nextURL,
                        eventId: eventId || 'all'
                    },
                    timestamp: new Date().toISOString()
                });

            case 'clearAllData':
                // KVデータを全削除
                const clearResult = await kvURLManager.clearAllData();
                return res.status(200).json({
                    success: true,
                    action: 'clearAllData',
                    result: clearResult,
                    timestamp: new Date().toISOString()
                });

            default:
                return res.status(400).json({
                    success: false,
                    error: '無効なアクション',
                    availableActions: ['status', 'stats', 'load', 'test-write', 'recent', 'getNextURL', 'clearAllData']
                });
        }

    } catch (error) {
        console.error('KV Test API Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
