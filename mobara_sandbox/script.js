// ゲーム状態管理
class GameState {
    constructor() {
        this.currentCommand = 'merami';
        this.currentTarget = 'crow';
        this.battleLog = [];
        this.currentPage = 2; // デフォルトで2ページ目（タイ風キック）
    }
}

// ゲームインスタンス
let game = new GameState();

// DOM要素の取得
const gameOverModal = document.getElementById('game-over-modal');
const gameResult = document.getElementById('game-result');
const resultMessage = document.getElementById('result-message');
const encounterAnimation = document.getElementById('encounter-animation');
const encounterEnemy = document.querySelector('.encounter-enemy');
const encounterBattle = document.getElementById('encounter-battle');
const bgm = document.getElementById('bgm');
const se = document.getElementById('se');
const descriptionText = document.getElementById('description-text');

// 初期化
function initGame() {
    updateUI();
    setupEventListeners();
    startEncounterAnimation();
    // BGMはエンカウント後に開始
    // 初期説明テキストを設定
    updateDescriptionText();
    
    // 音声ファイルのプリロード
    preloadAudio();
}

// エンカウントアニメーション開始
function startEncounterAnimation() {
    // 1. 黒背景表示
    encounterAnimation.classList.add('show');
    
    // 2. 文字表示（0.3秒後）
    setTimeout(() => {
        encounterEnemy.classList.add('show');
    }, 300);
    
    // 3. 文字消える（1.2秒後）
    setTimeout(() => {
        encounterEnemy.classList.remove('show');
        encounterEnemy.classList.add('hide');
    }, 1200);
    
    // 4. 「たたかう」表示（1.5秒後）
    setTimeout(() => {
        encounterBattle.classList.add('show');
    }, 1500);
}

// BGM開始
function startBGM() {
    bgm.volume = 0.3;  // 音量30%
    bgm.loop = true;   // ループ再生
    
    // モバイル対応: ユーザーインタラクション後に再生
    const playPromise = bgm.play();
    if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.log('BGM再生エラー:', e);
            // モバイルで再生できない場合は静かに失敗
        });
    }
}

// ページが非表示になった時にBGMを停止
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        bgm.pause();
    } else {
        // ページが再表示された時にBGMを再開
        if (bgm.volume > 0) {
            bgm.play().catch(e => console.log('BGM再開エラー:', e));
        }
    }
});

// 効果音再生（複数インスタンス対応）
let seIndex = 0;
const seElements = [];

function playSE() {
    // SEインスタンスが初期化されていない場合は初期化
    if (seElements.length === 0) {
        preloadAudio();
    }
    
    const currentSE = seElements[seIndex];
    seIndex = (seIndex + 1) % seElements.length;
    
    // 再生位置をリセット
    currentSE.currentTime = 0;
    currentSE.volume = 0.8;
    
    // 再生を試行
    const playPromise = currentSE.play();
    if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.log('効果音再生エラー:', e);
            // 他のインスタンスで再試行
            tryAlternativeSE();
        });
    }
}

// 代替SE再生
function tryAlternativeSE() {
    for (let i = 0; i < seElements.length; i++) {
        const altSE = seElements[i];
        if (altSE.readyState >= 2) { // HAVE_CURRENT_DATA以上
            altSE.currentTime = 0;
            altSE.volume = 0.8;
            altSE.play().catch(e => console.log('代替SE再生エラー:', e));
            break;
        }
    }
}

// 音声ファイルのプリロード
function preloadAudio() {
    // SEインスタンスを初期化
    seElements.push(document.getElementById('se'));
    seElements.push(document.getElementById('se2'));
    seElements.push(document.getElementById('se3'));
    
    // 各SEインスタンスの読み込みを確実にする
    seElements.forEach((seElement, index) => {
        seElement.load();
        seElement.volume = 0.8;
        
        // 読み込み完了を監視
        seElement.addEventListener('canplaythrough', () => {
            console.log(`SE${index + 1} 読み込み完了`);
        });
        
        seElement.addEventListener('error', (e) => {
            console.log(`SE${index + 1} 読み込みエラー:`, e);
        });
    });
}

// 戦闘開始
function startBattle() {
    // 効果音再生
    playSE();
    
    // 黒背景を消す
    encounterAnimation.classList.remove('show');
    encounterEnemy.classList.remove('hide');
    encounterBattle.classList.remove('show');
    
    // メニューを有効化
    enableMenu();
    
    // 少し遅れてBGM開始（効果音と重ならないように）
    setTimeout(() => {
        startBGM();
    }, 500);
}

