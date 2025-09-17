/**
 * M2 Calculators External API
 * Публичный API для интеграции с внешними системами
 */

class M2CalculatorAPI {
    constructor() {
        this.version = '1.0.0';
        this.apiKey = null;
        this.endpoints = new Map();
        this.callbacks = new Map();
        this.rateLimiter = new Map();

        this.init();
    }

    init() {
        this.setupEndpoints();
        this.exposeGlobalAPI();
        this.setupCORS();
        this.initializeRateLimiting();
    }

    setupEndpoints() {
        // Регистрируем доступные эндпоинты API
        this.registerEndpoint('calculate', {
            description: 'Выполнить расчет с заданными параметрами',
            method: 'POST',
            parameters: {
                calculatorType: { type: 'string', required: true, enum: ['mortgage', 'rental', 'affordability'] },
                parameters: { type: 'object', required: true },
                options: { type: 'object', required: false }
            },
            handler: this.handleCalculate.bind(this)
        });

        this.registerEndpoint('getTemplates', {
            description: 'Получить список доступных шаблонов расчетов',
            method: 'GET',
            parameters: {
                type: { type: 'string', required: false }
            },
            handler: this.handleGetTemplates.bind(this)
        });

        this.registerEndpoint('exportResult', {
            description: 'Экспортировать результат расчета в различных форматах',
            method: 'POST',
            parameters: {
                result: { type: 'object', required: true },
                format: { type: 'string', required: true, enum: ['pdf', 'excel', 'json'] },
                options: { type: 'object', required: false }
            },
            handler: this.handleExportResult.bind(this)
        });

        this.registerEndpoint('getMetrics', {
            description: 'Получить метрики использования',
            method: 'GET',
            parameters: {
                period: { type: 'string', required: false, enum: ['hour', 'day', 'week', 'month'] }
            },
            handler: this.handleGetMetrics.bind(this)
        });

        this.registerEndpoint('validateParameters', {
            description: 'Валидация параметров расчета',
            method: 'POST',
            parameters: {
                calculatorType: { type: 'string', required: true },
                parameters: { type: 'object', required: true }
            },
            handler: this.handleValidateParameters.bind(this)
        });
    }

    exposeGlobalAPI() {
        // Создаем глобальный объект API
        window.M2API = {
            version: this.version,

            // Основные методы API
            calculate: this.calculate.bind(this),
            getTemplates: this.getTemplates.bind(this),
            exportResult: this.exportResult.bind(this),
            validateParameters: this.validateParameters.bind(this),
            getMetrics: this.getMetrics.bind(this),

            // Утилиты
            formatCurrency: this.formatCurrency.bind(this),
            formatPercent: this.formatPercent.bind(this),

            // Управление подписками
            subscribe: this.subscribe.bind(this),
            unsubscribe: this.unsubscribe.bind(this),

            // Конфигурация
            setApiKey: this.setApiKey.bind(this),
            configure: this.configure.bind(this),

            // Информация
            getVersion: () => this.version,
            getEndpoints: this.getEndpoints.bind(this),
            getStatus: this.getStatus.bind(this)
        };

        // Создаем REST-like интерфейс
        this.setupRESTInterface();
    }

    setupRESTInterface() {
        // Симулируем REST API через window.postMessage
        window.addEventListener('message', (event) => {
            if (event.data.type === 'M2_API_REQUEST') {
                this.handleAPIRequest(event);
            }
        });
    }

    setupCORS() {
        // Настройка CORS для внешних интеграций
        this.allowedOrigins = [
            window.location.origin,
            'https://m2-calculators.vercel.app',
            'https://your-domain.com' // Добавить реальные домены
        ];
    }

    initializeRateLimiting() {
        // Ограничения по умолчанию: 100 запросов в минуту на IP
        this.defaultRateLimit = {
            maxRequests: 100,
            windowMs: 60000, // 1 минута
            requests: new Map()
        };
    }

