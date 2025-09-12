/**
 * 使い切りURL リダイレクト API
 * T&T提供のURLプールから未使用URLを自動振り分け
 */

import kvURLManager from '../single-use-urls/kv-url-manager.mjs';

export default async function handler(req, res) {
    console.log('Single-Use URL API Request:', {
        method: req.method,
        url: req.url,
        query: req.query,
        userAgent: req.headers['user-agent']
    });

    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // GET: 未使用URLを取得してリダイレクト（一時的に無効化）
        if (req.method === 'GET') {
            // GETリクエストを完全に無効化（デバッグ用）
            return res.status(200).json({
                success: false,
                message: 'GETリクエストは一時的に無効化されています。POSTリクエストを使用してください。',
                debug: {
                    query: req.query,
                    userAgent: req.headers['user-agent']
                }
            });
            
            // 以下のコードは一時的にコメントアウト
            /*
            const userId = req.query.userId || generateGuestId(req);
            const eventName = req.query.event || null;
            const availableURL = await kvURLManager.getNextAvailableURL(userId, eventName);

            if (!availableURL) {
                const eventMessage = eventName ? `イベント${eventName}の` : '';
                return res.status(410).json({
                    success: false,
                    error: `${eventMessage}すべてのURLが使用済みです`,
                    message: 'イベントの募集は終了しました。次回の開催をお待ちください。',
                    stats: await kvURLManager.getStats()
                });
            }

            // 直接リダイレクト
            if (req.query.redirect === 'true') {
                console.log(`🎯 直接リダイレクト: ${availableURL.url} (${availableURL.event})`);
                res.writeHead(302, { 'Location': availableURL.url });
                res.end();
                return;
            }

            // URL情報を返す
            res.status(200).json({
                success: true,
                url: availableURL.url,
                urlId: availableURL.id,
                event: availableURL.event,
                description: availableURL.description,
                message: `${availableURL.event}のイベントページにリダイレクトします`,
                stats: await kvURLManager.getStats()
            });
            */
        }

        // POST: 管理者機能（リセット、統計など）
        else if (req.method === 'POST') {
            
            const { action, urlId } = req.body || {};
            
            // 認証チェックを無効化

            switch (action) {
                case 'stats':
                    const stats = await kvURLManager.getStats();
                    const recentUsage = await kvURLManager.getUsageHistory(10);
                    
                    res.status(200).json({
                        success: true,
                        stats,
                        recentUsage
                    });
                    break;

                case 'reset':
                    if (urlId) {
                        const result = await kvURLManager.resetURL(urlId);
                        res.status(200).json({
                            success: result.success,
                            message: result.message || (result.success ? `URL ${urlId} をリセットしました` : 'URLが見つかりません')
                        });
                    } else {
                        const result = await kvURLManager.resetAllURLs();
                        res.status(200).json({
                            success: result.success,
                            message: result.message || '全URLをリセットしました'
                        });
                    }
                    break;

                case 'export':
                    // TODO: KVマネージャーにexport機能を実装
                    res.status(200).json({
                        success: true,
                        message: '使用状況レポート機能は準備中です',
                        reportFile: null
                    });
                    break;

                case 'reload':
                    const loadedCount = await kvURLManager.loadFromCSV();
                    res.status(200).json({
                        success: true,
                        message: `CSVから${loadedCount}個のURLを読み込みました`,
                        stats: await kvURLManager.getStats()
                    });
                    break;

                default:
                    res.status(400).json({
                        success: false,
                        error: '無効なアクションです'
                    });
            }
        }

        else {
            res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('Single-Use URL API Error:', error);
        res.status(500).json({
            success: false,
            error: 'サーバーエラーが発生しました',
            details: error.message
        });
    }
}


/**
 * ゲストユーザーID生成
 */
function generateGuestId(req) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    const timestamp = Date.now();
    
    // 簡易的なハッシュ生成
    const hash = Buffer.from(`${ip}-${userAgent}-${timestamp}`).toString('base64').slice(0, 12);
    return `guest_${hash}`;
}
