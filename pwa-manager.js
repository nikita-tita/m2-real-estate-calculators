/**
 * M2 Calculators PWA Manager
 * Управление Progressive Web App функциональностью
 */

class PWAManager {
    constructor() {
        this.isInstallable = false;
        this.isInstalled = false;
        this.deferredPrompt = null;
        this.serviceWorker = null;
        this.notificationPermission = 'default';

        this.init();
    }

    async init() {
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupNotifications();
        this.checkInstallStatus();
        this.setupOfflineHandling();
        this.setupUpdatePrompts();
        this.trackPWAMetrics();

        console.log('📱 PWA Manager инициализирован');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Создаем service worker динамически
                const swContent = this.generateServiceWorkerContent();
                const swBlob = new Blob([swContent], { type: 'application/javascript' });
                const swUrl = URL.createObjectURL(swBlob);

                const registration = await navigator.serviceWorker.register(swUrl);
                this.serviceWorker = registration;

                registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate(registration);
                });

                console.log('✅ Service Worker зарегистрирован');
                return registration;

            } catch (error) {
                console.warn('⚠️ Ошибка регистрации Service Worker:', error);
            }
        }
    }

    generateServiceWorkerContent() {
        return `
            const CACHE_NAME = 'm2-calculators-v${Date.now()}';
            const CACHE_STATIC = 'm2-static-v1';
            const CACHE_DYNAMIC = 'm2-dynamic-v1';

            // Файлы для кэширования
            const staticAssets = [
                '/',
                '/manifest.json',
                '/favicon.svg',
                '/icons/icon-192x192.png',
                '/icons/icon-512x512.png',
                '/m2-enhancements-loader.js',
                '/dark-theme.js',
                '/mobile-optimizer.js',
                '/advanced-validation.js',
                '/calculation-templates.js'
            ];

            // Установка Service Worker
            self.addEventListener('install', event => {
                event.waitUntil(
                    caches.open(CACHE_STATIC)
                        .then(cache => cache.addAll(staticAssets))
                        .then(() => self.skipWaiting())
                );
            });

            // Активация Service Worker
            self.addEventListener('activate', event => {
                event.waitUntil(
                    caches.keys().then(cacheNames => {
                        return Promise.all(
                            cacheNames.map(cacheName => {
                                if (cacheName !== CACHE_STATIC && cacheName !== CACHE_DYNAMIC) {
                                    return caches.delete(cacheName);
                                }
                            })
                        );
                    }).then(() => self.clients.claim())
                );
            });

            // Стратегия кэширования
            self.addEventListener('fetch', event => {
                const { request } = event;
                const url = new URL(request.url);

                // API запросы - Network First
                if (url.pathname.includes('/api/')) {
                    event.respondWith(
                        fetch(request)
                            .then(response => {
                                const responseClone = response.clone();
                                caches.open(CACHE_DYNAMIC)
                                    .then(cache => cache.put(request, responseClone));
                                return response;
                            })
                            .catch(() => caches.match(request))
                    );
                    return;
                }

                // Статические ресурсы - Cache First
                if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
                    event.respondWith(
                        caches.match(request)
                            .then(response => response || fetch(request)
                                .then(fetchResponse => {
                                    const responseClone = fetchResponse.clone();
                                    caches.open(CACHE_STATIC)
                                        .then(cache => cache.put(request, responseClone));
                                    return fetchResponse;
                                })
                            )
                    );
                    return;
                }

                // HTML страницы - Stale While Revalidate
                event.respondWith(
                    caches.match(request)
                        .then(response => {
                            const fetchPromise = fetch(request)
                                .then(fetchResponse => {
                                    const responseClone = fetchResponse.clone();
                                    caches.open(CACHE_DYNAMIC)
                                        .then(cache => cache.put(request, responseClone));
                                    return fetchResponse;
                                });

                            return response || fetchPromise;
                        })
                );
            });

            // Обработка уведомлений
            self.addEventListener('notificationclick', event => {
                event.notification.close();

                if (event.action === 'open_calculator') {
                    event.waitUntil(
                        clients.openWindow('/')
                    );
                }
            });

            // Background Sync для отложенных расчетов
            self.addEventListener('sync', event => {
                if (event.tag === 'background-calculation') {
                    event.waitUntil(processPendingCalculations());
                }
            });

            async function processPendingCalculations() {
                // Обработка отложенных расчетов при восстановлении соединения
                const pending = await getFromIndexedDB('pendingCalculations');

                for (const calculation of pending) {
                    try {
                        await sendCalculationToServer(calculation);
                        await removeFromIndexedDB('pendingCalculations', calculation.id);
                    } catch (error) {
                        console.warn('Не удалось обработать расчет:', error);
                    }
                }
            }
        `;
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.isInstallable = true;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton();
            this.trackPWAInstall();
            this.showInstallSuccessMessage();
        });
    }

    showInstallButton() {
        const installButton = this.createInstallButton();
        document.body.appendChild(installButton);

        // Показываем промо установки через 30 секунд
        setTimeout(() => {
            if (this.isInstallable && !this.isInstalled) {
                this.showInstallPromo();
            }
        }, 30000);
    }

    createInstallButton() {
        const button = document.createElement('button');
        button.id = 'pwa-install-button';
        button.className = 'pwa-install-btn';
        button.innerHTML = `
            <span class="install-icon">📱</span>
            Установить приложение
        `;

        button.addEventListener('click', () => {
            this.promptInstall();
        });

        this.injectInstallStyles();
        return button;
    }

    async promptInstall() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('👍 Пользователь согласился установить PWA');
            } else {
                console.log('👎 Пользователь отклонил установку PWA');
            }

            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }

    showInstallPromo() {
        const promo = document.createElement('div');
        promo.id = 'pwa-install-promo';
        promo.className = 'pwa-install-promo';
        promo.innerHTML = `
            <div class="promo-content">
                <div class="promo-header">
                    <span class="promo-icon">🚀</span>
                    <h3>Установите М2 Калькуляторы</h3>
                    <button class="promo-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
                </div>
                <div class="promo-body">
                    <ul class="promo-benefits">
                        <li>📱 Быстрый доступ с рабочего стола</li>
                        <li>⚡ Работа без интернета</li>
                        <li>🔔 Уведомления о новых функциях</li>
                        <li>💾 Автосохранение расчетов</li>
                    </ul>
                    <div class="promo-actions">
                        <button class="install-now-btn" onclick="window.M2PWA.promptInstall(); this.parentElement.parentElement.parentElement.parentElement.remove();">
                            Установить сейчас
                        </button>
                        <button class="install-later-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.remove();">
                            Позже
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(promo);

        // Автоматически скрываем через 10 секунд
        setTimeout(() => {
            if (promo.parentElement) {
                promo.remove();
            }
        }, 10000);
    }

    hideInstallButton() {
        const button = document.getElementById('pwa-install-button');
        if (button) {
            button.remove();
        }
    }

    showInstallSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'pwa-success-message';
        message.innerHTML = `
            <div class="success-content">
                <span class="success-icon">🎉</span>
                <strong>Приложение установлено!</strong>
                <p>Теперь вы можете запускать М2 Калькуляторы прямо с рабочего стола</p>
            </div>
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    async setupNotifications() {
        if ('Notification' in window) {
            this.notificationPermission = await Notification.requestPermission();

            if (this.notificationPermission === 'granted') {
                this.scheduleNotifications();
            }
        }
    }

    scheduleNotifications() {
        // Уведомление о новых функциях
        setTimeout(() => {
            this.showNotification('Новые функции доступны!', {
                body: 'Обновите страницу, чтобы увидеть последние улучшения',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                actions: [
                    { action: 'update', title: 'Обновить' },
                    { action: 'dismiss', title: 'Закрыть' }
                ]
            });
        }, 60000); // через минуту

        // Напоминание о расчетах
        if (this.hasUnfinishedCalculations()) {
            setTimeout(() => {
                this.showNotification('Незавершенные расчеты', {
                    body: 'У вас есть несохраненные расчеты. Завершите их, чтобы не потерять данные.',
                    icon: '/icons/icon-192x192.png',
                    requireInteraction: true
                });
            }, 300000); // через 5 минут
        }
    }

    showNotification(title, options = {}) {
        if (this.notificationPermission === 'granted' && 'serviceWorker' in navigator) {
            const defaultOptions = {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                vibrate: [200, 100, 200],
                data: {
                    timestamp: Date.now(),
                    url: window.location.href
                }
            };

            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, { ...defaultOptions, ...options });
            });
        }
    }

    checkInstallStatus() {
        // Проверяем, запущено ли приложение как PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone ||
                            document.referrer.includes('android-app://');

        this.isInstalled = isStandalone;

        if (this.isInstalled) {
            document.body.classList.add('pwa-installed');
            this.setupPWAFeatures();
        }
    }

    setupPWAFeatures() {
        // Функции доступные только в установленном PWA
        this.setupBackgroundSync();
        this.setupOfflineStorage();
        this.enableAdvancedCaching();

        console.log('🎯 PWA режим активирован');
    }

    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.handleOffline();
        });

        // Проверяем текущий статус
        if (!navigator.onLine) {
            this.handleOffline();
        }
    }

    handleOnline() {
        document.body.classList.remove('offline-mode');

        const offlineBanner = document.getElementById('offline-banner');
        if (offlineBanner) {
            offlineBanner.remove();
        }

        // Синхронизируем отложенные данные
        this.syncPendingData();

        this.showNotification('Соединение восстановлено', {
            body: 'Синхронизация данных...',
            icon: '/icons/icon-192x192.png'
        });
    }

    handleOffline() {
        document.body.classList.add('offline-mode');
        this.showOfflineBanner();
    }

    showOfflineBanner() {
        if (document.getElementById('offline-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'offline-banner';
        banner.className = 'offline-banner';
        banner.innerHTML = `
            <div class="offline-content">
                <span class="offline-icon">📡</span>
                <span class="offline-text">Работаем в автономном режиме</span>
                <span class="offline-details">Ваши расчеты сохраняются локально</span>
            </div>
        `;

        document.body.appendChild(banner);
    }

    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                // Регистрируем background sync для отложенных расчетов
                registration.sync.register('background-calculation');
            });
        }
    }

    setupOfflineStorage() {
        // Настраиваем IndexedDB для офлайн хранения
        this.initIndexedDB();
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('M2CalculatorsDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Создаем хранилище для расчетов
                if (!db.objectStoreNames.contains('calculations')) {
                    const calculationsStore = db.createObjectStore('calculations', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    calculationsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    calculationsStore.createIndex('type', 'type', { unique: false });
                }

                // Создаем хранилище для отложенных операций
                if (!db.objectStoreNames.contains('pendingOperations')) {
                    db.createObjectStore('pendingOperations', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                }
            };
        });
    }

    async saveCalculationOffline(calculationData) {
        try {
            const db = await this.initIndexedDB();
            const transaction = db.transaction(['calculations'], 'readwrite');
            const store = transaction.objectStore('calculations');

            const calculation = {
                ...calculationData,
                timestamp: Date.now(),
                offline: true,
                synced: false
            };

            await store.add(calculation);
            console.log('💾 Расчет сохранен офлайн');

            return calculation;
        } catch (error) {
            console.error('Ошибка сохранения офлайн:', error);
        }
    }

    async getOfflineCalculations() {
        try {
            const db = await this.initIndexedDB();
            const transaction = db.transaction(['calculations'], 'readonly');
            const store = transaction.objectStore('calculations');

            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Ошибка получения офлайн данных:', error);
            return [];
        }
    }

    async syncPendingData() {
        const calculations = await this.getOfflineCalculations();
        const unsynced = calculations.filter(calc => !calc.synced);

        for (const calculation of unsynced) {
            try {
                await this.sendCalculationToServer(calculation);
                await this.markCalculationAsSynced(calculation.id);
            } catch (error) {
                console.warn('Не удалось синхронизировать расчет:', error);
            }
        }

        if (unsynced.length > 0) {
            console.log(`📡 Синхронизировано ${unsynced.length} расчетов`);
        }
    }

    setupUpdatePrompts() {
        if (this.serviceWorker) {
            this.serviceWorker.addEventListener('updatefound', () => {
                const newWorker = this.serviceWorker.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdatePrompt();
                    }
                });
            });
        }
    }

    handleServiceWorkerUpdate(registration) {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
            }
        });
    }

    showUpdatePrompt() {
        const updatePrompt = document.createElement('div');
        updatePrompt.id = 'pwa-update-prompt';
        updatePrompt.className = 'pwa-update-prompt';
        updatePrompt.innerHTML = `
            <div class="update-content">
                <div class="update-header">
                    <span class="update-icon">🔄</span>
                    <strong>Доступно обновление</strong>
                </div>
                <div class="update-body">
                    <p>Новая версия приложения готова к установке</p>
                    <div class="update-actions">
                        <button class="update-now-btn" onclick="window.M2PWA.applyUpdate()">
                            Обновить сейчас
                        </button>
                        <button class="update-later-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
                            Позже
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(updatePrompt);
    }

    showUpdateAvailable() {
        this.showNotification('Обновление доступно', {
            body: 'Новая версия М2 Калькуляторов готова к установке',
            icon: '/icons/icon-192x192.png',
            actions: [
                { action: 'update', title: 'Обновить' },
                { action: 'dismiss', title: 'Позже' }
            ],
            requireInteraction: true
        });
    }

    applyUpdate() {
        if (this.serviceWorker && this.serviceWorker.waiting) {
            this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    trackPWAMetrics() {
        const metrics = {
            isInstallable: this.isInstallable,
            isInstalled: this.isInstalled,
            notificationPermission: this.notificationPermission,
            serviceWorkerSupport: 'serviceWorker' in navigator,
            installPromptShown: false,
            installCompleted: false
        };

        if (window.M2Analytics) {
            window.M2Analytics.addEvent({
                type: 'pwa_metrics',
                timestamp: Date.now(),
                metrics: metrics
            });
        }
    }

    trackPWAInstall() {
        if (window.M2Analytics) {
            window.M2Analytics.addEvent({
                type: 'pwa_install',
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            });
        }
    }

    hasUnfinishedCalculations() {
        // Проверяем наличие несохраненных данных в формах
        const inputs = document.querySelectorAll('input[type="number"]:not([value=""]), select:not([value=""])');
        return inputs.length > 0;
    }

    injectInstallStyles() {
        if (document.querySelector('#pwa-install-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'pwa-install-styles';
        styles.textContent = `
            .pwa-install-btn {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 25px;
                padding: 12px 20px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }

            .pwa-install-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
            }

            .install-icon {
                font-size: 16px;
            }

            .pwa-install-promo {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                max-width: 400px;
                width: 90%;
                overflow: hidden;
                animation: promoSlideIn 0.5s ease-out;
            }

            .promo-content {
                padding: 0;
            }

            .promo-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                position: relative;
            }

            .promo-icon {
                font-size: 24px;
            }

            .promo-header h3 {
                margin: 0;
                flex: 1;
                font-size: 18px;
            }

            .promo-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
            }

            .promo-body {
                padding: 20px;
            }

            .promo-benefits {
                list-style: none;
                padding: 0;
                margin: 0 0 20px 0;
            }

            .promo-benefits li {
                padding: 8px 0;
                font-size: 14px;
                color: #555;
            }

            .promo-actions {
                display: flex;
                gap: 10px;
            }

            .install-now-btn {
                flex: 1;
                background: #007bff;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }

            .install-later-btn {
                flex: 1;
                background: #f8f9fa;
                color: #6c757d;
                border: 1px solid #dee2e6;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
            }

            .pwa-success-message {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
                z-index: 10001;
                animation: successSlideIn 0.5s ease-out;
                max-width: 350px;
            }

            .success-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .success-icon {
                font-size: 20px;
            }

            .offline-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ffc107;
                color: #212529;
                padding: 10px;
                text-align: center;
                z-index: 10002;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }

            .offline-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-weight: 500;
            }

            .offline-details {
                font-size: 12px;
                opacity: 0.8;
                margin-left: 10px;
            }

            .pwa-update-prompt {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                max-width: 300px;
                overflow: hidden;
                animation: updateSlideIn 0.5s ease-out;
            }

            .update-content {
                padding: 0;
            }

            .update-header {
                background: #17a2b8;
                color: white;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .update-body {
                padding: 15px 20px;
            }

            .update-body p {
                margin: 0 0 15px 0;
                font-size: 14px;
                color: #555;
            }

            .update-actions {
                display: flex;
                gap: 8px;
            }

            .update-now-btn {
                flex: 1;
                background: #17a2b8;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 13px;
                cursor: pointer;
            }

            .update-later-btn {
                flex: 1;
                background: #f8f9fa;
                color: #6c757d;
                border: 1px solid #dee2e6;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 13px;
                cursor: pointer;
            }

            /* Анимации */
            @keyframes promoSlideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }

            @keyframes successSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes updateSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(100%);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Стили для установленного PWA */
            .pwa-installed .container {
                padding-top: 20px;
            }

            /* Офлайн режим */
            .offline-mode .online-only {
                opacity: 0.5;
                pointer-events: none;
            }

            .offline-mode .offline-indicator {
                display: block !important;
            }

            @media (max-width: 768px) {
                .pwa-install-promo {
                    width: 95%;
                    margin: 0 2.5%;
                }

                .pwa-install-btn {
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Публичные методы
    getPWAStatus() {
        return {
            isInstallable: this.isInstallable,
            isInstalled: this.isInstalled,
            serviceWorkerRegistered: !!this.serviceWorker,
            notificationPermission: this.notificationPermission,
            isOnline: navigator.onLine
        };
    }

    async clearOfflineData() {
        try {
            const db = await this.initIndexedDB();
            const transaction = db.transaction(['calculations', 'pendingOperations'], 'readwrite');

            await transaction.objectStore('calculations').clear();
            await transaction.objectStore('pendingOperations').clear();

            console.log('🗑️ Офлайн данные очищены');
        } catch (error) {
            console.error('Ошибка очистки офлайн данных:', error);
        }
    }

    async exportOfflineData() {
        const calculations = await this.getOfflineCalculations();

        const exportData = {
            timestamp: new Date().toISOString(),
            calculations: calculations,
            metadata: {
                totalCalculations: calculations.length,
                offlineCalculations: calculations.filter(c => c.offline).length,
                unsyncedCalculations: calculations.filter(c => !c.synced).length
            }
        };

        return exportData;
    }
}

// Создаем экземпляр PWA Manager
const pwaManager = new PWAManager();

// Добавляем в глобальную область
window.M2PWA = pwaManager;

// Информируем систему о загрузке модуля
if (window.M2EnhancementsLoader) {
    window.M2EnhancementsLoader.registerModule('pwa-manager', pwaManager);
}

// Экспортируем для использования в Service Worker
if (typeof self !== 'undefined' && self.importScripts) {
    self.M2PWA = pwaManager;
}

console.log('📱 PWA Manager загружен:', pwaManager.getPWAStatus());