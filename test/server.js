// トークン付きリダイレクトシステム用サーバー
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

// 設定
const PORT = 8000;
const SECRET = process.env.SECRET || 'machisaga-secret-key-2025';

// MIMEタイプ
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 静的ファイルの提供
function serveStaticFile(req, res, filePath) {
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
}

// API: トークン生成
function handleGenerateToken(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const parsedUrl = url.parse(req.url, true);
    const targetUrl = parsedUrl.query.url || 'https://example.com';
    
    // 有効期限（5分後）
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    // ペイロード作成
    const payload = `${targetUrl}|${expiresAt}`;
    
    // Base64エンコード
    const token = Buffer.from(payload).toString('base64');
    
    // HMAC-SHA256で署名生成
    const hash = crypto.createHmac('sha256', SECRET).update(token).digest('hex');
    
    // リダイレクトURL生成
    const redirectUrl = `/redirect/${encodeURIComponent(token)}?sig=${hash}`;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      url: redirectUrl,
      expiresAt: expiresAt,
      message: 'トークン付きリダイレクトURLを生成しました'
    }));
    
  } catch (error) {
    console.error('Token generation error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'トークン生成に失敗しました'
    }));
  }
}

// メインサーバー
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

  // API エンドポイント
  if (pathname === '/api/generate-token') {
    handleGenerateToken(req, res);
    return;
  }

  // リダイレクトページの動的処理
  if (pathname.startsWith('/redirect/')) {
    const token = pathname.split('/')[2];
    const filePath = path.join(__dirname, 'redirect', '[token].html');
    
    if (fs.existsSync(filePath)) {
      serveStaticFile(req, res, filePath);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Redirect page not found</h1>');
    }
    return;
  }

  // 静的ファイルの提供
  let filePath = path.join(__dirname, pathname);
  
  // デフォルトでindex.htmlを提供
  if (pathname === '/' || pathname === '/test/') {
    filePath = path.join(__dirname, 'index.html');
  }
  
  // ファイルが存在しない場合はindex.htmlを提供
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'index.html');
  }

  serveStaticFile(req, res, filePath);
});

server.listen(PORT, () => {
  console.log(`🚀 トークン付きリダイレクトシステムサーバーが起動しました！`);
  console.log(`📡 サーバーURL: http://localhost:${PORT}`);
  console.log(`🔐 API エンドポイント: http://localhost:${PORT}/api/generate-token`);
  console.log(`📄 テストページ: http://localhost:${PORT}/test/`);
  console.log(`⏰ 起動時刻: ${new Date().toLocaleString('ja-JP')}`);
  console.log(`🔑 シークレットキー: ${SECRET.substring(0, 10)}...`);
  console.log('─'.repeat(60));
});

// エラーハンドリング
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ ポート ${PORT} は既に使用されています`);
    console.log('💡 解決方法: 他のプロセスを終了するか、別のポートを使用してください');
  } else {
    console.error('❌ サーバーエラー:', err);
  }
});

// グレースフルシャットダウン
process.on('SIGINT', () => {
  console.log('\n🛑 サーバーをシャットダウンしています...');
  server.close(() => {
    console.log('✅ サーバーが正常に終了しました');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 サーバーをシャットダウンしています...');
  server.close(() => {
    console.log('✅ サーバーが正常に終了しました');
    process.exit(0);
  });
});
