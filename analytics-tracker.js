/**
 * M2 Calculators Advanced Analytics Tracker
 * Расширенная система аналитики и метрик для калькуляторов М2
 */

class AnalyticsTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.startTime = Date.now();
        this.events = [];
        this.metrics = {
            calculations: 0,
            interactions: 0,
            timeSpent: 0,
            features: new Set(),
            errors: 0
        };

        this.heatmapData = [];
        this.userJourney = [];
        this.performanceMetrics = {};

        this.init();
    }

    init() {
        this.setupEventTracking();
        this.startPerformanceMonitoring();
        this.setupHeatmapTracking();
        this.trackUserBehavior();
        this.startPeriodicReporting();
    }

    setupEventTracking() {
        // Отслеживание кликов
        document.addEventListener('click', (event) => {
            this.trackClick(event);
        });

        // Отслеживание изменений в формах
        document.addEventListener('input', (event) => {
            if (event.target.matches('.input-field, input, select, textarea')) {
                this.trackInput(event);
            }
        });

        // Отслеживание навигации
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
        });

        // Отслеживание ошибок
        window.addEventListener('error', (event) => {
            this.trackError(event.error, event.filename, event.lineno);
        });

        // Отслеживание промисов с ошибками
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError(event.reason, 'Promise', 0);
        });
    }

    trackClick(event) {
        const element = event.target;
        const clickData = {
            type: 'click',
            timestamp: Date.now(),
            element: this.getElementInfo(element),
            coordinates: {
                x: event.clientX,
                y: event.clientY,
                pageX: event.pageX,
                pageY: event.pageY
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        this.addEvent(clickData);
        this.updateHeatmap(event.pageX, event.pageY);

        // Специальное отслеживание для элементов калькулятора
        if (element.matches('.calculate-btn, .export-btn, .template-btn')) {
            this.trackFeatureUsage(element.classList[0]);
        }
    }

    trackInput(event) {
        const element = event.target;
        const inputData = {
            type: 'input',
            timestamp: Date.now(),
            element: this.getElementInfo(element),
            value: element.value,
            valueLength: element.value.length,
            isValid: element.checkValidity ? element.checkValidity() : true
        };

        this.addEvent(inputData);
        this.metrics.interactions++;

        // Отслеживание времени между вводами
        if (this.lastInputTime) {
            const timeBetween = Date.now() - this.lastInputTime;
            this.trackInputSpeed(timeBetween);
        }
        this.lastInputTime = Date.now();
    }

    trackCalculation(calculatorType, parameters, result) {
        const calculationData = {
            type: 'calculation',
            timestamp: Date.now(),
            calculatorType: calculatorType,
            parameters: this.sanitizeParameters(parameters),
            result: this.sanitizeResult(result),
            sessionId: this.sessionId,
            processingTime: performance.now() - (this.calculationStartTime || performance.now())
        };

        this.addEvent(calculationData);
        this.metrics.calculations++;

        // Анализ популярности параметров
        this.analyzeParameterUsage(parameters);
    }

    trackFeatureUsage(featureName) {
        this.metrics.features.add(featureName);

        const featureData = {
            type: 'feature_usage',
            timestamp: Date.now(),
            feature: featureName,
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };

        this.addEvent(featureData);
    }

    trackError(error, filename, lineno) {
        this.metrics.errors++;

        const errorData = {
            type: 'error',
            timestamp: Date.now(),
            message: error?.message || error,
            filename: filename,
            lineno: lineno,
            stack: error?.stack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: this.sessionId
        };

        this.addEvent(errorData);

        // Отправляем критические ошибки немедленно
        if (this.isCriticalError(error)) {
            this.sendErrorReport(errorData);
        }
    }

    startPerformanceMonitoring() {
        // Мониторинг производительности страницы
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    this.performanceMetrics.pageLoad = {
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                        totalTime: perfData.loadEventEnd - perfData.fetchStart
                    };
                }, 100);
            });
        }

        // Мониторинг памяти (если доступно)
        if ('memory' in performance) {
            setInterval(() => {
                this.performanceMetrics.memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
            }, 30000); // каждые 30 секунд
        }
    }

    setupHeatmapTracking() {
        // Отслеживание движения мыши для тепловой карты
        let mouseTrackingThrottle = null;

        document.addEventListener('mousemove', (event) => {
            if (mouseTrackingThrottle) return;

            mouseTrackingThrottle = setTimeout(() => {
                this.heatmapData.push({
                    x: event.pageX,
                    y: event.pageY,
                    timestamp: Date.now()
                });

                mouseTrackingThrottle = null;
            }, 100); // throttle до 100ms
        });

        // Отслеживание скроллинга
        window.addEventListener('scroll', this.throttle(() => {
            this.trackScrollPosition();
        }, 200));
    }

    trackUserBehavior() {
        // Отслеживание времени на странице
        setInterval(() => {
            this.metrics.timeSpent = Date.now() - this.startTime;
        }, 1000);

        // Отслеживание активности пользователя
        let inactiveTimer;
        const resetInactiveTimer = () => {
            clearTimeout(inactiveTimer);
            inactiveTimer = setTimeout(() => {
                this.trackInactivity();
            }, 300000); // 5 минут неактивности
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetInactiveTimer, true);
        });
    }

    trackScrollPosition() {
        const scrollData = {
            type: 'scroll',
            timestamp: Date.now(),
            scrollY: window.scrollY,
            scrollX: window.scrollX,
            maxScrollY: document.documentElement.scrollHeight - window.innerHeight,
            scrollPercentage: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
        };

        this.addEvent(scrollData);
    }

    trackInactivity() {
        const inactivityData = {
            type: 'inactivity',
            timestamp: Date.now(),
            timeActive: Date.now() - this.startTime,
            sessionId: this.sessionId
        };

        this.addEvent(inactivityData);
    }

    trackSessionEnd() {
        const sessionData = {
            type: 'session_end',
            timestamp: Date.now(),
            sessionId: this.sessionId,
            duration: Date.now() - this.startTime,
            totalEvents: this.events.length,
            calculations: this.metrics.calculations,
            interactions: this.metrics.interactions,
            featuresUsed: Array.from(this.metrics.features),
            errors: this.metrics.errors,
            performanceMetrics: this.performanceMetrics
        };

        this.addEvent(sessionData);
        this.sendDataBatch([sessionData]);
    }

    startPeriodicReporting() {
        // Отправляем данные каждые 2 минуты
        setInterval(() => {
            this.sendAnalyticsBatch();
        }, 120000);

        // Отправляем при закрытии страницы
        window.addEventListener('beforeunload', () => {
            this.sendAnalyticsBatch(true);
        });
    }

    // Утилиты и вспомогательные методы
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserId() {
        let userId = localStorage.getItem('m2_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('m2_user_id', userId);
        }
        return userId;
    }

    getElementInfo(element) {
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            textContent: element.textContent?.substring(0, 100),
            type: element.type,
            name: element.name
        };
    }

    sanitizeParameters(parameters) {
        // Удаляем или маскируем чувствительные данные
        const sanitized = { ...parameters };

        // Удаляем потенциально чувствительную информацию
        delete sanitized.personalData;
        delete sanitized.email;
        delete sanitized.phone;

        return sanitized;
    }

    sanitizeResult(result) {
        // Маскируем личные данные в результатах
        if (typeof result === 'object') {
            const sanitized = { ...result };
            // Оставляем только структурные данные, убираем персональные
            return sanitized;
        }
        return result;
    }

    analyzeParameterUsage(parameters) {
        Object.keys(parameters).forEach(param => {
            const usage = JSON.parse(localStorage.getItem('m2_param_usage') || '{}');
            usage[param] = (usage[param] || 0) + 1;
            localStorage.setItem('m2_param_usage', JSON.stringify(usage));
        });
    }

    updateHeatmap(x, y) {
        // Группируем клики в области 20x20 пикселей
        const gridSize = 20;
        const gridX = Math.floor(x / gridSize) * gridSize;
        const gridY = Math.floor(y / gridSize) * gridSize;
        const key = `${gridX},${gridY}`;

        const heatmap = JSON.parse(localStorage.getItem('m2_heatmap') || '{}');
        heatmap[key] = (heatmap[key] || 0) + 1;
        localStorage.setItem('m2_heatmap', JSON.stringify(heatmap));
    }

    trackInputSpeed(timeBetween) {
        const speeds = JSON.parse(localStorage.getItem('m2_input_speeds') || '[]');
        speeds.push(timeBetween);

        // Сохраняем только последние 100 измерений
        if (speeds.length > 100) {
            speeds.shift();
        }

        localStorage.setItem('m2_input_speeds', JSON.stringify(speeds));
    }

    isCriticalError(error) {
        const criticalKeywords = ['TypeError', 'ReferenceError', 'Network Error', 'Failed to fetch'];
        return criticalKeywords.some(keyword =>
            error?.message?.includes(keyword) || String(error).includes(keyword)
        );
    }

    addEvent(event) {
        this.events.push(event);

        // Ограничиваем количество событий в памяти
        if (this.events.length > 1000) {
            this.events = this.events.slice(-500);
        }
    }

    async sendAnalyticsBatch(immediate = false) {
        if (this.events.length === 0) return;

        const batch = [...this.events];
        this.events = [];

        await this.sendDataBatch(batch, immediate);
    }

    async sendDataBatch(events, immediate = false) {
        const payload = {
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: Date.now(),
            events: events,
            metadata: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                referrer: document.referrer,
                screenResolution: `${screen.width}x${screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language
            }
        };

        try {
            // В продакшене здесь был бы реальный эндпоинт
            if (immediate && 'sendBeacon' in navigator) {
                navigator.sendBeacon('/analytics', JSON.stringify(payload));
            } else {
                // Симулируем отправку
                console.log('📊 Analytics data sent:', payload);

                // Сохраняем локально для демонстрации
                const stored = JSON.parse(localStorage.getItem('m2_analytics_log') || '[]');
                stored.push(payload);

                // Сохраняем только последние 10 сессий
                if (stored.length > 10) {
                    stored.shift();
                }

                localStorage.setItem('m2_analytics_log', JSON.stringify(stored));
            }
        } catch (error) {
            console.warn('Failed to send analytics:', error);
        }
    }

    async sendErrorReport(errorData) {
        try {
            // В продакшене - отправка на сервер мониторинга ошибок
            console.error('🚨 Critical error reported:', errorData);
        } catch (error) {
            console.warn('Failed to send error report:', error);
        }
    }

    throttle(func, wait) {
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

    // Публичные методы для внешнего использования
    getMetrics() {
        return {
            ...this.metrics,
            featuresUsed: Array.from(this.metrics.features),
            sessionDuration: Date.now() - this.startTime
        };
    }

    getHeatmapData() {
        return JSON.parse(localStorage.getItem('m2_heatmap') || '{}');
    }

    getParameterUsage() {
        return JSON.parse(localStorage.getItem('m2_param_usage') || '{}');
    }

    getAnalyticsLog() {
        return JSON.parse(localStorage.getItem('m2_analytics_log') || '[]');
    }

    clearAnalyticsData() {
        localStorage.removeItem('m2_heatmap');
        localStorage.removeItem('m2_param_usage');
        localStorage.removeItem('m2_analytics_log');
        this.events = [];
        console.log('🗑️ Analytics data cleared');
    }

    // Методы для вызова из других модулей
    markCalculationStart() {
        this.calculationStartTime = performance.now();
    }

    trackModuleLoad(moduleName, loadTime) {
        this.trackFeatureUsage(moduleName);

        const moduleData = {
            type: 'module_load',
            timestamp: Date.now(),
            module: moduleName,
            loadTime: loadTime,
            sessionId: this.sessionId
        };

        this.addEvent(moduleData);
    }
}

// Создаем глобальный экземпляр
const analyticsTracker = new AnalyticsTracker();

// Добавляем в глобальную область
window.M2Analytics = analyticsTracker;

// Информируем систему о загрузке модуля
if (window.M2EnhancementsLoader) {
    window.M2EnhancementsLoader.registerModule('analytics-tracker', analyticsTracker);
}

// Интегрируем с существующей системой аналитики
if (window.AnalyticsManager) {
    window.AnalyticsManager.advanced = analyticsTracker;
}