/**
 * M2 Calculator Enhancements Loader
 * Автоматический загрузчик всех улучшений для калькуляторов М2
 */

class M2EnhancementsLoader {
    constructor() {
        this.modules = new Map();
        this.loadedModules = new Set();
        this.config = {
            enableVersionManager: true,
            enableMonitoringSystem: true,
            enableAutoUpdater: true,
            enableAnalyticsTracker: true,
            enableMetricsDashboard: true,
            enableExternalApi: true,
            enableMobileOptimizer: true,
            enablePwaManager: true,
            enableAiAssistant: true,
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
            { name: 'version-manager', file: 'version-manager.js', required: true },
            { name: 'monitoring-system', file: 'monitoring-system.js', required: true },
            { name: 'visitor-counter', file: 'visitor-counter.js', required: true },
            { name: 'auto-updater', file: 'auto-updater.js', required: true },
            { name: 'analytics-tracker', file: 'analytics-tracker.js', required: true },
            { name: 'metrics-dashboard', file: 'metrics-dashboard.js', required: false },
            { name: 'external-api', file: 'external-api.js', required: true },
            { name: 'mobile-optimizer', file: 'mobile-optimizer.js', required: true },
            { name: 'pwa-manager', file: 'pwa-manager.js', required: true },
            { name: 'ai-assistant', file: 'ai-assistant.js', required: true },
            { name: 'dark-theme', file: 'dark-theme.js', required: true },
            { name: 'advanced-validation', file: 'advanced-validation.js', required: true },
            { name: 'calculation-templates', file: 'calculation-templates.js', required: true },
            { name: 'scenario-comparison', file: 'scenario-comparison.js', required: true },
            { name: 'pdf-export', file: 'pdf-export.js', required: true },
            { name: 'advanced-ux', file: 'advanced-ux-enhancements.js', required: false }
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
        const configKey = `enable${this.toCamelCase(moduleName)}`;
        return this.config[configKey] !== false;
    }

    /**
     * Загрузка отдельного модуля
     */
    async loadModule(moduleInfo) {
        const { name, file, required } = moduleInfo;

        try {
            console.log(`📦 Загружается модуль: ${name}`);

            // Проверяем, есть ли уже скрипт на странице
            const existingScript = document.querySelector(`script[src*="${file}"]`);
            if (existingScript) {
                console.log(`✅ Модуль ${name} уже загружен`);
                this.loadedModules.add(name);
                return;
            }

            // Загружаем модуль
            await this.loadScript(file);
            this.loadedModules.add(name);

            console.log(`✅ Модуль ${name} успешно загружен`);

        } catch (error) {
            console.error(`❌ Ошибка загрузки модуля ${name}:`, error);

            if (required) {
                throw new Error(`Критический модуль ${name} не загружен`);
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
            script.onerror = () => reject(new Error(`Не удалось загрузить: ${src}`));
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
            window.scenarioComparison.updateChartsForTheme?.(themeInfo.effectiveTheme);
        }
    }

    /**
     * Интеграция Excel экспорта со сравнением сценариев
     */
    setupExcelScenarioIntegration() {
        // Добавляем кнопку экспорта сравнения в Excel
        setTimeout(() => {
            const comparisonPanels = document.querySelectorAll('.scenario-comparison-panel');
            comparisonPanels.forEach(panel => {
                const exportBtn = document.createElement('button');
                exportBtn.className = 'export-comparison-excel-btn';
                exportBtn.innerHTML = '<i class="feather-icon" data-feather="file-spreadsheet"></i> Excel';
                exportBtn.title = 'Экспорт сравнения в Excel';

                const actionsContainer = panel.querySelector('.comparison-actions');
                if (actionsContainer && !actionsContainer.querySelector('.export-comparison-excel-btn')) {
                    actionsContainer.appendChild(exportBtn);

                    // Инициализируем иконки, если доступно
                    if (typeof feather !== 'undefined') {
                        feather.replace();
                    }
                }
            });
        }, 2000);
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
        const enabledModules = Object.keys(this.config).filter(key => key.startsWith('enable') && this.config[key]);
        const status = {
            loaded: this.loadedModules.size,
            total: enabledModules.length,
            modules: Array.from(this.loadedModules)
        };

        console.group('📊 Статус модулей M2 Calculator Enhancements');
        console.log(`Загружено: ${status.loaded}/${status.total}`);
        console.log(`Активные модули: ${status.modules.join(', ')}`);
        console.groupEnd();

        // Создаем индикатор в интерфейсе (если нужно)
        if (status.loaded === status.total) {
            setTimeout(() => {
                this.createSuccessIndicator();
            }, 1000);
        }
    }

    /**
     * Создание индикатора успешной загрузки
     */
    createSuccessIndicator() {
        // Проверяем, нет ли уже индикатора
        if (document.querySelector('.m2-enhancements-loaded')) return;

        const indicator = document.createElement('div');
        indicator.className = 'm2-enhancements-loaded';
        indicator.innerHTML = `
            <div class="enhancement-badge">
                🚀 М2 Enhanced
                <span class="enhancement-count">${this.loadedModules.size}</span>
            </div>
        `;

        // Стили для индикатора
        const styles = `
            <style id="m2-enhancement-indicator-styles">
            .m2-enhancements-loaded {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 999;
                opacity: 0;
                animation: fadeInUp 0.5s ease forwards;
                animation-delay: 0.5s;
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
                user-select: none;
            }

            .enhancement-badge:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
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

            /* Темная тема */
            [data-theme="dark"] .enhancement-badge {
                background: linear-gradient(135deg, #4c6ef5, #364fc7);
                box-shadow: 0 2px 10px rgba(76, 110, 245, 0.3);
            }

            [data-theme="dark"] .enhancement-badge:hover {
                box-shadow: 0 4px 15px rgba(76, 110, 245, 0.4);
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

            @media (prefers-reduced-motion: reduce) {
                .m2-enhancements-loaded {
                    animation: none !important;
                    opacity: 1;
                }
            }
            </style>
        `;

        // Добавляем стили
        if (!document.querySelector('#m2-enhancement-indicator-styles')) {
            const styleElement = document.createElement('div');
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement.firstElementChild);
        }

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
            'dark-theme': '🌙 Темная тема - переключение между светлой и темной темами',
            'bundle-optimizer': '⚡ Оптимизация производительности - lazy loading и сжатие',
            'advanced-validation': '✅ Расширенная валидация - умные проверки параметров',
            'calculation-templates': '📄 Шаблоны расчетов - готовые наборы параметров',
            'scenario-comparison': '📊 Сравнение сценариев - анализ нескольких вариантов',
            'excel-export': '📑 Экспорт в Excel - детальные отчеты в формате XLSX'
        };

        const loadedInfo = Array.from(this.loadedModules).map(module =>
            moduleInfo[module] || `• ${module}`
        );

        const infoText = `М2 Calculator Enhancements активен!\n\nЗагруженные модули (${this.loadedModules.size}):\n${loadedInfo.join('\n')}`;

        // Создаем модальное окно вместо alert
        this.showInfoModal(infoText);
    }

