/**
 * アクセス制御テストAPI
 * パス: /api/test-access
 */

export default async function handler(req, res) {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // シンプルなテストレスポンス
        return res.status(200).json({
            status: 'ok',
            retryAt: new Date(Date.now() + 3600000).toISOString(), // 1時間後
            message: 'Test API working'
        });
    } catch (error) {
        console.error('Test API error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Test API error: ' + error.message,
            retryAt: null
        });
    }
}
