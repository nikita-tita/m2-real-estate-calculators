/**
 * Bundle Optimizer - техническая оптимизация для калькуляторов М2
 * Реализует lazy loading, минификацию и оптимизацию ресурсов
 */

class BundleOptimizer {
    constructor() {
        this.loadedModules = new Set();
        this.preloadedModules = new Map();
        this.compressionEnabled = true;
        this.lazyLoadingEnabled = true;
    }

    /**
     * Инициализация оптимизатора
     */
    async init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupModulePreloading();
        this.setupPerformanceMonitoring();

        console.log('🚀 Bundle Optimizer инициализирован');
    }

    /**
     * Настройка lazy loading для калькуляторов
     */
    setupLazyLoading() {
        // Intersection Observer для lazy loading компонентов
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadCalculatorModule(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Наблюдаем за всеми калькуляторами на главной странице
        document.querySelectorAll('.calculator-card, .calculator-preview').forEach(card => {
            observer.observe(card);
        });
    }

    /**
     * Динамическая загрузка модуля калькулятора
     */
    async loadCalculatorModule(element) {
        const calculatorType = element.dataset.calculator;
        if (!calculatorType || this.loadedModules.has(calculatorType)) return;

        const loadingSpinner = this.showLoadingSpinner(element);

        try {
            const startTime = performance.now();

            // Асинхронная загрузка модуля
            const module = await this.importCalculatorModule(calculatorType);

            if (module && module.initCalculator) {
                await module.initCalculator();
                this.loadedModules.add(calculatorType);

                const loadTime = Math.round(performance.now() - startTime);
                console.log(`📊 Калькулятор ${calculatorType} загружен за ${loadTime}мс`);

                // Аналитика производительности
                if (window.gtag) {
                    gtag('event', 'calculator_lazy_loaded', {
                        calculator_type: calculatorType,
                        load_time: loadTime
                    });
                }
            }
        } catch (error) {
            console.error(`❌ Ошибка загрузки калькулятора ${calculatorType}:`, error);
            this.showLoadError(element);
        } finally {
            this.hideLoadingSpinner(loadingSpinner);
        }
    }

    /**
     * Импорт модуля калькулятора
     */
    async importCalculatorModule(calculatorType) {
        const moduleMap = {
            'mortgage': () => import('./calculators/mortgage.js'),
            'rental': () => import('./calculators/rental-profitability.js'),
            'rent-vs-buy': () => import('./calculators/rent-vs-buy.js'),
            'prepayment': () => import('./calculators/prepayment.js'),
            'affordability': () => import('./calculators/affordability.js'),
            'airbnb': () => import('./calculators/airbnb.js'),
            'new-vs-secondary': () => import('./calculators/new-vs-secondary.js'),
            'compound-interest': () => import('./calculators/compound-interest.js')
        };

        const importFn = moduleMap[calculatorType];
        if (!importFn) {
            throw new Error(`Неизвестный тип калькулятора: ${calculatorType}`);
        }

        return await importFn();
    }

    /**
     * Предзагрузка критических модулей
     */
    setupModulePreloading() {
        // Предзагружаем самые популярные калькуляторы
        const criticalModules = ['mortgage', 'rental', 'rent-vs-buy'];

        // Предзагрузка через 2 секунды после загрузки страницы
        setTimeout(() => {
            criticalModules.forEach(module => {
                this.preloadModule(module);
            });
        }, 2000);
    }

    /**
     * Предзагрузка модуля
     */
    async preloadModule(calculatorType) {
        if (this.preloadedModules.has(calculatorType)) return;

        try {
            const module = await this.importCalculatorModule(calculatorType);
            this.preloadedModules.set(calculatorType, module);
            console.log(`🔄 Предзагружен модуль: ${calculatorType}`);
        } catch (error) {
            console.warn(`⚠️ Не удалось предзагрузить ${calculatorType}:`, error);
        }
    }

    /**
     * Оптимизация изображений
     */
    setupImageOptimization() {
        // WebP support detection
        const supportsWebP = this.checkWebPSupport();

        if (supportsWebP) {
            document.querySelectorAll('img[data-webp]').forEach(img => {
                img.src = img.dataset.webp;
            });
        }

        // Lazy loading для изображений
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img[data-lazy]').forEach(img => {
                img.loading = 'lazy';
            });
        } else {
            // Fallback для старых браузеров
            this.setupImageLazyLoading();
        }
    }

    /**
     * Проверка поддержки WebP
     */
    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, 1, 1);
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    /**
     * Fallback lazy loading для изображений
     */
    setupImageLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    /**
     * Мониторинг производительности
     */
    setupPerformanceMonitoring() {
        // Core Web Vitals
        if ('web-vital' in window) {
            import('https://unpkg.com/web-vitals@3/dist/web-vitals.js')
                .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                    getCLS(this.sendToAnalytics);
                    getFID(this.sendToAnalytics);
                    getFCP(this.sendToAnalytics);
                    getLCP(this.sendToAnalytics);
                    getTTFB(this.sendToAnalytics);
                });
        }

        // Мониторинг долгих задач
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) {
                        console.warn('🐌 Долгая задача обнаружена:', entry);
                    }
                });
            });
            observer.observe({ entryTypes: ['longtask'] });
        }
    }

    /**
     * Отправка метрик в аналитику
     */
    sendToAnalytics({ name, value, id }) {
        console.log(`📊 Core Web Vital: ${name} = ${value} (${id})`);

        if (window.gtag) {
            gtag('event', name, {
                event_category: 'Web Vitals',
                value: Math.round(name === 'CLS' ? value * 1000 : value),
                custom_parameter: id,
                non_interaction: true
            });
        }
    }

    /**
     * Показать спиннер загрузки
     */
    showLoadingSpinner(element) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-ring"></div>
            <span>Загрузка калькулятора...</span>
        `;

        element.appendChild(spinner);
        return spinner;
    }

    /**
     * Скрыть спиннер загрузки
     */
    hideLoadingSpinner(spinner) {
        if (spinner && spinner.parentNode) {
            spinner.remove();
        }
    }

    /**
     * Показать ошибку загрузки
     */
    showLoadError(element) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'load-error';
        errorDiv.innerHTML = `
            <div class="error-icon">⚠️</div>
            <p>Не удалось загрузить калькулятор</p>
            <button onclick="location.reload()">Обновить страницу</button>
        `;

        element.appendChild(errorDiv);
    }

    /**
     * Минификация CSS на лету (для динамических стилей)
     */
    minifyCSS(css) {
        if (!this.compressionEnabled) return css;

        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // удаляем комментарии
            .replace(/\s+/g, ' ') // сжимаем пробелы
            .replace(/;\s*}/g, '}') // убираем ; перед }
            .replace(/\s*{\s*/g, '{') // убираем пробелы вокруг {
            .replace(/}\s*/g, '}') // убираем пробелы после }
            .replace(/:\s*/g, ':') // убираем пробелы после :
            .replace(/;\s*/g, ';') // убираем пробелы после ;
            .trim();
    }

    /**
     * Сжатие JSON данных
     */
    compressJSON(data) {
        if (!this.compressionEnabled) return JSON.stringify(data);

        return JSON.stringify(data, (key, value) => {
            // Округляем числа до 2 знаков для экономии места
            if (typeof value === 'number' && !Number.isInteger(value)) {
                return Math.round(value * 100) / 100;
            }
            return value;
        });
    }

    /**
     * Получение статистики оптимизации
     */
    getOptimizationStats() {
        return {
            loadedModules: Array.from(this.loadedModules),
            preloadedModules: Array.from(this.preloadedModules.keys()),
            totalModules: this.loadedModules.size + this.preloadedModules.size,
            compressionEnabled: this.compressionEnabled,
            lazyLoadingEnabled: this.lazyLoadingEnabled,
            performance: this.getPerformanceMetrics()
        };
    }

    /**
     * Получение метрик производительности
     */
    getPerformanceMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
            firstPaint: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0),
            firstContentfulPaint: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0),
            loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart)
        };
    }
}

// CSS для спиннера и анимаций
const optimizerStyles = `
<style>
.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.spinner-ring {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3416b6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.load-error {
    text-align: center;
    padding: 20px;
    background: #fff5f5;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    color: #c53030;
}

.error-icon {
    font-size: 24px;
    margin-bottom: 10px;
}

.load-error button {
    background: #3416b6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 10px;
}

.load-error button:hover {
    background: #2c0e94;
}

/* Плавные переходы для lazy-loaded элементов */
.calculator-card, .calculator-preview {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.calculator-card.loaded, .calculator-preview.loaded {
    opacity: 1;
    transform: translateY(0);
}

/* Оптимизация изображений */
img[data-lazy] {
    opacity: 0;
    transition: opacity 0.3s;
}

img[data-lazy].loaded {
    opacity: 1;
}
</style>
`;

// Инъекция стилей
if (!document.querySelector('#optimizer-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'optimizer-styles';
    styleElement.innerHTML = optimizerStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Глобальная инициализация
window.BundleOptimizer = BundleOptimizer;

// Автоматическая инициализация после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        window.bundleOptimizer = new BundleOptimizer();
        await window.bundleOptimizer.init();
    });
} else {
    // Если DOM уже загружен
    setTimeout(async () => {
        window.bundleOptimizer = new BundleOptimizer();
        await window.bundleOptimizer.init();
    }, 0);
}

export { BundleOptimizer };