    /**
     * Показ модального окна с информацией
     */
    showInfoModal(content) {
        // Удаляем существующее модальное окно
        const existingModal = document.querySelector('.m2-info-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'm2-info-modal';
        modal.innerHTML = `
            <div class="m2-modal-overlay">
                <div class="m2-modal-content">
                    <div class="m2-modal-header">
                        <h3>🚀 M2 Calculator Enhancements</h3>
                        <button class="m2-modal-close">&times;</button>
                    </div>
                    <div class="m2-modal-body">
                        <div class="module-status-grid">
                            ${this.generateModuleStatusHTML()}
                        </div>
                        <div class="integration-info">
                            <h4>📖 Интеграция</h4>
                            <p>Для интеграции в ваш проект:</p>
                            <ol>
                                <li>Скопируйте файлы модулей в папку проекта</li>
                                <li>Добавьте: <code>&lt;script src="m2-enhancements-loader.js"&gt;&lt;/script&gt;</code></li>
                                <li>Готово! Все модули загрузятся автоматически</li>
                            </ol>
                        </div>
                    </div>
                    <div class="m2-modal-footer">
                        <button class="m2-modal-btn" onclick="window.open('https://github.com/m2-calculators/enhancements', '_blank')">
                            📚 Документация
                        </button>
                        <button class="m2-modal-btn m2-modal-btn-primary" onclick="this.closest('.m2-info-modal').remove()">
                            ✅ Понятно
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Стили для модального окна
        const modalStyles = `
            <style id="m2-modal-styles">
            .m2-info-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .m2-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                animation: fadeIn 0.3s ease;
            }

            .m2-modal-content {
                background: var(--bg-primary, #ffffff);
                border-radius: 12px;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                position: relative;
                animation: slideInUp 0.3s ease;
                color: var(--text-primary, #212529);
            }

            .m2-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px;
                border-bottom: 1px solid var(--border-color, #e9ecef);
                background: linear-gradient(135deg, #3416b6, #5a67d8);
                color: white;
                border-radius: 12px 12px 0 0;
            }

            .m2-modal-header h3 {
                margin: 0;
                font-size: 18px;
            }

            .m2-modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .m2-modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .m2-modal-body {
                padding: 20px;
            }

            .module-status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
                margin-bottom: 20px;
            }

            .module-status-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 15px;
                background: var(--bg-secondary, #f8f9fa);
                border: 1px solid var(--border-color, #e9ecef);
                border-radius: 8px;
                font-size: 14px;
            }

            .module-status-name {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
            }

            .module-status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #28a745;
            }

            .integration-info {
                border-top: 1px solid var(--border-color, #e9ecef);
                padding-top: 20px;
                margin-top: 20px;
            }

            .integration-info h4 {
                margin: 0 0 10px 0;
                color: var(--text-primary, #212529);
            }

            .integration-info p {
                margin: 8px 0;
                color: var(--text-secondary, #6c757d);
            }

            .integration-info ol {
                color: var(--text-secondary, #6c757d);
                padding-left: 20px;
            }

            .integration-info li {
                margin: 8px 0;
                line-height: 1.4;
            }

            .integration-info code {
                background: var(--bg-tertiary, #e9ecef);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                color: var(--accent-primary, #3416b6);
            }

            .m2-modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 20px;
                border-top: 1px solid var(--border-color, #e9ecef);
                background: var(--bg-secondary, #f8f9fa);
                border-radius: 0 0 12px 12px;
            }

            .m2-modal-btn {
                padding: 8px 16px;
                border: 1px solid var(--border-color, #ced4da);
                border-radius: 6px;
                background: var(--bg-primary, #ffffff);
                color: var(--text-primary, #212529);
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .m2-modal-btn:hover {
                background: var(--bg-tertiary, #e9ecef);
                border-color: var(--accent-primary, #3416b6);
            }

            .m2-modal-btn-primary {
                background: var(--accent-primary, #3416b6);
                color: white;
                border-color: var(--accent-primary, #3416b6);
            }

            .m2-modal-btn-primary:hover {
                background: var(--accent-secondary, #5a67d8);
                border-color: var(--accent-secondary, #5a67d8);
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @media (max-width: 768px) {
                .m2-modal-content {
                    margin: 10px;
                    max-width: none;
                }

                .module-status-grid {
                    grid-template-columns: 1fr;
                }

                .m2-modal-footer {
                    flex-direction: column;
                }
            }
            </style>
        `;

        // Добавляем стили
        if (!document.querySelector('#m2-modal-styles')) {
            const styleElement = document.createElement('div');
            styleElement.innerHTML = modalStyles;
            document.head.appendChild(styleElement.firstElementChild);
        }

        // Добавляем модальное окно
        document.body.appendChild(modal);

        // Обработчики закрытия
        modal.querySelector('.m2-modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.m2-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modal.remove();
            }
        });

        // Закрытие по Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Генерация HTML статуса модулей
     */
    generateModuleStatusHTML() {
        const moduleInfo = [
            { key: 'dark-theme', name: '🌙 Темная тема', description: 'Переключение тем' },
            { key: 'bundle-optimizer', name: '⚡ Оптимизатор', description: 'Производительность' },
            { key: 'advanced-validation', name: '✅ Валидация', description: 'Умная проверка' },
            { key: 'calculation-templates', name: '📄 Шаблоны', description: 'Готовые наборы' },
            { key: 'scenario-comparison', name: '📊 Сравнение', description: 'Анализ сценариев' },
            { key: 'excel-export', name: '📑 Excel экспорт', description: 'Отчеты XLSX' }
        ];

        return moduleInfo.map(module => {
            const isLoaded = this.loadedModules.has(module.key);
            return `
                <div class="module-status-item">
                    <div class="module-status-name">
                        <span>${module.name}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <small style="color: var(--text-muted, #adb5bd);">${module.description}</small>
                        <div class="module-status-indicator" style="background: ${isLoaded ? '#28a745' : '#dc3545'};"></div>
                    </div>
                </div>
            `;
        }).join('');
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
        console.log('🔧 Конфигурация M2 Enhancements обновлена:', this.config);
    }

    /**
     * Получение статуса модулей
     */
    getModuleStatus() {
        const enabledModules = Object.keys(this.config).filter(key => key.startsWith('enable') && this.config[key]);

        return {
            loadedModules: Array.from(this.loadedModules),
            totalModules: enabledModules.length,
            enabledModules: enabledModules.map(key => key.replace('enable', '').toLowerCase().replace(/([A-Z])/g, '-$1')),
            isFullyLoaded: this.loadedModules.size === enabledModules.length,
            config: this.getConfig()
        };
    }

    /**
     * Перезагрузка модулей
     */
    async reload(newConfig = {}) {
        console.log('🔄 Перезагрузка M2 Calculator Enhancements...');

        // Обновляем конфигурацию
        this.updateConfig(newConfig);

        // Очищаем состояние
        this.loadedModules.clear();

        // Удаляем индикатор
        const indicator = document.querySelector('.m2-enhancements-loaded');
        if (indicator) {
            indicator.remove();
        }

        // Перезапускаем инициализацию
        await this.init();
    }

    /**
     * Экспорт конфигурации и статуса
     */
    exportStatus() {
        const status = this.getModuleStatus();
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...status
        };

        console.log('📋 Экспорт статуса M2 Calculator Enhancements:', exportData);
        return exportData;
    }
}

// Глобальный экземпляр загрузчика
window.M2EnhancementsLoader = M2EnhancementsLoader;

// Автоматическая инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        window.m2Enhancements = new M2EnhancementsLoader();

        try {
            await window.m2Enhancements.init();
        } catch (error) {
            console.error('❌ Ошибка инициализации M2 Calculator Enhancements:', error);
        }
    });
} else {
    setTimeout(async () => {
        window.m2Enhancements = new M2EnhancementsLoader();

        try {
            await window.m2Enhancements.init();
        } catch (error) {
            console.error('❌ Ошибка инициализации M2 Calculator Enhancements:', error);
        }
    }, 100);
}

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = M2EnhancementsLoader;
}

export { M2EnhancementsLoader };