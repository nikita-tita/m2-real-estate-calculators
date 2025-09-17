# M2 Calculator Enhancements API Documentation

## Обзор

M2 Calculator Enhancements предоставляет мощный API для интеграции с калькуляторами недвижимости. Система включает 17 модулей с богатой функциональностью.

## Быстрый старт

```javascript
// Проверка готовности API
if (window.M2API) {
    console.log('✅ M2 API готов к использованию');
    console.log('Версия:', window.M2API.getVersion());
    console.log('Статус:', window.M2API.getStatus());
}
```

## Основные API модули

### 1. M2API - Основной API

#### Расчеты

```javascript
// Ипотечный расчет
const mortgageResult = await window.M2API.calculate('mortgage', {
    propertyPrice: 5000000,
    downPayment: 1000000,
    interestRate: 8.5,
    loanTerm: 20,
    paymentType: 'annuity'
});

// Доходность аренды
const rentalResult = await window.M2API.calculate('rental', {
    propertyPrice: 5000000,
    monthlyRent: 35000,
    managementFee: 0.1,
    vacancy: 0.05
});

// Доступность жилья
const affordabilityResult = await window.M2API.calculate('affordability', {
    monthlyIncome: 150000,
    monthlyExpenses: 50000,
    interestRate: 8.5,
    loanTerm: 20,
    downPaymentPercent: 20
});
```

#### Шаблоны

```javascript
// Получить все шаблоны
const templates = await window.M2API.getTemplates();

// Получить шаблоны по типу
const mortgageTemplates = await window.M2API.getTemplates('mortgage');

// Применить шаблон (через Templates API)
window.M2Templates.applyTemplate('mortgage_first_time');
```

#### Экспорт данных

```javascript
// Экспорт в Excel
const excelExport = await window.M2API.exportResult(result, 'excel', {
    includeCharts: true,
    includeAnalysis: true
});

// Экспорт в PDF
const pdfExport = await window.M2API.exportResult(result, 'pdf', {
    template: 'detailed',
    includeLogo: true
});

// Экспорт в JSON
const jsonExport = await window.M2API.exportResult(result, 'json');
```

#### Валидация

```javascript
// Валидация параметров
const validation = await window.M2API.validateParameters('mortgage', {
    propertyPrice: 5000000,
    downPayment: 500000,
    interestRate: 8.5
});

if (!validation.valid) {
    console.log('Ошибки валидации:', validation.errors);
}
```

### 2. M2Analytics - Аналитика

#### Метрики

```javascript
// Получить текущие метрики
const metrics = window.M2Analytics.getMetrics();

// Тепловая карта
const heatmap = window.M2Analytics.getHeatmapData();

// Использование параметров
const paramUsage = window.M2Analytics.getParameterUsage();

// Журнал аналитики
const analyticsLog = window.M2Analytics.getAnalyticsLog();
```

#### Отслеживание событий

```javascript
// Отслеживание пользовательских событий
window.M2Analytics.trackFeatureUsage('custom_feature');

// Отслеживание расчетов
window.M2Analytics.trackCalculation('mortgage', parameters, result);

// Отслеживание ошибок
window.M2Analytics.trackError(error, 'custom_error', 123);
```

#### Очистка данных

```javascript
// Очистить все данные аналитики
window.M2Analytics.clearAnalyticsData();
```

### 3. M2MetricsDashboard - Панель метрик

#### Управление дашбордом

```javascript
// Показать дашборд
window.M2MetricsDashboard.show();

// Скрыть дашборд
window.M2MetricsDashboard.hide();

// Переключить видимость
window.M2MetricsDashboard.toggle();

// Горячая клавиша: Ctrl+Alt+D
```

#### Экспорт данных дашборда

```javascript
// Экспорт данных дашборда
const dashboardData = window.M2MetricsDashboard.getDashboardData();

// Автоматический экспорт при нажатии кнопки экспорта в UI
```

### 4. M2Templates - Шаблоны расчетов

#### Управление шаблонами

