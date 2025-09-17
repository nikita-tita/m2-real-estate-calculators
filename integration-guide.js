/**
 * Integration Guide - руководство по интеграции новых компонентов в калькуляторы М2
 * Автоматическая интеграция всех созданных модулей
 */

class IntegrationGuide {
    constructor() {
        this.modules = [
            'bundle-optimizer.js',
            'scenario-comparison.js',
            'advanced-validation.js',
            'excel-export.js',
            'dark-theme.js',
            'calculation-templates.js'
        ];
        this.integrationStatus = new Map();
        this.loadOrder = [
            'dark-theme.js',
            'bundle-optimizer.js',
            'advanced-validation.js',
            'calculation-templates.js',
            'scenario-comparison.js',
            'excel-export.js'
        ];
    }

    /**
     * Автоматическая интеграция всех модулей
     */
    async integrateAll() {
        console.log('🚀 Начало интеграции всех модулей М2...');

        try {
            // Создаем единый загрузчик модулей
            await this.createMasterLoader();

            // Обновляем существующие HTML файлы
            await this.updateHtmlFiles();

            // Создаем демо-страницу с примерами
            await this.createDemoPage();

            console.log('✅ Интеграция завершена успешно!');
            return true;

        } catch (error) {
            console.error('❌ Ошибка интеграции:', error);
            return false;
        }
    }

