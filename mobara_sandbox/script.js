// ゲーム状態管理
class GameState {
    constructor() {
        this.currentCommand = 'mera';
        this.currentTarget = 'crow';
        this.battleLog = [];
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
    // ターゲット選択の更新
    updateTargetSelection();
}

// ターゲット選択の更新
function updateTargetSelection() {
    const targetOptions = document.querySelectorAll('.target-option');
    targetOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.target === game.currentTarget) {
            option.classList.add('selected');
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



// コマンド実行
function executeCommand() {
    switch (game.currentCommand) {
        case 'mera':
            executeMera();
            break;
        case 'merami':
            executeMerami();
            break;
        case 'merazoma':
            executeMerazoma();
            break;
    }
}

// メラ実行
function executeMera() {
    const enemyElement = document.getElementById(game.currentTarget);
    enemyElement.classList.add('attack-effect');
    
    setTimeout(() => {
        addLogEntry('メラを唱えた！');
        updateUI();
        
        enemyElement.classList.remove('attack-effect');
        
        // まちサーガのチェックインページに遷移
        setTimeout(() => {
            window.open('https://play.ttt.games/worlds/machi-saga/events/UEAWX5-E8La6ob8MihKzFgefl0SMlJgmM1b1YoZU--s/checkin', '_blank');
        }, 500);
    }, 300);
}

// メラミ実行
function executeMerami() {
    const enemyElement = document.getElementById(game.currentTarget);
    enemyElement.classList.add('attack-effect');
    
    setTimeout(() => {
        addLogEntry('メラミを唱えた！');
        updateUI();
        
        enemyElement.classList.remove('attack-effect');
        
        // まちサーガのチェックインページに遷移
        setTimeout(() => {
            window.open('https://play.ttt.games/worlds/machi-saga/events/ZA0kD9WnKGGe4n3qHcFppJ-mY_yvzsG62K17pEGRPnA/checkin', '_blank');
        }, 500);
    }, 300);
}

// メラゾーマ実行
function executeMerazoma() {
    const enemyElement = document.getElementById(game.currentTarget);
    enemyElement.classList.add('attack-effect');
    
    setTimeout(() => {
        addLogEntry('メラゾーマを唱えた！');
        updateUI();
        
        enemyElement.classList.remove('attack-effect');
        
        // まちサーガのチェックインページに遷移
        setTimeout(() => {
            window.open('https://play.ttt.games/worlds/machi-saga/events/gNQHIfrDuA4Gi0csw7GJA_V6U6rsvhXJB_my9Xcdtnk/checkin', '_blank');
        }, 500);
    }, 300);
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
            document.querySelectorAll('.target-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            game.currentTarget = option.dataset.target;
            
            // ターゲットをタップしたら即座に攻撃開始
            executeCommand();
        });
    });
    
    // キーボードショートカット
    document.addEventListener('keydown', (event) => {
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
