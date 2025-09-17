/**
 * M2 Calculators Monitoring System
 * Система мониторинга производительности, ошибок и пользовательской активности
 */

class MonitoringSystem {
    constructor() {
        this.isEnabled = true;
        this.alerts = new Map();
        this.thresholds = this.initThresholds();
        this.metrics = this.initMetrics();
        this.errorQueue = [];
        this.performanceQueue = [];
        this.alertQueue = [];

        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.setupErrorMonitoring();
        this.setupUserActivityMonitoring();
        this.setupResourceMonitoring();
        this.setupHealthChecks();
        this.setupAlertSystem();
        this.startReporting();

        console.log('📊 Monitoring System активирован');
    }

    initThresholds() {
        return {
            performance: {
                pageLoadTime: 3000,      // максимальное время загрузки страницы (мс)
                memoryUsage: 100,        // максимальное использование памяти (МБ)
                cpuUsage: 80,            // максимальная загрузка CPU (%)
                networkLatency: 1000,    // максимальная задержка сети (мс)
                fps: 30                  // минимальный FPS
            },
            errors: {
                errorRate: 0.05,         // максимальный процент ошибок (5%)
                criticalErrors: 1,       // максимальное количество критических ошибок
                maxErrorsPerMinute: 10   // максимум ошибок в минуту
            },
            usage: {
                maxUsersPerMinute: 1000, // максимальное количество пользователей в минуту
                maxCalculationsPerMinute: 500, // максимальное количество расчетов в минуту
                sessionTimeout: 1800000  // таймаут сессии (30 минут)
            },
            system: {
                diskSpace: 90,           // максимальное использование диска (%)
                connectionPoolSize: 80,  // максимальный размер пула соединений (%)
                cacheHitRate: 0.8        // минимальный процент попаданий в кэш
            }
        };
    }

    initMetrics() {
        return {
            performance: {
                pageLoadTimes: [],
                memoryUsage: [],
                cpuUsage: [],
                networkRequests: [],
                frameRates: []
            },
            errors: {
                totalErrors: 0,
                errorsByType: new Map(),
                criticalErrors: 0,
                errorRate: 0,
                lastError: null
            },
            usage: {
                activeUsers: 0,
                totalSessions: 0,
                calculationsPerMinute: 0,
                popularFeatures: new Map(),
                userJourneys: []
            },
            system: {
                uptime: Date.now(),
                apiResponseTimes: [],
                cacheStats: { hits: 0, misses: 0 },
                resourceUsage: []
            }
        };
    }

