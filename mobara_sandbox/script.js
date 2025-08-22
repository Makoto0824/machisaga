// ゲーム状態管理
class GameState {
    constructor() {
        this.player = {
            name: '勇者',
            hp: 100,
            maxHp: 100,
            attack: 25,
            defense: 15,
            magic: 30,
            mp: 50,
            maxMp: 50
        };
        
        this.enemy = {
            name: 'スライム',
            hp: 50,
            maxHp: 50,
            attack: 15,
            defense: 10,
            magic: 0,
            mp: 0,
            maxMp: 0
        };
        
        this.battleLog = [];
        this.isPlayerTurn = true;
        this.battleEnded = false;
        this.soundEnabled = true;
    }
}

// ゲームインスタンス
let game = new GameState();

// DOM要素の取得
const playerHpFill = document.getElementById('player-hp-fill');
const playerHpText = document.getElementById('player-hp-text');
const enemyHpFill = document.getElementById('enemy-hp-fill');
const enemyHpText = document.getElementById('enemy-hp-text');
const battleLog = document.getElementById('battle-log');
const gameOverModal = document.getElementById('game-over-modal');
const gameResult = document.getElementById('game-result');
const resultMessage = document.getElementById('result-message');

// 初期化
function initGame() {
    updateUI();
    addLogEntry('戦闘開始！');
}

// UI更新
function updateUI() {
    // プレイヤーHP更新
    const playerHpPercent = (game.player.hp / game.player.maxHp) * 100;
    playerHpFill.style.width = `${playerHpPercent}%`;
    playerHpText.textContent = `HP: ${game.player.hp}/${game.player.maxHp}`;
    
    // 敵HP更新
    const enemyHpPercent = (game.enemy.hp / game.enemy.maxHp) * 100;
    enemyHpFill.style.width = `${enemyHpPercent}%`;
    enemyHpText.textContent = `HP: ${game.enemy.hp}/${game.enemy.maxHp}`;
    
    // HPバーの色変更（低HP時）
    if (playerHpPercent <= 25) {
        playerHpFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
    } else {
        playerHpFill.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
    }
    
    if (enemyHpPercent <= 25) {
        enemyHpFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
    } else {
        enemyHpFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
    }
}

// ログエントリ追加
function addLogEntry(message) {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = message;
    battleLog.appendChild(logEntry);
    battleLog.scrollTop = battleLog.scrollHeight;
    
    // ログエントリの自動削除（最大10個まで）
    if (battleLog.children.length > 10) {
        battleLog.removeChild(battleLog.firstChild);
    }
}

// ランダム数値生成
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ダメージ計算
function calculateDamage(attacker, defender, isMagic = false) {
    const baseAttack = isMagic ? attacker.magic : attacker.attack;
    const baseDefense = defender.defense;
    
    // 基本ダメージ計算
    let damage = Math.max(1, baseAttack - baseDefense / 2);
    
    // ランダム要素（0.8〜1.2倍）
    const randomFactor = 0.8 + Math.random() * 0.4;
    damage = Math.floor(damage * randomFactor);
    
    // クリティカルヒット（10%の確率で1.5倍）
    if (Math.random() < 0.1) {
        damage = Math.floor(damage * 1.5);
        return { damage, critical: true };
    }
    
    return { damage, critical: false };
}

// プレイヤーの攻撃
function playerAttack() {
    if (game.battleEnded || !game.isPlayerTurn) return;
    
    const playerSprite = document.querySelector('.player-sprite');
    playerSprite.classList.add('attack-animation');
    
    setTimeout(() => {
        const result = calculateDamage(game.player, game.enemy);
        game.enemy.hp = Math.max(0, game.enemy.hp - result.damage);
        
        let message = `${game.player.name}の攻撃！`;
        if (result.critical) {
            message += ' クリティカルヒット！';
        }
        message += ` ${game.enemy.name}に${result.damage}のダメージ！`;
        
        addLogEntry(message);
        updateUI();
        
        playerSprite.classList.remove('attack-animation');
        
        // 敵のHPが0になった場合
        if (game.enemy.hp <= 0) {
            setTimeout(() => {
                endBattle(true);
            }, 1000);
        } else {
            // 敵のターン
            game.isPlayerTurn = false;
            setTimeout(() => {
                enemyTurn();
            }, 1500);
        }
    }, 300);
}

// プレイヤーの魔法
function playerMagic() {
    if (game.battleEnded || !game.isPlayerTurn || game.player.mp < 10) return;
    
    const playerSprite = document.querySelector('.player-sprite');
    playerSprite.classList.add('attack-animation');
    
    setTimeout(() => {
        game.player.mp -= 10;
        const result = calculateDamage(game.player, game.enemy, true);
        game.enemy.hp = Math.max(0, game.enemy.hp - result.damage);
        
        let message = `${game.player.name}の魔法！`;
        if (result.critical) {
            message += ' クリティカルヒット！';
        }
        message += ` ${game.enemy.name}に${result.damage}のダメージ！`;
        
        addLogEntry(message);
        updateUI();
        
        playerSprite.classList.remove('attack-animation');
        
        if (game.enemy.hp <= 0) {
            setTimeout(() => {
                endBattle(true);
            }, 1000);
        } else {
            game.isPlayerTurn = false;
            setTimeout(() => {
                enemyTurn();
            }, 1500);
        }
    }, 300);
}

