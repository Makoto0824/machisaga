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
const encounterVideoContainer = document.getElementById('encounter-video-container');
const encounterVideo = document.getElementById('encounter-video');
const encounterEnemy = document.querySelector('.encounter-enemy');
const encounterBattle = document.getElementById('encounter-battle');
const bgm = document.getElementById('bgm');
const se = document.getElementById('se');
const attackSE = document.getElementById('attackSE');
const rouletteStartSE = document.getElementById('rouletteStartSE');
const rouletteStopSE = document.getElementById('rouletteStopSE');
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
    showInitialBattleButton();
    // エンカウンターはユーザーインタラクション後に開始
    // 初期説明テキストを設定
    updateDescriptionText();
    
    // 音声ファイルのプリロード
    preloadAudio();
    
    // ダメージ動画をプリロード
    preloadDamageVideo();
}

// 初期「たたかう」ボタンを表示（ユーザーインタラクション待ち）
function showInitialBattleButton() {
    // 黒背景とたたかうボタンのみ表示
    encounterAnimation.classList.add('show');
    encounterBattle.classList.add('show');
    
    // エンカウンター演出は非表示のまま
    encounterEnemy.classList.remove('show');
    encounterVideoContainer.style.display = 'none';
}

// エンカウントアニメーション開始
function startEncounterAnimation() {
    // 1. 初期「たたかう」ボタンを非表示
    encounterBattle.classList.remove('show');
    
    // 2. 黒背景表示
    encounterAnimation.classList.add('show');
    
    // 3. エンカウンター動画アニメーション表示（即座に）
    encounterVideoContainer.style.display = 'flex'; // 表示状態に戻す
    encounterVideoContainer.classList.add('show');
    encounterVideo.currentTime = 0; // 動画を最初から再生
    encounterVideo.volume = 0.7; // 音量設定（70%）
    encounterVideo.muted = false; // 音声を有効化
    encounterVideo.play().catch(e => console.log('エンカウンター動画再生エラー:', e));
    
    // 4. 動画アニメーション停止（1秒後）
    setTimeout(() => {
        encounterVideoContainer.classList.remove('show');
        encounterVideoContainer.style.display = 'none'; // 完全に非表示
        encounterVideo.pause(); // 動画停止
    }, 1000);
    
    // 5. 文字表示（1.3秒後）
    setTimeout(() => {
        encounterEnemy.classList.add('show');
    }, 1300);
    
    // 6. 文字消える（2.2秒後）とバトル開始
    setTimeout(() => {
        encounterEnemy.classList.remove('show');
        encounterEnemy.classList.add('hide');
        
        // 直接バトル開始（0.3秒後）
        setTimeout(() => {
            startActualBattle();
        }, 300);
    }, 2200);
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

// 攻撃時効果音再生
function playAttackSE() {
    // 攻撃時効果音の再生位置をリセット
    attackSE.currentTime = 0;
    attackSE.volume = 0.8;
    
    // 再生を試行
    const playPromise = attackSE.play();
    if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.log('攻撃時効果音再生エラー:', e);
        });
    }
}

// ルーレット開始効果音再生
function playRouletteStartSE() {
    rouletteStartSE.currentTime = 0;
    rouletteStartSE.volume = 0.8;
    
    const playPromise = rouletteStartSE.play();
    if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.log('ルーレット開始効果音再生エラー:', e);
        });
    }
}

// ルーレット停止効果音再生
function playRouletteStopSE() {
    rouletteStopSE.currentTime = 0;
    rouletteStopSE.volume = 0.8;
    
    const playPromise = rouletteStopSE.play();
    if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.log('ルーレット停止効果音再生エラー:', e);
        });
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

// ダメージ動画のプリロード
function preloadDamageVideo() {
    const video = document.createElement('video');
    video.src = 'videos/damage.mp4';
    video.preload = 'auto';
    video.muted = true; // プリロード時は音声を無効化
    video.style.display = 'none'; // 非表示でプリロード
    document.body.appendChild(video);
    
    // プリロード完了後に要素を削除
    video.addEventListener('loadeddata', () => {
        document.body.removeChild(video);
    }, { once: true });
}

