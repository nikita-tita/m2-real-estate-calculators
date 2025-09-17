/**
 * Scenario Comparison - система сравнения сценариев для калькуляторов М2
 * Позволяет пользователям сравнивать до 3 различных сценариев расчетов
 */

class ScenarioComparison {
    constructor() {
        this.scenarios = new Map();
        this.maxScenarios = 3;
        this.activeComparison = null;
        this.comparisonMode = false;
        this.storage = new Map();
    }

    /**
     * Инициализация системы сравнения сценариев
     */
    init() {
        this.loadSavedScenarios();
        this.setupEventListeners();
        this.initializeUI();

        console.log('📊 Система сравнения сценариев инициализирована');
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Кнопка "Сравнить сценарии"
        document.addEventListener('click', (e) => {
            if (e.target.matches('.compare-scenarios-btn')) {
                this.toggleComparisonMode();
            }

            if (e.target.matches('.add-scenario-btn')) {
                this.addCurrentScenario();
            }

            if (e.target.matches('.remove-scenario-btn')) {
                const scenarioId = e.target.dataset.scenarioId;
                this.removeScenario(scenarioId);
            }

            if (e.target.matches('.clear-scenarios-btn')) {
                this.clearAllScenarios();
            }

            if (e.target.matches('.export-comparison-btn')) {
                this.exportComparison();
            }
        });

        // Автосохранение при изменении параметров
        document.addEventListener('input', this.debounce((e) => {
            if (this.comparisonMode && e.target.matches('input[type="number"], input[type="range"], select')) {
                this.updateCurrentScenario();
            }
        }, 300));
    }

    /**
     * Инициализация UI элементов
     */
    initializeUI() {
        // Добавляем кнопку сравнения сценариев в каждый калькулятор
        const calculators = document.querySelectorAll('.calculator-container');
        calculators.forEach(calc => this.injectComparisonUI(calc));
    }

