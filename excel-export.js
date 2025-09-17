/**
 * Excel Export - система экспорта данных в Excel для калькуляторов М2
 * Поддерживает экспорт расчетов, таблиц и сравнений в формате XLSX
 */

class ExcelExporter {
    constructor() {
        this.workbook = null;
        this.worksheets = new Map();
        this.styles = this.createStyles();
        this.charts = [];
        this.images = [];
    }

    /**
     * Инициализация экспортера Excel
     */
    async init() {
        await this.loadLibrary();
        this.setupEventListeners();
        this.injectExportButtons();

        console.log('📊 Excel Export инициализирован');
    }

    /**
     * Загрузка библиотеки SheetJS
     */
    async loadLibrary() {
        if (typeof XLSX !== 'undefined') return;

        try {
            // Загружаем SheetJS с CDN
            await this.loadScript('https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js');
            console.log('📚 SheetJS загружен');
        } catch (error) {
            console.error('Ошибка загрузки SheetJS:', error);
            // Fallback - создаем упрощенную версию без библиотеки
            this.createFallbackExporter();
        }
    }

    /**
     * Загрузка внешнего скрипта
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Создание fallback экспортера без внешних библиотек
     */
    createFallbackExporter() {
        window.XLSX = {
            utils: {
                book_new: () => ({ Sheets: {}, SheetNames: [] }),
                json_to_sheet: (data) => this.jsonToSheetFallback(data),
                book_append_sheet: (wb, ws, name) => {
                    wb.Sheets[name] = ws;
                    wb.SheetNames.push(name);
                }
            },
            writeFile: (wb, filename) => this.writeFileFallback(wb, filename)
        };
    }

