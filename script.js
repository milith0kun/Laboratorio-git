// Configuración global y utilidades
const CONFIG = {
    animationDuration: 300,
    scrollOffset: 100,
    statsAnimationDuration: 2000,
    debounceDelay: 100
};

// Utilidad para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utilidad para throttle
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Smooth scroll mejorado con mejor rendimiento
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (!element) return;
    
    const targetPosition = element.offsetTop - CONFIG.scrollOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = Math.min(Math.abs(distance) / 2, 800); // Duración adaptativa
    let start = null;

    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Función de easing mejorada
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Intersection Observer para animaciones optimizadas
class ScrollAnimator {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) {
            // Fallback para navegadores antiguos
            this.fallbackAnimation();
            return;
        }

        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateElement(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        this.observeElements();
    }

    observeElements() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => this.observer.observe(el));
    }

    animateElement(element) {
        element.classList.add('animated');
        
        // Animación específica para estadísticas
        if (element.classList.contains('stat-number')) {
            this.animateNumber(element);
        }
    }

    animateNumber(element) {
        const finalNumber = parseInt(element.textContent);
        const duration = CONFIG.statsAnimationDuration;
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function para números
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentNumber = Math.floor(finalNumber * easeOutQuart);
            
            element.textContent = currentNumber.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = finalNumber.toLocaleString();
            }
        }
        
        requestAnimationFrame(updateNumber);
    }

    fallbackAnimation() {
        // Animación simple para navegadores sin IntersectionObserver
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => {
            setTimeout(() => el.classList.add('animated'), 100);
        });
    }
}

// Gestor del menú móvil mejorado
class MobileMenuManager {
    constructor() {
        this.toggle = document.querySelector('.mobile-menu-toggle');
        this.menu = document.querySelector('.nav-links');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (!this.toggle || !this.menu) return;
        
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });

        // Cerrar menú al hacer clic en un enlace
        this.menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (this.isOpen) this.closeMenu();
            });
        });

        // Cerrar menú con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.toggle.contains(e.target) && !this.menu.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.isOpen = true;
        this.menu.classList.add('active');
        this.toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }

    closeMenu() {
        this.isOpen = false;
        this.menu.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

// Efecto de scroll del header optimizado
class HeaderScrollEffect {
    constructor() {
        this.header = document.querySelector('header');
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        this.init();
    }

    init() {
        if (!this.header) return;
        
        const handleScroll = throttle(() => {
            this.updateHeader();
        }, 16); // ~60fps

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateHeader() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
        
        this.lastScrollY = currentScrollY;
    }
}

// Gestor de estadísticas mejorado
class StatsManager {
    constructor() {
        this.stats = [
            { element: '.commits-count', baseValue: 150, variance: 50 },
            { element: '.branches-count', baseValue: 8, variance: 3 },
            { element: '.contributors-count', baseValue: 12, variance: 5 },
            { element: '.files-count', baseValue: 45, variance: 15 }
        ];
        this.refreshButton = document.querySelector('.refresh-stats');
        this.init();
    }

    init() {
        if (this.refreshButton) {
            this.refreshButton.addEventListener('click', () => {
                this.refreshStats();
            });
        }
        
        // Actualizar estadísticas iniciales
        this.updateStats();
    }

    generateRandomValue(base, variance) {
        const min = base - variance;
        const max = base + variance;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    updateStats() {
        this.stats.forEach(stat => {
            const element = document.querySelector(stat.element);
            if (element) {
                const newValue = this.generateRandomValue(stat.baseValue, stat.variance);
                element.textContent = newValue;
                element.setAttribute('data-target', newValue);
            }
        });
    }

    refreshStats() {
        // Animación de loading
        this.refreshButton.style.transform = 'rotate(360deg)';
        this.refreshButton.disabled = true;
        
        setTimeout(() => {
            this.updateStats();
            
            // Reanimar números
            const animator = new ScrollAnimator();
            this.stats.forEach(stat => {
                const element = document.querySelector(stat.element);
                if (element) {
                    element.classList.remove('animated');
                    setTimeout(() => animator.animateElement(element), 100);
                }
            });
            
            // Restaurar botón
            setTimeout(() => {
                this.refreshButton.style.transform = '';
                this.refreshButton.disabled = false;
            }, 500);
        }, 800);
    }
}

// Botón back-to-top mejorado
class BackToTopButton {
    constructor() {
        this.button = document.querySelector('.back-to-top');
        this.init();
    }

    init() {
        if (!this.button) return;

        const handleScroll = throttle(() => {
            this.toggleVisibility();
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });
    }

    toggleVisibility() {
        const scrollY = window.scrollY;
        
        if (scrollY > 300) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Gestor de información de Git mejorado
class GitInfoManager {
    constructor() {
        this.commands = [
            'git init',
            'git add .',
            'git commit -m "Initial commit"',
            'git branch -M main',
            'git remote add origin <url>',
            'git push -u origin main',
            'git checkout -b feature',
            'git merge feature',
            'git pull origin main',
            'git status'
        ];
        this.init();
    }

    init() {
        this.displayRandomCommands();
    }

    displayRandomCommands() {
        const codeElement = document.querySelector('.code-preview pre');
        if (!codeElement) return;

        const shuffled = [...this.commands].sort(() => 0.5 - Math.random());
        const selectedCommands = shuffled.slice(0, 5);
        
        const codeHTML = selectedCommands.map((cmd, index) => 
            `<span class="code-line">
                <span class="code-comment"># Comando ${index + 1}</span>
                <span class="code-command">${cmd}</span>
            </span>`
        ).join('\n');
        
        codeElement.innerHTML = codeHTML;
    }
}

// Gestor principal de la aplicación
class App {
    constructor() {
        this.components = [];
        this.init();
    }

    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    initComponents() {
        try {
            // Inicializar todos los componentes
            this.components = [
                new ScrollAnimator(),
                new MobileMenuManager(),
                new HeaderScrollEffect(),
                new StatsManager(),
                new BackToTopButton(),
                new GitInfoManager()
            ];

            // Configurar navegación suave
            this.setupSmoothNavigation();
            
            // Configurar botón CTA
            this.setupCTAButton();
            
            console.log('✅ Aplicación inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
        }
    }

    setupSmoothNavigation() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = anchor.getAttribute('href');
                if (target && target !== '#') {
                    smoothScroll(target);
                }
            });
        });
    }

    setupCTAButton() {
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                // Efecto de pulso
                ctaButton.style.animation = 'pulse 0.6s ease-in-out';
                setTimeout(() => {
                    ctaButton.style.animation = '';
                }, 600);
                
                // Scroll a servicios
                smoothScroll('#servicios');
            });
        }
    }

    // Método para limpiar recursos si es necesario
    destroy() {
        this.components.forEach(component => {
            if (component.destroy && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
    }
}

// Inicializar la aplicación
const app = new App();

// Exponer funciones globales para compatibilidad
window.projectFunctions = {
    smoothScroll,
    debounce,
    throttle,
    app
};

// Manejo de errores global
window.addEventListener('error', (e) => {
    console.error('Error global capturado:', e.error);
});

// Performance monitoring (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('📊 Métricas de rendimiento:', {
                'Tiempo de carga': `${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`,
                'DOM listo': `${Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart)}ms`,
                'Primer byte': `${Math.round(perfData.responseStart - perfData.fetchStart)}ms`
            });
        }, 0);
    });
}