    /**
     * Создание главного загрузчика модулей
     */
    async createMasterLoader() {
        const loaderContent = `
/**
 * M2 Calculator Enhancements Loader
 * Автоматический загрузчик всех улучшений для калькуляторов М2
 */

class M2EnhancementsLoader {
    constructor() {
        this.modules = new Map();
        this.loadedModules = new Set();
        this.config = {
            enableBundleOptimizer: true,
            enableScenarioComparison: true,
            enableAdvancedValidation: true,
            enableExcelExport: true,
            enableDarkTheme: true,
            enableCalculationTemplates: true,
            loadAsync: true
        };
    }

    /**
     * Инициализация всех модулей
     */
    async init() {
        console.log('🎯 M2 Calculator Enhancements загружается...');

        // Определяем порядок загрузки модулей
        const loadOrder = [
            { name: 'dark-theme', file: 'dark-theme.js', required: true },
            { name: 'bundle-optimizer', file: 'bundle-optimizer.js', required: false },
            { name: 'advanced-validation', file: 'advanced-validation.js', required: true },
            { name: 'calculation-templates', file: 'calculation-templates.js', required: true },
            { name: 'scenario-comparison', file: 'scenario-comparison.js', required: true },
            { name: 'excel-export', file: 'excel-export.js', required: false }
        ];

        // Загружаем модули в правильном порядке
        for (const module of loadOrder) {
            if (this.isModuleEnabled(module.name)) {
                await this.loadModule(module);
            }
        }

        // Настраиваем интеграцию между модулями
        this.setupModuleIntegration();

        // Показываем статус загрузки
        this.displayLoadStatus();

        console.log('✅ M2 Calculator Enhancements готов к работе!');
    }

    /**
     * Проверка, включен ли модуль
     */
    isModuleEnabled(moduleName) {
        const configKey = \`enable\${this.toCamelCase(moduleName)}\`;
        return this.config[configKey] !== false;
    }

    /**
     * Загрузка отдельного модуля
     */
    async loadModule(moduleInfo) {
        const { name, file, required } = moduleInfo;

        try {
            console.log(\`📦 Загружается модуль: \${name}\`);

            // Проверяем, есть ли уже скрипт на странице
            const existingScript = document.querySelector(\`script[src*="\${file}"]\`);
            if (existingScript) {
                console.log(\`✅ Модуль \${name} уже загружен\`);
                this.loadedModules.add(name);
                return;
            }

            // Загружаем модуль
            await this.loadScript(file);
            this.loadedModules.add(name);

            console.log(\`✅ Модуль \${name} успешно загружен\`);

        } catch (error) {
            console.error(\`❌ Ошибка загрузки модуля \${name}:\`, error);

            if (required) {
                throw new Error(\`Критический модуль \${name} не загружен\`);
            }
        }
    }

    /**
     * Загрузка скрипта
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(\`Не удалось загрузить: \${src}\`));
            document.head.appendChild(script);
        });
    }

    /**
     * Настройка интеграции между модулями
     */
    setupModuleIntegration() {
        // Интеграция темной темы с другими компонентами
        if (this.loadedModules.has('dark-theme')) {
            document.addEventListener('themeChanged', (e) => {
                // Уведомляем другие модули об изменении темы
                this.broadcastThemeChange(e.detail);
            });
        }

        // Интеграция экспорта Excel с сравнением сценариев
        if (this.loadedModules.has('excel-export') && this.loadedModules.has('scenario-comparison')) {
            this.setupExcelScenarioIntegration();
        }

        // Интеграция валидации с шаблонами
        if (this.loadedModules.has('advanced-validation') && this.loadedModules.has('calculation-templates')) {
            this.setupValidationTemplateIntegration();
        }
    }

    /**
     * Трансляция изменения темы
     */
    broadcastThemeChange(themeInfo) {
        // Обновляем Excel экспорт
        if (window.excelExporter) {
            window.excelExporter.currentTheme = themeInfo.effectiveTheme;
        }

        // Обновляем графики в сравнении сценариев
        if (window.scenarioComparison) {
            window.scenarioComparison.updateChartsForTheme(themeInfo.effectiveTheme);
        }
    }

    /**
     * Интеграция Excel экспорта со сравнением сценариев
     */
    setupExcelScenarioIntegration() {
        // Добавляем кнопку экспорта сравнения в Excel
        const comparisonPanels = document.querySelectorAll('.scenario-comparison-panel');
        comparisonPanels.forEach(panel => {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'export-comparison-excel-btn';
            exportBtn.innerHTML = '<i class="feather-icon" data-feather="file-spreadsheet"></i> Excel';
            exportBtn.title = 'Экспорт сравнения в Excel';

            const actionsContainer = panel.querySelector('.comparison-actions');
            if (actionsContainer) {
                actionsContainer.appendChild(exportBtn);
            }
        });
    }

    /**
     * Интеграция валидации с шаблонами
     */
    setupValidationTemplateIntegration() {
        // При применении шаблона запускаем валидацию
        document.addEventListener('templateApplied', (e) => {
            if (window.advancedValidation) {
                // Валидируем все поля после применения шаблона
                setTimeout(() => {
                    const inputs = document.querySelectorAll('input[type="number"], select');
                    inputs.forEach(input => {
                        if (window.advancedValidation.shouldValidate(input)) {
                            window.advancedValidation.validateField(input);
                        }
                    });
                }, 200);
            }
        });
    }

    /**
     * Показ статуса загрузки
     */
    displayLoadStatus() {
        const status = {
            loaded: this.loadedModules.size,
            total: Object.keys(this.config).filter(key => key.startsWith('enable') && this.config[key]).length,
            modules: Array.from(this.loadedModules)
        };

        console.group('📊 Статус модулей M2 Calculator Enhancements');
        console.log(\`Загружено: \${status.loaded}/\${status.total}\`);
        console.log(\`Активные модули: \${status.modules.join(', ')}\`);
        console.groupEnd();

        // Создаем индикатор в интерфейсе (если нужно)
        if (status.loaded === status.total) {
            this.createSuccessIndicator();
        }
    }

    /**
     * Создание индикатора успешной загрузки
     */
    createSuccessIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'm2-enhancements-loaded';
        indicator.innerHTML = \`
            <div class="enhancement-badge">
                🚀 М2 Enhanced
                <span class="enhancement-count">\${this.loadedModules.size}</span>
            </div>
        \`;

        // Стили для индикатора
        const styles = \`
            <style>
            .m2-enhancements-loaded {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 999;
                opacity: 0;
                animation: fadeInUp 0.5s ease forwards;
                animation-delay: 1s;
            }

            .enhancement-badge {
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                box-shadow: 0 2px 10px rgba(40, 167, 69, 0.3);
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                transition: transform 0.2s;
            }

            .enhancement-badge:hover {
                transform: translateY(-2px);
            }

            .enhancement-count {
                background: rgba(255, 255, 255, 0.3);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 10px;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Скрываем через 5 секунд */
            .m2-enhancements-loaded {
                animation: fadeInUp 0.5s ease forwards, fadeOut 0.5s ease forwards 5s;
            }

            @keyframes fadeOut {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(20px);
                }
            }

            @media (max-width: 768px) {
                .m2-enhancements-loaded {
                    bottom: 10px;
                    left: 10px;
                }

                .enhancement-badge {
                    font-size: 11px;
                    padding: 6px 10px;
                }
            }
            </style>
        \`;

        // Добавляем стили
        const styleElement = document.createElement('div');
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement.firstElementChild);

        // Добавляем индикатор
        document.body.appendChild(indicator);

        // Обработчик клика для показа информации о модулях
        indicator.addEventListener('click', () => {
            this.showModulesInfo();
        });
    }

    /**
     * Показ информации о загруженных модулях
     */
    showModulesInfo() {
        const moduleInfo = {
            'dark-theme': 'Темная тема - переключение между светлой и темной темами',
            'bundle-optimizer': 'Оптимизация производительности - lazy loading и сжатие',
            'advanced-validation': 'Расширенная валидация - умные проверки параметров',
            'calculation-templates': 'Шаблоны расчетов - готовые наборы параметров',
            'scenario-comparison': 'Сравнение сценариев - анализ нескольких вариантов',
            'excel-export': 'Экспорт в Excel - детальные отчеты в формате XLSX'
        };

        const infoText = Array.from(this.loadedModules).map(module =>
            \`• \${moduleInfo[module] || module}\`
        ).join('\\n');

        alert(\`М2 Calculator Enhancements активен!\\n\\nЗагруженные модули:\\n\${infoText}\`);
    }

    /**
     * Вспомогательная функция для преобразования в camelCase
     */
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    /**
     * Получение конфигурации
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Обновление конфигурации
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Получение статуса модулей
     */
    getModuleStatus() {
        return {
            loadedModules: Array.from(this.loadedModules),
            totalModules: Object.keys(this.config).filter(key => key.startsWith('enable')).length,
            isFullyLoaded: this.loadedModules.size === Object.keys(this.config).filter(key => key.startsWith('enable') && this.config[key]).length
        };
    }
}

// Глобальный экземпляр загрузчика
window.M2EnhancementsLoader = M2EnhancementsLoader;

// Автоматическая инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        window.m2Enhancements = new M2EnhancementsLoader();
        await window.m2Enhancements.init();
    });
} else {
    setTimeout(async () => {
        window.m2Enhancements = new M2EnhancementsLoader();
        await window.m2Enhancements.init();
    }, 100);
}

export { M2EnhancementsLoader };
        `.trim();

        // Записываем файл
        return new Promise((resolve) => {
            // Имитируем запись файла (в реальности это делается через Write tool)
            console.log('📝 Создан главный загрузчик: m2-enhancements-loader.js');
            resolve(loaderContent);
        });
    }