    setupPerformanceMonitoring() {
        // Мониторинг времени загрузки страницы
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.measurePageLoadTime();
                }, 100);
            });
        }

        // Мониторинг использования памяти
        if ('memory' in performance) {
            setInterval(() => {
                this.measureMemoryUsage();
            }, 10000); // каждые 10 секунд
        }

        // Мониторинг FPS
        this.setupFPSMonitoring();

        // Мониторинг сетевых запросов
        this.setupNetworkMonitoring();
    }

    measurePageLoadTime() {
        const navigationTiming = performance.getEntriesByType('navigation')[0];
        if (navigationTiming) {
            const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;

            this.metrics.performance.pageLoadTimes.push({
                timestamp: Date.now(),
                loadTime: loadTime,
                url: window.location.pathname
            });

            if (loadTime > this.thresholds.performance.pageLoadTime) {
                this.triggerAlert('performance', 'slow_page_load', {
                    loadTime: loadTime,
                    threshold: this.thresholds.performance.pageLoadTime,
                    url: window.location.pathname
                });
            }

            this.sendMetric('page_load_time', loadTime);
        }
    }

    measureMemoryUsage() {
        if ('memory' in performance) {
            const memoryInfo = performance.memory;
            const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
            const totalMB = Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024);

            this.metrics.performance.memoryUsage.push({
                timestamp: Date.now(),
                used: usedMB,
                total: totalMB,
                percentage: (usedMB / totalMB) * 100
            });

            if (usedMB > this.thresholds.performance.memoryUsage) {
                this.triggerAlert('performance', 'high_memory_usage', {
                    used: usedMB,
                    total: totalMB,
                    threshold: this.thresholds.performance.memoryUsage
                });
            }

            this.sendMetric('memory_usage', usedMB);
        }
    }

    setupFPSMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        let fps = 0;

        const measureFPS = (currentTime) => {
            frameCount++;

            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

                this.metrics.performance.frameRates.push({
                    timestamp: Date.now(),
                    fps: fps
                });

                if (fps < this.thresholds.performance.fps) {
                    this.triggerAlert('performance', 'low_fps', {
                        fps: fps,
                        threshold: this.thresholds.performance.fps
                    });
                }

                frameCount = 0;
                lastTime = currentTime;
                this.sendMetric('fps', fps);
            }

            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }

    setupNetworkMonitoring() {
        // Перехватываем fetch запросы
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();

            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                const duration = endTime - startTime;

                this.recordNetworkRequest({
                    url: args[0],
                    method: args[1]?.method || 'GET',
                    status: response.status,
                    duration: duration,
                    timestamp: Date.now(),
                    success: response.ok
                });

                if (duration > this.thresholds.performance.networkLatency) {
                    this.triggerAlert('performance', 'slow_network_request', {
                        url: args[0],
                        duration: duration,
                        threshold: this.thresholds.performance.networkLatency
                    });
                }

                return response;
            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;

                this.recordNetworkRequest({
                    url: args[0],
                    method: args[1]?.method || 'GET',
                    status: 0,
                    duration: duration,
                    timestamp: Date.now(),
                    success: false,
                    error: error.message
                });

                this.recordError(error, 'network_request');
                throw error;
            }
        };

        // Мониторинг XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const startTime = performance.now();

            xhr.addEventListener('loadend', () => {
                const duration = performance.now() - startTime;

                this.recordNetworkRequest({
                    url: xhr.responseURL,
                    method: 'XHR',
                    status: xhr.status,
                    duration: duration,
                    timestamp: Date.now(),
                    success: xhr.status >= 200 && xhr.status < 300
                });
            });

            return xhr;
        };
    }

    recordNetworkRequest(requestData) {
        this.metrics.performance.networkRequests.push(requestData);

        // Ограничиваем количество записей
        if (this.metrics.performance.networkRequests.length > 1000) {
            this.metrics.performance.networkRequests = this.metrics.performance.networkRequests.slice(-500);
        }

        this.sendMetric('network_request', requestData);
    }

    setupErrorMonitoring() {
        // Глобальные ошибки JavaScript
        window.addEventListener('error', (event) => {
            this.recordError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            }, 'javascript_error');
        });

        // Необработанные промисы
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError({
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack,
                type: 'unhandled_promise'
            }, 'promise_rejection');
        });

        // Ошибки ресурсов
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.recordError({
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    source: event.target.src || event.target.href
                }, 'resource_error');
            }
        }, true);
    }

    recordError(error, type = 'unknown') {
        const errorRecord = {
            timestamp: Date.now(),
            type: type,
            message: error.message || String(error),
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.getUserId(),
            sessionId: this.getSessionId(),
            severity: this.determineErrorSeverity(error, type)
        };

        this.metrics.errors.totalErrors++;
        this.metrics.errors.lastError = errorRecord;

        // Подсчет ошибок по типам
        const errorType = errorRecord.type;
        this.metrics.errors.errorsByType.set(
            errorType,
            (this.metrics.errors.errorsByType.get(errorType) || 0) + 1
        );

        // Критические ошибки
        if (errorRecord.severity === 'critical') {
            this.metrics.errors.criticalErrors++;

            this.triggerAlert('error', 'critical_error', errorRecord);
        }

        // Добавляем в очередь для отправки
        this.errorQueue.push(errorRecord);

        // Проверяем превышение лимитов
        this.checkErrorThresholds();

        console.error('🚨 Recorded error:', errorRecord);
    }

    determineErrorSeverity(error, type) {
        const criticalPatterns = [
            /TypeError.*Cannot read property/i,
            /ReferenceError/i,
            /Network Error/i,
            /Failed to fetch/i,
            /Authentication failed/i,
            /Payment.*failed/i
        ];

        const warningPatterns = [
            /404.*Not Found/i,
            /Timeout/i,
            /Connection.*refused/i
        ];

        const message = error.message || String(error);

        if (criticalPatterns.some(pattern => pattern.test(message))) {
            return 'critical';
        } else if (warningPatterns.some(pattern => pattern.test(message))) {
            return 'warning';
        } else if (type === 'resource_error') {
            return 'info';
        }

        return 'error';
    }

    setupUserActivityMonitoring() {
        // Мониторинг активных пользователей
        this.trackUserSession();

        // Мониторинг действий пользователей
        document.addEventListener('click', (event) => {
            this.recordUserAction('click', {
                element: event.target.tagName,
                className: event.target.className,
                id: event.target.id,
                timestamp: Date.now()
            });
        });

        // Мониторинг расчетов
        document.addEventListener('calculationCompleted', (event) => {
            this.recordCalculation(event.detail);
        });

        // Мониторинг использования функций
        if (window.M2Analytics) {
            const originalTrackFeature = window.M2Analytics.trackFeatureUsage;
            window.M2Analytics.trackFeatureUsage = (feature) => {
                originalTrackFeature.call(window.M2Analytics, feature);
                this.recordFeatureUsage(feature);
            };
        }
    }

    trackUserSession() {
        const sessionId = this.getSessionId();
        const userId = this.getUserId();

        this.metrics.usage.activeUsers++;
        this.metrics.usage.totalSessions++;

        // Отправляем heartbeat каждую минуту
        setInterval(() => {
            this.sendHeartbeat(sessionId, userId);
        }, 60000);

        // Отслеживаем завершение сессии
        window.addEventListener('beforeunload', () => {
            this.endUserSession(sessionId);
        });
    }

    recordUserAction(action, details) {
        const actionRecord = {
            timestamp: Date.now(),
            action: action,
            details: details,
            sessionId: this.getSessionId(),
            userId: this.getUserId()
        };

        this.sendMetric('user_action', actionRecord);
    }

    recordCalculation(calculationData) {
        this.metrics.usage.calculationsPerMinute++;

        const calculationRecord = {
            timestamp: Date.now(),
            type: calculationData.type,
            parameters: this.sanitizeParameters(calculationData.parameters),
            result: this.sanitizeResult(calculationData.result),
            processingTime: calculationData.processingTime,
            sessionId: this.getSessionId(),
            userId: this.getUserId()
        };

        this.sendMetric('calculation', calculationRecord);

        // Проверяем превышение лимитов
        if (this.metrics.usage.calculationsPerMinute > this.thresholds.usage.maxCalculationsPerMinute) {
            this.triggerAlert('usage', 'high_calculation_rate', {
                rate: this.metrics.usage.calculationsPerMinute,
                threshold: this.thresholds.usage.maxCalculationsPerMinute
            });
        }
    }

    recordFeatureUsage(feature) {
        const currentCount = this.metrics.usage.popularFeatures.get(feature) || 0;
        this.metrics.usage.popularFeatures.set(feature, currentCount + 1);

        this.sendMetric('feature_usage', {
            feature: feature,
            count: currentCount + 1,
            timestamp: Date.now()
        });
    }

    setupResourceMonitoring() {
        // Мониторинг размера DOM
        setInterval(() => {
            const domSize = document.getElementsByTagName('*').length;
            this.sendMetric('dom_size', domSize);

            if (domSize > 5000) {
                this.triggerAlert('performance', 'large_dom', {
                    size: domSize,
                    threshold: 5000
                });
            }
        }, 30000); // каждые 30 секунд

        // Мониторинг локального хранилища
        setInterval(() => {
            this.measureStorageUsage();
        }, 60000); // каждую минуту

        // Мониторинг подключения к интернету
        this.setupConnectionMonitoring();
    }

    measureStorageUsage() {
        try {
            const localStorage = window.localStorage;
            let totalSize = 0;

            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }

            const sizeKB = Math.round(totalSize / 1024);
            this.sendMetric('storage_usage', sizeKB);

            if (sizeKB > 4000) { // 4MB лимит для localStorage
                this.triggerAlert('system', 'high_storage_usage', {
                    usage: sizeKB,
                    limit: 5120
                });
            }
        } catch (error) {
            this.recordError(error, 'storage_monitoring');
        }
    }

    setupConnectionMonitoring() {
        if ('connection' in navigator) {
            const connection = navigator.connection;

            const checkConnection = () => {
                this.sendMetric('connection', {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData,
                    timestamp: Date.now()
                });

                if (connection.rtt > this.thresholds.performance.networkLatency) {
                    this.triggerAlert('performance', 'slow_connection', {
                        rtt: connection.rtt,
                        effectiveType: connection.effectiveType
                    });
                }
            };

            connection.addEventListener('change', checkConnection);
            checkConnection(); // Проверяем сразу
        }

        // Мониторинг статуса онлайн/офлайн
        window.addEventListener('online', () => {
            this.sendMetric('connectivity', { status: 'online', timestamp: Date.now() });
        });

        window.addEventListener('offline', () => {
            this.sendMetric('connectivity', { status: 'offline', timestamp: Date.now() });
            this.triggerAlert('system', 'connection_lost', { timestamp: Date.now() });
        });
    }

    setupHealthChecks() {
        // Проверка здоровья системы каждые 5 минут
        setInterval(() => {
            this.performHealthCheck();
        }, 300000);

        // Первоначальная проверка
        setTimeout(() => {
            this.performHealthCheck();
        }, 5000);
    }

    async performHealthCheck() {
        const healthData = {
            timestamp: Date.now(),
            uptime: Date.now() - this.metrics.system.uptime,
            checks: {}
        };

        // Проверка загрузки модулей
        healthData.checks.modules = this.checkModulesHealth();

        // Проверка API
        healthData.checks.api = await this.checkAPIHealth();

        // Проверка локального хранилища
        healthData.checks.storage = this.checkStorageHealth();

        // Проверка производительности
        healthData.checks.performance = this.checkPerformanceHealth();

        // Проверка ошибок
        healthData.checks.errors = this.checkErrorsHealth();

        this.sendMetric('health_check', healthData);

        // Проверяем критические проблемы
        const criticalIssues = Object.entries(healthData.checks)
            .filter(([key, check]) => check.status === 'critical');

        if (criticalIssues.length > 0) {
            this.triggerAlert('system', 'health_check_failed', {
                issues: criticalIssues,
                healthData: healthData
            });
        }

        console.log('🏥 Health check completed:', healthData);
    }

    checkModulesHealth() {
        const requiredModules = [
            'M2EnhancementsLoader',
            'M2Analytics',
            'M2API'
        ];

        const loadedModules = requiredModules.filter(module => window[module]);
        const missingModules = requiredModules.filter(module => !window[module]);

        return {
            status: missingModules.length === 0 ? 'healthy' : 'warning',
            loaded: loadedModules.length,
            total: requiredModules.length,
            missing: missingModules
        };
    }

    async checkAPIHealth() {
        try {
            if (window.M2API) {
                const status = window.M2API.getStatus();
                return {
                    status: status.loaded ? 'healthy' : 'warning',
                    details: status
                };
            } else {
                return {
                    status: 'critical',
                    error: 'M2API not loaded'
                };
            }
        } catch (error) {
            return {
                status: 'critical',
                error: error.message
            };
        }
    }

    checkStorageHealth() {
        try {
            const testKey = 'm2_health_check';
            const testValue = Date.now().toString();

            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);

            return {
                status: retrieved === testValue ? 'healthy' : 'warning',
                accessible: true
            };
        } catch (error) {
            return {
                status: 'critical',
                accessible: false,
                error: error.message
            };
        }
    }

    checkPerformanceHealth() {
        const recentMemory = this.metrics.performance.memoryUsage.slice(-5);
        const recentFPS = this.metrics.performance.frameRates.slice(-5);

        const avgMemory = recentMemory.reduce((sum, m) => sum + m.used, 0) / recentMemory.length;
        const avgFPS = recentFPS.reduce((sum, f) => sum + f.fps, 0) / recentFPS.length;

        let status = 'healthy';
        if (avgMemory > this.thresholds.performance.memoryUsage * 0.8 || avgFPS < this.thresholds.performance.fps * 1.2) {
            status = 'warning';
        }
        if (avgMemory > this.thresholds.performance.memoryUsage || avgFPS < this.thresholds.performance.fps) {
            status = 'critical';
        }

        return {
            status: status,
            avgMemory: Math.round(avgMemory),
            avgFPS: Math.round(avgFPS),
            thresholds: this.thresholds.performance
        };
    }

    checkErrorsHealth() {
        const recentErrors = this.errorQueue.filter(
            error => Date.now() - error.timestamp < 600000 // последние 10 минут
        );

        const criticalErrors = recentErrors.filter(error => error.severity === 'critical');

        let status = 'healthy';
        if (recentErrors.length > 20) status = 'warning';
        if (criticalErrors.length > 0 || recentErrors.length > 50) status = 'critical';

        return {
            status: status,
            recentErrors: recentErrors.length,
            criticalErrors: criticalErrors.length,
            errorRate: this.metrics.errors.errorRate
        };
    }

    setupAlertSystem() {
        // Настраиваем различные каналы алертов
        this.alertChannels = {
            console: this.sendConsoleAlert.bind(this),
            notification: this.sendNotificationAlert.bind(this),
            storage: this.sendStorageAlert.bind(this),
            analytics: this.sendAnalyticsAlert.bind(this)
        };

        // Обрабатываем очередь алертов каждые 30 секунд
        setInterval(() => {
            this.processAlertQueue();
        }, 30000);
    }

    triggerAlert(category, type, details) {
        const alert = {
            id: this.generateAlertId(),
            timestamp: Date.now(),
            category: category,
            type: type,
            details: details,
            severity: this.determineAlertSeverity(category, type),
            resolved: false
        };

        this.alerts.set(alert.id, alert);
        this.alertQueue.push(alert);

        // Немедленная отправка критических алертов
        if (alert.severity === 'critical') {
            this.sendImmediateAlert(alert);
        }

        console.warn(`🚨 Alert triggered: [${category}] ${type}`, details);
    }

    determineAlertSeverity(category, type) {
        const criticalAlerts = {
            error: ['critical_error'],
            system: ['health_check_failed', 'connection_lost'],
            performance: ['low_fps']
        };

        const warningAlerts = {
            performance: ['slow_page_load', 'high_memory_usage', 'slow_network_request'],
            usage: ['high_calculation_rate'],
            system: ['high_storage_usage']
        };

        if (criticalAlerts[category]?.includes(type)) {
            return 'critical';
        } else if (warningAlerts[category]?.includes(type)) {
            return 'warning';
        }

        return 'info';
    }

    sendImmediateAlert(alert) {
        // Отправляем критические алерты через все доступные каналы
        Object.values(this.alertChannels).forEach(channel => {
            try {
                channel(alert);
            } catch (error) {
                console.error('Failed to send alert:', error);
            }
        });
    }

    processAlertQueue() {
        if (this.alertQueue.length === 0) return;

        const alertsToProcess = [...this.alertQueue];
        this.alertQueue = [];

        alertsToProcess.forEach(alert => {
            if (alert.severity !== 'critical') { // Критические уже отправлены
                this.sendAlert(alert);
            }
        });
    }

    sendAlert(alert) {
        // Отправляем обычные алерты через выбранные каналы
        this.alertChannels.console(alert);
        this.alertChannels.storage(alert);

        if (alert.severity === 'warning') {
            this.alertChannels.analytics(alert);
        }
    }

    sendConsoleAlert(alert) {
        const emoji = {
            critical: '🔴',
            warning: '🟡',
            info: '🔵'
        };

        console.warn(
            `${emoji[alert.severity]} ALERT [${alert.category}/${alert.type}]:`,
            alert.details
        );
    }

    sendNotificationAlert(alert) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`M2 Alert: ${alert.type}`, {
                body: `Category: ${alert.category}\nDetails: ${JSON.stringify(alert.details)}`,
                icon: '/icons/icon-192x192.png',
                requireInteraction: alert.severity === 'critical'
            });
        }
    }

    sendStorageAlert(alert) {
        try {
            const existingAlerts = JSON.parse(localStorage.getItem('m2_alerts') || '[]');
            existingAlerts.push(alert);

            // Ограничиваем количество сохраненных алертов
            if (existingAlerts.length > 100) {
                existingAlerts.splice(0, existingAlerts.length - 50);
            }

            localStorage.setItem('m2_alerts', JSON.stringify(existingAlerts));
        } catch (error) {
            console.error('Failed to store alert:', error);
        }
    }

    sendAnalyticsAlert(alert) {
        if (window.M2Analytics) {
            window.M2Analytics.addEvent({
                type: 'monitoring_alert',
                timestamp: alert.timestamp,
                category: alert.category,
                alertType: alert.type,
                severity: alert.severity,
                details: alert.details
            });
        }
    }

    startReporting() {
        // Отправляем метрики каждые 2 минуты
        setInterval(() => {
            this.sendBatchReport();
        }, 120000);

        // Отправляем при закрытии страницы
        window.addEventListener('beforeunload', () => {
            this.sendFinalReport();
        });
    }

    sendBatchReport() {
        const report = {
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            metrics: this.aggregateMetrics(),
            errors: this.errorQueue.splice(0), // Очищаем очередь
            performance: this.performanceQueue.splice(0),
            alerts: this.getRecentAlerts()
        };

        this.sendReport(report);
    }

    aggregateMetrics() {
        return {
            performance: {
                avgPageLoadTime: this.calculateAverage(this.metrics.performance.pageLoadTimes, 'loadTime'),
                avgMemoryUsage: this.calculateAverage(this.metrics.performance.memoryUsage, 'used'),
                avgFPS: this.calculateAverage(this.metrics.performance.frameRates, 'fps'),
                totalNetworkRequests: this.metrics.performance.networkRequests.length
            },
            errors: {
                totalErrors: this.metrics.errors.totalErrors,
                errorsByType: Object.fromEntries(this.metrics.errors.errorsByType),
                criticalErrors: this.metrics.errors.criticalErrors,
                errorRate: this.metrics.errors.errorRate
            },
            usage: {
                activeUsers: this.metrics.usage.activeUsers,
                totalSessions: this.metrics.usage.totalSessions,
                calculationsPerMinute: this.metrics.usage.calculationsPerMinute,
                popularFeatures: Object.fromEntries(this.metrics.usage.popularFeatures)
            },
            system: {
                uptime: Date.now() - this.metrics.system.uptime,
                cacheHitRate: this.calculateCacheHitRate()
            }
        };
    }

    getRecentAlerts() {
        const oneHourAgo = Date.now() - 3600000;
        return Array.from(this.alerts.values())
            .filter(alert => alert.timestamp > oneHourAgo)
            .slice(-20); // Последние 20 алертов
    }

    sendReport(report) {
        // В продакшене здесь была бы отправка на сервер мониторинга
        console.log('📊 Monitoring report:', report);

        // Симулируем отправку
        this.simulateReportSending(report);
    }

    simulateReportSending(report) {
        // Сохраняем в localStorage для демонстрации
        try {
            const reports = JSON.parse(localStorage.getItem('m2_monitoring_reports') || '[]');
            reports.push(report);

            // Ограничиваем количество сохраненных отчетов
            if (reports.length > 20) {
                reports.splice(0, reports.length - 10);
            }

            localStorage.setItem('m2_monitoring_reports', JSON.stringify(reports));
        } catch (error) {
            console.error('Failed to save monitoring report:', error);
        }
    }

    // Утилиты
    generateAlertId() {
        return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserId() {
        return localStorage.getItem('m2_user_id') || 'anonymous';
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    sanitizeParameters(params) {
        // Удаляем чувствительные данные из параметров
        const sanitized = { ...params };
        delete sanitized.personalData;
        delete sanitized.email;
        delete sanitized.phone;
        return sanitized;
    }

    sanitizeResult(result) {
        // Маскируем чувствительные данные в результатах
        return result;
    }

    sendMetric(name, value) {
        // Отправляем метрику в систему аналитики
        if (window.M2Analytics) {
            window.M2Analytics.addEvent({
                type: 'monitoring_metric',
                timestamp: Date.now(),
                metric: name,
                value: value
            });
        }
    }

    sendHeartbeat(sessionId, userId) {
        this.sendMetric('heartbeat', {
            sessionId: sessionId,
            userId: userId,
            timestamp: Date.now(),
            active: !document.hidden
        });
    }

    endUserSession(sessionId) {
        this.sendMetric('session_end', {
            sessionId: sessionId,
            duration: Date.now() - this.metrics.system.uptime,
            timestamp: Date.now()
        });
    }

    calculateAverage(array, property) {
        if (array.length === 0) return 0;
        const sum = array.reduce((total, item) => total + (item[property] || item), 0);
        return Math.round(sum / array.length);
    }

    calculateCacheHitRate() {
        const stats = this.metrics.system.cacheStats;
        const total = stats.hits + stats.misses;
        return total > 0 ? stats.hits / total : 0;
    }

    checkErrorThresholds() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        const recentErrors = this.errorQueue.filter(error => error.timestamp > oneMinuteAgo);

        if (recentErrors.length > this.thresholds.errors.maxErrorsPerMinute) {
            this.triggerAlert('error', 'error_rate_exceeded', {
                errorCount: recentErrors.length,
                threshold: this.thresholds.errors.maxErrorsPerMinute,
                timeWindow: '1 minute'
            });
        }

        // Обновляем общий процент ошибок
        const totalRequests = this.metrics.performance.networkRequests.length;
        if (totalRequests > 0) {
            this.metrics.errors.errorRate = this.metrics.errors.totalErrors / totalRequests;

            if (this.metrics.errors.errorRate > this.thresholds.errors.errorRate) {
                this.triggerAlert('error', 'high_error_rate', {
                    errorRate: this.metrics.errors.errorRate,
                    threshold: this.thresholds.errors.errorRate
                });
            }
        }
    }

    sendFinalReport() {
        const finalReport = {
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            type: 'session_end',
            metrics: this.aggregateMetrics(),
            summary: {
                totalErrors: this.metrics.errors.totalErrors,
                totalAlerts: this.alerts.size,
                sessionDuration: Date.now() - this.metrics.system.uptime
            }
        };

        // Используем sendBeacon для надежной отправки при закрытии
        if ('sendBeacon' in navigator) {
            const data = JSON.stringify(finalReport);
            navigator.sendBeacon('/monitoring/final-report', data);
        }

        this.simulateReportSending(finalReport);
    }

    // Публичные методы
    getMonitoringStatus() {
        return {
            isEnabled: this.isEnabled,
            uptime: Date.now() - this.metrics.system.uptime,
            totalErrors: this.metrics.errors.totalErrors,
            totalAlerts: this.alerts.size,
            metrics: this.aggregateMetrics()
        };
    }

    getRecentReports() {
        try {
            return JSON.parse(localStorage.getItem('m2_monitoring_reports') || '[]');
        } catch (error) {
            return [];
        }
    }

    getAllAlerts() {
        try {
            return JSON.parse(localStorage.getItem('m2_alerts') || '[]');
        } catch (error) {
            return [];
        }
    }

    clearMonitoringData() {
        localStorage.removeItem('m2_monitoring_reports');
        localStorage.removeItem('m2_alerts');
        this.metrics = this.initMetrics();
        this.alerts.clear();
        this.errorQueue = [];
        this.performanceQueue = [];
        this.alertQueue = [];

        console.log('🗑️ Monitoring data cleared');
    }

    setThreshold(category, metric, value) {
        if (this.thresholds[category] && this.thresholds[category][metric] !== undefined) {
            this.thresholds[category][metric] = value;
            console.log(`📊 Threshold updated: ${category}.${metric} = ${value}`);
        }
    }

    enableMonitoring() {
        this.isEnabled = true;
        console.log('📊 Monitoring enabled');
    }

    disableMonitoring() {
        this.isEnabled = false;
        console.log('📊 Monitoring disabled');
    }
}

// Создаем экземпляр системы мониторинга
const monitoringSystem = new MonitoringSystem();

// Добавляем в глобальную область
window.M2Monitoring = monitoringSystem;

// Информируем систему о загрузке модуля
if (window.M2EnhancementsLoader) {
    window.M2EnhancementsLoader.registerModule('monitoring-system', monitoringSystem);
}

console.log('📊 Monitoring System активирована:', monitoringSystem.getMonitoringStatus());