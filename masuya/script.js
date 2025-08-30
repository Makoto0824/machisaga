// ゲーム状態管理
class GameState {
    constructor() {
        this.currentCommand = 'mera';
        this.currentTarget = 'crow';
        this.battleLog = [];
        this.isRandomSelecting = false; // ランダム選択中かどうか
        this.randomSelectionInterval = null; // ランダム選択のインターバル
        this.hasStarted = false; // かいしが押されたかどうか
        this.isSkillDetermined = false; // 技が確定したかどうか
        this.hasPlayedDamageVideo = false; // ダメージ動画を再生したかどうか
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
const kaishiBtn = document.getElementById('kaishi-btn');
const kaishiOption = document.getElementById('kaishi-option');

// 初期化
function initGame() {
    // 初期状態では技を非表示にする
    const commandOptions = document.querySelectorAll('.command-option');
    commandOptions.forEach(option => {
        option.style.display = 'none';
    });
    
    // 魔導士チャウダーの三角を非表示にする
    const enemyDisplay = document.querySelector('.enemy-display');
    if (enemyDisplay) {
        enemyDisplay.classList.remove('skill-determined');
    }
    
    // ゲーム状態をリセット
    game.isSkillDetermined = false;
    game.hasPlayedDamageVideo = false;
    
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
}

// コマンド選択の更新
function updateCommandSelection() {
    const commandOptions = document.querySelectorAll('.command-option');
    commandOptions.forEach(option => {
        option.classList.remove('selected');
        option.style.display = 'none'; // 全技を非表示
        
        if (option.dataset.command === game.currentCommand) {
            option.classList.add('selected');
            option.style.display = 'flex'; // 選択された技のみ表示
        }
    });
}

// かいしオプションを非表示にして技オプションを表示
function showCommandOptions() {
    kaishiOption.style.display = 'none';
    const commandOptions = document.querySelectorAll('.command-option');
    commandOptions.forEach(option => {
        option.style.display = 'none'; // 全技を非表示
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

// 技のリスト（出現率順）
const allCommands = ['mera', 'merami', 'merazoma', 'seiken', 'kancho', '99punch', 'kiru', 'foot', 'golden'];

// 重み付きランダム選択用の重み配列（数字が大きいほど出現率が低い）
const commandWeights = [9, 8, 7, 6, 5, 4, 3, 2, 1];

// 重み付きランダム選択関数
function getWeightedRandomCommand() {
    const totalWeight = commandWeights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < allCommands.length; i++) {
        random -= commandWeights[i];
        if (random <= 0) {
            return allCommands[i];
        }
    }
    
    // フォールバック（最後の技）
    return allCommands[allCommands.length - 1];
}

// ダメージ動画再生関数
function playDamageVideo() {
    const video = document.querySelector('.enemy-sprite');
    if (video && !game.hasPlayedDamageVideo) {
        // ダメージ動画に変更
        video.src = 'videos/damage.mp4';
        
        // 動画を1度だけ再生、音声を有効化
        video.loop = false;
        video.muted = false; // 音声を有効化
        video.volume = 0.5; // 音量を50%に設定
        video.currentTime = 0;
        
        // 動画の再生開始
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // 再生が開始されたらフラグを設定
                game.hasPlayedDamageVideo = true;
                
                // 動画が終了したら最終フレームで停止
                video.addEventListener('ended', () => {
                    // 最終フレームで停止（少し手前で停止して最終フレームを表示）
                    video.currentTime = video.duration - 0.1;
                    video.pause();
                }, { once: true });
            }).catch(e => {
                console.log('ダメージ動画再生エラー:', e);
            });
        }
        
        // 効果音再生（動画の音声と重複する場合は削除可能）
        // playSE();
    }
}

// 攻撃開始関数
function startAttack() {
    if (!game.isSkillDetermined || game.hasPlayedDamageVideo) return;
    
    // 技Boxに「勇者の　こうげき！」を表示
    showAttackMessage();
    
    // 1秒後にダメージ動画を再生
    setTimeout(() => {
        playDamageVideo();
    }, 1000);
}

// 攻撃メッセージ表示関数
function showAttackMessage() {
    // 技オプションを非表示
    const commandOptions = document.querySelectorAll('.command-option');
    commandOptions.forEach(option => {
        option.style.display = 'none';
    });
    
    // かいしオプションを表示して「勇者の　こうげき！」を表示
    const kaishiOption = document.getElementById('kaishi-option');
    const kaishiBtn = document.getElementById('kaishi-btn');
    
    if (kaishiOption && kaishiBtn) {
        kaishiOption.style.display = 'flex';
        kaishiBtn.textContent = '勇者の　こうげき！';
        kaishiBtn.style.pointerEvents = 'none'; // クリックを無効化
        kaishiBtn.style.cursor = 'default'; // カーソルを通常に
        kaishiBtn.style.background = 'transparent'; // 背景を透明に
        kaishiBtn.style.border = 'none'; // ボーダーを削除
        kaishiBtn.style.fontFamily = 'DotGothic16, monospace'; // フォントを設定
        kaishiBtn.style.fontSize = '16px'; // フォントサイズを設定
        kaishiBtn.style.fontWeight = 'bold'; // フォントウェイトを設定
        kaishiBtn.style.color = '#fff'; // 文字色を白に
        kaishiBtn.style.textTransform = 'none'; // テキスト変換を無効化
        kaishiBtn.style.outline = 'none'; // アウトラインを削除
        kaishiBtn.style.transition = 'none'; // トランジションを無効化
        kaishiBtn.classList.remove('kaishi-btn'); // かいしボタンのクラスを削除して▶を非表示
        
        // 既存のイベントリスナーを削除するため、新しい要素を作成して置き換え
        const newKaishiBtn = kaishiBtn.cloneNode(true);
        newKaishiBtn.id = 'kaishi-btn'; // IDを再設定
        kaishiBtn.parentNode.replaceChild(newKaishiBtn, kaishiBtn);
        
        // 新しい要素にも同じスタイルを適用
        newKaishiBtn.style.pointerEvents = 'none';
        newKaishiBtn.style.cursor = 'default';
        newKaishiBtn.style.background = 'transparent';
        newKaishiBtn.style.border = 'none';
        newKaishiBtn.style.fontFamily = 'DotGothic16, monospace';
        newKaishiBtn.style.fontSize = '16px';
        newKaishiBtn.style.fontWeight = 'bold';
        newKaishiBtn.style.color = '#fff';
        newKaishiBtn.style.textTransform = 'none';
        newKaishiBtn.style.outline = 'none';
        newKaishiBtn.style.transition = 'none';
        newKaishiBtn.classList.remove('kaishi-btn');
    }
}

// ランダム技選択開始
function startRandomSelection() {
    if (game.isRandomSelecting) return; // 既に選択中なら何もしない
    
    game.isRandomSelecting = true;
    game.hasStarted = true;
    
    // かいしオプションを非表示にして技オプションを表示
    showCommandOptions();
    
    // 効果音再生
    playSE();
    
    // 技を順番に切り替える（100ms間隔）
    game.randomSelectionInterval = setInterval(() => {
        const randomCommand = getWeightedRandomCommand();
        game.currentCommand = randomCommand;
        updateUI();
    }, 100);
    
    // 2秒後に停止
    setTimeout(() => {
        stopRandomSelection();
    }, 2000);
}

// ランダム技選択停止
function stopRandomSelection() {
    if (!game.isRandomSelecting) return;
    
    clearInterval(game.randomSelectionInterval);
    game.isRandomSelecting = false;
    
    // 最終的な技を決定（重み付きランダム選択）
    const finalCommand = getWeightedRandomCommand();
    game.currentCommand = finalCommand;
    
    updateUI();
    
    // 技が確定したことを記録
    game.isSkillDetermined = true;
    
    // 魔導士チャウダーの三角を表示（技確定後）
    const enemyDisplay = document.querySelector('.enemy-display');
    if (enemyDisplay) {
        enemyDisplay.classList.add('skill-determined');
    }
    
    // 効果音再生
    playSE();
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
    // かいしオプション
    kaishiOption.addEventListener('click', (e) => {
        // タッチイベントのデフォルト動作を防止
        e.preventDefault();
        
        // 攻撃メッセージ表示後は無効化
        if (game.hasPlayedDamageVideo) return;
        
        // ランダム技選択開始
        startRandomSelection();
    });
    
    // コマンド選択（ランダム選択中は無効化）
    document.querySelectorAll('.command-option').forEach(option => {
        option.addEventListener('click', (e) => {
            // タッチイベントのデフォルト動作を防止
            e.preventDefault();
            
            // ランダム選択中またはルーレット開始済みの場合は無効
            if (game.isRandomSelecting || game.hasStarted) return;
            
            // 効果音再生
            playSE();
            
            game.currentCommand = option.dataset.command;
            
            // UI更新（選択された技のみ表示）
            updateUI();
        });
    });
    

    

    
    // 敵表示をタップで攻撃開始
    document.querySelector('.enemy-display').addEventListener('click', (e) => {
        // タッチイベントのデフォルト動作を防止
        e.preventDefault();
        
        // 技が確定していて、まだダメージ動画を再生していない場合
        if (game.isSkillDetermined && !game.hasPlayedDamageVideo) {
            startAttack();
        } else {
            // 効果音再生
            playSE();
            
            // 敵表示をタップしたら即座に攻撃開始
            executeCommand();
        }
    });
    
    // キーボードショートカット
    document.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'Enter':
            case ' ':
                // ランダム選択中でない場合のみ攻撃実行
                if (!game.isRandomSelecting && game.hasStarted) {
                    executeCommand();
                }
                break;
            case 'k':
            case 'K':
                // Kキーでかいしボタンを押す
                if (!game.isRandomSelecting && !game.hasStarted) {
                    startRandomSelection();
                }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                // ランダム選択中は無効、かいしが押される前も無効
                if (!game.isRandomSelecting && game.hasStarted) {
                    navigateCommands(event.key);
                }
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
            newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
            break;
        case 'ArrowDown':
            newIndex = currentIndex < commands.length - 1 ? currentIndex + 1 : currentIndex;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            // 横方向の移動は無効化（縦方向のみ）
            break;
    }
    
    if (newIndex >= 0 && newIndex < commands.length) {
        game.currentCommand = commands[newIndex];
        updateUI(); // UI更新で選択された技のみ表示
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});
