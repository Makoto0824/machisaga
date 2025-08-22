// ゲーム状態管理
class GameState {
    constructor() {
        this.player = {
            name: '魔法使い',
            hp: 50,
            maxHp: 50,
            mp: 20,
            maxMp: 20
        };
        
        this.enemies = {
            crow: { name: 'おおがらす', hp: 20, maxHp: 20, alive: true }
        };
        
        this.currentCommand = 'mera';
        this.currentTarget = 'crow';
        this.battleLog = [];
        this.isPlayerTurn = true;
        this.battleEnded = false;
    }
}

// ゲームインスタンス
let game = new GameState();

// DOM要素の取得
const battleLog = document.getElementById('battle-log');
const gameOverModal = document.getElementById('game-over-modal');
const gameResult = document.getElementById('game-result');
const resultMessage = document.getElementById('result-message');

// 初期化
function initGame() {
    updateUI();
    addLogEntry('戦闘開始！');
    setupEventListeners();
}

// UI更新
function updateUI() {
    // 敵の表示/非表示
    Object.keys(game.enemies).forEach(enemyKey => {
        const enemy = game.enemies[enemyKey];
        const enemyElement = document.getElementById(enemyKey);
        if (enemyElement) {
            enemyElement.style.display = enemy.alive ? 'block' : 'none';
        }
    });
    
    // ターゲット選択の更新
    updateTargetSelection();
}

