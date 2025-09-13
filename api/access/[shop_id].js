import { kv } from '@vercel/kv';

/**
 * 店舗ごとのアクセス制御API (Pages Router)
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

    if (req.method === 'DELETE') {
        // アクセス履歴をクリア（デバッグ用）
        const { shop_id } = req.query;
        if (!shop_id) {
            return res.status(400).json({
                status: 'error',
                message: 'shop_id is required',
                retryAt: null
            });
        }
        
        const userUuid = await getUserUuid(req, res);
        const accessKey = `access:${userUuid}:${shop_id}`;
        await kv.del(accessKey);
        
        return res.status(200).json({
            status: 'ok',
            message: 'Access history cleared',
            retryAt: null
        });
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

        // 1. ユーザーUUIDを取得または生成
        const userUuid = await getUserUuid(req, res);
        if (!userUuid) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to get user UUID',
                retryAt: null
            });
        }

        // 2. 店舗ルールを取得
        const rule = await getShopRule(shop_id);
        
        // 3. アクセス履歴を取得
        const accessKey = `access:${userUuid}:${shop_id}`;
        const accessHistory = await kv.get(accessKey);
        
        const now = Math.floor(Date.now() / 1000);
        
        // 4. アクセス制御ロジック
        if (!accessHistory) {
            // 初回アクセス - 許可
            const nextAvailableAt = now + rule.intervalSeconds;
            const newAccessHistory = {
                nextAvailableAt: nextAvailableAt,
                lastAccessAt: now
            };
            
            // アクセス履歴を保存（TTL設定）
            await kv.setex(accessKey, rule.intervalSeconds, JSON.stringify(newAccessHistory));
            
            return res.status(200).json({
                status: 'ok',
                retryAt: new Date(nextAvailableAt * 1000).toISOString()
            });
            
        } else {
            // 既存アクセス - 制限チェック
            let history;
            try {
                history = typeof accessHistory === 'string' ? JSON.parse(accessHistory) : accessHistory;
            } catch (parseError) {
                console.error('JSON parse error:', parseError, 'accessHistory:', accessHistory);
                // パースエラーの場合は初回アクセスとして扱う
                const nextAvailableAt = now + rule.intervalSeconds;
                const newAccessHistory = {
                    nextAvailableAt: nextAvailableAt,
                    lastAccessAt: now
                };
                
                await kv.setex(accessKey, rule.intervalSeconds, JSON.stringify(newAccessHistory));
                
                return res.status(200).json({
                    status: 'ok',
                    retryAt: new Date(nextAvailableAt * 1000).toISOString()
                });
            }
            
            if (now < history.nextAvailableAt) {
                // 制限中
                return res.status(200).json({
                    status: 'locked',
                    retryAt: new Date(history.nextAvailableAt * 1000).toISOString()
                });
            } else {
                // 制限解除 - 許可
                const nextAvailableAt = now + rule.intervalSeconds;
                const updatedHistory = {
                    nextAvailableAt: nextAvailableAt,
                    lastAccessAt: now
                };
                
                // アクセス履歴を更新（TTL更新）
                await kv.setex(accessKey, rule.intervalSeconds, JSON.stringify(updatedHistory));
                
                return res.status(200).json({
                    status: 'ok',
                    retryAt: new Date(nextAvailableAt * 1000).toISOString()
                });
            }
        }
        
    } catch (error) {
        console.error('Access control error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server error',
            retryAt: null
        });
    }
}

/**
 * ユーザーUUIDを取得または生成
 */
async function getUserUuid(req, res) {
    // Cookieから取得を試行
    const cookieUuid = req.cookies?.ms_uuid;
    if (cookieUuid) {
        return cookieUuid;
    }
    
    // UUIDを生成
    const uuid = generateUUID();
    
    // Cookieに設定
    res.setHeader('Set-Cookie', `ms_uuid=${uuid}; Path=/; Max-Age=31536000; SameSite=Lax`);
    
    return uuid;
}

/**
 * 店舗ルールを取得
 */
async function getShopRule(shopId) {
    const ruleKey = `rule:${shopId}`;
    const raw = await kv.get(ruleKey);
    
    if (raw) {
        try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return parsed;
        } catch (e) {
            console.error('Rule parse error:', e, raw);
        }
    }
    
    // デフォルトルール（30分に1回）
    const defaultRule = { intervalSeconds: 1800, maxPerDay: 1 };
    await kv.set(ruleKey, JSON.stringify(defaultRule)); // 文字列で保存に統一
    return defaultRule;
}

/**
 * UUID生成
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
