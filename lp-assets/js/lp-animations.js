/**
 * まちサーガ LP アニメーションスクリプト
 * LP用のインタラクティブアニメーションと機能を提供
 */

// DOM要素の取得とユーティリティ関数
const LPAnimations = {
    // 初期化
    init() {
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupTypewriterEffect();
        this.setupCounterAnimations();
        this.setupSmoothScrolling();
        this.setupMobileMenuToggle();
        this.setupLazyLoading();
        this.bindEvents();
    },

    // スクロールアニメーション
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // アニメーション遅延の設定
                    const delay = entry.target.dataset.delay;
                    if (delay) {
                        entry.target.style.animationDelay = `${delay}ms`;
                    }
                }
            });
        }, observerOptions);

        // アニメーション対象要素を監視
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },

    // パララックス効果
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    },

    // タイプライター効果
    setupTypewriterEffect() {
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            const speed = parseInt(element.dataset.speed) || 100;
            
            element.textContent = '';
            element.style.borderRight = '2px solid';
            element.style.animation = 'blink 1s infinite';
            
            let i = 0;
            const typeTimer = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeTimer);
                    // カーソルの点滅を停止
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                        element.style.animation = 'none';
                    }, 1000);
                }
            }, speed);
        });
    },

    // カウンターアニメーション
    setupCounterAnimations() {
        const counters = document.querySelectorAll('.counter');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.target);
                    const duration = parseInt(counter.dataset.duration) || 2000;
                    
                    let start = 0;
                    const increment = target / (duration / 16);
                    
                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= target) {
                            counter.textContent = target.toLocaleString();
                            clearInterval(timer);
                        } else {
                            counter.textContent = Math.floor(start).toLocaleString();
                        }
                    }, 16);
                    
                    observer.unobserve(counter);
                }
            });
        });
        
        counters.forEach(counter => observer.observe(counter));
    },

    // スムーズスクロール
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                
                if (target) {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },

    // モバイルメニュートグル
    setupMobileMenuToggle() {
        const menuToggle = document.querySelector('.menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                menuToggle.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
            
            // メニュー項目クリック時にメニューを閉じる
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                });
            });
        }
    },

    // 遅延読み込み（Lazy Loading）
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    // イベントバインディング
    bindEvents() {
        // ウィンドウリサイズ
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // スクロール
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16));

        // ページ読み込み完了
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });
    },

    // リサイズハンドラー
    handleResize() {
        // モバイルメニューが開いている場合は閉じる
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            document.querySelector('.menu-toggle')?.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    },

    // スクロールハンドラー
    handleScroll() {
        const scrollTop = window.pageYOffset;
        
        // ヘッダーの背景変更
        const header = document.querySelector('header');
        if (header) {
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // スクロールトップボタンの表示/非表示
        const scrollTopBtn = document.querySelector('.scroll-top');
        if (scrollTopBtn) {
            if (scrollTop > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    },

    // ユーティリティ関数：デバウンス
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // ユーティリティ関数：スロットル
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 要素の表示/非表示アニメーション
    fadeIn(element, duration = 300) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        const start = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    fadeOut(element, duration = 300) {
        const start = performance.now();
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = initialOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// CSS カスタムプロパティ
const style = document.createElement('style');
style.textContent = `
    @keyframes blink {
        0%, 50% { border-color: transparent; }
        51%, 100% { border-color: currentColor; }
    }
    
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy:not([data-src]) {
        opacity: 1;
    }
    
    header.scrolled {
        background: rgba(26, 26, 46, 0.95);
        backdrop-filter: blur(10px);
    }
    
    .scroll-top {
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
    }
    
    .scroll-top.visible {
        opacity: 1;
        visibility: visible;
    }
`;
document.head.appendChild(style);

// DOM読み込み完了後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LPAnimations.init());
} else {
    LPAnimations.init();
}