// ターゲット選択の更新
function updateTargetSelection() {
    const targetOptions = document.querySelectorAll('.target-option');
    targetOptions.forEach(option => {
        const targetKey = option.dataset.target;
        const enemy = game.enemies[targetKey];
        
        if (enemy && enemy.alive) {
            option.style.display = 'block';
            option.classList.remove('selected');
            if (targetKey === game.currentTarget) {
                option.classList.add('selected');
            }
        } else {
            option.style.display = 'none';
            if (targetKey === game.currentTarget) {
                // 生きている敵に切り替え
                const aliveEnemies = Object.keys(game.enemies).filter(key => game.enemies[key].alive);
                if (aliveEnemies.length > 0) {
                    game.currentTarget = aliveEnemies[0];
                }
            }
        }
    });
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
    const baseAttack = isMagic ? 15 : 12;
    const baseDefense = 5;
    
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

// コマンド実行
function executeCommand() {
    if (game.battleEnded || !game.isPlayerTurn) return;
    
    const character = game.player;
    const target = game.enemies[game.currentTarget];
    
    if (!target || !target.alive) {
        addLogEntry('ターゲットが存在しません！');
        return;
    }
    
    switch (game.currentCommand) {
        case 'mera':
            executeMera(character, target);
            break;
        case 'merami':
            executeMerami(character, target);
            break;
        case 'merazoma':
            executeMerazoma(character, target);
            break;
    }
}

// メラ実行
function executeMera(character, target) {
    if (character.mp < 3) {
        addLogEntry('MPが足りません！');
        return;
    }
    
    character.mp -= 3;
    const enemyElement = document.getElementById(game.currentTarget);
    enemyElement.classList.add('attack-effect');
    
    setTimeout(() => {
        const result = calculateDamage(character, target, true);
        target.hp = Math.max(0, target.hp - result.damage);
        
        let message = `${character.name}のメラ！`;
        if (result.critical) {
            message += ' クリティカルヒット！';
        }
        message += ` ${target.name}に${result.damage}のダメージ！`;
        
        addLogEntry(message);
        updateUI();
        
        enemyElement.classList.remove('attack-effect');
        
        // まちサーガのチェックインページに遷移
        setTimeout(() => {
            window.open('https://play.ttt.games/worlds/machi-saga/events/UEAWX5-E8La6ob8MihKzFgefl0SMlJgmM1b1YoZU--s/checkin', '_blank');
        }, 1000);
        
        if (target.hp <= 0) {
            target.alive = false;
            addLogEntry(`${target.name}を倒した！`);
            setTimeout(() => {
                endBattle(true);
            }, 2000);
            return;
        }
        
        game.isPlayerTurn = false;
        setTimeout(() => {
            enemyTurn();
        }, 2000);
    }, 300);
}

// メラミ実行
function executeMerami(character, target) {
    if (character.mp < 5) {
        addLogEntry('MPが足りません！');
        return;
    }
    
    character.mp -= 5;
    const enemyElement = document.getElementById(game.currentTarget);
    enemyElement.classList.add('attack-effect');
    
    setTimeout(() => {
        const damage = 30; // 固定ダメージ30
        target.hp = Math.max(0, target.hp - damage);
        
        let message = `${character.name}のメラミ！`;
        message += ` ${target.name}に${damage}のダメージ！`;
        
        addLogEntry(message);
        updateUI();
        
        enemyElement.classList.remove('attack-effect');
        
        // まちサーガのチェックインページに遷移
        setTimeout(() => {
            window.open('https://play.ttt.games/worlds/machi-saga/events/ZA0kD9WnKGGe4n3qHcFppJ-mY_yvzsG62K17pEGRPnA/checkin', '_blank');
        }, 1000);
        
        if (target.hp <= 0) {
            target.alive = false;
            addLogEntry(`${target.name}を倒した！`);
            setTimeout(() => {
                endBattle(true);
            }, 2000);
            return;
        }
        
        game.isPlayerTurn = false;
        setTimeout(() => {
            enemyTurn();
        }, 2000);
    }, 300);
}

// メラゾーマ実行
function executeMerazoma(character, target) {
    if (character.mp < 8) {
        addLogEntry('MPが足りません！');
        return;
    }
    
    character.mp -= 8;
    const enemyElement = document.getElementById(game.currentTarget);
    enemyElement.classList.add('attack-effect');
    
    setTimeout(() => {
        const damage = 50; // 固定ダメージ50
        target.hp = Math.max(0, target.hp - damage);
        
        let message = `${character.name}のメラゾーマ！`;
        message += ` ${target.name}に${damage}のダメージ！`;
        
        addLogEntry(message);
        updateUI();
        
        enemyElement.classList.remove('attack-effect');
        
        // まちサーガのチェックインページに遷移
        setTimeout(() => {
            window.open('https://play.ttt.games/worlds/machi-saga/events/gNQHIfrDuA4Gi0csw7GJA_V6U6rsvhXJB_my9Xcdtnk/checkin', '_blank');
        }, 1000);
        
        if (target.hp <= 0) {
            target.alive = false;
            addLogEntry(`${target.name}を倒した！`);
            setTimeout(() => {
                endBattle(true);
            }, 2000);
            return;
        }
        
        game.isPlayerTurn = false;
        setTimeout(() => {
            enemyTurn();
        }, 2000);
    }, 300);
}







// 敵のターン
function enemyTurn() {
    if (game.battleEnded) return;
    
    const aliveEnemies = Object.values(game.enemies).filter(enemy => enemy.alive);
    if (aliveEnemies.length === 0) return;
    
    const enemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    const character = game.player;
    
    const enemyElement = document.querySelector(`[id="${Object.keys(game.enemies).find(key => game.enemies[key] === enemy)}"]`);
    enemyElement.classList.add('attack-effect');
    
    setTimeout(() => {
        const result = calculateDamage(enemy, character);
        character.hp = Math.max(0, character.hp - result.damage);
        
        let message = `${enemy.name}の攻撃！`;
        if (result.critical) {
            message += ' クリティカルヒット！';
        }
        message += ` ${character.name}に${result.damage}のダメージ！`;
        
        addLogEntry(message);
        updateUI();
        
        enemyElement.classList.remove('attack-effect');
        
        if (character.hp <= 0) {
            addLogEntry(`${character.name}は力尽きた！`);
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
        resultMessage.textContent = 'すべての敵を倒しました！';
    } else {
        gameResult.textContent = '敗北...';
        resultMessage.textContent = 'パーティーは全滅しました...';
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

// イベントリスナーの設定
function setupEventListeners() {
    // コマンド選択
    document.querySelectorAll('.command-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.command-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            game.currentCommand = option.dataset.command;
        });
    });
    
    // ターゲット選択（タップで攻撃開始）
    document.querySelectorAll('.target-option').forEach(option => {
        option.addEventListener('click', () => {
            const targetKey = option.dataset.target;
            if (game.enemies[targetKey] && game.enemies[targetKey].alive) {
                document.querySelectorAll('.target-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                game.currentTarget = targetKey;
                
                // ターゲットをタップしたら即座に攻撃開始
                if (game.isPlayerTurn && !game.battleEnded) {
                    executeCommand();
                }
            }
        });
    });
    
    // キーボードショートカット
    document.addEventListener('keydown', (event) => {
        if (game.battleEnded) return;
        
        switch(event.key) {
            case 'Enter':
            case ' ':
                executeCommand();
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                navigateCommands(event.key);
                break;
        }
    });
}

// コマンドナビゲーション
function navigateCommands(key) {
    const commands = ['mera', 'merami', 'merazoma'];
    const currentIndex = commands.indexOf(game.currentCommand);
    let newIndex = currentIndex;
    
    switch(key) {
        case 'ArrowUp':
            newIndex = currentIndex >= 2 ? currentIndex - 2 : currentIndex;
            break;
        case 'ArrowDown':
            newIndex = currentIndex < 1 ? currentIndex + 2 : currentIndex;
            break;
        case 'ArrowLeft':
            newIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
            break;
        case 'ArrowRight':
            newIndex = currentIndex % 2 === 1 ? currentIndex - 1 : currentIndex + 1;
            break;
    }
    
    if (newIndex >= 0 && newIndex < commands.length) {
        game.currentCommand = commands[newIndex];
        document.querySelectorAll('.command-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`[data-command="${game.currentCommand}"]`).classList.add('selected');
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});
