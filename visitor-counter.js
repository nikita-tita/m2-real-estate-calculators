// Система отслеживания уникальных посетителей M2 Calculator
// Использует localStorage и fingerprinting для идентификации

class VisitorCounter {
    constructor() {
        this.storageKey = 'm2-visitor-data';
        this.globalCounterKey = 'm2-global-visitors';
        this.sessionKey = 'm2-session-data';
        this.visitorId = null;
        this.init();
    }

    init() {
        this.generateVisitorFingerprint();
        this.trackVisitor();
        this.trackSession();
        this.cleanOldData();
    }

    // Создание уникального отпечатка браузера
    generateVisitorFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('M2 Calculator fingerprint', 2, 2);

        const fingerprint = {
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            userAgent: navigator.userAgent.substring(0, 100), // Обрезаем для экономии места
            canvas: canvas.toDataURL().substring(0, 100),
            memory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage
        };

        // Создаем хеш от отпечатка
        this.visitorId = this.generateHash(JSON.stringify(fingerprint));
    }

    // Простая хеш-функция
    generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Конвертируем в 32-битное число
        }
        return Math.abs(hash).toString(16);
    }

    // Отслеживание посетителя
    trackVisitor() {
        try {
            const now = Date.now();
            const today = new Date().toDateString();

            // Проверяем, есть ли уже данные о посетителе
            let visitorData = this.getStoredVisitorData();

            if (!visitorData) {
                // Новый посетитель
                visitorData = {
                    id: this.visitorId,
                    firstVisit: now,
                    lastVisit: now,
                    visitCount: 1,
                    dailyVisits: { [today]: 1 },
                    calculatorsUsed: new Set(),
                    totalSessions: 1,
                    totalTimeSpent: 0
                };

                this.incrementGlobalCounter();
            } else {
                // Возвращающийся посетитель
                visitorData.lastVisit = now;
                visitorData.visitCount++;
                visitorData.dailyVisits[today] = (visitorData.dailyVisits[today] || 0) + 1;

                // Очищаем старые дневные данные (храним только последние 30 дней)
                this.cleanOldDailyData(visitorData.dailyVisits);
            }

            this.saveVisitorData(visitorData);

        } catch (error) {
            console.warn('Error tracking visitor:', error);
        }
    }

    // Отслеживание сессии
    trackSession() {
        try {
            const sessionData = {
                id: this.generateHash(Date.now().toString()),
                startTime: Date.now(),
                visitorId: this.visitorId,
                pageViews: 1,
                calculationsPerformed: 0,
                featuresUsed: new Set()
            };

            sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData, this.setToArrayReplacer));

            // Отслеживаем события страницы
            this.trackPageEvents();

        } catch (error) {
            console.warn('Error tracking session:', error);
        }
    }

    // Отслеживание событий на странице
    trackPageEvents() {
        // Отслеживание использования калькулятора
        document.addEventListener('calculationPerformed', () => {
            this.incrementSessionCalculations();
            this.addUsedCalculator(this.getCalculatorType());
        });

        // Отслеживание использования функций
        document.addEventListener('featureUsed', (event) => {
            this.addUsedFeature(event.detail.feature);
        });

        // Отслеживание времени на странице
        window.addEventListener('beforeunload', () => {
            this.updateSessionDuration();
        });

        // Отслеживание видимости страницы
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.updateSessionDuration();
            }
        });
    }

    // Получение типа калькулятора по URL
    getCalculatorType() {
        const path = window.location.pathname;
        if (path.includes('mortgage')) return 'mortgage';
        if (path.includes('rental') || path.includes('profitability')) return 'rental';
        if (path.includes('affordability')) return 'affordability';
        if (path.includes('airbnb')) return 'airbnb';
        if (path.includes('rent_vs_buy')) return 'rent_vs_buy';
        if (path.includes('new_vs_secondary')) return 'new_vs_secondary';
        if (path.includes('compound')) return 'compound';
        if (path.includes('prepayment')) return 'prepayment';
        if (path.includes('advanced')) return 'advanced';
        return 'unknown';
    }

    // Увеличение счетчика расчетов в сессии
    incrementSessionCalculations() {
        try {
            const sessionData = this.getSessionData();
            if (sessionData) {
                sessionData.calculationsPerformed++;
                sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData, this.setToArrayReplacer));
            }
        } catch (error) {
            console.warn('Error incrementing session calculations:', error);
        }
    }

    // Добавление использованного калькулятора
    addUsedCalculator(calculatorType) {
        try {
            const visitorData = this.getStoredVisitorData();
            if (visitorData) {
                visitorData.calculatorsUsed.add(calculatorType);
                this.saveVisitorData(visitorData);
            }
        } catch (error) {
            console.warn('Error adding used calculator:', error);
        }
    }

    // Добавление использованной функции
    addUsedFeature(feature) {
        try {
            const sessionData = this.getSessionData();
            if (sessionData) {
                sessionData.featuresUsed.add(feature);
                sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData, this.setToArrayReplacer));
            }
        } catch (error) {
            console.warn('Error adding used feature:', error);
        }
    }

    // Обновление продолжительности сессии
    updateSessionDuration() {
        try {
            const sessionData = this.getSessionData();
            if (sessionData) {
                const duration = Date.now() - sessionData.startTime;

                // Обновляем общее время посетителя
                const visitorData = this.getStoredVisitorData();
                if (visitorData) {
                    visitorData.totalTimeSpent += duration;
                    this.saveVisitorData(visitorData);
                }
            }
        } catch (error) {
            console.warn('Error updating session duration:', error);
        }
    }

    // Увеличение глобального счетчика
    incrementGlobalCounter() {
        try {
            let globalData = this.getGlobalCounterData();

            if (!globalData) {
                globalData = {
                    totalUniqueVisitors: 1,
                    dailyVisitors: {},
                    monthlyVisitors: {},
                    lastUpdated: Date.now()
                };
            } else {
                globalData.totalUniqueVisitors++;
            }

            const today = new Date().toDateString();
            const month = new Date().toISOString().slice(0, 7); // YYYY-MM

            globalData.dailyVisitors[today] = (globalData.dailyVisitors[today] || 0) + 1;
            globalData.monthlyVisitors[month] = (globalData.monthlyVisitors[month] || 0) + 1;
            globalData.lastUpdated = Date.now();

            // Очищаем старые данные
            this.cleanOldGlobalData(globalData);

            localStorage.setItem(this.globalCounterKey, JSON.stringify(globalData));

        } catch (error) {
            console.warn('Error incrementing global counter:', error);
        }
    }

    // Очистка старых дневных данных (оставляем последние 30 дней)
    cleanOldDailyData(dailyData) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        Object.keys(dailyData).forEach(date => {
            if (new Date(date).getTime() < thirtyDaysAgo) {
                delete dailyData[date];
            }
        });
    }

    // Очистка старых глобальных данных
    cleanOldGlobalData(globalData) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);

        // Очищаем дневные данные старше 30 дней
        Object.keys(globalData.dailyVisitors).forEach(date => {
            if (new Date(date).getTime() < thirtyDaysAgo) {
                delete globalData.dailyVisitors[date];
            }
        });

        // Очищаем месячные данные старше 6 месяцев
        Object.keys(globalData.monthlyVisitors).forEach(month => {
            if (new Date(month + '-01').getTime() < sixMonthsAgo) {
                delete globalData.monthlyVisitors[month];
            }
        });
    }

    // Очистка старых данных
    cleanOldData() {
        try {
            // Очищаем данные посетителей старше 1 года
            const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storageKey)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (data && data.lastVisit < oneYearAgo) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        // Удаляем поврежденные данные
                        localStorage.removeItem(key);
                    }
                }
            }
        } catch (error) {
            console.warn('Error cleaning old data:', error);
        }
    }

    // Получение сохраненных данных посетителя
    getStoredVisitorData() {
        try {
            const key = `${this.storageKey}-${this.visitorId}`;
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data, this.arrayToSetReviver);
                return parsed;
            }
        } catch (error) {
            console.warn('Error getting stored visitor data:', error);
        }
        return null;
    }

    // Сохранение данных посетителя
    saveVisitorData(data) {
        try {
            const key = `${this.storageKey}-${this.visitorId}`;
            localStorage.setItem(key, JSON.stringify(data, this.setToArrayReplacer));
        } catch (error) {
            console.warn('Error saving visitor data:', error);
        }
    }

    // Получение данных сессии
    getSessionData() {
        try {
            const data = sessionStorage.getItem(this.sessionKey);
            if (data) {
                return JSON.parse(data, this.arrayToSetReviver);
            }
        } catch (error) {
            console.warn('Error getting session data:', error);
        }
        return null;
    }

    // Получение глобальных данных счетчика
    getGlobalCounterData() {
        try {
            const data = localStorage.getItem(this.globalCounterKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn('Error getting global counter data:', error);
        }
        return null;
    }

    // Преобразование Set в Array для JSON
    setToArrayReplacer(key, value) {
        if (value instanceof Set) {
            return Array.from(value);
        }
        return value;
    }

    // Преобразование Array обратно в Set
    arrayToSetReviver(key, value) {
        if (key === 'calculatorsUsed' || key === 'featuresUsed') {
            return new Set(value);
        }
        return value;
    }

    // Получение статистики для отображения
    getVisitorStats() {
        const visitorData = this.getStoredVisitorData();
        const globalData = this.getGlobalCounterData();
        const sessionData = this.getSessionData();

        return {
            visitor: {
                id: this.visitorId.substring(0, 8),
                isNewVisitor: visitorData ? visitorData.visitCount === 1 : true,
                visitCount: visitorData ? visitorData.visitCount : 1,
                firstVisit: visitorData ? new Date(visitorData.firstVisit) : new Date(),
                calculatorsUsed: visitorData ? Array.from(visitorData.calculatorsUsed) : [],
                totalTimeSpent: visitorData ? visitorData.totalTimeSpent : 0
            },
            global: {
                totalUniqueVisitors: globalData ? globalData.totalUniqueVisitors : 1,
                dailyVisitors: globalData ? globalData.dailyVisitors : {},
                monthlyVisitors: globalData ? globalData.monthlyVisitors : {},
                todayVisitors: globalData ? (globalData.dailyVisitors[new Date().toDateString()] || 0) : 1
            },
            session: {
                id: sessionData ? sessionData.id.substring(0, 8) : 'unknown',
                startTime: sessionData ? new Date(sessionData.startTime) : new Date(),
                calculationsPerformed: sessionData ? sessionData.calculationsPerformed : 0,
                featuresUsed: sessionData ? Array.from(sessionData.featuresUsed) : []
            }
        };
    }

    // Получение трендов посещений
    getVisitorTrends() {
        const globalData = this.getGlobalCounterData();
        if (!globalData) return null;

        const last7Days = [];
        const last30Days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            last7Days.push({
                date: dateStr,
                visitors: globalData.dailyVisitors[dateStr] || 0
            });
        }

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            last30Days.push({
                date: dateStr,
                visitors: globalData.dailyVisitors[dateStr] || 0
            });
        }

        return {
            last7Days,
            last30Days,
            monthlyTrends: globalData.monthlyVisitors
        };
    }

    // Экспорт статистики
    exportStats() {
        const stats = this.getVisitorStats();
        const trends = this.getVisitorTrends();

        return {
            ...stats,
            trends,
            exportDate: new Date().toISOString(),
            calculatorType: this.getCalculatorType()
        };
    }
}

// Глобальная инициализация
window.M2VisitorCounter = new VisitorCounter();

// Событие для уведомления о загрузке модуля
document.dispatchEvent(new CustomEvent('moduleLoaded', {
    detail: { name: 'M2VisitorCounter' }
}));

console.log('📊 M2 Visitor Counter загружен');