#!/bin/bash

echo "🎮 ドラクエ風戦闘シミュレーター - ローカル開発サーバー"
echo "=================================================="

# Node.jsがインストールされているかチェック
if ! command -v node &> /dev/null; then
    echo "❌ Node.jsがインストールされていません。"
    echo "   https://nodejs.org/ からNode.jsをインストールしてください。"
    exit 1
fi

# npmがインストールされているかチェック
if ! command -v npm &> /dev/null; then
    echo "❌ npmがインストールされていません。"
    exit 1
fi

echo "✅ Node.js $(node --version) がインストールされています"
echo "✅ npm $(npm --version) がインストールされています"

# 依存関係をインストール
echo ""
echo "📦 依存関係をインストール中..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依存関係のインストールに失敗しました。"
    exit 1
fi

echo "✅ 依存関係のインストールが完了しました"

# ローカルサーバーを起動
echo ""
echo "🚀 ローカルサーバーを起動中..."
echo "   ブラウザで http://localhost:3000 にアクセスしてください"
echo "   サーバーを停止するには Ctrl+C を押してください"
echo ""

npm run dev