    // Основные методы API
    async calculate(calculatorType, parameters, options = {}) {
        try {
            if (!this.checkRateLimit()) {
                throw new Error('Rate limit exceeded');
            }

            // Валидация параметров
            const validation = await this.validateParameters(calculatorType, parameters);
            if (!validation.valid) {
                throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
            }

            let result;

            switch (calculatorType) {
                case 'mortgage':
                    result = await this.calculateMortgage(parameters, options);
                    break;
                case 'rental':
                    result = await this.calculateRental(parameters, options);
                    break;
                case 'affordability':
                    result = await this.calculateAffordability(parameters, options);
                    break;
                default:
                    throw new Error(`Unknown calculator type: ${calculatorType}`);
            }

            // Логирование использования API
            this.logAPIUsage('calculate', calculatorType, parameters);

            return {
                success: true,
                data: result,
                metadata: {
                    calculatorType,
                    timestamp: new Date().toISOString(),
                    version: this.version
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async calculateMortgage(parameters, options) {
        const {
            propertyPrice,
            downPayment,
            interestRate,
            loanTerm,
            paymentType = 'annuity'
        } = parameters;

        const loanAmount = propertyPrice - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const totalPayments = loanTerm * 12;

        let monthlyPayment;
        if (paymentType === 'annuity') {
            monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
                           (Math.pow(1 + monthlyRate, totalPayments) - 1);
        } else {
            // Дифференцированный платеж
            monthlyPayment = loanAmount / totalPayments + loanAmount * monthlyRate;
        }

        const totalPayment = monthlyPayment * totalPayments;
        const overpayment = totalPayment - loanAmount;

        return {
            monthlyPayment: Math.round(monthlyPayment),
            totalPayment: Math.round(totalPayment),
            overpayment: Math.round(overpayment),
            loanAmount: Math.round(loanAmount),
            overpaymentPercentage: Math.round((overpayment / loanAmount) * 100 * 100) / 100
        };
    }

    async calculateRental(parameters, options) {
        const {
            propertyPrice,
            monthlyRent,
            managementFee = 0,
            repairFund = 0.05,
            vacancy = 0.05,
            propertyTax = 0.001,
            insurance = 0.002
        } = parameters;

        const grossRent = monthlyRent * 12;
        const managementCost = grossRent * managementFee;
        const repairCost = propertyPrice * repairFund;
        const vacancyCost = grossRent * vacancy;
        const taxCost = propertyPrice * propertyTax;
        const insuranceCost = propertyPrice * insurance;

        const totalExpenses = managementCost + repairCost + vacancyCost + taxCost + insuranceCost;
        const netRent = grossRent - totalExpenses;
        const yieldPercent = (netRent / propertyPrice) * 100;
        const capRate = yieldPercent;

        return {
            grossRent: Math.round(grossRent),
            netRent: Math.round(netRent),
            totalExpenses: Math.round(totalExpenses),
            yieldPercent: Math.round(yieldPercent * 100) / 100,
            capRate: Math.round(capRate * 100) / 100,
            monthlyNetIncome: Math.round(netRent / 12)
        };
    }

    async calculateAffordability(parameters, options) {
        const {
            monthlyIncome,
            monthlyExpenses = 0,
            interestRate,
            loanTerm,
            downPaymentPercent = 20,
            debtToIncomeRatio = 0.43
        } = parameters;

        const availableIncome = monthlyIncome - monthlyExpenses;
        const maxPayment = availableIncome * debtToIncomeRatio;

        const monthlyRate = interestRate / 100 / 12;
        const totalPayments = loanTerm * 12;

        const maxLoanAmount = maxPayment * (Math.pow(1 + monthlyRate, totalPayments) - 1) /
                             (monthlyRate * Math.pow(1 + monthlyRate, totalPayments));

        const downPaymentAmount = maxLoanAmount * (downPaymentPercent / 100) / (1 - downPaymentPercent / 100);
        const maxPropertyPrice = maxLoanAmount + downPaymentAmount;

        return {
            maxPropertyPrice: Math.round(maxPropertyPrice),
            maxLoanAmount: Math.round(maxLoanAmount),
            maxMonthlyPayment: Math.round(maxPayment),
            requiredDownPayment: Math.round(downPaymentAmount),
            availableIncome: Math.round(availableIncome)
        };
    }

    async getTemplates(type = null) {
        if (!window.M2Templates) {
            return {
                success: false,
                error: 'Templates module not loaded'
            };
        }

        try {
            const templates = window.M2Templates.getTemplates();
            const filteredTemplates = type ?
                templates.filter(t => t.calculatorType === type) :
                templates;

            return {
                success: true,
                data: filteredTemplates,
                count: filteredTemplates.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async exportResult(result, format, options = {}) {
        try {
            let exportData;

            switch (format) {
                case 'pdf':
                    if (window.M2PDFExporter) {
                        exportData = await window.M2PDFExporter.export(result, options);
                    } else {
                        throw new Error('PDF export module not available');
                    }
                    break;

                case 'excel':
                    if (window.M2ExcelExporter) {
                        exportData = await window.M2ExcelExporter.export(result, options);
                    } else {
                        throw new Error('Excel export module not available');
                    }
                    break;

                case 'json':
                    exportData = JSON.stringify(result, null, 2);
                    break;

                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            return {
                success: true,
                data: exportData,
                format: format,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async validateParameters(calculatorType, parameters) {
        const validationRules = this.getValidationRules(calculatorType);
        const errors = [];

        for (const [field, rules] of Object.entries(validationRules)) {
            const value = parameters[field];

            // Проверка обязательности
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            // Проверка типа
            if (value !== undefined && rules.type && typeof value !== rules.type) {
                errors.push(`${field} must be of type ${rules.type}`);
                continue;
            }

            // Проверка диапазона
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
            }

            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${field} must not exceed ${rules.max}`);
            }

            // Проверка допустимых значений
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    getValidationRules(calculatorType) {
        const commonRules = {
            propertyPrice: { type: 'number', required: true, min: 100000, max: 1000000000 },
            interestRate: { type: 'number', required: true, min: 0.1, max: 50 },
            loanTerm: { type: 'number', required: true, min: 1, max: 50 }
        };

        const typeSpecificRules = {
            mortgage: {
                ...commonRules,
                downPayment: { type: 'number', required: true, min: 0 },
                paymentType: { type: 'string', required: false, enum: ['annuity', 'differential'] }
            },
            rental: {
                ...commonRules,
                monthlyRent: { type: 'number', required: true, min: 1000, max: 10000000 },
                managementFee: { type: 'number', required: false, min: 0, max: 1 },
                vacancy: { type: 'number', required: false, min: 0, max: 1 }
            },
            affordability: {
                monthlyIncome: { type: 'number', required: true, min: 10000, max: 10000000 },
                monthlyExpenses: { type: 'number', required: false, min: 0 },
                interestRate: { type: 'number', required: true, min: 0.1, max: 50 },
                loanTerm: { type: 'number', required: true, min: 1, max: 50 },
                downPaymentPercent: { type: 'number', required: false, min: 0, max: 100 }
            }
        };

        return typeSpecificRules[calculatorType] || {};
    }

    async getMetrics(period = 'day') {
        if (!window.M2Analytics) {
            return {
                success: false,
                error: 'Analytics module not loaded'
            };
        }

        try {
            const metrics = window.M2Analytics.getMetrics();
            const analyticsLog = window.M2Analytics.getAnalyticsLog();

            // Фильтруем по периоду
            const periodMs = this.getPeriodMs(period);
            const since = Date.now() - periodMs;

            const filteredLog = analyticsLog.filter(entry =>
                new Date(entry.timestamp).getTime() >= since
            );

            return {
                success: true,
                data: {
                    period: period,
                    currentSession: metrics,
                    historicalData: filteredLog,
                    summary: this.summarizeMetrics(filteredLog)
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Вспомогательные методы
    registerEndpoint(name, config) {
        this.endpoints.set(name, config);
    }

    checkRateLimit(clientId = 'default') {
        const now = Date.now();
        const limit = this.rateLimiter.get(clientId) || {
            requests: [],
            windowStart: now
        };

        // Очищаем старые запросы
        const windowStart = now - this.defaultRateLimit.windowMs;
        limit.requests = limit.requests.filter(time => time >= windowStart);

        // Проверяем лимит
        if (limit.requests.length >= this.defaultRateLimit.maxRequests) {
            return false;
        }

        // Добавляем текущий запрос
        limit.requests.push(now);
        this.rateLimiter.set(clientId, limit);

        return true;
    }

    logAPIUsage(method, type, parameters) {
        if (window.M2Analytics) {
            window.M2Analytics.addEvent({
                type: 'api_usage',
                timestamp: Date.now(),
                method: method,
                calculatorType: type,
                parameterCount: Object.keys(parameters).length
            });
        }
    }

    getPeriodMs(period) {
        const periods = {
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000
        };
        return periods[period] || periods.day;
    }

    summarizeMetrics(logs) {
        const summary = {
            totalSessions: logs.length,
            totalCalculations: 0,
            totalErrors: 0,
            averageSessionTime: 0,
            popularCalculators: {}
        };

        logs.forEach(log => {
            if (log.events) {
                const calculations = log.events.filter(e => e.type === 'calculation');
                const errors = log.events.filter(e => e.type === 'error');

                summary.totalCalculations += calculations.length;
                summary.totalErrors += errors.length;

                // Подсчет популярности калькуляторов
                calculations.forEach(calc => {
                    const type = calc.calculatorType;
                    summary.popularCalculators[type] = (summary.popularCalculators[type] || 0) + 1;
                });
            }
        });

        return summary;
    }

    formatCurrency(amount, currency = 'RUB') {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatPercent(value) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value / 100);
    }

    // Система подписок и событий
    subscribe(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, new Set());
        }
        this.callbacks.get(event).add(callback);

        return () => {
            this.callbacks.get(event)?.delete(callback);
        };
    }

    unsubscribe(event, callback) {
        this.callbacks.get(event)?.delete(callback);
    }

    emit(event, data) {
        const callbacks = this.callbacks.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in API callback:', error);
                }
            });
        }
    }

    // Конфигурация API
    setApiKey(key) {
        this.apiKey = key;
    }

    configure(config) {
        Object.assign(this.config, config);
    }

    // Информационные методы
    getEndpoints() {
        const endpoints = {};
        this.endpoints.forEach((config, name) => {
            endpoints[name] = {
                description: config.description,
                method: config.method,
                parameters: config.parameters
            };
        });
        return endpoints;
    }

    getStatus() {
        return {
            version: this.version,
            loaded: true,
            endpoints: this.endpoints.size,
            rateLimit: this.defaultRateLimit,
            modules: {
                analytics: !!window.M2Analytics,
                templates: !!window.M2Templates,
                pdfExport: !!window.M2PDFExporter,
                excelExport: !!window.M2ExcelExporter
            }
        };
    }

    // Обработчик API запросов
    async handleAPIRequest(event) {
        const { endpoint, parameters, requestId } = event.data;

        try {
            const endpointConfig = this.endpoints.get(endpoint);

            if (!endpointConfig) {
                throw new Error(`Unknown endpoint: ${endpoint}`);
            }

            const result = await endpointConfig.handler(parameters);

            event.source.postMessage({
                type: 'M2_API_RESPONSE',
                requestId: requestId,
                success: true,
                data: result
            }, event.origin);

        } catch (error) {
            event.source.postMessage({
                type: 'M2_API_RESPONSE',
                requestId: requestId,
                success: false,
                error: error.message
            }, event.origin);
        }
    }

    // Обработчики эндпоинтов
    async handleCalculate(params) {
        return await this.calculate(params.calculatorType, params.parameters, params.options);
    }

    async handleGetTemplates(params) {
        return await this.getTemplates(params.type);
    }

    async handleExportResult(params) {
        return await this.exportResult(params.result, params.format, params.options);
    }

    async handleGetMetrics(params) {
        return await this.getMetrics(params.period);
    }

    async handleValidateParameters(params) {
        return await this.validateParameters(params.calculatorType, params.parameters);
    }
}

// Создаем и инициализируем API
const m2API = new M2CalculatorAPI();

// Информируем систему о загрузке модуля
if (window.M2EnhancementsLoader) {
    window.M2EnhancementsLoader.registerModule('external-api', m2API);
}

// Показываем информацию о доступности API
console.log('🚀 M2 Calculator API готов к использованию!');
console.log('Документация: window.M2API.getEndpoints()');
console.log('Статус: window.M2API.getStatus()');

// Пример использования в комментариях
/*
// Примеры использования M2 Calculator API:

// 1. Расчет ипотеки
const mortgageResult = await window.M2API.calculate('mortgage', {
    propertyPrice: 5000000,
    downPayment: 1000000,
    interestRate: 8.5,
    loanTerm: 20,
    paymentType: 'annuity'
});
console.log(mortgageResult);

// 2. Получение шаблонов
const templates = await window.M2API.getTemplates('mortgage');
console.log(templates);

// 3. Валидация параметров
const validation = await window.M2API.validateParameters('mortgage', {
    propertyPrice: 5000000,
    downPayment: 1000000
    // отсутствует обязательный interestRate
});
console.log(validation); // покажет ошибку валидации

// 4. Подписка на события
window.M2API.subscribe('calculationCompleted', (data) => {
    console.log('Расчет завершен:', data);
});

// 5. Экспорт результата
const exportResult = await window.M2API.exportResult(mortgageResult.data, 'json');
console.log(exportResult);
*/