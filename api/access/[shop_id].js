/**
 * 店舗ごとのアクセス制御API（シンプル版）
 * パス: /api/access/[shop_id]
 * 例: /api/access/kurofune
 */

export default async function handler(req, res) {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            status: 'error',
            message: 'Method not allowed',
            retryAt: null
        });
    }

    try {
        const { shop_id } = req.query;
        
        if (!shop_id) {
            return res.status(400).json({
                status: 'error',
                message: 'shop_id is required',
                retryAt: null
            });
        }

        // シンプルな実装：常に許可（テスト用）
        const nextAvailableAt = new Date(Date.now() + 3600000); // 1時間後
        
        return res.status(200).json({
            status: 'ok',
            retryAt: nextAvailableAt.toISOString()
        });
        
    } catch (error) {
        console.error('Access control error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Server error: ' + error.message,
            retryAt: null
        });
    }
}

