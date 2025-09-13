import { kv } from '@vercel/kv';

/**
 * 店舗ルール管理API
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
                rules[shopId] = rule ? JSON.parse(rule) : null;
            }
            
            return res.status(200).json({
                success: true,
                rules: rules
            });
            
        } else if (req.method === 'POST' || req.method === 'PUT') {
            // ルールを更新
            const { shopId, intervalSeconds, maxPerDay } = req.body;
            
            if (!shopId) {
                return res.status(400).json({
                    success: false,
                    message: 'shopId is required'
                });
            }
            
            const rule = {
                intervalSeconds: intervalSeconds || 7200, // デフォルト2時間
                maxPerDay: maxPerDay || 1 // デフォルト1日1回
            };
            
            const ruleKey = `rule:${shopId}`;
            await kv.set(ruleKey, JSON.stringify(rule));
            
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
            message: 'Server error'
        });
    }
}
