import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

/**
 * 店舗ごとのアクセス制御API (App Router)
 * パス: /api/access/[shop_id]
 * 例: /api/access/kurofune
 */

export async function GET(req, { params }) {
    try {
        const { shop_id } = params;
        
        if (!shop_id) {
            return NextResponse.json({
                status: 'error',
                message: 'shop_id is required',
                retryAt: null
            }, { status: 400 });
        }

        // 1. ユーザーUUIDを取得または生成
        const userUuid = await getUserUuid(req);
        if (!userUuid) {
            return NextResponse.json({
                status: 'error',
                message: 'Failed to get user UUID',
                retryAt: null
            }, { status: 500 });
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
            
            return NextResponse.json({
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
                
                return NextResponse.json({
                    status: 'ok',
                    retryAt: new Date(nextAvailableAt * 1000).toISOString()
                });
            }
            
            if (now < history.nextAvailableAt) {
                // 制限中
                return NextResponse.json({
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
                
                return NextResponse.json({
                    status: 'ok',
                    retryAt: new Date(nextAvailableAt * 1000).toISOString()
                });
            }
        }
        
    } catch (error) {
        console.error('Access control error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message || 'Server error',
            retryAt: null
        }, { status: 500 });
    }
}

export async function OPTIONS(req) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

/**
 * ユーザーUUIDを取得または生成
 */
async function getUserUuid(req) {
    // Cookieから取得を試行
    const cookies = req.cookies;
    const cookieUuid = cookies?.get('ms_uuid')?.value;
    
    if (cookieUuid) {
        return cookieUuid;
    }
    
    // UUIDを生成
    const uuid = generateUUID();
    
    return uuid; // Cookie設定はNextResponseで行う
}

/**
 * 店舗ルールを取得
 */
async function getShopRule(shopId) {
    const ruleKey = `rule:${shopId}`;
    const rule = await kv.get(ruleKey);
    
    if (rule) {
        try {
            return typeof rule === 'string' ? JSON.parse(rule) : rule;
        } catch (parseError) {
            console.error('Rule JSON parse error:', parseError, 'rule:', rule);
            // パースエラーの場合はデフォルトルールを使用
        }
    }
    
    // デフォルトルール（30分に1回）
    const defaultRule = {
        intervalSeconds: 1800, // 30分
        maxPerDay: 1
    };
    
    // デフォルトルールを保存
    await kv.set(ruleKey, JSON.stringify(defaultRule));
    
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
