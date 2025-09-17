/**
 * Dark Theme - система темной темы для калькуляторов М2
 * Реализует переключатель темы с сохранением предпочтений пользователя
 */

class DarkTheme {
    constructor() {
        this.currentTheme = 'light';
        this.themeStorageKey = 'm2_calculator_theme';
        this.transitionDuration = 200; // мс
        this.isTransitioning = false;
    }

    /**
     * Инициализация системы темной темы
     */
    init() {
        this.loadSavedTheme();
        this.injectThemeStyles();
        this.createThemeToggle();
        this.setupEventListeners();
        this.detectSystemTheme();

        console.log('🌙 Система темной темы инициализирована');
    }

    /**
     * Загрузка сохраненной темы
     */
    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem(this.themeStorageKey);
            if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
                this.currentTheme = savedTheme;
            }
        } catch (error) {
            console.warn('Не удалось загрузить сохраненную тему:', error);
        }
    }

    /**
     * Определение системной темы
     */
    detectSystemTheme() {
        if (this.currentTheme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme(prefersDark ? 'dark' : 'light', false);
        } else {
            this.applyTheme(this.currentTheme, false);
        }

        // Слушаем изменения системной темы
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                this.applyTheme(e.matches ? 'dark' : 'light', true);
            }
        });
    }

    /**
     * Внедрение CSS стилей для темной темы
     */
    injectThemeStyles() {
        const themeStyles = `
<style id="dark-theme-styles">
/* Основные CSS переменные для тем */
:root {
    /* Светлая тема */
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #e9ecef;
    --text-primary: #212529;
    --text-secondary: #6c757d;
    --text-muted: #adb5bd;
    --border-color: #dee2e6;
    --border-light: #e9ecef;
    --accent-primary: #3416b6;
    --accent-secondary: #5a67d8;
    --success: #28a745;
    --warning: #ffc107;
    --danger: #dc3545;
    --info: #17a2b8;
    --shadow-sm: rgba(0, 0, 0, 0.125);
    --shadow-md: rgba(0, 0, 0, 0.15);
    --shadow-lg: rgba(0, 0, 0, 0.2);

    /* Специальные цвета для компонентов */
    --input-bg: #ffffff;
    --input-border: #ced4da;
    --input-focus: #3416b6;
    --button-primary-bg: #3416b6;
    --button-primary-text: #ffffff;
    --button-secondary-bg: #6c757d;
    --card-bg: #ffffff;
    --header-bg: #3416b6;
    --sidebar-bg: #f8f9fa;

    /* Анимации */
    --transition-theme: all 200ms ease-in-out;
}

/* Темная тема */
[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --bg-tertiary: #404040;
    --text-primary: #ffffff;
    --text-secondary: #e0e0e0;
    --text-muted: #b0b0b0;
    --border-color: #404040;
    --border-light: #333333;
    --accent-primary: #4c6ef5;
    --accent-secondary: #6c7ce4;
    --success: #51cf66;
    --warning: #ffd43b;
    --danger: #ff6b6b;
    --info: #74c0fc;
    --shadow-sm: rgba(0, 0, 0, 0.3);
    --shadow-md: rgba(0, 0, 0, 0.4);
    --shadow-lg: rgba(0, 0, 0, 0.5);

    /* Специальные цвета для компонентов */
    --input-bg: #2d2d2d;
    --input-border: #404040;
    --input-focus: #4c6ef5;
    --button-primary-bg: #4c6ef5;
    --button-primary-text: #ffffff;
    --button-secondary-bg: #495057;
    --card-bg: #2d2d2d;
    --header-bg: #1a1a1a;
    --sidebar-bg: #2d2d2d;
}

/* Базовые элементы */
body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: var(--transition-theme);
}

/* Контейнеры и карточки */
.calculator-container,
.card,
.results-section,
.input-section,
.comparison-panel,
.scenario-comparison-panel {
    background-color: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
    transition: var(--transition-theme);
}

/* Заголовки */
h1, h2, h3, h4, h5, h6 {
    color: var(--text-primary);
    transition: var(--transition-theme);
}

/* Поля ввода */
input[type="text"],
input[type="number"],
input[type="email"],
input[type="password"],
input[type="range"],
select,
textarea {
    background-color: var(--input-bg);
    border-color: var(--input-border);
    color: var(--text-primary);
    transition: var(--transition-theme);
}

input[type="text"]:focus,
input[type="number"]:focus,
input[type="email"]:focus,
input[type="password"]:focus,
select:focus,
textarea:focus {
    border-color: var(--input-focus);
    box-shadow: 0 0 0 0.2rem rgba(52, 22, 182, 0.25);
}

[data-theme="dark"] input:focus {
    box-shadow: 0 0 0 0.2rem rgba(76, 110, 245, 0.25);
}

/* Кнопки */
.btn-primary,
.calculate-btn,
.export-btn {
    background-color: var(--button-primary-bg);
    border-color: var(--button-primary-bg);
    color: var(--button-primary-text);
    transition: var(--transition-theme);
}

.btn-secondary,
.btn-outline {
    background-color: var(--button-secondary-bg);
    border-color: var(--button-secondary-bg);
    color: var(--button-primary-text);
    transition: var(--transition-theme);
}

/* Таблицы */
table {
    color: var(--text-primary);
    transition: var(--transition-theme);
}

table th {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);
}

table td {
    border-color: var(--border-light);
    color: var(--text-secondary);
}

table tbody tr:hover {
    background-color: var(--bg-tertiary);
}

/* Графики (Chart.js адаптация) */
[data-theme="dark"] .chart-container {
    filter: invert(0.9) hue-rotate(180deg);
}

[data-theme="dark"] .chart-container canvas {
    filter: invert(0.9) hue-rotate(180deg);
}

/* Результаты расчетов */
.result-item,
.metric-value,
.calculation-result {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);
    transition: var(--transition-theme);
}

.result-positive {
    color: var(--success);
}

.result-negative {
    color: var(--danger);
}

.result-warning {
    color: var(--warning);
}

/* Навигация и заголовки */
.header,
.navigation,
.breadcrumb {
    background-color: var(--header-bg);
    color: var(--text-primary);
    transition: var(--transition-theme);
}

/* Сайдбар */
.sidebar,
.aside {
    background-color: var(--sidebar-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
    transition: var(--transition-theme);
}

/* Модальные окна */
.modal-content,
.popup,
.dropdown-menu {
    background-color: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
    box-shadow: 0 4px 20px var(--shadow-md);
    transition: var(--transition-theme);
}

/* Уведомления */
.notification,
.alert,
.toast {
    background-color: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
    transition: var(--transition-theme);
}

/* Валидация форм */
.field-valid {
    border-color: var(--success);
}

.field-invalid {
    border-color: var(--danger);
}

.validation-error {
    background-color: var(--danger);
    color: var(--bg-primary);
}

[data-theme="dark"] .validation-error {
    background-color: rgba(255, 107, 107, 0.9);
    color: var(--text-primary);
}

/* Прогресс бары */
.progress {
    background-color: var(--bg-tertiary);
}

.progress-bar {
    background-color: var(--accent-primary);
}

/* Тени */
.card,
.calculator-container,
.modal-content {
    box-shadow: 0 2px 10px var(--shadow-sm);
}

.card:hover,
.calculator-container:hover {
    box-shadow: 0 4px 20px var(--shadow-md);
}

/* Скроллбары */
[data-theme="dark"] ::-webkit-scrollbar {
    width: 12px;
}

[data-theme="dark"] ::-webkit-scrollbar-track {
    background: var(--bg-secondary);
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
    background: var(--bg-tertiary);
    border-radius: 6px;
}

[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
    background: var(--accent-primary);
}

/* Переключатель темы */
.theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    border-radius: 50px;
    padding: 8px;
    box-shadow: 0 2px 10px var(--shadow-sm);
    transition: var(--transition-theme);
}

.theme-toggle:hover {
    box-shadow: 0 4px 15px var(--shadow-md);
    transform: translateY(-1px);
}

.theme-toggle-button {
    background: none;
    border: none;
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 16px;
    transition: var(--transition-theme);
    color: var(--text-secondary);
}

.theme-toggle-button.active {
    background: var(--accent-primary);
    color: var(--button-primary-text);
}

.theme-toggle-button:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.theme-toggle-button.active:hover {
    background: var(--accent-secondary);
}

/* Адаптивность */
@media (max-width: 768px) {
    .theme-toggle {
        top: 10px;
        right: 10px;
        padding: 6px;
    }

    .theme-toggle-button {
        padding: 6px 10px;
        font-size: 14px;
    }
}

/* Анимация переключения темы */
.theme-transition * {
    transition: background-color 200ms ease-in-out,
                border-color 200ms ease-in-out,
                color 200ms ease-in-out,
                box-shadow 200ms ease-in-out !important;
}

/* Специальные стили для графиков в темной теме */
[data-theme="dark"] .chart-tooltip {
    background: var(--card-bg) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
}

[data-theme="dark"] .chart-legend {
    color: var(--text-primary) !important;
}

/* PDF экспорт - корректировка для темной темы */
@media print {
    [data-theme="dark"] * {
        background: white !important;
        color: black !important;
        border-color: #ccc !important;
    }
}
</style>
        `;

        // Удаляем старые стили темы
        const existingStyles = document.querySelector('#dark-theme-styles');
        if (existingStyles) {
            existingStyles.remove();
        }

        // Добавляем новые стили
        const styleElement = document.createElement('div');
        styleElement.innerHTML = themeStyles;
        document.head.appendChild(styleElement.firstElementChild);
    }

    /**
     * Создание переключателя темы
     */
    createThemeToggle() {
        // Проверяем, есть ли уже переключатель
        if (document.querySelector('.theme-toggle')) return;

        const themeToggle = document.createElement('div');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = `
            <button class="theme-toggle-button ${this.currentTheme === 'light' ? 'active' : ''}"
                    data-theme="light"
                    title="Светлая тема">
                ☀️
            </button>
            <button class="theme-toggle-button ${this.currentTheme === 'dark' ? 'active' : ''}"
                    data-theme="dark"
                    title="Темная тема">
                🌙
            </button>
            <button class="theme-toggle-button ${this.currentTheme === 'auto' ? 'active' : ''}"
                    data-theme="auto"
                    title="Как в системе">
                🔄
            </button>
        `;

        document.body.appendChild(themeToggle);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Клик по переключателю темы
        document.addEventListener('click', (e) => {
            if (e.target.matches('.theme-toggle-button')) {
                const theme = e.target.dataset.theme;
                this.switchTheme(theme);
            }
        });

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + D для переключения темы
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Контекстное меню для быстрого переключения
        document.addEventListener('contextmenu', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                this.showThemeContextMenu(e.pageX, e.pageY);
            }
        });
    }

    /**
     * Переключение темы
     */
    switchTheme(newTheme) {
        if (this.isTransitioning) return;

        this.isTransitioning = true;
        this.currentTheme = newTheme;

        // Обновляем активную кнопку
        document.querySelectorAll('.theme-toggle-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === newTheme);
        });

        // Применяем тему
        if (newTheme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme(prefersDark ? 'dark' : 'light', true);
        } else {
            this.applyTheme(newTheme, true);
        }

        // Сохраняем предпочтение
        this.saveTheme();

        // Отправляем событие
        this.dispatchThemeChangeEvent(newTheme);

        // Аналитика
        if (window.gtag) {
            gtag('event', 'theme_change', {
                theme: newTheme,
                user_agent: navigator.userAgent.includes('Dark') ? 'dark_system' : 'light_system'
            });
        }

        setTimeout(() => {
            this.isTransitioning = false;
        }, this.transitionDuration);
    }

    /**
     * Применение темы
     */
    applyTheme(theme, animate = false) {
        if (animate) {
            document.body.classList.add('theme-transition');
        }

        // Устанавливаем атрибут темы
        document.documentElement.setAttribute('data-theme', theme);

        // Обновляем meta тег для мобильных браузеров
        this.updateThemeColorMeta(theme);

        // Обновляем favicon (если нужно)
        this.updateFavicon(theme);

        if (animate) {
            setTimeout(() => {
                document.body.classList.remove('theme-transition');
            }, this.transitionDuration);
        }
    }

    /**
     * Быстрое переключение между светлой и темной темой
     */
    toggleTheme() {
        const currentEffectiveTheme = this.getEffectiveTheme();
        const newTheme = currentEffectiveTheme === 'dark' ? 'light' : 'dark';
        this.switchTheme(newTheme);
    }

    /**
     * Получение эффективной темы (с учетом auto)
     */
    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return this.currentTheme;
    }

    /**
     * Обновление meta тега theme-color
     */
    updateThemeColorMeta(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        const colors = {
            light: '#3416b6',
            dark: '#1a1a1a'
        };

        metaThemeColor.content = colors[theme] || colors.light;
    }

    /**
     * Обновление favicon для темной темы
     */
    updateFavicon(theme) {
        // Опционально: можно менять favicon для разных тем
        // Пока оставляем базовый функционал
    }

    /**
     * Контекстное меню для быстрого переключения темы
     */
    showThemeContextMenu(x, y) {
        // Удаляем существующее меню
        const existingMenu = document.querySelector('.theme-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const contextMenu = document.createElement('div');
        contextMenu.className = 'theme-context-menu';
        contextMenu.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px 0;
            box-shadow: 0 4px 20px var(--shadow-md);
            z-index: 10000;
            min-width: 150px;
        `;

        const themes = [
            { key: 'light', label: '☀️ Светлая тема', shortcut: 'Ctrl+Shift+D' },
            { key: 'dark', label: '🌙 Темная тема', shortcut: 'Ctrl+Shift+D' },
            { key: 'auto', label: '🔄 Как в системе', shortcut: '' }
        ];

        themes.forEach(themeOption => {
            const menuItem = document.createElement('div');
            menuItem.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                color: var(--text-primary);
                font-size: 14px;
                transition: background 0.1s;
                ${this.currentTheme === themeOption.key ? 'background: var(--accent-primary); color: white;' : ''}
            `;

            menuItem.innerHTML = `
                <span>${themeOption.label}</span>
                ${themeOption.shortcut ? `<small style="float: right; opacity: 0.7;">${themeOption.shortcut}</small>` : ''}
            `;

            menuItem.addEventListener('click', () => {
                this.switchTheme(themeOption.key);
                contextMenu.remove();
            });

            menuItem.addEventListener('mouseenter', () => {
                if (this.currentTheme !== themeOption.key) {
                    menuItem.style.background = 'var(--bg-secondary)';
                }
            });

            menuItem.addEventListener('mouseleave', () => {
                if (this.currentTheme !== themeOption.key) {
                    menuItem.style.background = 'transparent';
                }
            });

            contextMenu.appendChild(menuItem);
        });

        document.body.appendChild(contextMenu);

        // Закрытие меню при клике вне его
        setTimeout(() => {
            document.addEventListener('click', function closeContextMenu(e) {
                if (!contextMenu.contains(e.target)) {
                    contextMenu.remove();
                    document.removeEventListener('click', closeContextMenu);
                }
            });
        }, 100);
    }

    /**
     * Сохранение темы
     */
    saveTheme() {
        try {
            localStorage.setItem(this.themeStorageKey, this.currentTheme);
        } catch (error) {
            console.warn('Не удалось сохранить тему:', error);
        }
    }

    /**
     * Отправка события изменения темы
     */
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: theme,
                effectiveTheme: this.getEffectiveTheme(),
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);
    }

    /**
     * Получение текущей темы
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Получение статистики использования тем
     */
    getThemeStats() {
        return {
            currentTheme: this.currentTheme,
            effectiveTheme: this.getEffectiveTheme(),
            systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
            supportsColorScheme: window.matchMedia('(prefers-color-scheme)').media !== 'not all',
            transitionDuration: this.transitionDuration
        };
    }

    /**
     * Программная установка темы (для внешнего API)
     */
    setTheme(theme) {
        if (['light', 'dark', 'auto'].includes(theme)) {
            this.switchTheme(theme);
            return true;
        }
        return false;
    }

    /**
     * Экспорт настроек темы
     */
    exportThemeSettings() {
        return {
            theme: this.currentTheme,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            systemTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        };
    }

    /**
     * Импорт настроек темы
     */
    importThemeSettings(settings) {
        if (settings && settings.theme && ['light', 'dark', 'auto'].includes(settings.theme)) {
            this.switchTheme(settings.theme);
            return true;
        }
        return false;
    }
}

// Глобальная инициализация
window.DarkTheme = DarkTheme;

// Автоматическая инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.darkTheme = new DarkTheme();
        window.darkTheme.init();
    });
} else {
    setTimeout(() => {
        window.darkTheme = new DarkTheme();
        window.darkTheme.init();
    }, 0);
}

// Слушатель события изменения темы для других компонентов
document.addEventListener('themeChanged', (e) => {
    console.log(`🎨 Тема изменена на: ${e.detail.effectiveTheme}`);

    // Обновляем Chart.js графики, если они есть
    if (window.Chart && window.Chart.instances) {
        Object.values(window.Chart.instances).forEach(chart => {
            if (chart.options && chart.options.plugins && chart.options.plugins.legend) {
                chart.options.plugins.legend.labels.color = e.detail.effectiveTheme === 'dark' ? '#ffffff' : '#212529';
                chart.update('none');
            }
        });
    }

    // Уведомляем другие компоненты
    if (window.scenarioComparison) {
        // Компонент сравнения сценариев может адаптироваться к новой теме
    }
});

export { DarkTheme };