// 戦闘開始（ユーザークリック時）
function startBattle() {
    // 最初のクリックでエンカウンター演出開始
    if (!game.hasStarted) {
        startEncounterAnimation();
        return;
    }
}

// 実際のバトル開始処理（エンカウンター演出後）
function startActualBattle() {
    // 黒背景を消す
    encounterAnimation.classList.remove('show');
    encounterEnemy.classList.remove('hide');
    encounterBattle.classList.remove('show');
    
    // メニューを有効化
    enableMenu();
    
    // BGM開始
    startBGM();
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
    // わざルーレットスタート前は空白
    if (!game.hasStarted) {
        descriptionText.textContent = '';
        return;
    }
    
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
            descriptionText.textContent = '';
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

// 各技のダメージ値
const commandDamages = {
    'mera': 10,      // ネコ背でネコパンチ
    'merami': 40,    // タイ風キック
    'merazoma': 55,  // 青春のけつバット
    'seiken': 75,    // 黒帯せいけん突き
    'kancho': 100,   // こんしんのカンチョー
    '99punch': 115,  // 99れつ拳
    'kiru': 135,     // お前はもう斬られてる
    'foot': 160,     // 極フットプレッシャー
    'golden': 210    // G・B・クラッシャー
};

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
        // フェードアウト効果
        video.style.opacity = '0';
        video.style.transition = 'opacity 0.2s ease-out';
        
        setTimeout(() => {
            // ダメージ動画に変更
            video.src = 'videos/damage.mp4';
            
            // 動画を1度だけ再生、音声を有効化
            video.loop = false;
            video.muted = false; // 音声を有効化
            video.volume = 0.5; // 音量を50%に設定
            video.currentTime = 0;
            
            // 動画の読み込み完了を待ってから再生
            video.addEventListener('loadeddata', () => {
                // フェードイン効果
                video.style.opacity = '1';
                video.style.transition = 'opacity 0.2s ease-in';
                
                // 動画の再生開始
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // 再生が開始されたらフラグを設定
                        game.hasPlayedDamageVideo = true;
                        
                        // 動画が終了したら最終フレームで停止し、BGMを再開
                        video.addEventListener('ended', () => {
                            // 最終フレームで停止（少し手前で停止して最終フレームを表示）
                            video.currentTime = video.duration - 0.1;
                            video.pause();
                            
                            // モバイル対応: BGMが停止していたら再開
                            if (bgm.paused && bgm.volume > 0) {
                                bgm.play().catch(e => console.log('BGM再開エラー:', e));
                            }
                        }, { once: true });
                    }).catch(e => {
                        console.log('ダメージ動画再生エラー:', e);
                    });
                }
            }, { once: true });
        }, 200); // フェードアウト完了を待つ
        
        // 効果音再生（動画の音声と重複する場合は削除可能）
        // playSE();
    }
}

// 攻撃開始関数
function startAttack() {
    if (!game.isSkillDetermined || game.hasPlayedDamageVideo) return;
    
    // 魔導士チャウダーの▶を削除
    const enemyDisplay = document.querySelector('.enemy-display');
    if (enemyDisplay) {
        enemyDisplay.classList.remove('skill-determined');
    }
    
    // 技Boxに「勇者の　こうげき！」を表示
    showAttackMessage();
    
    // 1秒後にダメージ動画を再生
    setTimeout(() => {
        playDamageVideo();
    }, 1000);
}

// 攻撃メッセージ表示関数
function showAttackMessage() {
    // 攻撃時効果音を再生
    playAttackSE();
    
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
        
        // ダメージ動画再生後にダメージ表示と「つぎへ」に変更
        setTimeout(() => {
            // 選択された技のダメージ値を取得
            const damage = commandDamages[game.currentCommand] || 0;
            
            // ダメージ表示を追加
            const damageText = document.createElement('div');
            damageText.textContent = `${damage} のダメージ！`;
            damageText.className = 'damage-text';
            // インラインスタイルは一切使わない（CSSクラスのみに依存）
            
            // 既存の「つぎへ」ボタンの前にダメージ表示を挿入
            newKaishiBtn.parentNode.insertBefore(damageText, newKaishiBtn);
            
            // 「つぎへ」ボタン（▶はCSSアニメーションで表示）
            newKaishiBtn.textContent = 'つぎへ';
            newKaishiBtn.style.pointerEvents = 'auto'; // クリックを有効化
            newKaishiBtn.style.cursor = 'pointer'; // カーソルをポインターに
            newKaishiBtn.classList.remove('kaishi-btn'); // CSS疑似要素のクラスを削除
            newKaishiBtn.className = 'skill-determined-btn'; // 技確定後のスタイルクラスを追加
            
            // 「つぎへ」ボタンのクリックイベントを追加
            newKaishiBtn.addEventListener('click', () => {
                // 選択された技に対応するリンク先に遷移（技名表示なし）
                executeCommand();
            });
        }, 3000); // ダメージ動画再生開始から3秒後
    }
}