// プレイヤーの回復
function playerHeal() {
    if (game.battleEnded || !game.isPlayerTurn || game.player.mp < 15) return;
    
    const playerSprite = document.querySelector('.player-sprite');
    playerSprite.classList.add('heal-animation');
    
    setTimeout(() => {
        game.player.mp -= 15;
        const healAmount = Math.floor(game.player.maxHp * 0.4);
        game.player.hp = Math.min(game.player.maxHp, game.player.hp + healAmount);
        
        addLogEntry(`${game.player.name}の回復魔法！ HPが${healAmount}回復した！`);
        updateUI();
        
        playerSprite.classList.remove('heal-animation');
        
        game.isPlayerTurn = false;
        setTimeout(() => {
            enemyTurn();
        }, 1500);
    }, 300);
}

// プレイヤーの逃走
function playerRun() {
    if (game.battleEnded || !game.isPlayerTurn) return;
    
    const successRate = 0.6; // 60%の確率で逃走成功
    
    if (Math.random() < successRate) {
        addLogEntry(`${game.player.name}は逃げ出した！`);
        setTimeout(() => {
            endBattle(false, 'run');
        }, 1000);
    } else {
        addLogEntry(`${game.player.name}は逃げ出せなかった！`);
        game.isPlayerTurn = false;
        setTimeout(() => {
            enemyTurn();
        }, 1500);
    }
}

// 敵のターン
function enemyTurn() {
    if (game.battleEnded) return;
    
    const enemySprite = document.querySelector('.enemy-sprite');
    enemySprite.classList.add('attack-animation');
    
    setTimeout(() => {
        const result = calculateDamage(game.enemy, game.player);
        game.player.hp = Math.max(0, game.player.hp - result.damage);
        
        let message = `${game.enemy.name}の攻撃！`;
        if (result.critical) {
            message += ' クリティカルヒット！';
        }
        message += ` ${game.player.name}に${result.damage}のダメージ！`;
        
        addLogEntry(message);
        updateUI();
        
        enemySprite.classList.remove('attack-animation');
        
        if (game.player.hp <= 0) {
            setTimeout(() => {
                endBattle(false);
            }, 1000);
        } else {
            game.isPlayerTurn = true;
        }
    }, 300);
}

// 戦闘終了
function endBattle(playerWon, reason = '') {
    game.battleEnded = true;
    
    if (reason === 'run') {
        gameResult.textContent = '逃走成功';
        resultMessage.textContent = '無事に逃げ出すことができました。';
    } else if (playerWon) {
        gameResult.textContent = '勝利！';
        resultMessage.textContent = `${game.enemy.name}を倒しました！`;
    } else {
        gameResult.textContent = '敗北...';
        resultMessage.textContent = `${game.player.name}は力尽きました...`;
    }
    
    gameOverModal.style.display = 'block';
}

// モーダルを閉じる
function closeModal() {
    gameOverModal.style.display = 'none';
}

// 戦闘リセット
function resetBattle() {
    game = new GameState();
    updateUI();
    battleLog.innerHTML = '<div class="log-entry">戦闘開始！</div>';
    closeModal();
}

// 音效切り替え
function toggleSound() {
    game.soundEnabled = !game.soundEnabled;
    const soundBtn = document.querySelector('.control-btn:last-child');
    soundBtn.textContent = `音效: ${game.soundEnabled ? 'ON' : 'OFF'}`;
}

// キーボードショートカット
document.addEventListener('keydown', (event) => {
    if (game.battleEnded) return;
    
    switch(event.key) {
        case '1':
        case 'a':
            playerAttack();
            break;
        case '2':
        case 'm':
            playerMagic();
            break;
        case '3':
        case 'h':
            playerHeal();
            break;
        case '4':
        case 'r':
            playerRun();
            break;
    }
});

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    // アクションボタンの無効化状態管理
    const actionButtons = document.querySelectorAll('.action-btn');
    
    setInterval(() => {
        if (game.battleEnded) {
            actionButtons.forEach(btn => btn.disabled = true);
        } else {
            actionButtons.forEach(btn => btn.disabled = false);
            
            // MP不足時の魔法・回復ボタンを無効化
            const magicBtn = document.querySelector('.magic-btn');
            const healBtn = document.querySelector('.heal-btn');
            
            magicBtn.disabled = game.player.mp < 10;
            healBtn.disabled = game.player.mp < 15;
        }
    }, 100);
});
