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
        this.urlCache = new Map(); // URLキャッシュ
        this.cacheExpiry = 30000; // 30秒でキャッシュ期限切れ
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
            
            // 初期データの読み込み（KVが空の場合のみ）
            const existingKeys = await kv.keys('url:*');
            if (existingKeys.length === 0) {
                console.log('🔄 KVが空のため、CSVから自動読み込みを開始...');
                await this.loadFromCSV();
            } else {
                console.log(`📊 KVに${existingKeys.length}個のURLが保存済み`);
            }
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
            console.log(`🔍 KV接続状況: ${this.isKVAvailable ? '利用可能' : '利用不可'}`);

            // 既存のURLデータをクリア
            if (this.isKVAvailable) {
                const existingKeys = await kv.keys('url:*');
                console.log(`🔍 既存のKVキー: ${existingKeys.length}個`, existingKeys);
                if (existingKeys.length > 0) {
                    console.log(`🗑️ 既存データをクリア中...`);
                    for (const key of existingKeys) {
                        await kv.del(key);
                    }
                    console.log(`✅ ${existingKeys.length}個の既存データをクリアしました`);
                }
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
                // ヘッダー行をスキップ
                if (line.startsWith('ID,Event,URL,Description')) {
                    console.log(`📝 ヘッダー行をスキップ: ${line}`);
                    continue;
                }
                
                const [id, event, url, description] = line.split(',').map(item => item.trim().replace(/"/g, ''));
                
                if (!url || !url.startsWith('http')) {
                    console.log(`⚠️ スキップ: ${line.substring(0, 50)}...`);
                    continue;
                }

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

                // KVに保存（既存データを上書き）
                if (this.isKVAvailable) {
                    await kv.set(`url:${urlData.id}`, urlData);
                    console.log(`💾 KV保存成功: ${urlData.id} (${urlData.event})`);
                } else {
                    console.warn(`⚠️ KV利用不可のため保存スキップ: ${urlData.id}`);
                }

                loadedCount++;
                console.log(`📝 読み込み中: ${loadedCount}/${urlLines.length} - ${urlData.id}`);
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

            // 読み込み情報をKVに保存
            const loadInfo = {
                fileName: 'tnt-urls.csv',
                loadedAt: new Date().toISOString(),
                urlCount: loadedCount,
                timestamp: Date.now()
            };
            
            if (this.isKVAvailable) {
                await kv.set('csv_load_info', loadInfo);
                console.log(`📊 読み込み情報を保存:`, loadInfo);
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
            // 重複チェック: 重複URLがある場合は配布を停止（一時的に無効化）
            const duplicates = await kv.get('duplicates') || { urls: [], ids: [] };
            if (duplicates.urls.length > 0 || duplicates.ids.length > 0) {
                console.warn(`⚠️ 重複URL/IDが検出されていますが、配布を継続します`);
                console.warn(`⚠️ URL重複: ${duplicates.urls.length}個, ID重複: ${duplicates.ids.length}個`);
                
                // エラー履歴を保存（警告として）
                await this.saveErrorHistory({
                    type: 'duplicate_warning',
                    message: '重複URL/IDが検出されていますが、配布を継続します。',
                    eventId: eventId,
                    userId: userId || 'anonymous',
                    timestamp: new Date().toISOString(),
                    duplicates: duplicates
                });
                
                // 配布を停止せずに継続
                // return {
                //     error: 'duplicate_detected',
                //     message: '重複URL/IDが検出されているため、URL配布を停止しました。CSVファイルを修正してください。',
                //     duplicates: duplicates
                // };
            }

            // 全URLキーを取得（安全な方法に戻す）
            const urlKeys = await kv.keys('url:*');
            console.log(`🔍 修正: 全URLキー数 = ${urlKeys.length}`);
            
            let availableURL = null;
            let debugCount = 0;
            
            // 並列処理でURLデータを取得（修正版）
            const batchSize = 20;
            const availableURLs = [];
            
            for (let i = 0; i < urlKeys.length; i += batchSize) {
                const batch = urlKeys.slice(i, i + batchSize);
                const promises = batch.map(key => kv.get(key));
                const results = await Promise.all(promises);
                
                for (let j = 0; j < results.length; j++) {
                    const urlData = results[j];
                    debugCount++;
                    
                    if (!urlData) continue;
                    
                    if (urlData.used) continue;
                    
                    // eventIdが指定されている場合、文字列として比較
                    if (eventId && String(urlData.event) !== String(eventId)) {
                        continue;
                    }
                    
                    availableURLs.push(urlData);
                }
                
                if (availableURLs.length > 0) break;
            }
            
            if (availableURLs.length > 0) {
                availableURL = availableURLs[0];
                console.log(`✅ 修正: 利用可能URL発見 = ${availableURL.id} (${availableURLs.length}個中)`);
            }
            
            console.log(`🔍 最適化: 検索完了 - 処理したキー数 = ${debugCount}`);

            if (!availableURL) {
                console.log(`❌ 利用可能なURLがありません (イベント: ${eventId || '全イベント'})`);
                console.log(`🔍 デバッグ: urlKeys数 = ${urlKeys.length}, 処理したキー数 = ${debugCount}`);
                
                // エラー履歴を保存
                const errorData = {
                    type: 'no_available_url',
                    message: `利用可能なURLがありません (イベント: ${eventId || '全イベント'})`,
                    eventId: eventId,
                    userId: userId || 'anonymous',
                    timestamp: new Date().toISOString()
                };
                
                console.log(`📝 エラー履歴保存開始:`, errorData);
                await this.saveErrorHistory(errorData);
                console.log(`✅ エラー履歴保存完了`);
                
                return null;
            }

            // 使用済みにマーク（KVベース、確実）
            availableURL.used = true;
            availableURL.usedAt = new Date().toISOString();
            availableURL.usedBy = userId || 'anonymous';

            // KVに保存（確実な状態管理）
            await kv.set(`url:${availableURL.id}`, availableURL);

            console.log(`🎯 URL配布: ${availableURL.id} (${availableURL.event}) → ${userId || 'anonymous'}`);
            console.log(`✅ KVベースの管理: 使用状態を確実に保存しました`);
            return availableURL;

        } catch (error) {
            console.error('❌ URL取得エラー:', error);
            return null;
        }
    }

    /**
     * 管理者機能: 特定のURL状態をリセット
     */
    async resetURLStatus(urlId) {
        if (!this.isKVAvailable) {
            console.log('❌ KVが利用できません');
            return { error: 'KVが利用できません' };
        }

        try {
            const urlData = await kv.get(`url:${urlId}`);
            if (!urlData) {
                return { error: 'URLが見つかりません' };
            }
            
            // 使用状態をリセット
            urlData.used = false;
            urlData.usedAt = null;
            urlData.usedBy = null;
            
            // KVに保存
            await kv.set(`url:${urlId}`, urlData);
            
            console.log(`✅ URL状態をリセット: ${urlId}`);
            return { success: true, message: 'URL状態をリセットしました' };
            
        } catch (error) {
            console.error('❌ URL状態リセットエラー:', error);
            return { error: error.message };
        }
    }

    /**
     * 管理者機能: 全URL状態をリセット
     */
    async resetAllURLs() {
        if (!this.isKVAvailable) {
            console.log('❌ KVが利用できません');
            return { error: 'KVが利用できません' };
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
            
            console.log(`✅ 全URL状態をリセット: ${resetCount}個`);
            return { success: true, resetCount, message: `${resetCount}個のURL状態をリセットしました` };
            
        } catch (error) {
            console.error('❌ 全URL状態リセットエラー:', error);
            return { error: error.message };
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
     * KVデータを全削除（デバッグ用）
     */
    async clearAllData() {
        if (!this.isKVAvailable) {
            return { success: false, message: 'KVが利用できません' };
        }

        try {
            // 全キーを取得
            const urlKeys = await kv.keys('url:*');
            const errorKeys = await kv.keys('error:*');
            const duplicateKeys = await kv.keys('duplicates');
            const statsKeys = await kv.keys('stats');

            // 全キーを削除
            const allKeys = [...urlKeys, ...errorKeys, ...duplicateKeys, ...statsKeys];
            
            for (const key of allKeys) {
                await kv.del(key);
            }

            console.log(`🗑️ KVデータを全削除: ${allKeys.length}個のキーを削除`);
            
            return {
                success: true,
                message: `${allKeys.length}個のキーを削除しました`,
                deletedKeys: allKeys.length
            };
        } catch (error) {
            console.error('❌ KVデータ削除エラー:', error);
            return {
                success: false,
                message: `削除エラー: ${error.message}`
            };
        }
    }

    /**
     * CSV読み込み情報を取得
     */
    async getCSVLoadInfo() {
        if (!this.isKVAvailable) {
            return null;
        }

        try {
            const loadInfo = await kv.get('csv_load_info');
            return loadInfo;
        } catch (error) {
            console.error('❌ CSV読み込み情報取得エラー:', error);
            return null;
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
            console.log(`🔍 getUsageHistory: URLキー${urlKeys.length}個, エラーキー${errorKeys.length}個`);
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
                console.log(`🔍 エラーキー: ${key}, データ:`, errorData);
                if (errorData) {
                    allHistory.push({
                        id: `error_${key.split(':')[1]}`,
                        event: errorData.eventId || 'N/A',
                        url: null,
                        usedBy: errorData.userId || 'anonymous',
                        usedAt: errorData.timestamp,
                        type: 'error',
                        error: errorData.type,
                        message: errorData.message,
                        duplicates: errorData.duplicates
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