// ランダム技選択開始
function startRandomSelection() {
    if (game.isRandomSelecting) return; // 既に選択中なら何もしない
    
    game.isRandomSelecting = true;
    game.hasStarted = true;
    
    // かいしオプションを非表示にして技オプションを表示
    showCommandOptions();
    
    // ルーレット開始効果音を再生
    playRouletteStartSE();
    
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
    
    // ルーレット開始音を停止
    rouletteStartSE.pause();
    rouletteStartSE.currentTime = 0;
    
    // 最終的な技を決定（重み付きランダム選択）
    const finalCommand = getWeightedRandomCommand();
    game.currentCommand = finalCommand;
    
    updateUI();
    
    // 技が確定したことを記録
    game.isSkillDetermined = true;
    
    // 魔王スイッツンの三角を表示（技確定後）
    const enemyDisplay = document.querySelector('.enemy-display');
    if (enemyDisplay) {
        enemyDisplay.classList.add('skill-determined');
    }
    
    // ルーレット停止効果音を再生
    playRouletteStopSE();
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
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/b-mjFuRIEBL3xROr64xXA3qaSkZ5L926lSWCOXVtH60/checkin', '_blank');
    }, 100);
}

// タイ風キック実行
function executeMerami() {
    // 効果音再生
    playSE();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/iZP-oFgwKs-rwFFVToqXkV488vnDHjyxIPF_hZ5y8MM/checkin', '_blank');
    }, 100);
}

// 青春のけつバット実行
function executeMerazoma() {
    // 効果音再生
    playSE();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/x2pNQFx8ChWMoYPfgrXopstCgZ9HMF8JCPpNXmyXpn0/checkin', '_blank');
    }, 100);
}

// 黒帯せいけん突き実行
function executeSeiken() {
    // 効果音再生
    playSE();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/Ti0h_WV3B8OiAXAi-vxtodyw6wAyT35MHRGcsCBuh0g/checkin', '_blank');
    }, 100);
}

// こんしんのカンチョー実行
function executeKancho() {
    // 効果音再生
    playSE();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/17VlTOfDKjp6tqoAnuXxlgvsE4wRofg2Hz1i_rr_5Fc/checkin', '_blank');
    }, 100);
}

// 99れつ拳実行
function execute99Punch() {
    // 効果音再生
    playSE();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/MyKXAlK_qOWpn9hKrZEWrQKypMoE8Ess9C1PhKBXg0A/checkin', '_blank');
    }, 100);
}

// お前はもう斬られてる実行
function executeKiru() {
    // 効果音再生
    playSE();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/CrXfZStcu7XMtyDI77JE5lKlk7RYsZVcF5Xdk2XyiB0/checkin', '_blank');
    }, 100);
}

// 極フットプレッシャー実行
function executeFoot() {
    // 効果音再生
    playSE();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/in7B9olSOc9H-W7yoxpV3T9WFJQwgM9vYUVrkKyHgBU/checkin', '_blank');
    }, 100);
}

// G・B・クラッシャー実行
function executeGolden() {
    // 効果音再生
    playSE();
    
    // まちサーガのチェックインページに遷移
    setTimeout(() => {
        window.open('https://play.ttt.games/worlds/machi-saga/events/WsDzeA-BjEOjN833J0-tTzRDHnnLLzFMytiCf5gseD4/checkin', '_blank');
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
        
        // 技が確定していて、まだダメージ動画を再生していない場合のみ攻撃可能
        if (game.isSkillDetermined && !game.hasPlayedDamageVideo) {
            startAttack();
        }
        // 技が確定していない場合は何もしない
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
