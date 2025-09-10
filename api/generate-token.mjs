// Vercel API Route: トークン付きリダイレクトURL生成
// /api/generate-token.js

import crypto from 'crypto';

// 環境変数からシークレットキーを取得（本番環境では必ず設定）
const SECRET = process.env.SECRET || 'machisaga-secret-key-2025';

export default function handler(req, res) {
  // デバッグ情報
  console.log('API Request:', {
    method: req.method,
    url: req.url,
    query: req.query,
    headers: req.headers
  });

  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 外部URL（実際のプロジェクトでは動的に設定可能）
    const targetUrl = req.query.url || 'https://example.com';
    
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
    
    res.status(200).json({
      success: true,
      url: redirectUrl,
      expiresAt: expiresAt,
      message: 'トークン付きリダイレクトURLを生成しました'
    });
    
  } catch (error) {
    console.error('Token generation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'トークン生成に失敗しました',
      details: error.message
    });
  }
}
