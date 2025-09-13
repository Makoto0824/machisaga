import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

/**
 * 店舗ルール管理API (App Router)
 * パス: /api/admin/rules
 */

export async function GET(req) {
    try {
        // 全店舗のルールを取得
        const shopIds = ['kurofune']; // 現在の店舗ID一覧
        const rules = {};
        
        for (const shopId of shopIds) {
            const ruleKey = `rule:${shopId}`;
            const rule = await kv.get(ruleKey);
            rules[shopId] = rule ? (typeof rule === 'string' ? JSON.parse(rule) : rule) : null;
        }
        
        return NextResponse.json({
            success: true,
            rules: rules
        });
        
    } catch (error) {
        console.error('Rules API error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Server error'
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { shopId, intervalSeconds, maxPerDay } = body;
        
        if (!shopId) {
            return NextResponse.json({
                success: false,
                message: 'shopId is required'
            }, { status: 400 });
        }
        
        const rule = {
            intervalSeconds: intervalSeconds || 7200, // デフォルト2時間
            maxPerDay: maxPerDay || 1 // デフォルト1日1回
        };
        
        const ruleKey = `rule:${shopId}`;
        await kv.set(ruleKey, JSON.stringify(rule));
        
        return NextResponse.json({
            success: true,
            message: `Rule updated for shop: ${shopId}`,
            rule: rule
        });
        
    } catch (error) {
        console.error('Rules API error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Server error'
        }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const shopId = searchParams.get('shopId');
        
        if (!shopId) {
            return NextResponse.json({
                success: false,
                message: 'shopId is required'
            }, { status: 400 });
        }
        
        const ruleKey = `rule:${shopId}`;
        await kv.del(ruleKey);
        
        return NextResponse.json({
            success: true,
            message: `Rule deleted for shop: ${shopId}`
        });
        
    } catch (error) {
        console.error('Rules API error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Server error'
        }, { status: 500 });
    }
}

export async function OPTIONS(req) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