```javascript
// Получить все шаблоны
const allTemplates = window.M2Templates.getTemplates();

// Получить шаблон по ID
const template = window.M2Templates.getTemplate('mortgage_first_time');

// Применить шаблон
window.M2Templates.applyTemplate('mortgage_first_time');

// Создать пользовательский шаблон
window.M2Templates.createUserTemplate('Мой шаблон', 'mortgage', {
    propertyPrice: 7000000,
    downPayment: 2000000,
    interestRate: 8.0,
    loanTerm: 15
});
```

#### Предустановленные шаблоны

```javascript
// Доступные шаблоны:
const templates = {
    'mortgage_first_time': '👶 Первая квартира',
    'mortgage_family': '👨‍👩‍👧‍👦 Семейная ипотека',
    'mortgage_it': '💼 IT-ипотека',
    'rental_studio': '🏠 Студия в аренду',
    'rental_business': '🏢 Коммерческая недвижимость',
    'affordability_young': '👶 Молодая семья',
    'affordability_premium': '💎 Премиум сегмент'
};
```

### 5. M2ScenarioComparison - Сравнение сценариев

#### Управление сценариями

```javascript
// Добавить сценарий для сравнения
window.M2ScenarioComparison.addScenario('Сценарий 1', {
    propertyPrice: 5000000,
    downPayment: 1000000,
    interestRate: 8.5
});

// Получить все сценарии
const scenarios = window.M2ScenarioComparison.getScenarios();

// Сравнить сценарии
const comparison = window.M2ScenarioComparison.compareScenarios();

// Очистить все сценарии
window.M2ScenarioComparison.clearScenarios();
```

### 6. M2DarkTheme - Управление темами

#### Переключение тем

```javascript
// Установить темную тему
window.M2DarkTheme.setTheme('dark');

// Установить светлую тему
window.M2DarkTheme.setTheme('light');

// Установить системную тему
window.M2DarkTheme.setTheme('system');

// Переключить тему
window.M2DarkTheme.toggleTheme();

// Получить текущую тему
const currentTheme = window.M2DarkTheme.getCurrentTheme();
```

#### События тем

```javascript
// Подписка на изменения темы
window.M2DarkTheme.onThemeChange((theme) => {
    console.log('Тема изменена на:', theme);
});
```

### 7. M2MobileOptimizer - Мобильная оптимизация

#### Информация об устройстве

```javascript
// Получить информацию об устройстве
const deviceInfo = window.M2MobileOptimizer.getDeviceInfo();

// Принудительно включить мобильную оптимизацию
window.M2MobileOptimizer.enableMobileOptimizations();

// Отключить мобильную оптимизацию
window.M2MobileOptimizer.disableMobileOptimizations();
```

### 8. M2PWA - Progressive Web App

#### Управление PWA

```javascript
// Получить статус PWA
const pwaStatus = window.M2PWA.getPWAStatus();

// Принудительно предложить установку
window.M2PWA.promptInstall();

// Очистить офлайн данные
await window.M2PWA.clearOfflineData();

// Экспорт офлайн данных
const offlineData = await window.M2PWA.exportOfflineData();
```

### 9. M2AI - AI Помощник

#### Управление AI

```javascript
// Показать/скрыть AI помощника
window.M2AI.toggle();

// Задать вопрос программно
window.M2AI.askQuestion('Какой оптимальный первоначальный взнос?');

// Получить историю разговора
const history = window.M2AI.getConversationHistory();

// Очистить разговор
window.M2AI.clearConversation();

// Экспорт разговора
const exportedConversation = window.M2AI.exportConversation();

// Статус AI
const aiStatus = window.M2AI.getAIStatus();
```

### 10. M2Monitoring - Система мониторинга

#### Мониторинг системы

```javascript
// Получить статус мониторинга
const status = window.M2Monitoring.getMonitoringStatus();

// Получить отчеты
const reports = window.M2Monitoring.getRecentReports();

// Получить все алерты
const alerts = window.M2Monitoring.getAllAlerts();

// Очистить данные мониторинга
window.M2Monitoring.clearMonitoringData();
```

#### Настройка порогов

```javascript
// Установить пороговые значения
window.M2Monitoring.setThreshold('performance', 'pageLoadTime', 2000);
window.M2Monitoring.setThreshold('errors', 'errorRate', 0.02);

// Включить/отключить мониторинг
window.M2Monitoring.enableMonitoring();
window.M2Monitoring.disableMonitoring();
```

