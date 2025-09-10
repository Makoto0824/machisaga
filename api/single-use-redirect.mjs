/**
 * 使い切りURL リダイレクト API
 * T&T提供のURLプールから未使用URLを自動振り分け
 */

import SingleUseURLManager from '../single-use-urls/url-manager.mjs';

const urlManager = new SingleUseURLManager();

export default function handler(req, res) {
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
        // GET: 未使用URLを取得してリダイレクト
        if (req.method === 'GET') {
            const userId = req.query.userId || generateGuestId(req);
            const availableURL = urlManager.getNextAvailableURL(userId);

            if (!availableURL) {
                return res.status(410).json({
                    success: false,
                    error: 'すべてのURLが使用済みです',
                    message: 'イベントの募集は終了しました。次回の開催をお待ちください。',
                    stats: urlManager.getStats()
                });
            }

            // 直接リダイレクト
            if (req.query.redirect === 'true') {
                console.log(`🎯 直接リダイレクト: ${availableURL.url}`);
                res.writeHead(302, { 'Location': availableURL.url });
                res.end();
                return;
            }

            // URL情報を返す
            res.status(200).json({
                success: true,
                url: availableURL.url,
                urlId: availableURL.id,
                mscAmount: availableURL.mscAmount,
                description: availableURL.description,
                message: `${availableURL.mscAmount} MSCを獲得できるイベントページにリダイレクトします`,
                stats: urlManager.getStats()
            });
        }

        // POST: 管理者機能（リセット、統計など）
        else if (req.method === 'POST') {
            const { action, password, urlId } = req.body || {};
            
            // 簡易認証（本番では強化）
            if (password !== 'machisaga-admin-2025') {
                return res.status(401).json({
                    success: false,
                    error: '認証が必要です'
                });
            }

            switch (action) {
                case 'stats':
                    const stats = urlManager.getStats();
                    const recentUsage = urlManager.urls
                        .filter(url => url.used)
                        .sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt))
                        .slice(0, 10);
                    
                    res.status(200).json({
                        success: true,
                        stats,
                        recentUsage,
                        totalUrls: urlManager.urls.length
                    });
                    break;

                case 'reset':
                    if (urlId) {
                        const success = urlManager.resetURL(urlId);
                        res.status(200).json({
                            success,
                            message: success ? `URL ${urlId} をリセットしました` : 'URLが見つかりません'
                        });
                    } else {
                        urlManager.resetAllURLs();
                        res.status(200).json({
                            success: true,
                            message: '全URLをリセットしました'
                        });
                    }
                    break;

                case 'export':
                    const reportFile = urlManager.exportUsageReport();
                    res.status(200).json({
                        success: true,
                        message: '使用状況レポートを生成しました',
                        reportFile
                    });
                    break;

                case 'reload':
                    const loadedCount = urlManager.loadFromCSV();
                    res.status(200).json({
                        success: true,
                        message: `CSVから${loadedCount}個のURLを読み込みました`,
                        stats: urlManager.getStats()
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
