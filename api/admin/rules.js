import { kv } from '@vercel/kv';

/**
 * 指定店舗の全アクセス履歴をクリア
 */
async function clearAllAccessHistory(shopId) {
    try {
        // アクセス履歴のキーパターンを検索
        const pattern = `access:*:${shopId}`;
        const keys = await kv.keys(pattern);
        
        if (keys.length > 0) {
            // 複数のキーを一括削除
            await kv.del(...keys);
            console.log(`Cleared ${keys.length} access history entries for shop: ${shopId}`);
        }
    } catch (error) {
        console.error('Error clearing access history:', error);
    }
}

/**
 * 店舗ルール管理API (Pages Router)
 * パス: /api/admin/rules
 */

export default async function handler(req, res) {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // 全店舗のルールを取得
            const shopIds = ['kurofune']; // 現在の店舗ID一覧
            const rules = {};
            
            for (const shopId of shopIds) {
                const ruleKey = `rule:${shopId}`;
                const rule = await kv.get(ruleKey);
                rules[shopId] = rule || { intervalSeconds: 7200, maxPerDay: 1 };
            }
            
            return res.status(200).json({
                success: true,
                rules: rules
            });
            
        } else if (req.method === 'POST' || req.method === 'PUT') {
            // ルールを更新
            let body;
            try {
                body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON body'
                });
            }
            
            const { shopId, intervalSeconds, maxPerDay } = body;
            
            if (!shopId) {
                return res.status(400).json({
                    success: false,
                    message: 'shopId is required'
                });
            }
            
            const rule = {
                intervalSeconds: intervalSeconds !== undefined ? intervalSeconds : 7200, // デフォルト2時間
                maxPerDay: maxPerDay !== undefined ? maxPerDay : 1 // 0も有効な値として扱う
            };
            
            const ruleKey = `rule:${shopId}`;
            await kv.set(ruleKey, JSON.stringify(rule));
            
            // ルール変更時に既存のアクセス履歴をクリア
            await clearAllAccessHistory(shopId);
            
            return res.status(200).json({
                success: true,
                message: `Rule updated for shop: ${shopId}`,
                rule: rule
            });
            
        } else if (req.method === 'DELETE') {
            // ルールを削除（デフォルトに戻す）
            const { shopId } = req.query;
            
            if (!shopId) {
                return res.status(400).json({
                    success: false,
                    message: 'shopId is required'
                });
            }
            
            const ruleKey = `rule:${shopId}`;
            await kv.del(ruleKey);
            
            return res.status(200).json({
                success: true,
                message: `Rule deleted for shop: ${shopId}`
            });
            
        } else {
            return res.status(405).json({
                success: false,
                message: 'Method not allowed'
            });
        }
        
    } catch (error) {
        console.error('Rules API error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
}
