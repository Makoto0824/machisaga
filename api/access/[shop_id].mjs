import { kv } from '@vercel/kv';

/**
 * 店舗ごとのアクセス制御API
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
            message: 'Method not allowed'
        });
    }

    try {
        const { shop_id } = req.query;
        
        if (!shop_id) {
            return res.status(400).json({
                status: 'error',
                message: 'shop_id is required'
            });
        }

        // 1. ユーザーUUIDを取得または生成
        const userUuid = await getUserUuid(req, res);
        if (!userUuid) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to get user UUID'
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
            
            // 日次カウンタを更新（maxPerDayが設定されている場合）
            if (rule.maxPerDay > 0) {
                await updateDailyCounter(userUuid, shop_id, now);
            }
            
            return res.status(200).json({
                status: 'ok',
                retryAt: new Date(nextAvailableAt * 1000).toISOString()
            });
            
        } else {
            // 既存アクセス - 制限チェック
            const history = JSON.parse(accessHistory);
            
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
                
                // 日次カウンタを更新（maxPerDayが設定されている場合）
                if (rule.maxPerDay > 0) {
                    const dailyCount = await updateDailyCounter(userUuid, shop_id, now);
                    
                    // 日次制限チェック
                    if (dailyCount > rule.maxPerDay) {
                        // 日次制限に達している場合、翌日の0時まで待機
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        const nextAvailableAt = Math.floor(tomorrow.getTime() / 1000);
                        
                        const limitedHistory = {
                            nextAvailableAt: nextAvailableAt,
                            lastAccessAt: now
                        };
                        
                        // 翌日0時までのTTL
                        const ttlUntilTomorrow = nextAvailableAt - now;
                        await kv.setex(accessKey, ttlUntilTomorrow, JSON.stringify(limitedHistory));
                        
                        return res.status(200).json({
                            status: 'locked',
                            retryAt: new Date(nextAvailableAt * 1000).toISOString()
                        });
                    }
                }
                
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
            message: 'Server error'
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
    const rule = await kv.get(ruleKey);
    
    if (rule) {
        return JSON.parse(rule);
    }
    
    // デフォルトルール（1時間に1回、1日2回）
    const defaultRule = {
        intervalSeconds: 3600, // 1時間
        maxPerDay: 2
    };
    
    // デフォルトルールを保存
    await kv.set(ruleKey, JSON.stringify(defaultRule));
    
    return defaultRule;
}

/**
 * 日次カウンタを更新
 */
async function updateDailyCounter(userUuid, shopId, timestamp) {
    const date = new Date(timestamp * 1000);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const dailyKey = `daily:${userUuid}:${shopId}:${dateStr}`;
    
    const currentCount = await kv.get(dailyKey) || 0;
    const newCount = currentCount + 1;
    
    // 日次カウンタを保存（24時間のTTL）
    await kv.setex(dailyKey, 86400, newCount);
    
    return newCount;
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