    /**
     * Внедрение UI для сравнения в калькулятор
     */
    injectComparisonUI(calculatorContainer) {
        const comparisonPanel = document.createElement('div');
        comparisonPanel.className = 'scenario-comparison-panel';
        comparisonPanel.innerHTML = `
            <div class="comparison-header">
                <h3>📊 Сравнение сценариев</h3>
                <button class="compare-scenarios-btn" title="Включить режим сравнения">
                    <i class="feather-icon" data-feather="compare"></i>
                    Сравнить варианты
                </button>
            </div>

            <div class="comparison-controls" style="display: none;">
                <div class="current-scenario">
                    <label>Название текущего сценария:</label>
                    <input type="text" id="scenario-name" placeholder="Например: Базовый вариант" maxlength="50">
                    <button class="add-scenario-btn">
                        <i class="feather-icon" data-feather="plus"></i>
                        Добавить к сравнению
                    </button>
                </div>

                <div class="scenarios-list">
                    <h4>Сценарии для сравнения (${this.scenarios.size}/${this.maxScenarios}):</h4>
                    <div class="scenarios-container"></div>
                </div>

                <div class="comparison-actions">
                    <button class="export-comparison-btn" disabled>
                        <i class="feather-icon" data-feather="download"></i>
                        Экспорт сравнения
                    </button>
                    <button class="clear-scenarios-btn">
                        <i class="feather-icon" data-feather="trash-2"></i>
                        Очистить все
                    </button>
                </div>
            </div>

            <div class="comparison-results" style="display: none;"></div>
        `;

        // Вставляем панель после блока результатов
        const resultsSection = calculatorContainer.querySelector('.results-section, .calculation-results');
        if (resultsSection) {
            resultsSection.after(comparisonPanel);
        } else {
            calculatorContainer.appendChild(comparisonPanel);
        }

        // Инициализируем иконки Feather
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Переключение режима сравнения
     */
    toggleComparisonMode() {
        this.comparisonMode = !this.comparisonMode;

        const controls = document.querySelector('.comparison-controls');
        const results = document.querySelector('.comparison-results');
        const button = document.querySelector('.compare-scenarios-btn');

        if (this.comparisonMode) {
            controls.style.display = 'block';
            button.innerHTML = '<i class="feather-icon" data-feather="x"></i> Закрыть сравнение';
            button.classList.add('active');
            this.updateScenariosDisplay();

            if (this.scenarios.size >= 2) {
                results.style.display = 'block';
                this.generateComparisonTable();
            }
        } else {
            controls.style.display = 'none';
            results.style.display = 'none';
            button.innerHTML = '<i class="feather-icon" data-feather="compare"></i> Сравнить варианты';
            button.classList.remove('active');
        }

        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Добавление текущего сценария к сравнению
     */
    async addCurrentScenario() {
        if (this.scenarios.size >= this.maxScenarios) {
            this.showNotification(`Максимум ${this.maxScenarios} сценария для сравнения`, 'warning');
            return;
        }

        const nameInput = document.querySelector('#scenario-name');
        const scenarioName = nameInput.value.trim() || `Сценарий ${this.scenarios.size + 1}`;

        // Собираем текущие параметры калькулятора
        const currentParams = this.getCurrentCalculatorParams();
        if (!currentParams || Object.keys(currentParams).length === 0) {
            this.showNotification('Заполните параметры для создания сценария', 'error');
            return;
        }

        // Выполняем расчет для текущих параметров
        const results = await this.calculateScenarioResults(currentParams);

        const scenario = {
            id: this.generateScenarioId(),
            name: scenarioName,
            params: currentParams,
            results: results,
            createdAt: new Date().toISOString(),
            calculatorType: this.detectCalculatorType()
        };

        this.scenarios.set(scenario.id, scenario);
        this.saveScenarios();

        nameInput.value = '';
        this.updateScenariosDisplay();
        this.showNotification(`Сценарий "${scenarioName}" добавлен`, 'success');

        if (this.scenarios.size >= 2) {
            document.querySelector('.comparison-results').style.display = 'block';
            this.generateComparisonTable();
        }

        // Обновляем кнопку экспорта
        const exportBtn = document.querySelector('.export-comparison-btn');
        exportBtn.disabled = this.scenarios.size < 2;
    }

    /**
     * Получение текущих параметров калькулятора
     */
    getCurrentCalculatorParams() {
        const params = {};
        const form = document.querySelector('form, .calculator-form, .input-section');

        if (!form) return null;

        // Собираем все числовые поля, селекты и чекбоксы
        const inputs = form.querySelectorAll('input[type="number"], input[type="range"], select, input[type="checkbox"]');

        inputs.forEach(input => {
            if (input.id || input.name) {
                const key = input.id || input.name;

                if (input.type === 'checkbox') {
                    params[key] = input.checked;
                } else if (input.type === 'number' || input.type === 'range') {
                    params[key] = parseFloat(input.value) || 0;
                } else {
                    params[key] = input.value;
                }
            }
        });

        return params;
    }

    /**
     * Расчет результатов для сценария
     */
    async calculateScenarioResults(params) {
        const calculatorType = this.detectCalculatorType();

        try {
            // Вызываем функцию расчета соответствующего калькулятора
            switch (calculatorType) {
                case 'mortgage':
                    return this.calculateMortgageResults(params);
                case 'rental':
                    return this.calculateRentalResults(params);
                case 'rent-vs-buy':
                    return this.calculateRentVsBuyResults(params);
                case 'prepayment':
                    return this.calculatePrepaymentResults(params);
                default:
                    return this.calculateGenericResults(params);
            }
        } catch (error) {
            console.error('Ошибка расчета сценария:', error);
            return { error: 'Ошибка расчета' };
        }
    }

    /**
     * Расчет результатов ипотечного калькулятора
     */
    calculateMortgageResults(params) {
        const loanAmount = params.loanAmount || 0;
        const interestRate = params.interestRate || 0;
        const loanTerm = params.loanTerm || 0;

        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTerm * 12;

        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
                             / (Math.pow(1 + monthlyRate, numPayments) - 1);

        const totalPayment = monthlyPayment * numPayments;
        const totalInterest = totalPayment - loanAmount;

        return {
            monthlyPayment: Math.round(monthlyPayment),
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
            loanAmount: loanAmount,
            effectiveRate: ((totalPayment / loanAmount - 1) * 100 / loanTerm).toFixed(2)
        };
    }

    /**
     * Расчет результатов калькулятора доходности
     */
    calculateRentalResults(params) {
        const propertyPrice = params.propertyPrice || 0;
        const monthlyRent = params.monthlyRent || 0;
        const expenses = params.expenses || 0;

        const annualRent = monthlyRent * 12;
        const netAnnualIncome = annualRent - expenses;
        const grossYield = (annualRent / propertyPrice * 100).toFixed(2);
        const netYield = (netAnnualIncome / propertyPrice * 100).toFixed(2);

        return {
            grossYield: parseFloat(grossYield),
            netYield: parseFloat(netYield),
            monthlyNetIncome: Math.round(netAnnualIncome / 12),
            annualNetIncome: Math.round(netAnnualIncome),
            roi: parseFloat(netYield)
        };
    }

    /**
     * Универсальный расчет для других типов калькуляторов
     */
    calculateGenericResults(params) {
        // Базовые расчеты для неизвестных типов калькуляторов
        const results = {};

        Object.entries(params).forEach(([key, value]) => {
            if (typeof value === 'number' && value > 0) {
                results[key] = value;
            }
        });

        return results;
    }

    /**
     * Определение типа калькулятора
     */
    detectCalculatorType() {
        const url = window.location.pathname;

        if (url.includes('mortgage')) return 'mortgage';
        if (url.includes('rental')) return 'rental';
        if (url.includes('rent') && url.includes('buy')) return 'rent-vs-buy';
        if (url.includes('prepayment')) return 'prepayment';
        if (url.includes('affordability')) return 'affordability';
        if (url.includes('airbnb')) return 'airbnb';

        // Попробуем определить по заголовку страницы
        const title = document.title.toLowerCase();
        if (title.includes('ипотек')) return 'mortgage';
        if (title.includes('аренд')) return 'rental';

        return 'generic';
    }

    /**
     * Обновление отображения сценариев
     */
    updateScenariosDisplay() {
        const container = document.querySelector('.scenarios-container');
        if (!container) return;

        container.innerHTML = '';

        if (this.scenarios.size === 0) {
            container.innerHTML = '<p class="no-scenarios">Нет сохраненных сценариев</p>';
            return;
        }

        this.scenarios.forEach(scenario => {
            const scenarioCard = document.createElement('div');
            scenarioCard.className = 'scenario-card';
            scenarioCard.innerHTML = `
                <div class="scenario-header">
                    <h5>${scenario.name}</h5>
                    <button class="remove-scenario-btn" data-scenario-id="${scenario.id}" title="Удалить сценарий">
                        <i class="feather-icon" data-feather="x"></i>
                    </button>
                </div>
                <div class="scenario-summary">
                    ${this.generateScenarioSummary(scenario)}
                </div>
                <div class="scenario-meta">
                    Создан: ${new Date(scenario.createdAt).toLocaleDateString('ru-RU')}
                </div>
            `;

            container.appendChild(scenarioCard);
        });

        // Обновляем счетчик
        const header = document.querySelector('.scenarios-list h4');
        if (header) {
            header.textContent = `Сценарии для сравнения (${this.scenarios.size}/${this.maxScenarios}):`;
        }

        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Генерация краткого описания сценария
     */
    generateScenarioSummary(scenario) {
        const { params, results } = scenario;

        if (scenario.calculatorType === 'mortgage') {
            return `
                <div class="summary-item">Сумма кредита: ${this.formatNumber(params.loanAmount)} ₽</div>
                <div class="summary-item">Ставка: ${params.interestRate}%</div>
                <div class="summary-item">Ежемесячный платеж: ${this.formatNumber(results.monthlyPayment)} ₽</div>
            `;
        }

        if (scenario.calculatorType === 'rental') {
            return `
                <div class="summary-item">Стоимость: ${this.formatNumber(params.propertyPrice)} ₽</div>
                <div class="summary-item">Доходность: ${results.netYield}% годовых</div>
                <div class="summary-item">Доход в месяц: ${this.formatNumber(results.monthlyNetIncome)} ₽</div>
            `;
        }

        // Универсальное описание
        const key = Object.keys(results)[0];
        const value = results[key];
        return `<div class="summary-item">Основной результат: ${this.formatNumber(value)}</div>`;
    }

    /**
     * Генерация таблицы сравнения
     */
    generateComparisonTable() {
        const container = document.querySelector('.comparison-results');
        if (!container) return;

        const scenarios = Array.from(this.scenarios.values());
        if (scenarios.length < 2) return;

        const comparisonTable = this.buildComparisonTable(scenarios);
        const comparisonChart = this.buildComparisonChart(scenarios);

        container.innerHTML = `
            <h3>📊 Сравнительная таблица</h3>
            ${comparisonTable}
            <div class="comparison-insights">
                ${this.generateInsights(scenarios)}
            </div>
            ${comparisonChart}
        `;
    }

    /**
     * Построение таблицы сравнения
     */
    buildComparisonTable(scenarios) {
        const firstScenario = scenarios[0];
        const resultKeys = Object.keys(firstScenario.results);

        let tableHTML = `
            <div class="comparison-table-container">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Показатель</th>
                            ${scenarios.map(s => `<th>${s.name}</th>`).join('')}
                            <th>Лучший</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        resultKeys.forEach(key => {
            if (key === 'error') return;

            const values = scenarios.map(s => s.results[key] || 0);
            const bestIndex = this.findBestValueIndex(values, key);

            tableHTML += `
                <tr>
                    <td class="metric-name">${this.getMetricDisplayName(key)}</td>
                    ${values.map((value, index) => `
                        <td class="${index === bestIndex ? 'best-value' : ''}">
                            ${this.formatMetricValue(value, key)}
                        </td>
                    `).join('')}
                    <td class="best-indicator">
                        ${scenarios[bestIndex].name}
                        <span class="improvement">
                            ${this.calculateImprovement(values, bestIndex, key)}
                        </span>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        return tableHTML;
    }

    /**
     * Поиск индекса лучшего значения
     */
    findBestValueIndex(values, metricKey) {
        // Для некоторых метрик меньше = лучше
        const lowerIsBetter = ['totalInterest', 'monthlyPayment', 'expenses', 'totalPayment'];

        if (lowerIsBetter.includes(metricKey)) {
            return values.indexOf(Math.min(...values.filter(v => v > 0)));
        } else {
            return values.indexOf(Math.max(...values));
        }
    }

    /**
     * Расчет улучшения в процентах
     */
    calculateImprovement(values, bestIndex, metricKey) {
        const bestValue = values[bestIndex];
        const worstValue = metricKey.includes('Interest') || metricKey.includes('Payment')
            ? Math.max(...values)
            : Math.min(...values.filter(v => v > 0));

        if (bestValue === worstValue || worstValue === 0) return '';

        const improvement = Math.abs((bestValue - worstValue) / worstValue * 100);
        return improvement > 0.1 ? `+${improvement.toFixed(1)}%` : '';
    }

    /**
     * Генерация инсайтов сравнения
     */
    generateInsights(scenarios) {
        let insights = '<h4>💡 Ключевые выводы:</h4><ul class="insights-list">';

        // Анализируем основные метрики
        const firstScenario = scenarios[0];
        if (firstScenario.calculatorType === 'mortgage') {
            insights += this.getMortgageInsights(scenarios);
        } else if (firstScenario.calculatorType === 'rental') {
            insights += this.getRentalInsights(scenarios);
        } else {
            insights += this.getGenericInsights(scenarios);
        }

        insights += '</ul>';
        return insights;
    }

    /**
     * Инсайты для ипотечного калькулятора
     */
    getMortgageInsights(scenarios) {
        let insights = '';

        // Найдем сценарий с минимальным платежом
        const minPaymentScenario = scenarios.reduce((min, current) =>
            current.results.monthlyPayment < min.results.monthlyPayment ? current : min
        );

        // Найдем сценарий с минимальной переплатой
        const minInterestScenario = scenarios.reduce((min, current) =>
            current.results.totalInterest < min.results.totalInterest ? current : min
        );

        insights += `<li>Минимальный ежемесячный платеж: <strong>${minPaymentScenario.name}</strong> (${this.formatNumber(minPaymentScenario.results.monthlyPayment)} ₽)</li>`;
        insights += `<li>Минимальная переплата: <strong>${minInterestScenario.name}</strong> (${this.formatNumber(minInterestScenario.results.totalInterest)} ₽)</li>`;

        // Разница в переплате
        const maxInterestScenario = scenarios.reduce((max, current) =>
            current.results.totalInterest > max.results.totalInterest ? current : max
        );

        const interestDiff = maxInterestScenario.results.totalInterest - minInterestScenario.results.totalInterest;
        if (interestDiff > 0) {
            insights += `<li>Экономия при выборе лучшего варианта: <strong>${this.formatNumber(interestDiff)} ₽</strong></li>`;
        }

        return insights;
    }

    /**
     * Инсайты для калькулятора доходности
     */
    getRentalInsights(scenarios) {
        let insights = '';

        const maxYieldScenario = scenarios.reduce((max, current) =>
            current.results.netYield > max.results.netYield ? current : max
        );

        const maxIncomeScenario = scenarios.reduce((max, current) =>
            current.results.monthlyNetIncome > max.results.monthlyNetIncome ? current : max
        );

        insights += `<li>Максимальная доходность: <strong>${maxYieldScenario.name}</strong> (${maxYieldScenario.results.netYield}% годовых)</li>`;
        insights += `<li>Максимальный доход: <strong>${maxIncomeScenario.name}</strong> (${this.formatNumber(maxIncomeScenario.results.monthlyNetIncome)} ₽/месяц)</li>`;

        return insights;
    }

    /**
     * Универсальные инсайты
     */
    getGenericInsights(scenarios) {
        return '<li>Сравните показатели в таблице выше для принятия решения</li>';
    }

    /**
     * Построение графика сравнения
     */
    buildComparisonChart(scenarios) {
        // Упрощенная версия без Chart.js для базовой визуализации
        const chartContainer = `
            <div class="comparison-chart">
                <h4>📈 Визуальное сравнение</h4>
                <div class="chart-placeholder">
                    <p>График сравнения будет добавлен в следующих версиях</p>
                    <div class="simple-bars">
                        ${this.generateSimpleBars(scenarios)}
                    </div>
                </div>
            </div>
        `;

        return chartContainer;
    }

    /**
     * Генерация простых полосок для визуализации
     */
    generateSimpleBars(scenarios) {
        if (scenarios.length === 0) return '';

        const firstMetric = Object.keys(scenarios[0].results)[0];
        const values = scenarios.map(s => s.results[firstMetric] || 0);
        const maxValue = Math.max(...values);

        if (maxValue === 0) return '';

        return scenarios.map(scenario => {
            const value = scenario.results[firstMetric] || 0;
            const percentage = (value / maxValue * 100).toFixed(1);

            return `
                <div class="bar-item">
                    <span class="bar-label">${scenario.name}</span>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                        <span class="bar-value">${this.formatMetricValue(value, firstMetric)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Экспорт сравнения
     */
    async exportComparison() {
        if (this.scenarios.size < 2) {
            this.showNotification('Добавьте минимум 2 сценария для экспорта', 'warning');
            return;
        }

        const comparisonData = {
            title: 'Сравнение сценариев - М2 Калькуляторы',
            exportDate: new Date().toISOString(),
            calculatorType: this.detectCalculatorType(),
            scenarios: Array.from(this.scenarios.values()),
            summary: this.generateExportSummary()
        };

        // Экспорт в JSON
        this.downloadJSON(comparisonData, `comparison_${Date.now()}.json`);

        // Уведомление пользователя
        this.showNotification('Сравнение экспортировано в JSON', 'success');

        // Отправляем событие в аналитику
        if (window.gtag) {
            gtag('event', 'scenario_comparison_export', {
                event_category: 'Export',
                scenarios_count: this.scenarios.size,
                calculator_type: this.detectCalculatorType()
            });
        }
    }

    /**
     * Генерация сводки для экспорта
     */
    generateExportSummary() {
        const scenarios = Array.from(this.scenarios.values());
        return {
            totalScenarios: scenarios.length,
            calculatorType: this.detectCalculatorType(),
            dateRange: {
                earliest: Math.min(...scenarios.map(s => new Date(s.createdAt).getTime())),
                latest: Math.max(...scenarios.map(s => new Date(s.createdAt).getTime()))
            }
        };
    }

    /**
     * Загрузка JSON файла
     */
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Удаление сценария
     */
    removeScenario(scenarioId) {
        if (this.scenarios.has(scenarioId)) {
            const scenarioName = this.scenarios.get(scenarioId).name;
            this.scenarios.delete(scenarioId);
            this.saveScenarios();
            this.updateScenariosDisplay();

            if (this.scenarios.size < 2) {
                document.querySelector('.comparison-results').style.display = 'none';
            } else {
                this.generateComparisonTable();
            }

            // Обновляем кнопку экспорта
            const exportBtn = document.querySelector('.export-comparison-btn');
            if (exportBtn) {
                exportBtn.disabled = this.scenarios.size < 2;
            }

            this.showNotification(`Сценарий "${scenarioName}" удален`, 'info');
        }
    }

    /**
     * Очистка всех сценариев
     */
    clearAllScenarios() {
        if (this.scenarios.size === 0) return;

        const confirmMessage = `Удалить все ${this.scenarios.size} сценариев?`;
        if (confirm(confirmMessage)) {
            this.scenarios.clear();
            this.saveScenarios();
            this.updateScenariosDisplay();

            document.querySelector('.comparison-results').style.display = 'none';
            const exportBtn = document.querySelector('.export-comparison-btn');
            if (exportBtn) {
                exportBtn.disabled = true;
            }

            this.showNotification('Все сценарии удалены', 'info');
        }
    }

    /**
     * Сохранение сценариев в localStorage
     */
    saveScenarios() {
        try {
            const scenariosArray = Array.from(this.scenarios.entries());
            localStorage.setItem('m2_scenario_comparison', JSON.stringify(scenariosArray));
        } catch (error) {
            console.warn('Не удалось сохранить сценарии:', error);
        }
    }

    /**
     * Загрузка сохраненных сценариев
     */
    loadSavedScenarios() {
        try {
            const saved = localStorage.getItem('m2_scenario_comparison');
            if (saved) {
                const scenariosArray = JSON.parse(saved);
                this.scenarios = new Map(scenariosArray);
            }
        } catch (error) {
            console.warn('Не удалось загрузить сохраненные сценарии:', error);
            this.scenarios.clear();
        }
    }

    // Вспомогательные методы

    generateScenarioId() {
        return 'scenario_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('ru-RU').format(Math.round(num));
    }

    formatMetricValue(value, metricKey) {
        if (typeof value !== 'number') return value;

        if (metricKey.includes('Rate') || metricKey.includes('Yield')) {
            return value.toFixed(2) + '%';
        }

        if (metricKey.includes('Payment') || metricKey.includes('Amount') || metricKey.includes('Income')) {
            return this.formatNumber(value) + ' ₽';
        }

        return this.formatNumber(value);
    }

    getMetricDisplayName(key) {
        const names = {
            monthlyPayment: 'Ежемесячный платеж',
            totalPayment: 'Общая сумма выплат',
            totalInterest: 'Переплата по кредиту',
            loanAmount: 'Сумма кредита',
            effectiveRate: 'Эффективная ставка',
            grossYield: 'Валовая доходность',
            netYield: 'Чистая доходность',
            monthlyNetIncome: 'Чистый доход в месяц',
            annualNetIncome: 'Годовой доход',
            roi: 'Рентабельность'
        };

        return names[key] || key;
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Добавляем в DOM
        document.body.appendChild(notification);

        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            notification.remove();
        }, 3000);

        // Закрытие по клику
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

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
    }

    updateCurrentScenario() {
        // Автоматическое обновление текущего сценария при изменении параметров
        if (this.scenarios.size > 0) {
            console.log('Параметры изменены - сценарии могли устареть');
        }
    }
}

// CSS стили для сравнения сценариев
const comparisonStyles = `
<style>
.scenario-comparison-panel {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 20px;
    margin-top: 20px;
}

.comparison-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
}

.comparison-header h3 {
    margin: 0;
    color: #3416b6;
    font-size: 1.2em;
}

.compare-scenarios-btn {
    background: #3416b6;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.compare-scenarios-btn:hover {
    background: #2c0e94;
    transform: translateY(-1px);
}

.compare-scenarios-btn.active {
    background: #dc3545;
}

.comparison-controls {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.current-scenario {
    margin-bottom: 20px;
}

.current-scenario label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
}

.current-scenario input {
    width: 100%;
    max-width: 300px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-right: 10px;
}

.add-scenario-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.add-scenario-btn:hover {
    background: #218838;
}

.scenarios-list h4 {
    margin-bottom: 15px;
    color: #495057;
}

.scenarios-container {
    min-height: 60px;
}

.no-scenarios {
    text-align: center;
    color: #6c757d;
    font-style: italic;
    padding: 20px;
}

.scenario-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    position: relative;
}

.scenario-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.scenario-header h5 {
    margin: 0;
    color: #3416b6;
    font-size: 1.1em;
}

.remove-scenario-btn {
    background: #dc3545;
    color: white;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.remove-scenario-btn:hover {
    background: #c82333;
}

.scenario-summary {
    margin-bottom: 10px;
}

.summary-item {
    font-size: 0.9em;
    color: #495057;
    margin-bottom: 4px;
}

.scenario-meta {
    font-size: 0.8em;
    color: #6c757d;
}

.comparison-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.export-comparison-btn, .clear-scenarios-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
}

.export-comparison-btn {
    background: #17a2b8;
    color: white;
}

.export-comparison-btn:hover:not(:disabled) {
    background: #138496;
}

.export-comparison-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.clear-scenarios-btn {
    background: #6c757d;
    color: white;
}

.clear-scenarios-btn:hover {
    background: #545b62;
}

.comparison-results {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
}

.comparison-table-container {
    overflow-x: auto;
    margin-bottom: 20px;
}

.comparison-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9em;
}

.comparison-table th,
.comparison-table td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
}

.comparison-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
}

.metric-name {
    font-weight: 500;
    color: #3416b6;
}

.best-value {
    background: #d4edda;
    color: #155724;
    font-weight: 600;
}

.best-indicator {
    font-weight: 500;
    color: #28a745;
}

.improvement {
    font-size: 0.8em;
    color: #6c757d;
    font-weight: normal;
}

.comparison-insights {
    background: #e3f2fd;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
}

.comparison-insights h4 {
    margin-top: 0;
    color: #1976d2;
}

.insights-list {
    margin: 10px 0;
    padding-left: 20px;
}

.insights-list li {
    margin-bottom: 8px;
    line-height: 1.4;
}

.comparison-chart {
    margin-top: 20px;
}

.chart-placeholder {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
}

.simple-bars {
    margin-top: 15px;
}

.bar-item {
    margin-bottom: 15px;
    text-align: left;
}

.bar-label {
    display: block;
    font-weight: 500;
    margin-bottom: 5px;
    color: #495057;
}

.bar-container {
    position: relative;
    background: #e9ecef;
    border-radius: 4px;
    height: 30px;
    display: flex;
    align-items: center;
}

.bar-fill {
    background: linear-gradient(90deg, #3416b6, #5a67d8);
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.bar-value {
    position: absolute;
    right: 10px;
    font-size: 0.9em;
    font-weight: 500;
    color: #495057;
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    animation: slideInRight 0.3s ease;
}

.notification-success {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.notification-error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

.notification-warning {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
}

.notification-info {
    background: #cce8ff;
    border: 1px solid #b6d7ff;
    color: #004085;
}

.notification-content {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 10px;
}

.notification-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    margin-left: auto;
    opacity: 0.7;
}

.notification-close:hover {
    opacity: 1;
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

@media (max-width: 768px) {
    .comparison-header {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }

    .current-scenario input {
        max-width: none;
        margin-bottom: 10px;
    }

    .comparison-actions {
        flex-direction: column;
    }

    .comparison-table {
        font-size: 0.8em;
    }

    .notification {
        left: 20px;
        right: 20px;
        max-width: none;
    }
}
</style>
`;

// Инъекция стилей
if (!document.querySelector('#scenario-comparison-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'scenario-comparison-styles';
    styleElement.innerHTML = comparisonStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Глобальная инициализация
window.ScenarioComparison = ScenarioComparison;

// Автоматическая инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.scenarioComparison = new ScenarioComparison();
        window.scenarioComparison.init();
    });
} else {
    setTimeout(() => {
        window.scenarioComparison = new ScenarioComparison();
        window.scenarioComparison.init();
    }, 0);
}

export { ScenarioComparison };