### 11. M2VersionManager - Управление версиями

#### Информация о версиях

```javascript
// Получить текущую версию
const version = window.M2VersionManager.getCurrentVersion();

// Получить версии модулей
const moduleVersions = window.M2VersionManager.getModuleVersions();

// Получить историю версий
const history = window.M2VersionManager.getVersionHistory();

// Системная информация
const systemInfo = window.M2VersionManager.getSystemInfo();
```

### 12. M2AutoUpdater - Автообновления

#### Управление обновлениями

```javascript
// Принудительная проверка обновлений
window.M2AutoUpdater.forceUpdate();

// Получить версию
const version = window.M2AutoUpdater.getVersion();

// Статус обновлений
const updateStatus = window.M2AutoUpdater.getUpdateStatus();
```

### 13. M2ExcelExporter - Экспорт в Excel

#### Экспорт данных

```javascript
// Экспорт текущего калькулятора
await window.M2ExcelExporter.exportCurrentCalculator();

// Экспорт пользовательских данных
await window.M2ExcelExporter.exportCustomData({
    title: 'Мой расчет',
    data: calculationResult,
    options: {
        includeCharts: true,
        includeAnalysis: true
    }
});
```

### 14. M2AdvancedValidation - Продвинутая валидация

#### Валидация форм

```javascript
// Получить статус валидации
const validationStatus = window.M2AdvancedValidation.getValidationStatus();

// Принудительная валидация всех полей
window.M2AdvancedValidation.validateAllFields();

// Очистить ошибки валидации
window.M2AdvancedValidation.clearValidationErrors();
```

### 15. M2BundleOptimizer - Оптимизация производительности

#### Управление производительностью

```javascript
// Получить метрики производительности
const perfMetrics = window.M2BundleOptimizer.getPerformanceMetrics();

// Очистить кэш
window.M2BundleOptimizer.clearCache();

// Предзагрузка модулей
await window.M2BundleOptimizer.preloadModules(['dark-theme', 'templates']);
```

## События системы

### Подписка на события

```javascript
// Расчет завершен
document.addEventListener('calculationCompleted', (event) => {
    console.log('Расчет завершен:', event.detail);
});

// Модуль загружен
document.addEventListener('moduleLoaded', (event) => {
    console.log('Модуль загружен:', event.detail);
});

// Обновление версии
document.addEventListener('versionUpdate', (event) => {
    console.log('Обновление версии:', event.detail);
});

// Смена темы
document.addEventListener('themeChanged', (event) => {
    console.log('Тема изменена:', event.detail);
});
```

## Глобальные команды

### Отладка и диагностика

```javascript
// Получить статус всех модулей
Object.keys(window).filter(key => key.startsWith('M2')).forEach(module => {
    console.log(`${module}:`, window[module]);
});

// Проверить загрузку системы
console.log('Система загружена:', !!window.M2EnhancementsLoader);
console.log('Загруженные модули:', window.M2EnhancementsLoader?.loadedModules);

// Информация о производительности
console.log('Метрики:', window.M2Analytics?.getMetrics());
console.log('Устройство:', window.M2MobileOptimizer?.getDeviceInfo());
console.log('PWA статус:', window.M2PWA?.getPWAStatus());
```

## Типы данных

### Результат расчета ипотеки

```typescript
interface MortgageResult {
    monthlyPayment: number;      // Ежемесячный платеж
    totalPayment: number;        // Общая сумма выплат
    overpayment: number;         // Переплата
    loanAmount: number;          // Сумма кредита
    overpaymentPercentage: number; // Процент переплаты
}
```

### Результат расчета доходности

```typescript
interface RentalResult {
    grossRent: number;           // Валовая аренда
    netRent: number;            // Чистая аренда
    totalExpenses: number;       // Общие расходы
    yieldPercent: number;        // Доходность в %
    capRate: number;            // Капитализация
    monthlyNetIncome: number;    // Чистый месячный доход
}
```

### Результат расчета доступности

```typescript
interface AffordabilityResult {
    maxPropertyPrice: number;        // Максимальная стоимость
    maxLoanAmount: number;          // Максимальная сумма кредита
    maxMonthlyPayment: number;      // Максимальный платеж
    requiredDownPayment: number;    // Необходимый взнос
    availableIncome: number;        // Доступный доход
}
```