// UI更新
function updateUI() {
    // コマンド選択の更新
    updateCommandSelection();
    // 説明テキストの更新
    updateDescriptionText();
    // ページ表示の更新
    updatePageDisplay();
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

// ページ表示の更新
function updatePageDisplay() {
    const commandOptions = document.querySelectorAll('.command-option');
    const pageButtons = document.querySelectorAll('.page-btn');
    
    // ページボタンのアクティブ状態を更新
    pageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.page) === game.currentPage) {
            btn.classList.add('active');
        }
    });
    
    // コマンドオプションの表示/非表示を更新
    commandOptions.forEach((option, index) => {
        const page = Math.floor(index / 3) + 1;
        if (page === game.currentPage) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

// 説明テキストの更新
function updateDescriptionText() {
    switch (game.currentCommand) {
        case 'mera':
            descriptionText.textContent = 'ネコ背で　ネコパンチを　くりだし　ダメージを　あたえる';
            break;
        case 'merami':
            descriptionText.textContent = 'タイっぽいキックで　ダメージを　あたえる';
            break;
        case 'merazoma':
            descriptionText.textContent = '忘れもしないあの夏の　けつバットで　ダメージを　あたえる';
            break;
        case 'seiken':
            descriptionText.textContent = '黒帯を　まいて　せいけん突きを　うち　ダメージを　あたえる';
            break;
        case 'kancho':
            descriptionText.textContent = 'たましいを　こめた　カンチョーで　ダメージを　あたえる';
            break;
        case '99punch':
            descriptionText.textContent = '1びょう間に　99発の　パンチを出して　ダメージを　あたえる';
            break;
        case 'kiru':
            descriptionText.textContent = '斬られたことに　気づかないほどの　スピードで　斬りつけ　ダメージを　あたえる';
            break;
        case 'foot':
            descriptionText.textContent = '究極にイタイと　いわれている　足ツボをおし　ダメージを　あたえる';
            break;
        case 'golden':
            descriptionText.textContent = 'ゴールデンボールを…。　ダメージを　あたえる';
            break;
        default:
            descriptionText.textContent = 'ネコ背で　ネコパンチを　くりだし　ダメージを　あたえる';
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
        case 'seiken':
            executeSeiken();
            break;
        case 'kancho':
            executeKancho();
            break;
        case '99punch':
            execute99Punch();
            break;
        case 'kiru':
            executeKiru();
            break;
        case 'foot':
            executeFoot();
            break;
        case 'golden':
            executeGolden();
            break;
    }
}

// ネコ背でネコパンチ実行
function executeMera() {
    // 効果音再生
    playSE();
    
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/BpgSVAXz1qE4StdxrEYhvcUO04zTN1Xrko6xgmLm8fY/checkin', '_blank');
    }, 100);
}

// タイ風キック実行
function executeMerami() {
    // 効果音再生
    playSE();
    
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/Cg2clK4Cf-dK7td_8plPaz5ZwgqI3QveiKXZbC8c2wg/checkin', '_blank');
    }, 100);
}

// 青春のけつバット実行
function executeMerazoma() {
    // 効果音再生
    playSE();
    
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/LGaJJoZSk-sswUUPgVnG0sww__GGpeB4w0eexnmBHqg/checkin', '_blank');
    }, 100);
}

// 黒帯せいけん突き実行
function executeSeiken() {
    // 効果音再生
    playSE();
    
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/yiopBbp4QJ9JrR1acEGD8TA-hjmcLgAyw2D9fDjxans/checkin', '_blank');
    }, 100);
}

// こんしんのカンチョー実行
function executeKancho() {
    // 効果音再生
    playSE();
    
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/0Jd2u0r_WQKhUMSvo4X9Fdp7chhKY4E_NNDW6bw_zh4/checkin', '_blank');
    }, 100);
}

// 99れつ拳実行
function execute99Punch() {
    // 効果音再生
    playSE();
    
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/P6EpERFnWNQAKhXGp5n8r1VJ6R2Knn1ItLJhLDbA0c0/checkin', '_blank');
    }, 100);
}

