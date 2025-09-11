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

            // 既存のURLデータをクリア
            if (this.isKVAvailable) {
                const existingKeys = await kv.keys('url:*');
                for (const key of existingKeys) {
                    await kv.del(key);
                }
                console.log(`🗑️ 既存の${existingKeys.length}個のURLデータをクリアしました`);
            }

            let loadedCount = 0;
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

                // KVに保存
                if (this.isKVAvailable) {
                    await kv.set(`url:${urlData.id}`, urlData);
                }

                loadedCount++;
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
    async getNextAvailableURL(userId = null, eventName = null) {
        console.log(`🔍 getNextAvailableURL called - userId: ${userId}, eventName: ${eventName}`);
        console.trace('Call stack:');
        
        if (!this.isKVAvailable) {
            console.warn('⚠️ KVが利用できません');
            return null;
        }

        try {
            // 全URLキーを取得
            const urlKeys = await kv.keys('url:*');
            
            let availableURL = null;
            
            // イベント別または全イベントから未使用URLを検索
            for (const key of urlKeys) {
                const urlData = await kv.get(key);
                
                if (!urlData || urlData.used) continue;
                
                if (eventName && urlData.event !== eventName) continue;
                
                availableURL = urlData;
                break;
            }

            if (!availableURL) {
                console.log(`❌ 利用可能なURLがありません (イベント: ${eventName || '全イベント'})`);
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
            const urls = [];

            // 全URLデータを取得
            for (const key of urlKeys) {
                const urlData = await kv.get(key);
                if (urlData) {
                    urls.push(urlData);
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

            return {
                total,
                used,
                available,
                usageRate: total > 0 ? ((used / total) * 100).toFixed(1) : 0,
                events: eventStats
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
     */
    async resetAllURLs() {
        console.log('🔄 resetAllURLs called');
        console.trace('Call stack:');
        
        if (!this.isKVAvailable) {
            return { success: false, error: 'KVが利用できません' };
        }

        try {
            const urlKeys = await kv.keys('url:*');
            let resetCount = 0;

            for (const key of urlKeys) {
                const urlData = await kv.get(key);
                if (urlData && urlData.used) {
                    urlData.used = false;
                    urlData.usedAt = null;
                    urlData.usedBy = null;
                    await kv.set(key, urlData);
                    resetCount++;
                }
            }

            console.log(`🔄 全URLリセット: ${resetCount}個のURLをリセットしました`);
            return { success: true, message: `${resetCount}個のURLをリセットしました` };

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
}

// シングルトンインスタンス
const kvURLManager = new KVURLManager();

export default kvURLManager;
