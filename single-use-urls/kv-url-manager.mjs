/**
 * KV (Redis) ベースの使い切りURL管理システム
 * Vercel KVを使用して永続的なURL管理を実現
 */

import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class KVURLManager {
    constructor() {
        this.csvFile = path.join(__dirname, 'tnt-urls.csv');
        this.isKVAvailable = false;
        this.initializeKV();
    }

    /**
     * KV接続の初期化とテスト
     */
    async initializeKV() {
        try {
            // KV接続テスト
            await kv.ping();
            this.isKVAvailable = true;
            console.log('✅ Vercel KV接続成功');
            
            // 初期データの読み込み
            await this.loadFromCSV();
        } catch (error) {
            console.warn('⚠️ Vercel KV接続失敗:', error.message);
            this.isKVAvailable = false;
        }
    }

    /**
     * CSVファイルからURLを読み込んでKVに保存
     */
    async loadFromCSV() {
        try {
            if (!fs.existsSync(this.csvFile)) {
                console.warn('⚠️ CSVファイルが見つかりません:', this.csvFile);
                return 0;
            }

            const csvContent = fs.readFileSync(this.csvFile, 'utf-8');
            const lines = csvContent.split('\n').filter(line => line.trim());
            const urlLines = lines.slice(1); // ヘッダーをスキップ

            console.log(`📄 CSVから${urlLines.length}個のURLを読み込み中...`);
            console.log(`📄 CSV内容: ${csvContent.substring(0, 200)}...`);

            // 既存のURLデータをクリア（データ損失を防ぐため無効化）
            if (this.isKVAvailable) {
                const existingKeys = await kv.keys('url:*');
                console.log(`🔍 既存のKVキー: ${existingKeys.length}個`, existingKeys);
                // データ損失を防ぐため、既存データのクリアを無効化
                console.log(`⚠️ データ保護のため、既存データのクリアをスキップしました`);
            }

            let loadedCount = 0;
            
            // 重複チェック用のセット
            const urlSet = new Set();
            const idSet = new Set();
            const duplicates = {
                urls: [],
                ids: []
            };

            for (const line of urlLines) {
                const [id, event, url, description] = line.split(',').map(item => item.trim().replace(/"/g, ''));
                
                if (!url || !url.startsWith('http')) continue;

                const urlData = {
                    id: id || `url_${loadedCount + 1}`,
                    event: event || 'Default',
                    url: url,
                    description: description || `まちサーガイベント ${loadedCount + 1}`,
                    used: false,
                    usedAt: null,
                    usedBy: null
                };

                // ID重複チェック
                if (idSet.has(urlData.id)) {
                    console.warn(`⚠️ ID重複: ${urlData.id}`);
                    duplicates.ids.push(urlData.id);
                }
                idSet.add(urlData.id);

                // URL重複チェック
                if (urlSet.has(urlData.url)) {
                    console.warn(`⚠️ URL重複: ${urlData.url}`);
                    duplicates.urls.push(urlData.url);
                }
                urlSet.add(urlData.url);

                // KVに保存（既存データを保護）
                if (this.isKVAvailable) {
                    const existingData = await kv.get(`url:${urlData.id}`);
                    if (existingData) {
                        console.log(`⚠️ 既存データを保護: ${urlData.id} (${urlData.event})`);
                        // 既存データがある場合は、使用状況を保持してURLと説明のみ更新
                        urlData.used = existingData.used;
                        urlData.usedAt = existingData.usedAt;
                        urlData.usedBy = existingData.usedBy;
                    }
                    await kv.set(`url:${urlData.id}`, urlData);
                }

                loadedCount++;
            }

            // 重複チェック結果をログ出力
            if (duplicates.ids.length > 0) {
                console.warn(`❌ ID重複検出: ${duplicates.ids.join(', ')}`);
            }
            if (duplicates.urls.length > 0) {
                console.warn(`❌ URL重複検出: ${duplicates.urls.join(', ')}`);
            }
            if (duplicates.ids.length === 0 && duplicates.urls.length === 0) {
                console.log('✅ 重複なし');
            }

            // 重複情報をKVに保存（統計情報で使用）
            if (this.isKVAvailable) {
                await kv.set('duplicates', duplicates);
            }

            console.log(`✅ ${loadedCount}個のURLをKVに保存しました`);
            return loadedCount;

        } catch (error) {
            console.error('❌ CSV読み込みエラー:', error);
            return 0;
        }
    }

    /**
     * 未使用URLを1つ取得して使用済みにマーク
     */
    async getNextAvailableURL(userId = null, eventId = null) {
        console.log(`🔍 getNextAvailableURL called - userId: ${userId}, eventId: ${eventId}`);
        
        if (!this.isKVAvailable) {
            console.warn('⚠️ KVが利用できません');
            return null;
        }

        try {
            // 重複チェック: 重複URLがある場合は配布を停止
            const duplicates = await kv.get('duplicates') || { urls: [], ids: [] };
            if (duplicates.urls.length > 0 || duplicates.ids.length > 0) {
                console.warn(`❌ 重複URL/IDが検出されているため、URL配布を停止します`);
                console.warn(`❌ URL重複: ${duplicates.urls.length}個, ID重複: ${duplicates.ids.length}個`);
                
                // エラー履歴を保存
                await this.saveErrorHistory({
                    type: 'duplicate_detected',
                    message: '重複URL/IDが検出されているため、URL配布を停止しました。CSVファイルを修正してください。',
                    eventId: eventId,
                    userId: userId || 'anonymous',
                    timestamp: new Date().toISOString(),
                    duplicates: duplicates
                });
                
                return {
                    error: 'duplicate_detected',
                    message: '重複URL/IDが検出されているため、URL配布を停止しました。CSVファイルを修正してください。',
                    duplicates: duplicates
                };
            }

            // 全URLキーを取得
            const urlKeys = await kv.keys('url:*');
            
            let availableURL = null;
            
            // イベント別または全イベントから未使用URLを検索
            for (const key of urlKeys) {
                const urlData = await kv.get(key);
                
                if (!urlData || urlData.used) continue;
                
                // eventIdが指定されている場合、数値として比較
                if (eventId && urlData.event !== eventId) continue;
                
                availableURL = urlData;
                break;
            }

            if (!availableURL) {
                console.log(`❌ 利用可能なURLがありません (イベント: ${eventId || '全イベント'})`);
                return null;
            }

            // 使用済みにマーク
            availableURL.used = true;
            availableURL.usedAt = new Date().toISOString();
            availableURL.usedBy = userId || 'anonymous';

            // KVに保存
            await kv.set(`url:${availableURL.id}`, availableURL);

            console.log(`🎯 URL配布: ${availableURL.id} (${availableURL.event}) → ${userId || 'anonymous'}`);
            return availableURL;

        } catch (error) {
            console.error('❌ URL取得エラー:', error);
            return null;
        }
    }

    /**
     * 使用状況の統計を取得
     */
    async getStats() {
        console.log('📊 getStats called');
        
        if (!this.isKVAvailable) {
            return {
                total: 0,
                used: 0,
                available: 0,
                usageRate: '0.0',
                events: {},
                error: 'KVが利用できません'
            };
        }

        try {
            const urlKeys = await kv.keys('url:*');
            console.log(`🔍 getStats: KVから${urlKeys.length}個のキーを取得`, urlKeys);
            const urls = [];

            // 全URLデータを取得
            for (const key of urlKeys) {
                const urlData = await kv.get(key);
                if (urlData) {
                    urls.push(urlData);
                    console.log(`📊 URLデータ: ${key} = ${urlData.id} (${urlData.event}) - used: ${urlData.used}`);
                } else {
                    console.warn(`⚠️ キー${key}のデータがnullです`);
                }
            }

            const total = urls.length;
            const used = urls.filter(url => url.used).length;
            const available = total - used;

            // イベント別統計
            const eventStats = {};
            urls.forEach(url => {
                if (!eventStats[url.event]) {
                    eventStats[url.event] = { total: 0, used: 0, available: 0 };
                }
                eventStats[url.event].total++;
                if (url.used) {
                    eventStats[url.event].used++;
                } else {
                    eventStats[url.event].available++;
                }
            });

            // 各イベントの利用率を計算
            Object.keys(eventStats).forEach(event => {
                const stats = eventStats[event];
                stats.usageRate = stats.total > 0 ? ((stats.used / stats.total) * 100).toFixed(1) : 0;
            });

            console.log(`📊 統計: 総数=${total}, 使用済み=${used}, 利用可能=${available}`);

            // 重複情報を取得
            const duplicates = await kv.get('duplicates') || { urls: [], ids: [] };

            console.log(`📊 統計: 総数=${total}, 使用済み=${used}, 利用可能=${available}, 利用率=${((used / total) * 100).toFixed(1)}%`);
            console.log(`📊 重複: ID重複=${duplicates.ids.length}個, URL重複=${duplicates.urls.length}個`);

            return {
                total,
                used,
                available,
                usageRate: total > 0 ? ((used / total) * 100).toFixed(1) : 0,
                events: eventStats,
                duplicates: {
                    idDuplicates: duplicates.ids.length,
                    urlDuplicates: duplicates.urls.length,
                    duplicateIds: duplicates.ids,
                    duplicateUrls: duplicates.urls
                }
            };

        } catch (error) {
            console.error('❌ 統計取得エラー:', error);
            return {
                total: 0,
                used: 0,
                available: 0,
                usageRate: '0.0',
                events: {},
                error: error.message
            };
        }
    }

    /**
     * 使用済みURLをリセット（管理者用）
     */
    async resetURL(urlId) {
        if (!this.isKVAvailable) {
            return { success: false, error: 'KVが利用できません' };
        }

        try {
            const urlData = await kv.get(`url:${urlId}`);
            if (!urlData) {
                return { success: false, error: 'URLが見つかりません' };
            }

            urlData.used = false;
            urlData.usedAt = null;
            urlData.usedBy = null;

            await kv.set(`url:${urlId}`, urlData);

            console.log(`🔄 URLリセット: ${urlId}`);
            return { success: true, message: `URL ${urlId} をリセットしました` };

        } catch (error) {
            console.error('❌ URLリセットエラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 全URLをリセット（管理者用）
     * 注意: 使用済みURLは恒久的に使用済みのまま保持される
     */
    async resetAllURLs() {
        console.log('🔄 resetAllURLs called');
        
        if (!this.isKVAvailable) {
            return { success: false, error: 'KVが利用できません' };
        }

        try {
            const urlKeys = await kv.keys('url:*');
            let totalCount = 0;
            let usedCount = 0;
            let availableCount = 0;

            // 統計情報を取得（リセットは行わない）
            for (const key of urlKeys) {
                const urlData = await kv.get(key);
                if (urlData) {
                    totalCount++;
                    if (urlData.used) {
                        usedCount++;
                    } else {
                        availableCount++;
                    }
                }
            }

            console.log(`🔄 全URLリセット: 使用済みURLは恒久的に保持されます`);
            console.log(`📊 現在の状況: 総数=${totalCount}, 使用済み=${usedCount}, 利用可能=${availableCount}`);
            
            return { 
                success: true, 
                message: `使用済みURLは恒久的に保持されます。現在: 使用済み${usedCount}個、利用可能${availableCount}個`,
                stats: {
                    total: totalCount,
                    used: usedCount,
                    available: availableCount
                }
            };

        } catch (error) {
            console.error('❌ 全URLリセットエラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 最近の使用履歴を取得
     */
    async getRecentUsage(limit = 10) {
        if (!this.isKVAvailable) {
            return [];
        }

        try {
            const urlKeys = await kv.keys('url:*');
            const usedUrls = [];

            for (const key of urlKeys) {
                const urlData = await kv.get(key);
                if (urlData && urlData.used) {
                    usedUrls.push(urlData);
                }
            }

            // 使用日時でソート（新しい順）
            usedUrls.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));

            return usedUrls.slice(0, limit);

        } catch (error) {
            console.error('❌ 使用履歴取得エラー:', error);
            return [];
        }
    }

    /**
     * KV接続状態を確認
     */
    async checkKVStatus() {
        try {
            await kv.ping();
            return { connected: true, message: 'KV接続正常' };
        } catch (error) {
            return { connected: false, message: `KV接続エラー: ${error.message}` };
        }
    }

    /**
     * エラー履歴を保存
     */
    async saveErrorHistory(errorData) {
        if (!this.isKVAvailable) {
            return;
        }

        try {
            const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await kv.set(`error:${errorId}`, errorData);
            console.log(`📝 エラー履歴を保存: ${errorId} - ${errorData.type}`);
        } catch (error) {
            console.error('❌ エラー履歴保存エラー:', error);
        }
    }

    /**
     * 使用履歴を取得（エラー履歴も含む）
     */
    async getUsageHistory(limit = 10) {
        if (!this.isKVAvailable) {
            return [];
        }

        try {
            const urlKeys = await kv.keys('url:*');
            const errorKeys = await kv.keys('error:*');
            const allHistory = [];

            // 使用済みURL履歴を取得
            for (const key of urlKeys) {
                const urlData = await kv.get(key);
                if (urlData && urlData.used) {
                    allHistory.push({
                        id: urlData.id,
                        event: urlData.event,
                        url: urlData.url,
                        usedBy: urlData.usedBy,
                        usedAt: urlData.usedAt,
                        type: 'success'
                    });
                }
            }

            // エラー履歴を取得
            for (const key of errorKeys) {
                const errorData = await kv.get(key);
                if (errorData) {
                    allHistory.push({
                        id: `error_${key.split(':')[1]}`,
                        event: errorData.eventId || 'N/A',
                        url: null,
                        usedBy: errorData.userId || 'anonymous',
                        usedAt: errorData.timestamp,
                        type: 'error',
                        error: errorData.type,
                        message: errorData.message
                    });
                }
            }

            // 日時でソート（新しい順）
            allHistory.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));

            return allHistory.slice(0, limit);
        } catch (error) {
            console.error('getUsageHistory error:', error);
            return [];
        }
    }
}

// シングルトンインスタンス
const kvURLManager = new KVURLManager();

export default kvURLManager;
