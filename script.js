// Theme Management
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (this.theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    bindEvents() {
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());
    }
}

// Scroll Animation Manager
class ScrollAnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.createObserver();
        this.observeElements();
        this.handleNavbarScroll();
    }

    createObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);
    }

    observeElements() {
        const elements = document.querySelectorAll(
            '.problem-card, .kit-card, .step, .impact-card, .team-member, .feature-item'
        );
        
        elements.forEach((el, index) => {
            el.classList.add('loading');
            el.style.animationDelay = `${index * 0.1}s`;
            this.observer.observe(el);
        });
    }

    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                navbar.style.background = this.getNavbarBackground(0.95);
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = this.getNavbarBackground(0.8);
                navbar.style.backdropFilter = 'blur(20px)';
            }

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
        });
    }

    getNavbarBackground(opacity) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark 
            ? `rgba(15, 23, 42, ${opacity})` 
            : `rgba(248, 250, 252, ${opacity})`;
    }
}

// Counter Animation
class CounterAnimation {
    constructor() {
        this.init();
    }

    init() {
        this.observeCounters();
    }

    observeCounters() {
        const counters = document.querySelectorAll('.impact-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }
}

// Mobile Menu Manager
class MobileMenuManager {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.createMobileMenu();
    }

    createMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const mobileMenu = navMenu.cloneNode(true);
        mobileMenu.classList.add('mobile-menu');
        mobileMenu.style.cssText = `
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: var(--surface);
            flex-direction: column;
            padding: var(--spacing-lg);
            box-shadow: var(--shadow-lg);
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            z-index: 999;
            border-top: 1px solid var(--border);
        `;
        
        document.body.appendChild(mobileMenu);
        this.mobileMenu = mobileMenu;

        // Add click handlers to mobile menu links
        const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
    }

    bindEvents() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        toggle.addEventListener('click', () => this.toggleMobileMenu());

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-toggle')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        if (this.isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isOpen = true;
        this.mobileMenu.style.transform = 'translateY(0)';
        this.animateToggleIcon(true);
    }

    closeMobileMenu() {
        this.isOpen = false;
        this.mobileMenu.style.transform = 'translateY(-100%)';
        this.animateToggleIcon(false);
    }

    animateToggleIcon(isOpen) {
        const spans = document.querySelectorAll('.mobile-menu-toggle span');
        if (isOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
}

// Smooth Scroll Manager
class SmoothScrollManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Particle Animation
class ParticleAnimation {
    constructor() {
        this.particles = [];
        this.init();
    }

    init() {
        this.createCanvas();
        this.createParticles();
        this.animate();
        this.handleResize();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.1;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }

    createParticles() {
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(37, 99, 235, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleResize() {
        window.addEventListener('resize', () => this.resize());
    }
}

// Button Interactions
class ButtonInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.addRippleEffect();
        this.addHoverEffects();
    }

    addRippleEffect() {
        const buttons = document.querySelectorAll('.primary-button, .secondary-button, .cta-button');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
        
        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addHoverEffects() {
        const cards = document.querySelectorAll('.problem-card, .kit-card, .impact-card, .team-member');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
}

// Loading Manager
class LoadingManager {
    constructor() {
        this.init();
    }

    init() {
        this.showLoadingAnimation();
        this.handlePageLoad();
    }

    showLoadingAnimation() {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--background);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        `;
        
        loader.innerHTML = `
            <div style="width: 50px; height: 50px; border: 3px solid var(--border); border-top: 3px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        `;
        
        document.body.appendChild(loader);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    handlePageLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loader = document.getElementById('page-loader');
                if (loader) {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.remove(), 500);
                }
            }, 1000);
        });
    }
}

// Form Validation (for future contact forms)
class FormValidator {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        // Add form validation logic here
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary-color);
            color: white;
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        message.textContent = 'Message sent successfully!';
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }
}

// Intersection Observer for Active Navigation
class NavigationManager {
    constructor() {
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.createObserver();
    }

    createObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateActiveLink(entry.target.id);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -80px 0px'
        });

        this.sections.forEach(section => observer.observe(section));
    }

    updateActiveLink(activeId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize all managers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoadingManager();
    new ThemeManager();
    new ScrollAnimationManager();
    new CounterAnimation();
    new MobileMenuManager();
    new SmoothScrollManager();
    new ParticleAnimation();
    new ButtonInteractions();
    new FormValidator();
    new NavigationManager();
    
    // Add active nav link styles
    const style = document.createElement('style');
    style.textContent = `
        .nav-link.active {
            color: var(--primary-color);
        }
        .nav-link.active::after {
            width: 100%;
        }
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Performance optimization
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

// Lazy loading for images (if any are added later)
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