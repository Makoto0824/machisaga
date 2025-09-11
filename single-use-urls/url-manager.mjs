/**
 * 使い切りURL管理システム
 * T&T提供のCSVから未使用URLを自動振り分け
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SingleUseURLManager {
    constructor() {
        this.urlsFile = path.join(__dirname, 'urls.json');
        this.csvFile = path.join(__dirname, 'tnt-urls.csv');
        this.urls = [];
        this.loadURLs();
    }

    /**
     * CSVファイルから使い切りURLを読み込み
     */
    loadFromCSV() {
        try {
            if (!fs.existsSync(this.csvFile)) {
                console.warn('⚠️ CSVファイルが見つかりません:', this.csvFile);
                return;
            }

            const csvContent = fs.readFileSync(this.csvFile, 'utf-8');
            const lines = csvContent.split('\n').filter(line => line.trim());
            
            // CSVヘッダーをスキップ（最初の行）
            const urlLines = lines.slice(1);
            
            const newUrls = urlLines.map((line, index) => {
                const [id, event, url, description] = line.split(',').map(item => item.trim().replace(/"/g, ''));
                
                return {
                    id: id || `url_${index + 1}`,
                    event: event || 'Default',
                    url: url,
                    description: description || `まちサーガイベント ${index + 1}`,
                    used: false,
                    usedAt: null,
                    usedBy: null
                };
            }).filter(item => item.url && item.url.startsWith('http'));

            this.urls = newUrls;
            this.saveURLs();
            
            console.log(`✅ CSVから${newUrls.length}個のURLを読み込みました`);
            return newUrls.length;
            
        } catch (error) {
            console.error('❌ CSV読み込みエラー:', error);
            return 0;
        }
    }

    /**
     * JSONファイルからURL一覧を読み込み
     */
    loadURLs() {
        try {
            if (fs.existsSync(this.urlsFile)) {
                const data = fs.readFileSync(this.urlsFile, 'utf-8');
                this.urls = JSON.parse(data);
                console.log(`📚 ${this.urls.length}個のURLを読み込みました`);
            } else {
                console.log('📄 URLファイルが存在しません。CSVから初期化してください。');
                this.urls = [];
            }
        } catch (error) {
            console.error('❌ URL読み込みエラー:', error);
            this.urls = [];
        }
    }

    /**
     * URL一覧をJSONファイルに保存
     */
    saveURLs() {
        try {
            fs.writeFileSync(this.urlsFile, JSON.stringify(this.urls, null, 2));
        } catch (error) {
            console.error('❌ URL保存エラー:', error);
        }
    }

    /**
     * 未使用URLを1つ取得して使用済みにマーク
     */
    getNextAvailableURL(userId = null, eventName = null) {
        let availableURL;
        
        if (eventName) {
            // 特定のイベントから未使用URLを取得
            availableURL = this.urls.find(url => !url.used && url.event === eventName);
        } else {
            // 全イベントから未使用URLを取得
            availableURL = this.urls.find(url => !url.used);
        }
        
        if (!availableURL) {
            return null; // 使い切り
        }

        // 使用済みにマーク
        availableURL.used = true;
        availableURL.usedAt = new Date().toISOString();
        availableURL.usedBy = userId;

        this.saveURLs();

        console.log(`🎯 URL配布: ${availableURL.id} (${availableURL.event}) → ${userId || 'anonymous'}`);
        return availableURL;
    }

    /**
     * 使用状況の統計を取得
     */
    getStats() {
        const total = this.urls.length;
        const used = this.urls.filter(url => url.used).length;
        const available = total - used;
        
        // イベント別統計
        const eventStats = {};
        this.urls.forEach(url => {
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
        
        return {
            total,
            used,
            available,
            usageRate: total > 0 ? ((used / total) * 100).toFixed(1) : 0,
            events: eventStats
        };
    }

    /**
     * 使用済みURLをリセット（管理者用）
     */
    resetURL(urlId) {
        const url = this.urls.find(u => u.id === urlId);
        if (url) {
            url.used = false;
            url.usedAt = null;
            url.usedBy = null;
            this.saveURLs();
            return true;
        }
        return false;
    }

    /**
     * 全URLをリセット（管理者用）
     */
    resetAllURLs() {
        this.urls.forEach(url => {
            url.used = false;
            url.usedAt = null;
            url.usedBy = null;
        });
        this.saveURLs();
        console.log('🔄 全URLをリセットしました');
    }

    /**
     * CSV形式でエクスポート（使用状況レポート）
     */
    exportUsageReport() {
        const header = 'ID,Event,URL,Description,Used,UsedAt,UsedBy\n';
        const rows = this.urls.map(url => 
            `"${url.id}","${url.event}","${url.url}","${url.description}",${url.used},"${url.usedAt || ''}","${url.usedBy || ''}"`
        ).join('\n');
        
        const reportContent = header + rows;
        const reportFile = path.join(__dirname, `usage-report-${Date.now()}.csv`);
        
        fs.writeFileSync(reportFile, reportContent);
        console.log(`📊 使用状況レポートを出力: ${reportFile}`);
        return reportFile;
    }
}

export default SingleUseURLManager;
