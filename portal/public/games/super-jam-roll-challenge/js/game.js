// スーパージャムロールチャレンジ - 画像アセット版（モバイルファースト 9:16）

const BASE_GAME_WIDTH = 360;
const BASE_GAME_HEIGHT = 640;
const BASE_COUNTER_HEIGHT = 48;

const BASE_ITEM_CONFIG = {
    jam: { src: 'assets/images/jam.png', width: 40, height: 40 },
    takumi: { src: 'assets/images/takumi.png', width: 48, height: 48 },
    karashi: { src: 'assets/images/karashi.png', width: 52, height: 52 },
    mogumogun: { src: 'assets/images/mogumogun.png', width: 56, height: 56 },
};

const BASE_ROLL_SIZE = { width: 72, height: 72 };

const ROLL_FRAMES = [
    'assets/images/roll0.png',
    'assets/images/roll1.png',
    'assets/images/roll2.png',
    'assets/images/roll3.png',
    'assets/images/roll4.png',
    'assets/images/roll5.png',
];

const BG_GAME = 'assets/images/bg_game.png';
const KARASHI_SLOW_DURATION = 3;
const TAKUMI_TIME_SECONDS = 5;
const TAKUMI_SPEED_BONUS = 0.5;
const TAKUMI_INTERVAL_REDUCTION = 350;
const MIN_DROP_INTERVAL = 350;

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.applySmoothing();

        this.titleScreen = document.getElementById('title-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameStage = document.getElementById('game-stage');
        this.resultScreen = document.getElementById('result-screen');
        this.effectText = document.getElementById('effect-text');
        this.effectComplete = document.getElementById('effect-complete');
        this.effectTakumi = document.getElementById('effect-takumi');
        this.effectMogumogun = document.getElementById('effect-mogumogun');
        this.effectKarashi = document.getElementById('effect-karashi');
        this.startButton = document.getElementById('start-button');
        this.howToButton = document.getElementById('how-to-button');
        this.howToModal = document.getElementById('how-to-modal');
        this.howToBackdrop = document.getElementById('how-to-backdrop');
        this.howToClose = document.getElementById('how-to-close');

        this.timerDisplay = document.getElementById('timer');
        this.scoreDisplay = document.getElementById('score');
        this.scoreDisplayBox = document.getElementById('score-display');
        this.scoreDelta = document.getElementById('score-delta');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.jamDots = document.querySelectorAll('.jam-dot');

        this.images = {};
        this.imagesLoaded = false;

        this.isRunning = false;
        this.timeLeft = 30;
        this.score = 0;
        this.jamCount = 0;
        this.isTakumiTime = false;
        this.takumiTimeLeft = 0;
        this.karashiSlowLeft = 0;
        this.rollTargetX = null;

        this.roll = null;
        this.items = [];

        this.baseDropInterval = 1200;
        this.dropInterval = this.baseDropInterval;
        this.baseDropSpeed = 2;
        this.dropSpeed = this.baseDropSpeed;
        this.lastDropTime = 0;

        this.rollFalling = false;
        this.rollFallY = 0;
        this.rollFallSpeed = 0;

        this.completionAnimation = false;
        this.completionProgress = 0;
        this.completionDuration = 950;
        this.completionParticles = [];
        this.completionFlash = 0;
        this.scoreDownFlash = 0;
        this.completionRing = null;
        this.completionStart = null;
        this.completionTarget = null;
        this.scorePopTriggered = false;
        this.rollRespawnAnimation = false;
        this.rollRespawnProgress = 0;
        this.rollRespawnDuration = 380;

        this.gameWidth = BASE_GAME_WIDTH;
        this.gameHeight = BASE_GAME_HEIGHT;
        this.pixelScale = 1;
        this.scaleFactor = 1;
        this.counterHeight = BASE_COUNTER_HEIGHT;
        this.rollY = BASE_GAME_HEIGHT - 58;
        this.scaledRollSize = { ...BASE_ROLL_SIZE };
        this.scaledItemConfig = {};

        this.orientationNotice = document.getElementById('orientation-notice');
        this.activePointerId = null;

        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.handleViewportChange());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleViewportChange(), 100);
        });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => this.handleViewportChange());
            window.visualViewport.addEventListener('scroll', () => this.handleViewportChange());
        }

        if (window.ResizeObserver && this.gameStage) {
            this.viewportObserver = new ResizeObserver(() => this.handleViewportChange());
            this.viewportObserver.observe(this.gameStage);
        }

        this.handleViewportChange();

        this.startButton.disabled = true;
        this.startButton.classList.add('is-loading');

        document.getElementById('retry-button').addEventListener('click', () => this.goToTitle());
        this.startButton.addEventListener('click', () => this.startGame());
        this.setupHowToModal();

        this.setupInputHandlers();

        try {
            await this.loadImages();
            this.imagesLoaded = true;
            this.startButton.disabled = false;
            this.startButton.classList.remove('is-loading');
        } catch (err) {
            console.error(err);
            this.startButton.classList.remove('is-loading');
            this.startButton.classList.add('is-error');
            this.startButton.setAttribute('aria-label', '読み込み失敗');
        }
    }

    setupHowToModal() {
        if (!this.howToModal) return;

        this.howToButton?.addEventListener('click', () => this.openHowToModal());
        this.howToClose?.addEventListener('click', () => this.closeHowToModal());
        this.howToBackdrop?.addEventListener('click', () => this.closeHowToModal());

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !this.howToModal.classList.contains('hidden')) {
                this.closeHowToModal();
            }
        });
    }

    openHowToModal() {
        if (!this.howToModal) return;
        this.howToModal.classList.remove('hidden');
        document.body.classList.add('how-to-open');
        this.howToClose?.focus();
    }

    closeHowToModal() {
        if (!this.howToModal) return;
        this.howToModal.classList.add('hidden');
        document.body.classList.remove('how-to-open');
        this.howToButton?.focus();
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load: ${src}`));
            img.src = src;
        });
    }

    async loadImages() {
        this.images.items = {};
        for (const [key, config] of Object.entries(BASE_ITEM_CONFIG)) {
            this.images.items[key] = await this.loadImage(config.src);
        }

        this.images.roll = [];
        for (const src of ROLL_FRAMES) {
            this.images.roll.push(await this.loadImage(src));
        }

        this.images.bgGame = await this.loadImage(BG_GAME);
    }

    handleViewportChange() {
        this.updateOrientationNotice();
        this.resizeCanvas();
    }

    updateOrientationNotice() {
        if (!this.orientationNotice) return;
        const isMobile = window.matchMedia('(max-width: 900px)').matches;
        const isLandscape = window.innerWidth > window.innerHeight;
        const isShortLandscape = isLandscape && window.innerHeight <= 500;
        this.orientationNotice.classList.toggle('hidden', !(isMobile && isShortLandscape));
    }

    updateLayoutMetrics() {
        this.scaleFactor = this.gameWidth / BASE_GAME_WIDTH;
        const heightFactor = this.gameHeight / BASE_GAME_HEIGHT;

        this.scaledRollSize = {
            width: Math.round(BASE_ROLL_SIZE.width * this.scaleFactor),
            height: Math.round(BASE_ROLL_SIZE.height * this.scaleFactor),
        };

        this.scaledItemConfig = {};
        for (const [key, config] of Object.entries(BASE_ITEM_CONFIG)) {
            this.scaledItemConfig[key] = {
                src: config.src,
                width: Math.round(config.width * this.scaleFactor),
                height: Math.round(config.height * this.scaleFactor),
            };
        }

        this.counterHeight = Math.max(32, Math.round(BASE_COUNTER_HEIGHT * heightFactor));
        this.rollY = this.gameHeight - this.counterHeight - Math.round(this.scaledRollSize.height / 2) - 8;
    }

    resizeCanvas() {
        if (!this.gameStage) return;

        const rect = this.gameStage.getBoundingClientRect();
        const displayWidth = Math.max(1, rect.width);
        const displayHeight = Math.max(1, rect.height);

        this.gameWidth = BASE_GAME_WIDTH;
        this.gameHeight = BASE_GAME_HEIGHT;
        this.pixelScale = displayWidth / this.gameWidth;

        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;

        this.applySmoothing();
        this.updateLayoutMetrics();

        if (this.roll) {
            this.roll.y = this.rollY;
            this.roll.width = this.scaledRollSize.width;
            this.roll.height = this.scaledRollSize.height;
            this.roll.x = Math.min(
                Math.max(this.roll.x, this.roll.width / 2),
                this.gameWidth - this.roll.width / 2
            );
            this.rollTargetX = this.roll.x;
        }
    }

    applySmoothing() {
        const ctx = this.ctx;
        ctx.imageSmoothingEnabled = true;
        if ('imageSmoothingQuality' in ctx) {
            ctx.imageSmoothingQuality = 'high';
        }
    }

    setupInputHandlers() {
        const clampRollX = (gameX) => Math.min(
            Math.max(gameX, this.roll.width / 2),
            this.gameWidth - this.roll.width / 2
        );

        const moveRollTo = (clientX) => {
            if (!this.isRunning || this.rollFalling || this.rollRespawnAnimation || !this.roll) return;
            const rect = this.canvas.getBoundingClientRect();
            const gameX = ((clientX - rect.left) / rect.width) * this.gameWidth;
            const targetX = clampRollX(gameX);

            if (this.karashiSlowLeft > 0) {
                this.rollTargetX = targetX;
            } else {
                this.roll.x = targetX;
                this.rollTargetX = targetX;
            }
        };

        this.gameScreen.addEventListener('pointerdown', (e) => {
            if (!this.isRunning || this.rollFalling || this.rollRespawnAnimation) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;

            this.activePointerId = e.pointerId;
            this.gameScreen.setPointerCapture(e.pointerId);
            moveRollTo(e.clientX);
        });

        this.gameScreen.addEventListener('pointermove', (e) => {
            if (this.activePointerId !== e.pointerId) return;
            e.preventDefault();
            moveRollTo(e.clientX);
        }, { passive: false });

        const releasePointer = (e) => {
            if (this.activePointerId !== e.pointerId) return;
            this.activePointerId = null;
            if (this.gameScreen.hasPointerCapture(e.pointerId)) {
                this.gameScreen.releasePointerCapture(e.pointerId);
            }
        };

        this.gameScreen.addEventListener('pointerup', releasePointer);
        this.gameScreen.addEventListener('pointercancel', releasePointer);

        document.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.rollFalling || this.rollRespawnAnimation || !this.roll) return;
            const moveSpeed = this.getRollMoveSpeed();
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                this.roll.x = Math.max(this.roll.x - moveSpeed, this.roll.width / 2);
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                this.roll.x = Math.min(this.roll.x + moveSpeed, this.gameWidth - this.roll.width / 2);
            }
            this.rollTargetX = this.roll.x;
        });
    }

    getRollMoveSpeed() {
        const base = Math.max(6, Math.round(8 * this.scaleFactor));
        if (this.karashiSlowLeft > 0) {
            return Math.max(3, Math.round(base * 0.45));
        }
        return base;
    }

    updateRollMovement(deltaTime) {
        if (!this.roll || this.rollFalling || this.rollRespawnAnimation || this.karashiSlowLeft <= 0) return;

        if (this.rollTargetX == null) {
            this.rollTargetX = this.roll.x;
        }

        const follow = 0.3 * (deltaTime / 16);
        const half = this.roll.width / 2;
        this.roll.x += (this.rollTargetX - this.roll.x) * follow;
        this.roll.x = Math.min(Math.max(this.roll.x, half), this.gameWidth - half);
    }

    resetGameState() {
        this.isRunning = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = null;

        this.timeLeft = 30;
        this.score = 0;
        this.jamCount = 0;
        this.items = [];
        this.isTakumiTime = false;
        this.takumiTimeLeft = 0;
        this.karashiSlowLeft = 0;
        this.rollTargetX = null;
        this.dropInterval = this.baseDropInterval;
        this.dropSpeed = this.baseDropSpeed;
        this.lastDropTime = 0;

        this.rollFalling = false;
        this.rollFallY = 0;
        this.rollFallSpeed = 0;
        this.completionAnimation = false;
        this.completionProgress = 0;
        this.completionParticles = [];
        this.completionFlash = 0;
        this.scoreDownFlash = 0;
        this.completionRing = null;
        this.completionStart = null;
        this.completionTarget = null;
        this.scorePopTriggered = false;
        this.rollRespawnAnimation = false;
        this.rollRespawnProgress = 0;
        this.roll = null;
        this.activePointerId = null;

        this.gameScreen.classList.remove('takumi-time');
        this.gameStage.classList.remove('takumi-time');
        this.gameStage.classList.remove('completion-burst');
        if (this.scoreDisplayBox) {
            this.scoreDisplayBox.classList.remove('score-pop', 'score-pop-down');
        }
        if (this.scoreDelta) {
            this.scoreDelta.textContent = '';
            this.scoreDelta.classList.remove('show');
        }

        this.effectText.textContent = '';
        this.effectText.className = '';
        this.effectText.style.animation = 'none';
        this.effectText.style.opacity = '0';
        void this.effectText.offsetWidth;
        this.effectText.style.animation = '';
        this.effectText.style.opacity = '';

        if (this.effectComplete) {
            this.effectComplete.className = 'effect-complete';
            this.effectComplete.style.animation = 'none';
            this.effectComplete.style.opacity = '0';
            void this.effectComplete.offsetWidth;
            this.effectComplete.style.animation = '';
            this.effectComplete.style.opacity = '';
        }

        if (this.effectTakumi) {
            this.effectTakumi.className = 'effect-takumi';
            this.effectTakumi.style.animation = 'none';
            this.effectTakumi.style.opacity = '0';
            void this.effectTakumi.offsetWidth;
            this.effectTakumi.style.animation = '';
            this.effectTakumi.style.opacity = '';
        }

        if (this.effectMogumogun) {
            this.effectMogumogun.className = 'effect-mogumogun';
            this.effectMogumogun.style.animation = 'none';
            this.effectMogumogun.style.opacity = '0';
            void this.effectMogumogun.offsetWidth;
            this.effectMogumogun.style.animation = '';
            this.effectMogumogun.style.opacity = '';
        }

        if (this.effectKarashi) {
            this.effectKarashi.className = 'effect-karashi';
            this.effectKarashi.style.animation = 'none';
            this.effectKarashi.style.opacity = '0';
            void this.effectKarashi.offsetWidth;
            this.effectKarashi.style.animation = '';
            this.effectKarashi.style.opacity = '';
        }

        this.updateUI();
        this.updateJamGauge();
    }

    startGame() {
        if (!this.imagesLoaded) return;

        this.resetGameState();
        this.resizeCanvas();
        this.isRunning = true;

        this.roll = {
            x: this.gameWidth / 2,
            y: this.rollY,
            width: this.scaledRollSize.width,
            height: this.scaledRollSize.height,
        };
        this.rollTargetX = this.roll.x;

        this.titleScreen.classList.add('hidden');
        this.resultScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');

        this.startTimer();
        this.lastTime = performance.now();
        this.gameLoop();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            if (!this.isRunning) return;

            this.timeLeft--;

            if (this.isTakumiTime) {
                this.takumiTimeLeft--;
                if (this.takumiTimeLeft <= 0) this.endTakumiTime();
            }

            if (this.karashiSlowLeft > 0) {
                this.karashiSlowLeft--;
            }

            this.updateUI();

            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    updateUI() {
        this.timerDisplay.textContent = `タイム: ${Math.max(0, this.timeLeft)}`;
        this.scoreDisplay.textContent = `${this.score} 個`;
    }

    updateJamGauge() {
        this.jamDots.forEach((dot, index) => {
            dot.classList.toggle('filled', index < this.jamCount);
        });
    }

    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime, currentTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime, currentTime) {
        if (currentTime - this.lastDropTime > this.dropInterval) {
            this.spawnItem();
            this.lastDropTime = currentTime;
        }

        this.updateRollMovement(deltaTime);

        if (this.rollFalling) {
            this.rollFallSpeed += 0.3 * this.scaleFactor;
            this.rollFallY += this.rollFallSpeed;
            if (this.rollFallY > 60 * this.scaleFactor) {
                this.rollFalling = false;
                this.rollFallY = 0;
                this.rollFallSpeed = 0;
            }
        }

        if (this.completionAnimation) {
            this.completionProgress += deltaTime / this.completionDuration;

            if (this.completionFlash > 0) {
                this.completionFlash = Math.max(0, this.completionFlash - deltaTime / 220);
            }

            if (this.completionRing) {
                this.completionRing.radius += 4.5 * this.scaleFactor * (deltaTime / 16);
                this.completionRing.life -= deltaTime / 450;
                if (this.completionRing.life <= 0) this.completionRing = null;
            }

            const flyPhase = Math.max(0, (this.completionProgress - 0.14) / 0.86);
            if (flyPhase > 0.2 && flyPhase < 0.92 && Math.random() < 0.22) {
                const pose = this.getCompletionRollPose(this.completionProgress);
                this.completionParticles.push({
                    x: pose.x,
                    y: pose.y,
                    vx: (Math.random() - 0.5) * 1.2 * this.scaleFactor,
                    vy: (Math.random() - 0.5) * 1.2 * this.scaleFactor,
                    life: 0.7,
                    decay: 0.04,
                    size: (2 + Math.random() * 3) * this.scaleFactor,
                    color: '#f8b800',
                    star: false,
                });
            }

            if (flyPhase >= 0.9 && !this.scorePopTriggered) {
                this.triggerScorePop();
            }

            if (this.completionProgress >= 1) {
                this.completionAnimation = false;
                this.completionProgress = 0;
                this.completionFlash = 0;
                this.completionParticles = [];
                this.completionRing = null;
                this.completionStart = null;
                this.completionTarget = null;
                this.scorePopTriggered = false;
            }
        }

        if (this.completionParticles.length > 0) {
            this.completionParticles = this.completionParticles.filter((particle) => {
                particle.x += particle.vx * (deltaTime / 16);
                particle.y += particle.vy * (deltaTime / 16);
                particle.vy += 0.12 * (deltaTime / 16);
                particle.life -= particle.decay * (deltaTime / 16);
                return particle.life > 0;
            });
        }

        if (this.scoreDownFlash > 0) {
            this.scoreDownFlash = Math.max(0, this.scoreDownFlash - deltaTime / 280);
        }

        if (this.rollRespawnAnimation) {
            this.rollRespawnProgress += deltaTime / this.rollRespawnDuration;
            if (this.rollRespawnProgress >= 1) {
                this.rollRespawnAnimation = false;
                this.rollRespawnProgress = 0;
            }
        }

        this.items = this.items.filter((item) => {
            item.y += this.dropSpeed * (deltaTime / 16);

            if (!this.rollFalling && !this.rollRespawnAnimation && this.checkCollision(item)) {
                this.collectItem(item);
                return false;
            }

            return item.y < this.gameHeight + 40;
        });

        this.adjustDifficulty();
    }

    spawnItem() {
        const types = this.getItemTypes();
        const type = types[Math.floor(Math.random() * types.length)];
        const config = this.scaledItemConfig[type];

        let itemsToSpawn = 1;
        if (this.isTakumiTime && type === 'jam') {
            itemsToSpawn = Math.floor(Math.random() * 3) + 3;
        }

        const spawnGap = Math.round(28 * this.scaleFactor);

        for (let i = 0; i < itemsToSpawn; i++) {
            this.items.push({
                type,
                x: Math.random() * (this.gameWidth - config.width) + config.width / 2,
                y: -config.height - i * spawnGap,
                width: config.width,
                height: config.height,
            });
        }
    }

    getItemTypes() {
        if (this.isTakumiTime) return ['jam'];

        const types = ['jam', 'jam', 'jam', 'jam', 'jam', 'jam', 'jam', 'jam'];
        if (this.score >= 2) types.push('karashi');
        if (this.score >= 4) types.push('mogumogun');
        if (this.score >= 1) types.push('takumi');
        return types;
    }

    checkCollision(item) {
        const rollOffsetY = this.rollFallY + this.getRollVerticalOffset();
        const rollLeft = this.roll.x - this.roll.width / 2;
        const rollRight = this.roll.x + this.roll.width / 2;
        const rollTop = this.roll.y - this.roll.height / 2 + rollOffsetY;
        const rollBottom = this.roll.y + this.roll.height / 2 + rollOffsetY;

        const itemLeft = item.x - item.width / 2;
        const itemRight = item.x + item.width / 2;
        const itemTop = item.y - item.height / 2;
        const itemBottom = item.y + item.height / 2;

        return !(rollLeft > itemRight || rollRight < itemLeft ||
                 rollTop > itemBottom || rollBottom < itemTop);
    }

    collectItem(item) {
        switch (item.type) {
            case 'jam': this.collectJam(); break;
            case 'takumi': this.startTakumiTime(); break;
            case 'karashi': this.hitKarashi(); break;
            case 'mogumogun': this.hitMogumogun(); break;
        }
    }

    collectJam() {
        this.jamCount++;
        this.updateJamGauge();
        if (this.jamCount >= 5) this.completeRoll();
    }

    completeRoll() {
        this.score++;
        this.jamCount = 0;
        this.timeLeft += 2;
        this.updateUI();
        this.updateJamGauge();
        this.completionAnimation = true;
        this.completionProgress = 0;
        this.completionFlash = 1;
        this.scorePopTriggered = false;
        this.completionStart = {
            x: this.roll.x,
            y: this.roll.y + this.rollFallY,
        };
        this.completionTarget = this.getScoreTargetPosition();
        this.spawnCompletionBurst();
        this.gameStage.classList.remove('completion-burst');
        void this.gameStage.offsetWidth;
        this.gameStage.classList.add('completion-burst');
        setTimeout(() => this.gameStage.classList.remove('completion-burst'), 380);
        this.startRollRespawn();
        this.showCompleteEffect();
    }

    getScoreTargetPosition() {
        if (this.scoreDisplayBox && this.canvas) {
            const canvasRect = this.canvas.getBoundingClientRect();
            const scoreRect = this.scoreDisplayBox.getBoundingClientRect();

            if (canvasRect.width > 0 && canvasRect.height > 0) {
                const screenX = scoreRect.left + scoreRect.width / 2 - canvasRect.left;
                const screenY = scoreRect.top + scoreRect.height / 2 - canvasRect.top;
                return {
                    x: (screenX / canvasRect.width) * this.gameWidth,
                    y: (screenY / canvasRect.height) * this.gameHeight,
                };
            }
        }

        return {
            x: this.gameWidth * 0.82,
            y: this.gameHeight * 0.09,
        };
    }

    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    getCompletionRollPose(t) {
        const start = this.completionStart;
        const target = this.completionTarget;
        if (!start || !target) {
            return { x: this.roll.x, y: this.roll.y, scale: 1, rotation: 0, alpha: 1 };
        }

        const popEnd = 0.14;
        if (t < popEnd) {
            const p = t / popEnd;
            const pop = 1 + Math.sin(p * Math.PI) * 0.3;
            return {
                x: start.x,
                y: start.y - Math.sin(p * Math.PI) * 18 * this.scaleFactor,
                scale: pop,
                rotation: Math.sin(p * Math.PI) * 0.08,
                alpha: 1,
            };
        }

        const flyT = (t - popEnd) / (1 - popEnd);
        const eased = this.easeInOutCubic(flyT);
        const controlX = (start.x + target.x) / 2 + 24 * this.scaleFactor;
        const controlY = Math.min(start.y, target.y) - 95 * this.scaleFactor;
        const inv = 1 - eased;

        const x = inv * inv * start.x + 2 * inv * eased * controlX + eased * eased * target.x;
        const y = inv * inv * start.y + 2 * inv * eased * controlY + eased * eased * target.y;
        const scale = 1.05 - eased * 0.72;
        const rotation = eased * Math.PI * 1.6;
        const alpha = flyT > 0.88 ? Math.max(0, 1 - (flyT - 0.88) / 0.12) : 1;

        return { x, y, scale, rotation, alpha };
    }

    triggerScorePop() {
        this.scorePopTriggered = true;
        if (!this.scoreDisplayBox) return;
        this.scoreDisplayBox.classList.remove('score-pop', 'score-pop-down');
        void this.scoreDisplayBox.offsetWidth;
        this.scoreDisplayBox.classList.add('score-pop');
    }

    triggerScoreDown() {
        if (!this.scoreDisplayBox) return;

        this.scoreDownFlash = 1;
        this.spawnScoreDownBurst();

        this.scoreDisplayBox.classList.remove('score-pop', 'score-pop-down');
        void this.scoreDisplayBox.offsetWidth;
        this.scoreDisplayBox.classList.add('score-pop-down');

        if (this.scoreDelta) {
            this.scoreDelta.textContent = '-1';
            this.scoreDelta.classList.remove('show');
            void this.scoreDelta.offsetWidth;
            this.scoreDelta.classList.add('show');
            setTimeout(() => this.scoreDelta.classList.remove('show'), 900);
        }
    }

    spawnScoreDownBurst() {
        const target = this.getScoreTargetPosition();
        const colors = ['#ff4444', '#cc2222', '#ff8888', '#ffcc00', '#ffffff'];

        for (let i = 0; i < 18; i++) {
            const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.5;
            const speed = (1.8 + Math.random() * 3.2) * this.scaleFactor;
            this.completionParticles.push({
                x: target.x,
                y: target.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5 * this.scaleFactor,
                life: 0.85,
                decay: 0.028 + Math.random() * 0.018,
                size: (2 + Math.random() * 4) * this.scaleFactor,
                color: colors[Math.floor(Math.random() * colors.length)],
                star: Math.random() > 0.6,
            });
        }
    }

    startRollRespawn() {
        if (!this.roll) return;
        this.rollRespawnAnimation = true;
        this.rollRespawnProgress = 0;
        this.roll.y = this.rollY;
        this.rollFallY = 0;
        this.rollFallSpeed = 0;
    }

    getRollRespawnPose() {
        const t = Math.min(1, this.rollRespawnProgress);
        const eased = 1 - Math.pow(1 - t, 3.2);
        const startOffset = -42 * this.scaleFactor;
        const sway = Math.sin(t * Math.PI * 3) * 2.5 * (1 - t) * this.scaleFactor;

        return {
            offsetY: startOffset * (1 - eased) + sway,
            scale: 0.86 + eased * 0.14,
            alpha: Math.min(1, t / 0.12),
            rotation: Math.sin(t * Math.PI) * 0.04 * (1 - t),
        };
    }

    spawnCompletionBurst() {
        if (!this.roll) return;

        const cx = this.roll.x;
        const cy = this.roll.y + this.rollFallY;
        const colors = ['#f8b800', '#d82800', '#fcfcfc', '#ff6b9d', '#00a800', '#ffb347'];

        for (let i = 0; i < 28; i++) {
            const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.4;
            const speed = (2.5 + Math.random() * 4.5) * this.scaleFactor;
            this.completionParticles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2.5 * this.scaleFactor,
                life: 1,
                decay: 0.018 + Math.random() * 0.015,
                size: (3 + Math.random() * 5) * this.scaleFactor,
                color: colors[Math.floor(Math.random() * colors.length)],
                star: Math.random() > 0.45,
            });
        }

        this.completionRing = {
            x: cx,
            y: cy,
            radius: this.roll.width * 0.2,
            life: 1,
        };
    }

    startTakumiTime() {
        this.isTakumiTime = true;
        this.takumiTimeLeft = TAKUMI_TIME_SECONDS;
        this.gameScreen.classList.add('takumi-time');
        this.gameStage.classList.add('takumi-time');
        this.adjustDifficulty();
        this.showTakumiEffect();
    }

    endTakumiTime() {
        this.isTakumiTime = false;
        this.gameScreen.classList.remove('takumi-time');
        this.gameStage.classList.remove('takumi-time');
        this.adjustDifficulty();
        this.hideTakumiEffect();
    }

    hitKarashi() {
        this.jamCount = 0;
        this.updateJamGauge();
        this.rollFalling = true;
        this.rollFallY = 0;
        this.rollFallSpeed = 0;
        this.karashiSlowLeft = KARASHI_SLOW_DURATION;
        if (this.roll) this.rollTargetX = this.roll.x;
        this.showKarashiEffect();
    }

    hitMogumogun() {
        this.jamCount = 0;
        this.updateJamGauge();
        this.rollFalling = true;
        this.rollFallY = 0;
        this.rollFallSpeed = 0;
        if (this.score > 0) {
            this.score--;
            this.updateUI();
            this.triggerScoreDown();
        }
        this.showMogumogunEffect();
    }

    showEffect(text, className) {
        this.hideEffectImages();
        this.effectText.textContent = text;
        this.effectText.className = '';
        void this.effectText.offsetWidth;
        this.effectText.classList.add(className);
    }

    showCompleteEffect() {
        this.hideEffectImages();
        this.effectText.textContent = '';
        this.effectText.className = '';
        if (!this.effectComplete) return;
        this.effectComplete.className = 'effect-complete';
        void this.effectComplete.offsetWidth;
        this.effectComplete.classList.add('show');
    }

    showTakumiEffect() {
        this.hideEffectImages();
        this.effectText.textContent = '';
        this.effectText.className = '';
        if (!this.effectTakumi) return;
        this.effectTakumi.className = 'effect-takumi';
        void this.effectTakumi.offsetWidth;
        this.effectTakumi.classList.add('show');
    }

    showMogumogunEffect() {
        this.hideEffectImages();
        this.effectText.textContent = '';
        this.effectText.className = '';
        if (!this.effectMogumogun) return;
        this.effectMogumogun.className = 'effect-mogumogun';
        void this.effectMogumogun.offsetWidth;
        this.effectMogumogun.classList.add('show');
    }

    showKarashiEffect() {
        this.hideEffectImages();
        this.effectText.textContent = '';
        this.effectText.className = '';
        if (!this.effectKarashi) return;
        this.effectKarashi.className = 'effect-karashi';
        void this.effectKarashi.offsetWidth;
        this.effectKarashi.classList.add('show');
    }

    hideEffectImages() {
        if (this.effectComplete) {
            this.effectComplete.className = 'effect-complete';
        }
        if (this.effectTakumi) {
            this.effectTakumi.className = 'effect-takumi';
        }
        if (this.effectMogumogun) {
            this.effectMogumogun.className = 'effect-mogumogun';
        }
        if (this.effectKarashi) {
            this.effectKarashi.className = 'effect-karashi';
        }
    }

    hideTakumiEffect() {
        if (!this.effectTakumi) return;
        this.effectTakumi.className = 'effect-takumi';
    }

    adjustDifficulty() {
        const difficultyFactor = Math.min(this.score / 10, 1);
        const normalInterval = this.baseDropInterval - difficultyFactor * 500;
        const normalSpeed = this.baseDropSpeed + difficultyFactor * 2;

        if (this.isTakumiTime) {
            this.dropSpeed = normalSpeed + TAKUMI_SPEED_BONUS;
            this.dropInterval = Math.max(MIN_DROP_INTERVAL, normalInterval - TAKUMI_INTERVAL_REDUCTION);
        } else {
            this.dropSpeed = normalSpeed;
            this.dropInterval = normalInterval;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.applySmoothing();
        this.drawBackground();
        this.items.forEach((item) => this.drawItem(item));
        this.drawCompletionEffects();
        this.drawRoll();
    }

    drawBackground() {
        const ctx = this.ctx;
        const w = this.gameWidth;
        const h = this.gameHeight;

        if (this.images.bgGame) {
            ctx.drawImage(this.images.bgGame, 0, 0, w, h);
            if (this.isTakumiTime) {
                ctx.fillStyle = 'rgba(255, 184, 0, 0.28)';
                ctx.fillRect(0, 0, w, h);
            }
            return;
        }

        const counterH = this.counterHeight;
        const skyColors = ['#5ec8f0', '#87ceeb', '#5ec8f0', '#78c0e8'];
        const bandH = 8;
        for (let y = 0; y < h * 0.55; y += bandH) {
            ctx.fillStyle = skyColors[Math.floor(y / bandH) % skyColors.length];
            ctx.fillRect(0, y, w, bandH);
        }

        ctx.fillStyle = '#ffe8b8';
        ctx.fillRect(0, h * 0.55, w, h * 0.45 - counterH + 4);
        ctx.fillStyle = '#a82030';
        ctx.fillRect(0, h - counterH, w, 4);
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(0, h - counterH + 4, w, counterH - 4);
    }

    /** 画像を指定サイズで中央揃え描画 */
    drawImage(img, x, y, width, height) {
        const dx = x - width / 2;
        const dy = y - height / 2;
        this.ctx.drawImage(img, dx, dy, width, height);
    }

    getRollVerticalOffset() {
        if (this.rollRespawnAnimation) {
            return this.getRollRespawnPose().offsetY;
        }
        return 0;
    }

    drawRespawnRoll() {
        const img = this.images.roll[0];
        const w = this.roll.width;
        const h = this.roll.height;
        const respawn = this.getRollRespawnPose();
        const x = this.roll.x;
        const y = this.roll.y + this.rollFallY + respawn.offsetY;
        const drawW = w * respawn.scale;
        const drawH = h * respawn.scale;

        this.ctx.save();
        this.ctx.globalAlpha = respawn.alpha;
        this.ctx.translate(x, y);
        this.ctx.rotate(respawn.rotation);
        this.drawImage(img, 0, 0, drawW, drawH);
        this.ctx.restore();
        this.ctx.globalAlpha = 1;
    }

    drawFlyingCompletedRoll() {
        const img = this.images.roll[5];
        const w = this.roll.width;
        const h = this.roll.height;
        const pose = this.getCompletionRollPose(this.completionProgress);
        const drawW = w * pose.scale;
        const drawH = h * pose.scale;

        this.ctx.save();
        this.ctx.globalAlpha = pose.alpha;
        this.ctx.translate(pose.x, pose.y);
        this.ctx.rotate(pose.rotation);
        this.ctx.shadowColor = 'rgba(255, 210, 60, 0.95)';
        this.ctx.shadowBlur = 16 * pose.scale;
        this.drawImage(img, 0, 0, drawW, drawH);
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }

    drawRoll() {
        if (!this.imagesLoaded || !this.roll) return;

        if (this.rollRespawnAnimation) {
            this.drawRespawnRoll();
        } else if (!this.completionAnimation || this.jamCount < 5) {
            const rollIndex = Math.min(this.jamCount, 5);
            const img = this.images.roll[rollIndex];
            const x = this.roll.x;
            const y = this.roll.y + this.rollFallY;
            this.drawImage(img, x, y, this.roll.width, this.roll.height);
        }

        if (this.completionAnimation) {
            this.drawFlyingCompletedRoll();
        }
    }

    drawCompletionEffects() {
        const ctx = this.ctx;
        const hasFlash = this.completionFlash > 0;
        const hasScoreDownFlash = this.scoreDownFlash > 0;
        const hasRing = !!this.completionRing;
        const hasParticles = this.completionParticles.length > 0;

        if (!hasFlash && !hasScoreDownFlash && !hasRing && !hasParticles) return;

        if (hasFlash) {
            ctx.fillStyle = `rgba(255, 228, 120, ${this.completionFlash * 0.38})`;
            ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        }

        if (hasScoreDownFlash) {
            const target = this.getScoreTargetPosition();
            const radius = 70 * this.scaleFactor * (0.6 + this.scoreDownFlash * 0.4);
            const gradient = ctx.createRadialGradient(
                target.x, target.y, 0,
                target.x, target.y, radius
            );
            gradient.addColorStop(0, `rgba(255, 60, 60, ${this.scoreDownFlash * 0.45})`);
            gradient.addColorStop(1, 'rgba(255, 60, 60, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        }

        if (hasRing) {
            const ring = this.completionRing;
            ctx.save();
            ctx.strokeStyle = `rgba(255, 200, 40, ${ring.life * 0.85})`;
            ctx.lineWidth = 4 * this.scaleFactor;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255, 255, 255, ${ring.life * 0.45})`;
            ctx.lineWidth = 2 * this.scaleFactor;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius * 0.72, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        for (const particle of this.completionParticles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, particle.life);
            ctx.fillStyle = particle.color;
            if (particle.star) {
                this.drawStar(particle.x, particle.y, particle.size);
            } else {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        ctx.globalAlpha = 1;
    }

    drawStar(x, y, size) {
        const ctx = this.ctx;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const outerX = x + Math.cos(angle) * size;
            const outerY = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(outerX, outerY);
            else ctx.lineTo(outerX, outerY);

            const innerAngle = angle + Math.PI / 5;
            ctx.lineTo(
                x + Math.cos(innerAngle) * size * 0.45,
                y + Math.sin(innerAngle) * size * 0.45
            );
        }
        ctx.closePath();
        ctx.fill();
    }

    drawItem(item) {
        if (!this.imagesLoaded) return;
        const img = this.images.items[item.type];
        if (!img) return;
        this.drawImage(img, item.x, item.y, item.width, item.height);
    }

    endGame() {
        this.finalScoreDisplay.textContent = this.score;
        this.resetGameState();

        setTimeout(() => {
            this.gameScreen.classList.add('hidden');
            this.resultScreen.classList.remove('hidden');
        }, 500);
    }

    goToTitle() {
        this.resetGameState();

        this.gameScreen.classList.add('hidden');
        this.resultScreen.classList.add('hidden');
        this.titleScreen.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