    /**
     * Fallback функция для преобразования JSON в лист
     */
    jsonToSheetFallback(data) {
        if (!Array.isArray(data) || data.length === 0) return {};

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                // Экранируем запятые и кавычки
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(','))
        ].join('\n');

        return { csvContent, headers, data };
    }

    /**
     * Fallback функция для записи файла
     */
    writeFileFallback(workbook, filename) {
        const sheets = Object.keys(workbook.Sheets);
        if (sheets.length === 0) return;

        const mainSheet = workbook.Sheets[sheets[0]];
        const csvContent = mainSheet.csvContent || '';

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadBlob(blob, filename.replace('.xlsx', '.csv'));
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.export-excel-btn')) {
                this.exportCurrentCalculator();
            }

            if (e.target.matches('.export-comparison-excel-btn')) {
                this.exportScenarioComparison();
            }

            if (e.target.matches('.export-detailed-excel-btn')) {
                this.exportDetailedAnalysis();
            }
        });
    }

    /**
     * Добавление кнопок экспорта на страницы
     */
    injectExportButtons() {
        // Находим все блоки результатов
        const resultsSections = document.querySelectorAll('.results-section, .calculation-results, .results-container');

        resultsSections.forEach(section => {
            if (!section.querySelector('.excel-export-controls')) {
                this.addExportControls(section);
            }
        });
    }

    /**
     * Добавление элементов управления экспортом
     */
    addExportControls(container) {
        const exportControls = document.createElement('div');
        exportControls.className = 'excel-export-controls';
        exportControls.innerHTML = `
            <div class="export-buttons-group">
                <button class="export-excel-btn" title="Экспорт результатов в Excel">
                    <i class="feather-icon" data-feather="file-text"></i>
                    Экспорт в Excel
                </button>
                <button class="export-detailed-excel-btn" title="Детальный анализ в Excel">
                    <i class="feather-icon" data-feather="bar-chart"></i>
                    Детальный отчет
                </button>
            </div>
            <div class="export-options">
                <label class="export-option">
                    <input type="checkbox" id="include-charts" checked>
                    Включить графики
                </label>
                <label class="export-option">
                    <input type="checkbox" id="include-formulas" checked>
                    Показать формулы
                </label>
                <label class="export-option">
                    <input type="checkbox" id="include-summary" checked>
                    Сводка результатов
                </label>
            </div>
        `;

        container.appendChild(exportControls);

        // Инициализируем иконки Feather
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Экспорт текущего калькулятора
     */
    async exportCurrentCalculator() {
        try {
            const calculatorData = this.extractCalculatorData();
            const workbook = XLSX.utils.book_new();

            // Основной лист с результатами
            this.addResultsSheet(workbook, calculatorData);

            // Лист с параметрами
            this.addParametersSheet(workbook, calculatorData);

            // Лист с расшифровкой (если есть)
            if (calculatorData.breakdown) {
                this.addBreakdownSheet(workbook, calculatorData);
            }

            // Лист с графиками (текстовое описание)
            if (document.getElementById('include-charts')?.checked) {
                this.addChartsSheet(workbook, calculatorData);
            }

            // Лист с формулами
            if (document.getElementById('include-formulas')?.checked) {
                this.addFormulasSheet(workbook, calculatorData);
            }

            const filename = `${calculatorData.type}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, filename);

            this.showNotification('Данные экспортированы в Excel', 'success');

            // Аналитика
            if (window.gtag) {
                gtag('event', 'excel_export', {
                    calculator_type: calculatorData.type,
                    export_type: 'standard'
                });
            }

        } catch (error) {
            console.error('Ошибка экспорта:', error);
            this.showNotification('Ошибка при экспорте в Excel', 'error');
        }
    }

    /**
     * Извлечение данных калькулятора
     */
    extractCalculatorData() {
        const calculatorType = this.detectCalculatorType();
        const params = this.extractParameters();
        const results = this.extractResults();

        return {
            type: calculatorType,
            title: this.getCalculatorTitle(),
            timestamp: new Date().toISOString(),
            parameters: params,
            results: results,
            breakdown: this.extractBreakdown(),
            charts: this.extractChartsData(),
            metadata: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                version: '1.0'
            }
        };
    }

    /**
     * Определение типа калькулятора
     */
    detectCalculatorType() {
        const url = window.location.pathname;
        const title = document.title.toLowerCase();

        if (url.includes('mortgage') || title.includes('ипотек')) return 'mortgage';
        if (url.includes('rental') || title.includes('доходност')) return 'rental';
        if (url.includes('rent') && url.includes('buy')) return 'rent_vs_buy';
        if (url.includes('prepayment') || title.includes('досрочн')) return 'prepayment';
        if (url.includes('affordability') || title.includes('доступност')) return 'affordability';
        if (url.includes('airbnb') || title.includes('краткосрочн')) return 'airbnb';

        return 'calculator';
    }

    /**
     * Получение заголовка калькулятора
     */
    getCalculatorTitle() {
        const h1 = document.querySelector('h1');
        if (h1) return h1.textContent.trim();

        const title = document.title;
        return title.replace(' - М2 Калькуляторы', '');
    }

    /**
     * Извлечение параметров
     */
    extractParameters() {
        const params = {};
        const inputs = document.querySelectorAll('input[type="number"], input[type="range"], select');

        inputs.forEach(input => {
            if (input.id || input.name) {
                const key = input.id || input.name;
                const label = this.getInputLabel(input);

                let value = input.value;
                if (input.type === 'number' || input.type === 'range') {
                    value = parseFloat(value) || 0;
                }

                params[key] = {
                    label: label,
                    value: value,
                    unit: this.getInputUnit(input)
                };
            }
        });

        return params;
    }

    /**
     * Получение метки поля ввода
     */
    getInputLabel(input) {
        // Ищем связанный label
        let label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return label.textContent.trim();

        // Ищем label-родитель
        label = input.closest('label');
        if (label) return label.textContent.replace(input.value, '').trim();

        // Ищем ближайший текст
        const container = input.closest('.input-group, .form-group, .calculator-field');
        if (container) {
            const labelText = container.querySelector('.label, .field-label, span, p');
            if (labelText) return labelText.textContent.trim();
        }

        // Fallback - используем placeholder или id
        return input.placeholder || input.id || 'Параметр';
    }

    /**
     * Получение единицы измерения
     */
    getInputUnit(input) {
        const fieldName = input.id || input.name;

        const units = {
            'Amount': '₽',
            'Price': '₽',
            'Payment': '₽',
            'Income': '₽',
            'Rent': '₽',
            'Rate': '%',
            'Percentage': '%',
            'Term': 'лет',
            'Years': 'лет',
            'Months': 'мес'
        };

        for (const [key, unit] of Object.entries(units)) {
            if (fieldName.toLowerCase().includes(key.toLowerCase())) {
                return unit;
            }
        }

        return '';
    }

    /**
     * Извлечение результатов
     */
    extractResults() {
        const results = {};
        const resultElements = document.querySelectorAll('.result-item, .calculation-result, .metric-value');

        resultElements.forEach(element => {
            const label = this.getResultLabel(element);
            const value = this.getResultValue(element);

            if (label && value !== null) {
                results[label] = {
                    value: value,
                    formatted: element.textContent.trim(),
                    type: this.detectResultType(element)
                };
            }
        });

        // Извлекаем значения из таблиц
        const tables = document.querySelectorAll('table');
        tables.forEach((table, index) => {
            const tableData = this.extractTableData(table);
            if (tableData.length > 0) {
                results[`table_${index + 1}`] = {
                    type: 'table',
                    data: tableData,
                    headers: this.extractTableHeaders(table)
                };
            }
        });

        return results;
    }

    /**
     * Получение метки результата
     */
    getResultLabel(element) {
        // Ищем метку в том же контейнере
        const container = element.closest('.result-item, .metric, .calculation-row');
        if (container) {
            const labelEl = container.querySelector('.label, .metric-label, .result-label');
            if (labelEl && labelEl !== element) {
                return labelEl.textContent.trim();
            }
        }

        // Ищем предыдущий элемент с текстом
        const prev = element.previousElementSibling;
        if (prev && !prev.querySelector('input, button')) {
            return prev.textContent.trim();
        }

        return element.className || 'Результат';
    }

    /**
     * Получение числового значения результата
     */
    getResultValue(element) {
        const text = element.textContent.trim();

        // Извлекаем число из текста
        const numberMatch = text.match(/([\d\s,.-]+)/);
        if (numberMatch) {
            const numStr = numberMatch[1].replace(/\s/g, '').replace(',', '.');
            const num = parseFloat(numStr);
            return isNaN(num) ? text : num;
        }

        return text;
    }

    /**
     * Определение типа результата
     */
    detectResultType(element) {
        const text = element.textContent.toLowerCase();

        if (text.includes('₽') || text.includes('руб')) return 'currency';
        if (text.includes('%')) return 'percentage';
        if (text.includes('лет') || text.includes('мес')) return 'duration';

        return 'text';
    }

    /**
     * Извлечение данных таблицы
     */
    extractTableData(table) {
        const rows = table.querySelectorAll('tbody tr, tr');
        const data = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td, th');
            if (cells.length > 0) {
                const rowData = {};
                cells.forEach((cell, index) => {
                    const header = this.getTableHeader(table, index) || `column_${index + 1}`;
                    rowData[header] = cell.textContent.trim();
                });
                data.push(rowData);
            }
        });

        return data;
    }

    /**
     * Извлечение заголовков таблицы
     */
    extractTableHeaders(table) {
        const headerRow = table.querySelector('thead tr, tr:first-child');
        if (!headerRow) return [];

        const headers = [];
        const cells = headerRow.querySelectorAll('th, td');
        cells.forEach(cell => {
            headers.push(cell.textContent.trim());
        });

        return headers;
    }

    /**
     * Получение заголовка колонки таблицы
     */
    getTableHeader(table, columnIndex) {
        const headerRow = table.querySelector('thead tr, tr:first-child');
        if (!headerRow) return null;

        const headerCell = headerRow.querySelectorAll('th, td')[columnIndex];
        return headerCell ? headerCell.textContent.trim() : null;
    }

    /**
     * Извлечение данных для расшифровки
     */
    extractBreakdown() {
        const breakdown = {};

        // Ищем детализированные расчеты
        const detailSections = document.querySelectorAll('.calculation-details, .breakdown, .detailed-results');

        detailSections.forEach((section, index) => {
            const title = section.querySelector('h3, h4, .section-title')?.textContent || `Детализация ${index + 1}`;
            const items = [];

            const detailItems = section.querySelectorAll('.detail-item, .breakdown-item');
            detailItems.forEach(item => {
                const label = item.querySelector('.label, .item-label')?.textContent || '';
                const value = item.querySelector('.value, .item-value')?.textContent || item.textContent;

                items.push({ label: label.trim(), value: value.trim() });
            });

            if (items.length > 0) {
                breakdown[title] = items;
            }
        });

        return breakdown;
    }

    /**
     * Извлечение данных графиков
     */
    extractChartsData() {
        const charts = [];

        // Ищем canvas элементы (Chart.js)
        const canvases = document.querySelectorAll('canvas[data-chart], .chart-container canvas');
        canvases.forEach((canvas, index) => {
            const chart = {
                id: canvas.id || `chart_${index + 1}`,
                type: canvas.dataset.chartType || 'unknown',
                title: this.getChartTitle(canvas),
                data: this.extractChartData(canvas)
            };
            charts.push(chart);
        });

        return charts;
    }

    /**
     * Получение заголовка графика
     */
    getChartTitle(canvas) {
        const container = canvas.closest('.chart-container, .chart-section');
        if (container) {
            const title = container.querySelector('h3, h4, .chart-title');
            if (title) return title.textContent.trim();
        }

        return canvas.dataset.title || 'График';
    }

    /**
     * Извлечение данных графика
     */
    extractChartData(canvas) {
        // Пытаемся получить данные из Chart.js
        if (canvas.chart && canvas.chart.data) {
            return {
                labels: canvas.chart.data.labels || [],
                datasets: canvas.chart.data.datasets || []
            };
        }

        // Fallback - возвращаем placeholder
        return {
            note: 'Данные графика недоступны для экспорта'
        };
    }

    /**
     * Добавление листа результатов
     */
    addResultsSheet(workbook, data) {
        const resultsData = [];

        // Заголовок отчета
        resultsData.push({
            parameter: 'ОТЧЕТ КАЛЬКУЛЯТОРА М2',
            value: '',
            unit: ''
        });
        resultsData.push({
            parameter: 'Тип калькулятора',
            value: data.title,
            unit: ''
        });
        resultsData.push({
            parameter: 'Дата расчета',
            value: new Date(data.timestamp).toLocaleDateString('ru-RU'),
            unit: ''
        });
        resultsData.push({ parameter: '', value: '', unit: '' }); // Пустая строка

        // Основные результаты
        resultsData.push({
            parameter: '=== РЕЗУЛЬТАТЫ ===',
            value: '',
            unit: ''
        });

        Object.entries(data.results).forEach(([key, result]) => {
            if (result.type !== 'table') {
                resultsData.push({
                    parameter: key,
                    value: result.value,
                    unit: this.getUnitByType(result.type)
                });
            }
        });

        resultsData.push({ parameter: '', value: '', unit: '' }); // Пустая строка

        // Параметры
        resultsData.push({
            parameter: '=== ПАРАМЕТРЫ ===',
            value: '',
            unit: ''
        });

        Object.entries(data.parameters).forEach(([key, param]) => {
            resultsData.push({
                parameter: param.label,
                value: param.value,
                unit: param.unit
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(resultsData);
        this.applyResultsSheetFormatting(worksheet);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Результаты');
    }

    /**
     * Добавление листа параметров
     */
    addParametersSheet(workbook, data) {
        const parametersData = Object.entries(data.parameters).map(([key, param]) => ({
            Параметр: param.label,
            Значение: param.value,
            Единица: param.unit,
            'Внутреннее имя': key
        }));

        const worksheet = XLSX.utils.json_to_sheet(parametersData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Параметры');
    }

    /**
     * Добавление листа с детализацией
     */
    addBreakdownSheet(workbook, data) {
        const breakdownData = [];

        Object.entries(data.breakdown).forEach(([section, items]) => {
            breakdownData.push({
                Раздел: section,
                Показатель: '',
                Значение: ''
            });

            items.forEach(item => {
                breakdownData.push({
                    Раздел: '',
                    Показатель: item.label,
                    Значение: item.value
                });
            });

            breakdownData.push({ Раздел: '', Показатель: '', Значение: '' }); // Пустая строка
        });

        const worksheet = XLSX.utils.json_to_sheet(breakdownData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Детализация');
    }

    /**
     * Добавление листа с графиками
     */
    addChartsSheet(workbook, data) {
        const chartsData = [];

        chartsData.push({
            График: 'ОПИСАНИЕ ГРАФИКОВ',
            Тип: '',
            Данные: 'В данном разделе представлено текстовое описание графиков из калькулятора'
        });
        chartsData.push({ График: '', Тип: '', Данные: '' });

        data.charts.forEach(chart => {
            chartsData.push({
                График: chart.title,
                Тип: chart.type,
                Данные: JSON.stringify(chart.data, null, 2)
            });
        });

        if (chartsData.length > 2) {
            const worksheet = XLSX.utils.json_to_sheet(chartsData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Графики');
        }
    }

    /**
     * Добавление листа с формулами
     */
    addFormulasSheet(workbook, data) {
        const formulas = this.getCalculationFormulas(data.type);

        const formulasData = formulas.map(formula => ({
            Расчет: formula.name,
            Формула: formula.formula,
            Описание: formula.description,
            Переменные: formula.variables || ''
        }));

        if (formulasData.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(formulasData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Формулы');
        }
    }

    /**
     * Получение формул расчета по типу калькулятора
     */
    getCalculationFormulas(calculatorType) {
        const formulas = {
            mortgage: [
                {
                    name: 'Ежемесячный платеж',
                    formula: 'ЕП = С × (i × (1 + i)^n) / ((1 + i)^n - 1)',
                    description: 'Аннуитетный платеж по ипотеке',
                    variables: 'С - сумма кредита, i - месячная ставка, n - количество месяцев'
                },
                {
                    name: 'Общая переплата',
                    formula: 'Переплата = (ЕП × n) - С',
                    description: 'Общая сумма переплаты по кредиту',
                    variables: 'ЕП - ежемесячный платеж, n - срок в месяцах, С - сумма кредита'
                }
            ],
            rental: [
                {
                    name: 'Валовая доходность',
                    formula: 'ВД = (Аренда × 12) / Стоимость × 100%',
                    description: 'Доходность без учета расходов',
                    variables: 'Аренда - месячная арендная плата'
                },
                {
                    name: 'Чистая доходность',
                    formula: 'ЧД = ((Аренда × 12) - Расходы) / Стоимость × 100%',
                    description: 'Доходность с учетом всех расходов',
                    variables: 'Расходы - годовые расходы на содержание'
                }
            ]
        };

        return formulas[calculatorType] || [];
    }

    /**
     * Экспорт сравнения сценариев
     */
    async exportScenarioComparison() {
        try {
            const scenarios = this.getComparisonScenarios();
            if (!scenarios || scenarios.length < 2) {
                this.showNotification('Нет сценариев для экспорта', 'warning');
                return;
            }

            const workbook = XLSX.utils.book_new();

            // Лист сравнения
            this.addComparisonSheet(workbook, scenarios);

            // Листы для каждого сценария
            scenarios.forEach((scenario, index) => {
                this.addScenarioSheet(workbook, scenario, index + 1);
            });

            // Лист выводов
            this.addInsightsSheet(workbook, scenarios);

            const filename = `scenario_comparison_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, filename);

            this.showNotification('Сравнение сценариев экспортировано', 'success');

        } catch (error) {
            console.error('Ошибка экспорта сравнения:', error);
            this.showNotification('Ошибка экспорта сравнения', 'error');
        }
    }

    /**
     * Получение сценариев для сравнения
     */
    getComparisonScenarios() {
        if (window.scenarioComparison) {
            return Array.from(window.scenarioComparison.scenarios.values());
        }
        return [];
    }

    /**
     * Добавление листа сравнения
     */
    addComparisonSheet(workbook, scenarios) {
        const comparisonData = [];

        // Заголовок
        const headerRow = { Показатель: 'ПОКАЗАТЕЛЬ' };
        scenarios.forEach((scenario, index) => {
            headerRow[`scenario_${index + 1}`] = scenario.name;
        });
        comparisonData.push(headerRow);

        // Данные по каждому показателю
        const firstScenario = scenarios[0];
        const metrics = Object.keys(firstScenario.results);

        metrics.forEach(metric => {
            const row = { Показатель: this.getMetricDisplayName(metric) };

            scenarios.forEach((scenario, index) => {
                const value = scenario.results[metric];
                row[`scenario_${index + 1}`] = this.formatMetricForExcel(value, metric);
            });

            comparisonData.push(row);
        });

        const worksheet = XLSX.utils.json_to_sheet(comparisonData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Сравнение');
    }

    /**
     * Добавление листа сценария
     */
    addScenarioSheet(workbook, scenario, number) {
        const scenarioData = [];

        // Заголовок сценария
        scenarioData.push({
            Параметр: `СЦЕНАРИЙ: ${scenario.name}`,
            Значение: '',
            Примечание: `Создан: ${new Date(scenario.createdAt).toLocaleDateString('ru-RU')}`
        });
        scenarioData.push({ Параметр: '', Значение: '', Примечание: '' });

        // Параметры
        scenarioData.push({ Параметр: '=== ПАРАМЕТРЫ ===', Значение: '', Примечание: '' });
        Object.entries(scenario.params).forEach(([key, value]) => {
            scenarioData.push({
                Параметр: this.getParameterDisplayName(key),
                Значение: value,
                Примечание: this.getParameterNote(key, value)
            });
        });

        scenarioData.push({ Параметр: '', Значение: '', Примечание: '' });

        // Результаты
        scenarioData.push({ Параметр: '=== РЕЗУЛЬТАТЫ ===', Значение: '', Примечание: '' });
        Object.entries(scenario.results).forEach(([key, value]) => {
            scenarioData.push({
                Параметр: this.getMetricDisplayName(key),
                Значение: this.formatMetricForExcel(value, key),
                Примечание: this.getResultNote(key, value)
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(scenarioData);
        XLSX.utils.book_append_sheet(workbook, worksheet, `Сценарий ${number}`);
    }

    /**
     * Добавление листа с выводами
     */
    addInsightsSheet(workbook, scenarios) {
        const insights = this.generateComparisonInsights(scenarios);

        const insightsData = insights.map((insight, index) => ({
            '№': index + 1,
            Вывод: insight.title,
            Описание: insight.description,
            Рекомендация: insight.recommendation || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(insightsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Выводы');
    }

    /**
     * Генерация инсайтов для сравнения
     */
    generateComparisonInsights(scenarios) {
        const insights = [];

        // Лучший сценарий по ключевым метрикам
        const keyMetrics = ['monthlyPayment', 'totalInterest', 'netYield', 'roi'];

        keyMetrics.forEach(metric => {
            const scenariosWithMetric = scenarios.filter(s => s.results[metric] !== undefined);
            if (scenariosWithMetric.length < 2) return;

            const best = this.findBestScenario(scenariosWithMetric, metric);
            if (best) {
                insights.push({
                    title: `Лучший по показателю "${this.getMetricDisplayName(metric)}"`,
                    description: `Сценарий "${best.name}" показывает оптимальное значение`,
                    recommendation: this.getMetricRecommendation(metric, best.results[metric])
                });
            }
        });

        // Экономия или потери
        const savings = this.calculateSavings(scenarios);
        if (savings.amount > 0) {
            insights.push({
                title: 'Потенциальная экономия',
                description: `При выборе оптимального сценария можно сэкономить ${this.formatNumber(savings.amount)} ₽`,
                recommendation: `Рекомендуется выбрать сценарий "${savings.bestScenario}"`
            });
        }

        return insights;
    }

    /**
     * Поиск лучшего сценария по метрике
     */
    findBestScenario(scenarios, metric) {
        const lowerIsBetter = ['totalInterest', 'monthlyPayment', 'expenses'];

        if (lowerIsBetter.includes(metric)) {
            return scenarios.reduce((best, current) =>
                current.results[metric] < best.results[metric] ? current : best
            );
        } else {
            return scenarios.reduce((best, current) =>
                current.results[metric] > best.results[metric] ? current : best
            );
        }
    }

    /**
     * Расчет потенциальной экономии
     */
    calculateSavings(scenarios) {
        if (scenarios.length < 2) return { amount: 0 };

        // Ищем показатель "общая переплата" или "общие затраты"
        const costMetrics = ['totalInterest', 'totalPayment', 'totalCost'];
        let relevantMetric = null;

        for (const metric of costMetrics) {
            if (scenarios[0].results[metric] !== undefined) {
                relevantMetric = metric;
                break;
            }
        }

        if (!relevantMetric) return { amount: 0 };

        const costs = scenarios.map(s => ({ name: s.name, cost: s.results[relevantMetric] }));
        const minCost = Math.min(...costs.map(c => c.cost));
        const maxCost = Math.max(...costs.map(c => c.cost));

        return {
            amount: maxCost - minCost,
            bestScenario: costs.find(c => c.cost === minCost)?.name
        };
    }

    /**
     * Детальный экспорт с анализом
     */
    async exportDetailedAnalysis() {
        try {
            const data = this.extractCalculatorData();
            const workbook = XLSX.utils.book_new();

            // Основные листы
            this.addResultsSheet(workbook, data);
            this.addParametersSheet(workbook, data);

            // Дополнительные аналитические листы
            this.addSensitivityAnalysisSheet(workbook, data);
            this.addBenchmarkSheet(workbook, data);
            this.addRiskAnalysisSheet(workbook, data);

            const filename = `detailed_analysis_${data.type}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, filename);

            this.showNotification('Детальный анализ экспортирован', 'success');

        } catch (error) {
            console.error('Ошибка детального экспорта:', error);
            this.showNotification('Ошибка экспорта анализа', 'error');
        }
    }

    /**
     * Добавление листа анализа чувствительности
     */
    addSensitivityAnalysisSheet(workbook, data) {
        if (data.type !== 'mortgage') return;

        const baseRate = data.parameters.interestRate?.value || 10;
        const baseLoan = data.parameters.loanAmount?.value || 3000000;
        const baseTerm = data.parameters.loanTerm?.value || 20;

        const sensitivityData = [];

        // Анализ изменения процентной ставки
        sensitivityData.push({ Параметр: 'АНАЛИЗ ЧУВСТВИТЕЛЬНОСТИ К СТАВКЕ', Изменение: '', 'Новый платеж': '', Разница: '' });

        [-2, -1, -0.5, 0, 0.5, 1, 2].forEach(change => {
            const newRate = baseRate + change;
            const newPayment = this.calculateMortgagePayment(baseLoan, newRate, baseTerm);
            const basePayment = this.calculateMortgagePayment(baseLoan, baseRate, baseTerm);

            sensitivityData.push({
                Параметр: `Ставка ${newRate}%`,
                Изменение: change > 0 ? `+${change}%` : `${change}%`,
                'Новый платеж': Math.round(newPayment),
                Разница: Math.round(newPayment - basePayment)
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(sensitivityData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Анализ чувствительности');
    }

    /**
     * Расчет ипотечного платежа
     */
    calculateMortgagePayment(amount, rate, years) {
        const monthlyRate = rate / 100 / 12;
        const numPayments = years * 12;

        return amount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    /**
     * Добавление листа бенчмарков
     */
    addBenchmarkSheet(workbook, data) {
        const benchmarks = this.getBenchmarkData(data.type);

        if (benchmarks.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(benchmarks);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Бенчмарки');
        }
    }

    /**
     * Получение данных бенчмарков
     */
    getBenchmarkData(calculatorType) {
        const benchmarks = {
            mortgage: [
                { Показатель: 'Средняя ставка по ипотеке', Значение: '12.5%', Источник: 'ЦБ РФ' },
                { Показатель: 'Рекомендуемый первоначальный взнос', Значение: '20%', Источник: 'Банки' },
                { Показатель: 'Максимальная долговая нагрузка', Значение: '45%', Источник: 'ЦБ РФ' }
            ],
            rental: [
                { Показатель: 'Средняя доходность недвижимости', Значение: '6-8%', Источник: 'Аналитика М2' },
                { Показатель: 'Депозитная ставка', Значение: '8%', Источник: 'Банки' },
                { Показатель: 'Инфляция', Значение: '5-6%', Источник: 'Росстат' }
            ]
        };

        return benchmarks[calculatorType] || [];
    }

    /**
     * Добавление листа анализа рисков
     */
    addRiskAnalysisSheet(workbook, data) {
        const risks = this.analyzeRisks(data);

        if (risks.length > 0) {
            const riskData = risks.map(risk => ({
                Риск: risk.name,
                Вероятность: risk.probability,
                Влияние: risk.impact,
                Описание: risk.description,
                Митигация: risk.mitigation
            }));

            const worksheet = XLSX.utils.json_to_sheet(riskData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Анализ рисков');
        }
    }

    /**
     * Анализ рисков
     */
    analyzeRisks(data) {
        const risks = [];

        if (data.type === 'mortgage') {
            const debtRatio = this.calculateDebtRatio(data);
            if (debtRatio > 0.4) {
                risks.push({
                    name: 'Высокая долговая нагрузка',
                    probability: 'Высокая',
                    impact: 'Критический',
                    description: `Долговая нагрузка ${(debtRatio * 100).toFixed(1)}% превышает рекомендуемые 40%`,
                    mitigation: 'Увеличить доход или снизить сумму кредита'
                });
            }
        }

        if (data.type === 'rental') {
            const yield = data.results.netYield?.value;
            if (yield < 4) {
                risks.push({
                    name: 'Низкая доходность',
                    probability: 'Средняя',
                    impact: 'Значительный',
                    description: `Доходность ${yield}% ниже инфляции`,
                    mitigation: 'Пересмотреть арендную ставку или объект'
                });
            }
        }

        return risks;
    }

    /**
     * Расчет долговой нагрузки
     */
    calculateDebtRatio(data) {
        const monthlyPayment = data.results.monthlyPayment?.value || 0;
        const income = data.parameters.income?.value || 0;

        return income > 0 ? monthlyPayment / income : 0;
    }

    // Вспомогательные методы

    formatNumber(num) {
        return new Intl.NumberFormat('ru-RU').format(Math.round(num));
    }

    formatMetricForExcel(value, metric) {
        if (typeof value !== 'number') return value;

        if (metric.includes('Rate') || metric.includes('Yield')) {
            return `${value.toFixed(2)}%`;
        }

        return this.formatNumber(value);
    }

    getMetricDisplayName(key) {
        const names = {
            monthlyPayment: 'Ежемесячный платеж',
            totalPayment: 'Общая сумма',
            totalInterest: 'Переплата',
            netYield: 'Чистая доходность',
            grossYield: 'Валовая доходность',
            roi: 'ROI'
        };

        return names[key] || key;
    }

    getParameterDisplayName(key) {
        const names = {
            loanAmount: 'Сумма кредита',
            interestRate: 'Процентная ставка',
            loanTerm: 'Срок кредита',
            propertyPrice: 'Стоимость недвижимости',
            monthlyRent: 'Арендная плата'
        };

        return names[key] || key;
    }

    getParameterNote(key, value) {
        if (key === 'interestRate') return 'Годовая ставка';
        if (key === 'loanTerm') return 'В годах';
        return '';
    }

    getResultNote(key, value) {
        if (key.includes('Payment') || key.includes('Amount')) return 'В рублях';
        if (key.includes('Rate') || key.includes('Yield')) return 'Годовая доходность';
        return '';
    }

    getUnitByType(type) {
        const units = {
            currency: '₽',
            percentage: '%',
            duration: ''
        };

        return units[type] || '';
    }

    getMetricRecommendation(metric, value) {
        if (metric === 'netYield') {
            if (value > 10) return 'Отличная доходность';
            if (value > 6) return 'Хорошая доходность';
            return 'Низкая доходность';
        }

        return '';
    }

    applyResultsSheetFormatting(worksheet) {
        // Базовое форматирование для главного листа
        // В реальной реализации здесь можно настроить стили ячеек
    }

    createStyles() {
        return {
            header: { bold: true, size: 14 },
            subheader: { bold: true, size: 12 },
            currency: { numFmt: '#,##0.00 "₽"' },
            percentage: { numFmt: '0.00%' }
        };
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showNotification(message, type) {
        if (window.scenarioComparison?.showNotification) {
            window.scenarioComparison.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(message);
        }
    }
}

// CSS стили для Excel экспорта
const excelExportStyles = `
<style>
.excel-export-controls {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
    margin-top: 20px;
}

.export-buttons-group {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

.export-excel-btn,
.export-detailed-excel-btn,
.export-comparison-excel-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9em;
    transition: all 0.2s;
}

.export-excel-btn:hover {
    background: #218838;
    transform: translateY(-1px);
}

.export-detailed-excel-btn {
    background: #17a2b8;
}

.export-detailed-excel-btn:hover {
    background: #138496;
}

.export-comparison-excel-btn {
    background: #6f42c1;
}

.export-comparison-excel-btn:hover {
    background: #5a36a3;
}

.export-options {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    padding-top: 10px;
    border-top: 1px solid #e9ecef;
}

.export-option {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9em;
    cursor: pointer;
    user-select: none;
}

.export-option input[type="checkbox"] {
    margin: 0;
}

.export-option:hover {
    color: #3416b6;
}

@media (max-width: 768px) {
    .export-buttons-group {
        flex-direction: column;
    }

    .export-options {
        flex-direction: column;
        gap: 8px;
    }
}
</style>
`;

// Инъекция стилей
if (!document.querySelector('#excel-export-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'excel-export-styles';
    styleElement.innerHTML = excelExportStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Глобальная инициализация
window.ExcelExporter = ExcelExporter;

// Автоматическая инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        window.excelExporter = new ExcelExporter();
        await window.excelExporter.init();
    });
} else {
    setTimeout(async () => {
        window.excelExporter = new ExcelExporter();
        await window.excelExporter.init();
    }, 0);
}

export { ExcelExporter };