## Обработка ошибок

### Стандартный формат ответа

```typescript
interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
    metadata?: any;
}
```

### Примеры обработки ошибок

```javascript
try {
    const result = await window.M2API.calculate('mortgage', parameters);

    if (result.success) {
        console.log('Результат:', result.data);
    } else {
        console.error('Ошибка расчета:', result.error);
    }
} catch (error) {
    console.error('Критическая ошибка:', error);
}
```

## Конфигурация

### Настройка модулей

```javascript
// В m2-enhancements-loader.js можно настроить загрузку модулей:
const config = {
    enableVersionManager: true,
    enableMonitoringSystem: true,
    enableAutoUpdater: true,
    enableAnalyticsTracker: true,
    enableMetricsDashboard: true,    // можно отключить
    enableExternalApi: true,
    enableMobileOptimizer: true,
    enablePwaManager: true,
    enableAiAssistant: true,
    enableBundleOptimizer: false,    // опциональный
    enableScenarioComparison: true,
    enableAdvancedValidation: true,
    enableExcelExport: true,
    enableDarkTheme: true,
    enableCalculationTemplates: true,
    loadAsync: true
};
```

## Интеграция с внешними системами

### PostMessage API

```javascript
// Отправка запроса через postMessage
window.postMessage({
    type: 'M2_API_REQUEST',
    endpoint: 'calculate',
    parameters: {
        calculatorType: 'mortgage',
        parameters: { propertyPrice: 5000000, ... },
        options: {}
    },
    requestId: 'unique_request_id'
}, '*');

// Обработка ответа
window.addEventListener('message', (event) => {
    if (event.data.type === 'M2_API_RESPONSE') {
        console.log('Ответ API:', event.data);
    }
});
```

## Лучшие практики

### 1. Проверка готовности

```javascript
// Всегда проверяйте готовность API перед использованием
function waitForM2API() {
    return new Promise((resolve) => {
        if (window.M2API) {
            resolve(window.M2API);
        } else {
            const checkAPI = () => {
                if (window.M2API) {
                    resolve(window.M2API);
                } else {
                    setTimeout(checkAPI, 100);
                }
            };
            checkAPI();
        }
    });
}

// Использование
waitForM2API().then(api => {
    // Работаем с API
});
```

### 2. Обработка событий

```javascript
// Используйте делегирование событий для оптимизации
document.addEventListener('click', (event) => {
    if (event.target.matches('.calculate-btn')) {
        // Обработка нажатия на кнопку расчета
        handleCalculation();
    }
});
```

### 3. Кэширование результатов

```javascript
// Кэшируйте результаты для повышения производительности
const resultCache = new Map();

async function getCachedResult(type, parameters) {
    const key = `${type}_${JSON.stringify(parameters)}`;

    if (resultCache.has(key)) {
        return resultCache.get(key);
    }

    const result = await window.M2API.calculate(type, parameters);
    resultCache.set(key, result);

    return result;
}
```

## Поддержка и отладка

### Включение отладочных логов

```javascript
// В консоли браузера
localStorage.setItem('m2_debug', 'true');
// Перезагрузите страницу для активации

// Отключение
localStorage.removeItem('m2_debug');
```

### Диагностические команды

```javascript
// Проверка состояния системы
console.table({
    'API Status': window.M2API?.getStatus(),
    'Analytics': !!window.M2Analytics,
    'AI Assistant': !!window.M2AI,
    'PWA Manager': !!window.M2PWA,
    'Monitoring': !!window.M2Monitoring
});

// Экспорт диагностических данных
const diagnostics = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    modules: Object.keys(window).filter(k => k.startsWith('M2')),
    metrics: window.M2Analytics?.getMetrics(),
    errors: window.M2Monitoring?.getAllAlerts()
};

console.log('Диагностические данные:', diagnostics);
```

## Версионность API

**Текущая версия:** 1.0.0

**Совместимость:** Обратная совместимость гарантируется в рамках мажорной версии.

**Изменения версий отслеживаются в** `version.json` **и системе автообновлений.**

---

**Документация обновлена:** Январь 2024
**Совместимость:** M2 Calculators v1.0+
**Лицензия:** Проприетарная для М2