// 秘技！お前はすでに斬られている実行
function executeKiru() {
    // 効果音再生
    playSE();
    
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/EgR40twnDUba9zoDCSU9PTflYnaefalh9k8ZFrtawfM/checkin', '_blank');
    }, 100);
}

// アルティメット・フット・プレッシャー実行
function executeFoot() {
    // 効果音再生
    playSE();
    
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/gjFWlm8uUR0dd9dgZOx3JHl5osCr9nTSnVAecq__FUg/checkin', '_blank');
    }, 100);
}

// ゴールデン・ボール・クラッシャー実行
function executeGolden() {
    // 効果音再生
    playSE();
    
    updateUI();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/xfSxyFwoD-m9EdrBUZfsmLfxRxmLz0PzxFFrttc0aWQ/checkin', '_blank');
    }, 100);
}









// メニュー有効化
function enableMenu() {
    // コマンド選択
    document.querySelectorAll('.command-option').forEach(option => {
        option.addEventListener('click', (e) => {
            // タッチイベントのデフォルト動作を防止
            e.preventDefault();
            
            // 効果音再生
            playSE();
            
            document.querySelectorAll('.command-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            game.currentCommand = option.dataset.command;
            
            // 説明テキストを更新
            updateDescriptionText();
        });
    });
    
    // ページ切り替え
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // タッチイベントのデフォルト動作を防止
            e.preventDefault();
            
            // 効果音再生
            playSE();
            
            const newPage = parseInt(btn.dataset.page);
            game.currentPage = newPage;
            
            // 現在のページの最初の技を選択
            const commandOptions = document.querySelectorAll('.command-option');
            const firstCommandInPage = commandOptions[(newPage - 1) * 3];
            if (firstCommandInPage) {
                game.currentCommand = firstCommandInPage.dataset.command;
            }
            
            // UI更新
            updateUI();
        });
    });
    
    // 次のページボタン
    document.querySelector('.next-page-btn').addEventListener('click', (e) => {
        // タッチイベントのデフォルト動作を防止
        e.preventDefault();
        
        // 効果音再生
        playSE();
        
        // 次のページに移動
        const nextPage = game.currentPage < 3 ? game.currentPage + 1 : 1;
        game.currentPage = nextPage;
        
        // 現在のページの最初の技を選択
        const commandOptions = document.querySelectorAll('.command-option');
        const firstCommandInPage = commandOptions[(nextPage - 1) * 3];
        if (firstCommandInPage) {
            game.currentCommand = firstCommandInPage.dataset.command;
        }
        
        // UI更新
        updateUI();
    });
    
    // 敵表示をタップで攻撃開始
    document.querySelector('.enemy-display').addEventListener('click', (e) => {
        // タッチイベントのデフォルト動作を防止
        e.preventDefault();
        
        // 効果音再生
        playSE();
        
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

// イベントリスナーの設定
function setupEventListeners() {
    // 「たたかう」ボタンのクリック
    encounterBattle.addEventListener('click', (e) => {
        // タッチイベントのデフォルト動作を防止
        e.preventDefault();
        startBattle();
    });
}

// コマンドナビゲーション
function navigateCommands(key) {
    const commands = ['mera', 'merami', 'merazoma', 'seiken', 'kancho', '99punch', 'kiru', 'foot', 'golden'];
    const currentIndex = commands.indexOf(game.currentCommand);
    let newIndex = currentIndex;
    
    switch(key) {
        case 'ArrowUp':
            newIndex = currentIndex >= 3 ? currentIndex - 3 : currentIndex;
            break;
        case 'ArrowDown':
            newIndex = currentIndex < 6 ? currentIndex + 3 : currentIndex;
            break;
        case 'ArrowLeft':
            newIndex = currentIndex % 3 === 0 ? currentIndex + 2 : currentIndex - 1;
            break;
        case 'ArrowRight':
            newIndex = currentIndex % 3 === 2 ? currentIndex - 2 : currentIndex + 1;
            break;
    }
    
    if (newIndex >= 0 && newIndex < commands.length) {
        game.currentCommand = commands[newIndex];
        
        // 新しい技が属するページを計算
        const newPage = Math.floor(newIndex / 3) + 1;
        if (newPage !== game.currentPage) {
            game.currentPage = newPage;
        }
        
        document.querySelectorAll('.command-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`[data-command="${game.currentCommand}"]`).classList.add('selected');
        updateUI();
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});