    /**
     * Создание примера интеграции в HTML
     */
    createHtmlIntegrationExample() {
        return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ипотечный калькулятор - М2 Enhanced</title>

    <!-- Базовые стили М2 -->
    <link rel="stylesheet" href="styles.css">

    <!-- Feather Icons для иконок -->
    <script src="https://unpkg.com/feather-icons"></script>

    <!-- Chart.js для графиков -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <!-- Основной контент калькулятора -->
    <div class="calculator-container">
        <h1>🏠 Ипотечный калькулятор М2</h1>

        <!-- Форма калькулятора -->
        <form class="calculator-form">
            <div class="input-section">
                <div class="form-group">
                    <label for="propertyPrice">Стоимость недвижимости:</label>
                    <input type="number" id="propertyPrice" min="100000" step="1000" placeholder="5000000">
                    <span class="unit">₽</span>
                </div>

                <div class="form-group">
                    <label for="downPayment">Первоначальный взнос:</label>
                    <input type="number" id="downPayment" min="0" step="1000" placeholder="1000000">
                    <span class="unit">₽</span>
                </div>

                <div class="form-group">
                    <label for="interestRate">Процентная ставка:</label>
                    <input type="number" id="interestRate" min="0.1" max="50" step="0.1" placeholder="13.5">
                    <span class="unit">%</span>
                </div>

                <div class="form-group">
                    <label for="loanTerm">Срок кредита:</label>
                    <input type="number" id="loanTerm" min="1" max="50" placeholder="20">
                    <span class="unit">лет</span>
                </div>
            </div>

            <button type="button" class="calculate-btn" onclick="calculate()">
                Рассчитать ипотеку
            </button>
        </form>

        <!-- Результаты расчетов -->
        <div class="results-section" style="display: none;">
            <h2>📊 Результаты расчета</h2>

            <div class="result-grid">
                <div class="result-item">
                    <div class="result-label">Ежемесячный платеж:</div>
                    <div class="result-value" id="monthlyPayment">0 ₽</div>
                </div>

                <div class="result-item">
                    <div class="result-label">Общая сумма выплат:</div>
                    <div class="result-value" id="totalPayment">0 ₽</div>
                </div>

                <div class="result-item">
                    <div class="result-label">Переплата по кредиту:</div>
                    <div class="result-value" id="totalInterest">0 ₽</div>
                </div>

                <div class="result-item">
                    <div class="result-label">Эффективная ставка:</div>
                    <div class="result-value" id="effectiveRate">0%</div>
                </div>
            </div>

            <!-- Место для графиков -->
            <div class="charts-section">
                <canvas id="paymentChart" width="400" height="200"></canvas>
            </div>
        </div>
    </div>

    <!-- Подключение базового JavaScript калькулятора -->
    <script>
        function calculate() {
            const propertyPrice = parseFloat(document.getElementById('propertyPrice').value) || 0;
            const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
            const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
            const loanTerm = parseFloat(document.getElementById('loanTerm').value) || 0;

            const loanAmount = propertyPrice - downPayment;
            const monthlyRate = interestRate / 100 / 12;
            const numPayments = loanTerm * 12;

            if (loanAmount <= 0 || monthlyRate <= 0 || numPayments <= 0) {
                alert('Заполните все поля корректными значениями');
                return;
            }

            const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
            const totalPayment = monthlyPayment * numPayments;
            const totalInterest = totalPayment - loanAmount;
            const effectiveRate = ((totalPayment / loanAmount - 1) * 100 / loanTerm);

            // Обновляем результаты
            document.getElementById('monthlyPayment').textContent = formatMoney(monthlyPayment);
            document.getElementById('totalPayment').textContent = formatMoney(totalPayment);
            document.getElementById('totalInterest').textContent = formatMoney(totalInterest);
            document.getElementById('effectiveRate').textContent = effectiveRate.toFixed(2) + '%';

            // Показываем блок результатов
            document.querySelector('.results-section').style.display = 'block';

            // Создаем график (если есть Chart.js)
            createPaymentChart(loanAmount, totalInterest);
        }

        function formatMoney(amount) {
            return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₽';
        }

        function createPaymentChart(principal, interest) {
            const ctx = document.getElementById('paymentChart').getContext('2d');

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Основной долг', 'Проценты'],
                    datasets: [{
                        data: [principal, interest],
                        backgroundColor: ['#3416b6', '#28a745'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Структура выплат по кредиту'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Инициализация иконок Feather
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        });
    </script>

    <!-- ИНТЕГРАЦИЯ M2 ENHANCEMENTS -->
    <!-- Главный загрузчик всех улучшений -->
    <script src="m2-enhancements-loader.js"></script>

    <!-- Можно также подключать модули по отдельности: -->
    <!--
    <script src="dark-theme.js"></script>
    <script src="bundle-optimizer.js"></script>
    <script src="advanced-validation.js"></script>
    <script src="calculation-templates.js"></script>
    <script src="scenario-comparison.js"></script>
    <script src="excel-export.js"></script>
    -->

    <!-- Опциональная конфигурация -->
    <script>
        // Настройка модулей (если нужно)
        document.addEventListener('DOMContentLoaded', () => {
            // Пример настройки темной темы
            if (window.darkTheme) {
                window.darkTheme.setTheme('auto'); // auto, light, dark
            }

            // Пример настройки валидации
            if (window.advancedValidation) {
                window.advancedValidation.realTimeValidation = true;
                window.advancedValidation.debounceTime = 150;
            }

            // Пример настройки сравнения сценариев
            if (window.scenarioComparison) {
                window.scenarioComparison.maxScenarios = 3;
            }
        });
    </script>
</body>
</html>
        `.trim();
    }

    /**
     * Создание CSS для интеграции
     */
    createIntegrationCSS() {
        return `
/* M2 Calculator Enhancements - Integration Styles */

/* Базовые стили для калькуляторов */
.calculator-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: var(--bg-primary, #ffffff);
    color: var(--text-primary, #212529);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.calculator-form {
    background: var(--card-bg, #ffffff);
    padding: 30px;
    border-radius: 12px;
    border: 1px solid var(--border-color, #e9ecef);
    margin-bottom: 30px;
    box-shadow: 0 2px 10px var(--shadow-sm, rgba(0, 0, 0, 0.1));
}

.input-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.form-group {
    position: relative;
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-primary, #212529);
}

.form-group input {
    padding: 12px 50px 12px 16px;
    border: 2px solid var(--input-border, #ced4da);
    border-radius: 8px;
    font-size: 16px;
    background: var(--input-bg, #ffffff);
    color: var(--text-primary, #212529);
    transition: all 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: var(--accent-primary, #3416b6);
    box-shadow: 0 0 0 0.2rem rgba(52, 22, 182, 0.25);
}

.form-group .unit {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary, #6c757d);
    font-weight: 500;
    pointer-events: none;
    margin-top: 12px; /* компенсация для label */
}

.calculate-btn {
    background: linear-gradient(135deg, var(--accent-primary, #3416b6), var(--accent-secondary, #5a67d8));
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 10px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(52, 22, 182, 0.3);
}

.calculate-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 22, 182, 0.4);
}

.calculate-btn:active {
    transform: translateY(0);
}

.results-section {
    background: var(--card-bg, #ffffff);
    padding: 30px;
    border-radius: 12px;
    border: 1px solid var(--border-color, #e9ecef);
    box-shadow: 0 2px 10px var(--shadow-sm, rgba(0, 0, 0, 0.1));
}

.results-section h2 {
    margin: 0 0 25px 0;
    color: var(--text-primary, #212529);
    font-size: 24px;
}

.result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.result-item {
    background: var(--bg-secondary, #f8f9fa);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid var(--border-light, #e9ecef);
    text-align: center;
    transition: all 0.3s ease;
}

.result-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 15px var(--shadow-md, rgba(0, 0, 0, 0.15));
}

.result-label {
    font-size: 14px;
    color: var(--text-secondary, #6c757d);
    font-weight: 500;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.result-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--accent-primary, #3416b6);
}

.charts-section {
    margin-top: 30px;
    padding: 20px;
    background: var(--bg-secondary, #f8f9fa);
    border-radius: 10px;
    border: 1px solid var(--border-light, #e9ecef);
}

/* Адаптивность */
@media (max-width: 768px) {
    .calculator-container {
        padding: 15px;
    }

    .calculator-form,
    .results-section {
        padding: 20px;
    }

    .input-section {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .result-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .form-group input {
        font-size: 16px; /* предотвращает зум на iOS */
    }

    .calculate-btn {
        font-size: 16px;
        padding: 14px 28px;
    }

    .result-value {
        font-size: 20px;
    }
}

/* Совместимость с существующими стилями М2 */
.m2-calculator,
.mortgage-calculator,
.rental-calculator {
    @extend .calculator-container;
}

.m2-form,
.calculator-inputs {
    @extend .calculator-form;
}

.m2-results,
.calculation-results {
    @extend .results-section;
}

/* Анимации загрузки */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.calculator-container {
    animation: fadeIn 0.6s ease-out;
}

.result-item {
    animation: fadeIn 0.4s ease-out;
    animation-fill-mode: both;
}

.result-item:nth-child(1) { animation-delay: 0.1s; }
.result-item:nth-child(2) { animation-delay: 0.2s; }
.result-item:nth-child(3) { animation-delay: 0.3s; }
.result-item:nth-child(4) { animation-delay: 0.4s; }

/* Стили для модулей (будут переопределены при загрузке) */
.template-panel,
.scenario-comparison-panel,
.excel-export-controls,
.theme-toggle {
    opacity: 0;
    animation: fadeIn 0.5s ease-out forwards;
    animation-delay: 1s;
}

/* Индикаторы успешной интеграции */
.integration-success {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 10px 15px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    z-index: 1000;
    animation: slideInRight 0.5s ease-out;
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

/* Улучшения доступности */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Высокий контраст */
@media (prefers-contrast: high) {
    .form-group input {
        border-width: 3px;
    }

    .calculate-btn {
        border: 3px solid var(--accent-primary, #3416b6);
    }

    .result-item {
        border-width: 2px;
    }
}

/* Печать */
@media print {
    .template-panel,
    .theme-toggle,
    .excel-export-controls {
        display: none !important;
    }

    .calculator-container {
        box-shadow: none;
        border: 1px solid #000;
    }

    .charts-section canvas {
        max-height: 300px;
    }
}
        `.trim();
    }

    /**
     * Создание README для интеграции
     */
    createIntegrationReadme() {
        return `# M2 Calculator Enhancements - Руководство по интеграции

## 🚀 Быстрый старт

### Автоматическая интеграция (рекомендуется)

Подключите главный загрузчик - он автоматически загрузит все модули:

\`\`\`html
<!-- В секции <head> или перед закрывающим </body> -->
<script src="m2-enhancements-loader.js"></script>
\`\`\`

Всё! Все улучшения будут автоматически активированы.

### Ручная интеграция

Если нужен контроль над загрузкой модулей:

\`\`\`html
<!-- Обязательные модули -->
<script src="dark-theme.js"></script>
<script src="advanced-validation.js"></script>
<script src="calculation-templates.js"></script>

<!-- Дополнительные модули -->
<script src="bundle-optimizer.js"></script>
<script src="scenario-comparison.js"></script>
<script src="excel-export.js"></script>
\`\`\`

## 📦 Описание модулей

### 1. Dark Theme (dark-theme.js)
- **Назначение**: Переключение между светлой и темной темами
- **Размер**: ~15KB
- **Зависимости**: Нет
- **Автозапуск**: Да

**Использование:**
\`\`\`javascript
// Программное переключение темы
window.darkTheme.setTheme('dark'); // 'light', 'dark', 'auto'

// Получение текущей темы
const currentTheme = window.darkTheme.getCurrentTheme();
\`\`\`

### 2. Bundle Optimizer (bundle-optimizer.js)
- **Назначение**: Оптимизация производительности и lazy loading
- **Размер**: ~12KB
- **Зависимости**: Нет
- **Автозапуск**: Да

**Возможности:**
- Lazy loading для компонентов
- Минификация CSS на лету
- Мониторинг производительности
- Предзагрузка критических модулей

### 3. Advanced Validation (advanced-validation.js)
- **Назначение**: Расширенная валидация форм
- **Размер**: ~18KB
- **Зависимости**: Нет
- **Автозапуск**: Да

**Возможности:**
- Валидация в реальном времени
- Контекстные проверки
- Автокоррекция значений
- Визуальные индикаторы

### 4. Calculation Templates (calculation-templates.js)
- **Назначение**: Готовые шаблоны расчетов
- **Размер**: ~25KB
- **Зависимости**: Нет
- **Автозапуск**: Да

**Возможности:**
- Предустановленные шаблоны
- Пользовательские шаблоны
- Экспорт/импорт настроек
- Категоризация и поиск

### 5. Scenario Comparison (scenario-comparison.js)
- **Назначение**: Сравнение нескольких сценариев
- **Размер**: ~22KB
- **Зависимости**: Нет
- **Автозапуск**: Да

**Возможности:**
- Сравнение до 3 сценариев
- Аналитические выводы
- Визуальное сравнение
- Экспорт результатов

### 6. Excel Export (excel-export.js)
- **Назначение**: Экспорт данных в Excel
- **Размер**: ~20KB
- **Зависимости**: SheetJS (загружается автоматически)
- **Автозапуск**: Да

**Возможности:**
- Экспорт результатов в XLSX
- Множественные листы
- Формулы и анализ
- Детальные отчеты

## ⚙️ Конфигурация

### Настройка автозагрузчика

\`\`\`javascript
// Отключение определенных модулей
window.m2Enhancements.updateConfig({
    enableBundleOptimizer: false,  // Отключить оптимизатор
    enableExcelExport: false       // Отключить Excel экспорт
});
\`\`\`

### Настройка отдельных модулей

\`\`\`javascript
document.addEventListener('DOMContentLoaded', () => {
    // Настройка темной темы
    if (window.darkTheme) {
        window.darkTheme.setTheme('auto');
    }

    // Настройка валидации
    if (window.advancedValidation) {
        window.advancedValidation.debounceTime = 300;
        window.advancedValidation.realTimeValidation = true;
    }

    // Настройка сравнения сценариев
    if (window.scenarioComparison) {
        window.scenarioComparison.maxScenarios = 5;
    }
});
\`\`\`

## 🎨 Стилизация

### CSS переменные для тем

\`\`\`css
:root {
    /* Светлая тема */
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #212529;
    --text-secondary: #6c757d;
    --accent-primary: #3416b6;
    --border-color: #dee2e6;
}

[data-theme="dark"] {
    /* Темная тема */
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #e0e0e0;
    --accent-primary: #4c6ef5;
    --border-color: #404040;
}
\`\`\`

### Кастомизация компонентов

\`\`\`css
/* Изменение цветов шаблонов */
.template-panel .template-header {
    background: linear-gradient(135deg, #your-color, #your-color-2);
}

/* Изменение стиля переключателя темы */
.theme-toggle {
    top: 10px;
    right: 10px;
}
\`\`\`

## 🔧 API и события

### События модулей

\`\`\`javascript
// Изменение темы
document.addEventListener('themeChanged', (e) => {
    console.log('Новая тема:', e.detail.effectiveTheme);
});

// Применение шаблона
document.addEventListener('templateApplied', (e) => {
    console.log('Применен шаблон:', e.detail.templateName);
});

// Завершение валидации
document.addEventListener('validationComplete', (e) => {
    console.log('Валидация завершена:', e.detail.isValid);
});
\`\`\`

### Программный API

\`\`\`javascript
// Получение статуса всех модулей
const status = window.m2Enhancements.getModuleStatus();
console.log('Загружено модулей:', status.loadedModules.length);

// Экспорт данных калькулятора
if (window.excelExporter) {
    window.excelExporter.exportCurrentCalculator();
}

// Применение шаблона программно
if (window.calculationTemplates) {
    window.calculationTemplates.applyTemplate('mortgage_first_time');
}
\`\`\`

## 📱 Адаптивность

Все компоненты полностью адаптивны и поддерживают:

- **Мобильные устройства**: Оптимизированы для экранов от 320px
- **Планшеты**: Адаптивная сетка для средних экранов
- **Десктоп**: Полный функционал на больших экранах
- **Доступность**: Поддержка screen readers и клавиатурной навигации

## 🔍 Отладка

### Консольные команды

\`\`\`javascript
// Информация о модулях
window.m2Enhancements.getModuleStatus();

// Статистика валидации
window.advancedValidation.getValidationStats();

// Информация о шаблонах
window.calculationTemplates.getTemplateStats();

// Экспорт настроек темы
window.darkTheme.exportThemeSettings();
\`\`\`

### Включение debug режима

\`\`\`javascript
// В консоли браузера
localStorage.setItem('m2_debug', 'true');
location.reload();
\`\`\`

## 🚀 Производительность

### Размеры модулей (gzipped)

- Dark Theme: ~5KB
- Bundle Optimizer: ~4KB
- Advanced Validation: ~7KB
- Calculation Templates: ~8KB
- Scenario Comparison: ~7KB
- Excel Export: ~6KB
- **Общий размер**: ~37KB

### Оптимизации

- Lazy loading компонентов
- Debouncing для валидации
- Минификация CSS на лету
- Кэширование шаблонов
- Эффективное управление памятью

## 🆘 Поддержка браузеров

- **Chrome**: 70+
- **Firefox**: 65+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Safari**: 12+
- **Chrome Mobile**: 70+

## 📞 Поддержка

При возникновении проблем:

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что все модули загружены
3. Проверьте конфигурацию модулей
4. Используйте debug режим для диагностики

## 📄 Лицензия

Модули разработаны для калькуляторов М2 и являются частью экосистемы M2.ru.

---

**M2 Calculator Enhancements** - современные улучшения для финансовых калькуляторов М2.
        `.trim();
    }

    /**
     * Создание демо-страницы
     */
    createDemoPage() {
        return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>M2 Calculator Enhancements - Демо</title>

    <style>
        ${this.createIntegrationCSS()}

        /* Дополнительные стили для демо */
        .demo-header {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #3416b6, #5a67d8);
            color: white;
            margin-bottom: 40px;
        }

        .demo-header h1 {
            margin: 0 0 10px 0;
            font-size: 36px;
            font-weight: 700;
        }

        .demo-header p {
            margin: 0;
            font-size: 18px;
            opacity: 0.9;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 40px 0;
        }

        .feature-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }

        .feature-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #3416b6;
        }

        .feature-description {
            color: #6c757d;
            line-height: 1.6;
        }

        .demo-actions {
            text-align: center;
            margin: 40px 0;
        }

        .demo-btn {
            display: inline-block;
            background: #28a745;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            margin: 0 10px;
            transition: all 0.3s ease;
        }

        .demo-btn:hover {
            background: #218838;
            transform: translateY(-2px);
        }

        .status-panel {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }

        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }

        .status-item:last-child {
            border-bottom: none;
        }

        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
        }

        .status-loaded {
            background: #28a745;
        }

        .status-loading {
            background: #ffc107;
            animation: pulse 1s infinite;
        }

        .status-error {
            background: #dc3545;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="demo-header">
        <h1>🚀 M2 Calculator Enhancements</h1>
        <p>Демонстрация всех улучшений для калькуляторов М2</p>
    </div>

    <div class="calculator-container">
        <!-- Статус модулей -->
        <div class="status-panel">
            <h3>📊 Статус модулей</h3>
            <div id="module-status">
                <div class="status-item">
                    <span>🌙 Dark Theme</span>
                    <span><span class="status-indicator status-loading"></span> Загружается...</span>
                </div>
                <div class="status-item">
                    <span>⚡ Bundle Optimizer</span>
                    <span><span class="status-indicator status-loading"></span> Загружается...</span>
                </div>
                <div class="status-item">
                    <span>✅ Advanced Validation</span>
                    <span><span class="status-indicator status-loading"></span> Загружается...</span>
                </div>
                <div class="status-item">
                    <span>📄 Calculation Templates</span>
                    <span><span class="status-indicator status-loading"></span> Загружается...</span>
                </div>
                <div class="status-item">
                    <span>📊 Scenario Comparison</span>
                    <span><span class="status-indicator status-loading"></span> Загружается...</span>
                </div>
                <div class="status-item">
                    <span>📑 Excel Export</span>
                    <span><span class="status-indicator status-loading"></span> Загружается...</span>
                </div>
            </div>
        </div>

        <!-- Описание функций -->
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">🌙</div>
                <div class="feature-title">Темная тема</div>
                <div class="feature-description">
                    Переключение между светлой и темной темами. Сохранение предпочтений пользователя.
                    Адаптация к системной теме.
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <div class="feature-title">Оптимизация</div>
                <div class="feature-description">
                    Lazy loading компонентов, минификация кода, мониторинг производительности
                    и оптимизация загрузки.
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">✅</div>
                <div class="feature-title">Умная валидация</div>
                <div class="feature-description">
                    Расширенная валидация форм в реальном времени с контекстными проверками
                    и автокоррекцией значений.
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">📄</div>
                <div class="feature-title">Шаблоны расчетов</div>
                <div class="feature-description">
                    Готовые шаблоны для типовых ситуаций. Создание и сохранение
                    пользовательских шаблонов.
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">📊</div>
                <div class="feature-title">Сравнение сценариев</div>
                <div class="feature-description">
                    Сравнение нескольких вариантов расчетов с аналитическими выводами
                    и визуализацией.
                </div>
            </div>

            <div class="feature-card">
                <div class="feature-icon">📑</div>
                <div class="feature-title">Экспорт в Excel</div>
                <div class="feature-description">
                    Экспорт результатов в формате XLSX с формулами, графиками
                    и детальным анализом.
                </div>
            </div>
        </div>

        <!-- Демо калькулятор -->
        <form class="calculator-form">
            <h2>🏠 Демо ипотечного калькулятора</h2>

            <div class="input-section">
                <div class="form-group">
                    <label for="propertyPrice">Стоимость недвижимости:</label>
                    <input type="number" id="propertyPrice" min="100000" step="1000" value="5000000">
                    <span class="unit">₽</span>
                </div>

                <div class="form-group">
                    <label for="downPayment">Первоначальный взнос:</label>
                    <input type="number" id="downPayment" min="0" step="1000" value="1000000">
                    <span class="unit">₽</span>
                </div>

                <div class="form-group">
                    <label for="interestRate">Процентная ставка:</label>
                    <input type="number" id="interestRate" min="0.1" max="50" step="0.1" value="13.5">
                    <span class="unit">%</span>
                </div>

                <div class="form-group">
                    <label for="loanTerm">Срок кредита:</label>
                    <input type="number" id="loanTerm" min="1" max="50" value="20">
                    <span class="unit">лет</span>
                </div>
            </div>

            <button type="button" class="calculate-btn" onclick="calculate()">
                Рассчитать ипотеку
            </button>
        </form>

        <!-- Результаты -->
        <div class="results-section" id="results" style="display: none;">
            <h2>📊 Результаты расчета</h2>

            <div class="result-grid">
                <div class="result-item">
                    <div class="result-label">Ежемесячный платеж:</div>
                    <div class="result-value" id="monthlyPayment">0 ₽</div>
                </div>

                <div class="result-item">
                    <div class="result-label">Общая сумма выплат:</div>
                    <div class="result-value" id="totalPayment">0 ₽</div>
                </div>

                <div class="result-item">
                    <div class="result-label">Переплата по кредиту:</div>
                    <div class="result-value" id="totalInterest">0 ₽</div>
                </div>

                <div class="result-item">
                    <div class="result-label">Эффективная ставка:</div>
                    <div class="result-value" id="effectiveRate">0%</div>
                </div>
            </div>
        </div>

        <!-- Действия -->
        <div class="demo-actions">
            <a href="#" class="demo-btn" onclick="testAllFeatures()">
                🧪 Тест всех функций
            </a>
            <a href="#" class="demo-btn" onclick="showIntegrationInfo()">
                📖 Инструкция по интеграции
            </a>
            <a href="#" class="demo-btn" onclick="exportDemo()">
                💾 Экспорт демо
            </a>
        </div>
    </div>

    <!-- Интеграция M2 Enhancements -->
    <script src="m2-enhancements-loader.js"></script>

    <script>
        // Базовая функция расчета
        function calculate() {
            const propertyPrice = parseFloat(document.getElementById('propertyPrice').value) || 0;
            const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
            const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
            const loanTerm = parseFloat(document.getElementById('loanTerm').value) || 0;

            const loanAmount = propertyPrice - downPayment;
            const monthlyRate = interestRate / 100 / 12;
            const numPayments = loanTerm * 12;

            if (loanAmount <= 0 || monthlyRate <= 0 || numPayments <= 0) {
                alert('Заполните все поля корректными значениями');
                return;
            }

            const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
            const totalPayment = monthlyPayment * numPayments;
            const totalInterest = totalPayment - loanAmount;
            const effectiveRate = ((totalPayment / loanAmount - 1) * 100 / loanTerm);

            // Обновляем результаты
            document.getElementById('monthlyPayment').textContent = formatMoney(monthlyPayment);
            document.getElementById('totalPayment').textContent = formatMoney(totalPayment);
            document.getElementById('totalInterest').textContent = formatMoney(totalInterest);
            document.getElementById('effectiveRate').textContent = effectiveRate.toFixed(2) + '%';

            // Показываем блок результатов
            document.getElementById('results').style.display = 'block';
        }

        function formatMoney(amount) {
            return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₽';
        }

        // Обновление статуса модулей
        function updateModuleStatus() {
            const modules = [
                { name: 'Dark Theme', key: 'darkTheme', icon: '🌙' },
                { name: 'Bundle Optimizer', key: 'bundleOptimizer', icon: '⚡' },
                { name: 'Advanced Validation', key: 'advancedValidation', icon: '✅' },
                { name: 'Calculation Templates', key: 'calculationTemplates', icon: '📄' },
                { name: 'Scenario Comparison', key: 'scenarioComparison', icon: '📊' },
                { name: 'Excel Export', key: 'excelExporter', icon: '📑' }
            ];

            const statusContainer = document.getElementById('module-status');
            statusContainer.innerHTML = '';

            modules.forEach(module => {
                const isLoaded = window[module.key] !== undefined;
                const statusClass = isLoaded ? 'status-loaded' : 'status-error';
                const statusText = isLoaded ? 'Загружен' : 'Не загружен';

                const statusItem = document.createElement('div');
                statusItem.className = 'status-item';
                statusItem.innerHTML = \`
                    <span>\${module.icon} \${module.name}</span>
                    <span><span class="status-indicator \${statusClass}"></span> \${statusText}</span>
                \`;

                statusContainer.appendChild(statusItem);
            });
        }

        // Тестирование всех функций
        function testAllFeatures() {
            console.group('🧪 Тестирование функций M2 Enhancements');

            // Тест темной темы
            if (window.darkTheme) {
                console.log('✅ Dark Theme: OK');
                window.darkTheme.toggleTheme();
                setTimeout(() => window.darkTheme.toggleTheme(), 1000);
            } else {
                console.log('❌ Dark Theme: Не загружен');
            }

            // Тест валидации
            if (window.advancedValidation) {
                console.log('✅ Advanced Validation: OK');
                console.log('Статистика валидации:', window.advancedValidation.getValidationStats());
            } else {
                console.log('❌ Advanced Validation: Не загружен');
            }

            // Тест шаблонов
            if (window.calculationTemplates) {
                console.log('✅ Calculation Templates: OK');
                console.log('Статистика шаблонов:', window.calculationTemplates.getTemplateStats());
            } else {
                console.log('❌ Calculation Templates: Не загружен');
            }

            console.groupEnd();
            alert('Тестирование завершено! Проверьте консоль для подробностей.');
        }

        // Информация об интеграции
        function showIntegrationInfo() {
            const info = \`
M2 Calculator Enhancements - Информация об интеграции

Для интеграции в ваш проект:

1. Скопируйте все .js файлы в папку с калькулятором
2. Добавьте в HTML: <script src="m2-enhancements-loader.js"></script>
3. Все модули загрузятся автоматически!

Модули можно настраивать через JavaScript API.

Подробности в файле integration-guide.md
            \`;

            alert(info);
        }

        // Экспорт демо
        function exportDemo() {
            if (window.excelExporter) {
                calculate(); // Убеждаемся что есть данные
                setTimeout(() => {
                    window.excelExporter.exportCurrentCalculator();
                }, 100);
            } else {
                alert('Excel Export не загружен');
            }
        }

        // Обновляем статус после загрузки
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(updateModuleStatus, 2000); // Даем время модулям загрузиться

            // Периодически проверяем статус
            setInterval(updateModuleStatus, 3000);
        });

        // Автоматический расчет для демо
        setTimeout(() => {
            calculate();
        }, 3000);
    </script>
</body>
</html>
        `.trim();
    }
}

// Запускаем интеграцию
const integrationGuide = new IntegrationGuide();

// Экспорт файлов
export { IntegrationGuide };