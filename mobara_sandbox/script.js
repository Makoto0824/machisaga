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
const gameOverModal = document.getElementById('game-over-modal');
const gameResult = document.getElementById('game-result');
const resultMessage = document.getElementById('result-message');
const encounterAnimation = document.getElementById('encounter-animation');

// 初期化
function initGame() {
    updateUI();
    setupEventListeners();
    startEncounterAnimation();
}

// エンカウントアニメーション開始
function startEncounterAnimation() {
    encounterAnimation.classList.add('show');
    
    // 0.5秒後にアニメーションを非表示（文字が先に消える）
    setTimeout(() => {
        encounterAnimation.classList.remove('show');
    }, 500);
}

// UI更新
function updateUI() {
    // コマンド選択の更新
    updateCommandSelection();
}

// コマンド選択の更新
function updateCommandSelection() {
    const commandOptions = document.querySelectorAll('.command-option');
    commandOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.command === game.currentCommand) {
            option.classList.add('selected');
        }
    });
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
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/UEAWX5-E8La6ob8MihKzFgefl0SMlJgmM1b1YoZU--s/checkin', '_blank');
    }, 100);
}

// メラミ実行
function executeMerami() {
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/ZA0kD9WnKGGe4n3qHcFppJ-mY_yvzsG62K17pEGRPnA/checkin', '_blank');
    }, 100);
}

// メラゾーマ実行
function executeMerazoma() {
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/gNQHIfrDuA4Gi0csw7GJA_V6U6rsvhXJB_my9Xcdtnk/checkin', '_blank');
    }, 100);
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
    
    // 敵表示をタップで攻撃開始
    document.querySelector('.enemy-display').addEventListener('click', () => {
        // 敵表示をタップしたら即座に攻撃開始
        executeCommand();
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
