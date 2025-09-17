# 🚀 M2 Calculator Enhancements

**Современные улучшения для финансовых калькуляторов М2**

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)
![CSS](https://img.shields.io/badge/css-3.0-blue.svg)
![License](https://img.shields.io/badge/license-M2-green.svg)

## 📋 Содержание

- [Быстрый старт](#быстрый-старт)
- [Описание модулей](#описание-модулей)
- [Установка и интеграция](#установка-и-интеграция)
- [Конфигурация](#конфигурация)
- [API и события](#api-и-события)
- [Примеры использования](#примеры-использования)
- [Производительность](#производительность)
- [Поддержка браузеров](#поддержка-браузеров)

## ⚡ Быстрый старт

### Автоматическая интеграция (рекомендуется)

1. Скачайте все файлы модулей в папку с калькулятором
2. Добавьте одну строку в ваш HTML:

```html
<script src="m2-enhancements-loader.js"></script>
```

3. Готово! Все улучшения активируются автоматически.

### Результат

✅ **Темная тема** - переключатель в правом верхнем углу
✅ **Расширенная валидация** - умные проверки при вводе
✅ **Шаблоны расчетов** - готовые наборы параметров
✅ **Сравнение сценариев** - анализ нескольких вариантов
✅ **Экспорт в Excel** - детальные отчеты в XLSX
✅ **Оптимизация производительности** - ускорение загрузки

## 📦 Описание модулей

### 1. 🌙 Dark Theme (dark-theme.js)
**Переключение между светлой и темной темами**

```javascript
// Программное управление
window.darkTheme.setTheme('dark');     // темная тема
window.darkTheme.setTheme('light');    // светлая тема
window.darkTheme.setTheme('auto');     // следовать системе
window.darkTheme.toggleTheme();        // переключить
```

**Возможности:**
- Сохранение предпочтений пользователя
- Автоматическое определение системной темы
- Горячие клавиши: `Ctrl+Shift+D`
- Плавные анимации переходов
- Адаптация всех компонентов

**Размер:** ~5KB (gzip)

---

### 2. ⚡ Bundle Optimizer (bundle-optimizer.js)
**Оптимизация производительности и загрузки**

```javascript
// Получение статистики
const stats = window.bundleOptimizer.getOptimizationStats();
console.log('Загружено модулей:', stats.totalModules);
console.log('Метрики производительности:', stats.performance);
```

**Возможности:**
- Lazy loading компонентов
- Минификация CSS на лету
- Предзагрузка критических модулей
- Мониторинг Core Web Vitals
- Оптимизация изображений (WebP)

**Размер:** ~4KB (gzip)

---

### 3. ✅ Advanced Validation (advanced-validation.js)
**Расширенная валидация форм с умными проверками**

```javascript
// Настройка валидации
window.advancedValidation.realTimeValidation = true;
window.advancedValidation.debounceTime = 150; // мс

// Получение статистики
const stats = window.advancedValidation.getValidationStats();
```

**Возможности:**
- Валидация в реальном времени (debounce 150мс)
- Контекстные проверки связанных полей
- Автокоррекция значений
- Визуальные индикаторы состояния
- Подсказки и рекомендации

**Размер:** ~7KB (gzip)

---

### 4. 📄 Calculation Templates (calculation-templates.js)
**Готовые шаблоны расчетов для типовых ситуаций**

```javascript
// Применение шаблона
window.calculationTemplates.applyTemplate('mortgage_first_time');

// Сохранение текущих параметров как шаблон
window.calculationTemplates.showSaveTemplateDialog();

// Статистика шаблонов
const stats = window.calculationTemplates.getTemplateStats();
```

**Предустановленные шаблоны:**
- 👶 Первая квартира
- 👨‍👩‍👧‍👦 Семейная ипотека (льготная)
- 💻 IT-ипотека
- 🔄 Рефинансирование
- 💎 Премиум недвижимость
- 🏠 Инвестиции в студию
- 🏢 Коммерческая недвижимость

**Возможности:**
- Создание пользовательских шаблонов
- Экспорт/импорт настроек
- Категоризация и поиск
- Горячие клавиши: `Ctrl+Shift+T`

**Размер:** ~8KB (gzip)

---

### 5. 📊 Scenario Comparison (scenario-comparison.js)
**Сравнение нескольких сценариев расчетов**

```javascript
// Получение сценариев для экспорта
const scenarios = window.scenarioComparison.scenarios;

// Настройка максимального количества сценариев
window.scenarioComparison.maxScenarios = 5;
```

**Возможности:**
- Сравнение до 3 сценариев одновременно
- Автоматические аналитические выводы
- Визуальные графики сравнения
- Экспорт результатов в JSON
- Поиск оптимального варианта

**Размер:** ~7KB (gzip)

---

### 6. 📑 Excel Export (excel-export.js)
**Экспорт данных и результатов в Excel**

```javascript
// Экспорт текущего калькулятора
window.excelExporter.exportCurrentCalculator();

// Экспорт сравнения сценариев
window.excelExporter.exportScenarioComparison();

// Детальный анализ
window.excelExporter.exportDetailedAnalysis();
```

**Возможности:**
- Экспорт в формате XLSX
- Множественные листы с данными
- Формулы и расчеты
- Анализ чувствительности
- Бенчмарки и рыночные данные
- Анализ рисков

**Размер:** ~6KB (gzip) + SheetJS (подгружается автоматически)

---

## 🔧 Установка и интеграция

### Вариант 1: Автоматическая загрузка

```html
<!DOCTYPE html>
<html>
<head>
    <title>Калькулятор М2</title>
    <!-- Ваши стили -->
</head>
<body>
    <!-- Ваш контент -->

    <!-- В конце перед </body> -->
    <script src="m2-enhancements-loader.js"></script>
</body>
</html>
```

### Вариант 2: Ручная загрузка модулей

```html
<!-- Обязательные модули -->
<script src="dark-theme.js"></script>
<script src="advanced-validation.js"></script>
<script src="calculation-templates.js"></script>

<!-- Дополнительные модули -->
<script src="bundle-optimizer.js"></script>
<script src="scenario-comparison.js"></script>
<script src="excel-export.js"></script>
```

### Вариант 3: Селективная загрузка

```html
<script src="m2-enhancements-loader.js"></script>
<script>
// Отключение ненужных модулей
window.m2Enhancements.updateConfig({
    enableBundleOptimizer: false,
    enableExcelExport: false
});
</script>
```

## ⚙️ Конфигурация

### Настройка автозагрузчика

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Настройка модулей
    window.m2Enhancements.updateConfig({
        enableBundleOptimizer: true,      // Оптимизация
        enableScenarioComparison: true,   // Сравнение сценариев
        enableAdvancedValidation: true,   // Валидация
        enableExcelExport: true,          // Excel экспорт
        enableDarkTheme: true,            // Темная тема
        enableCalculationTemplates: true, // Шаблоны
        loadAsync: true                   // Асинхронная загрузка
    });
});
```

### Настройка отдельных модулей

```javascript
// Темная тема
if (window.darkTheme) {
    window.darkTheme.setTheme('auto'); // auto, light, dark
}

// Валидация
if (window.advancedValidation) {
    window.advancedValidation.debounceTime = 300;
    window.advancedValidation.realTimeValidation = true;
}

// Сравнение сценариев
if (window.scenarioComparison) {
    window.scenarioComparison.maxScenarios = 5;
    window.scenarioComparison.comparisonMode = false;
}

// Шаблоны
if (window.calculationTemplates) {
    // Программное применение шаблона
    window.calculationTemplates.applyTemplate('mortgage_first_time');
}
```

## 🎨 Стилизация и темы

### CSS переменные

```css
:root {
    /* Светлая тема */
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #212529;
    --text-secondary: #6c757d;
    --accent-primary: #3416b6;
    --border-color: #dee2e6;

    /* Тени и эффекты */
    --shadow-sm: rgba(0, 0, 0, 0.125);
    --shadow-md: rgba(0, 0, 0, 0.15);
    --shadow-lg: rgba(0, 0, 0, 0.2);

    /* Анимации */
    --transition-theme: all 200ms ease-in-out;
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
```

### Кастомизация компонентов

```css
/* Изменение цвета шаблонов */
.template-panel .template-header {
    background: linear-gradient(135deg, #your-color, #your-color-2);
}

/* Позиционирование переключателя темы */
.theme-toggle {
    top: 10px;
    right: 10px;
}

/* Стили для валидации */
.field-valid {
    border-color: #28a745;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.field-invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}
```

## 📡 API и события

### События модулей

```javascript
// Изменение темы
document.addEventListener('themeChanged', (e) => {
    console.log('Тема изменена на:', e.detail.effectiveTheme);
    console.log('Пользовательский выбор:', e.detail.theme);
});

// Применение шаблона
document.addEventListener('templateApplied', (e) => {
    console.log('Применен шаблон:', e.detail.templateName);
    console.log('Параметры:', e.detail.params);
});

// Завершение валидации формы
document.addEventListener('validationComplete', (e) => {
    console.log('Валидация завершена:', e.detail.isValid);
    console.log('Ошибки:', e.detail.errors);
});

// Добавление сценария к сравнению
document.addEventListener('scenarioAdded', (e) => {
    console.log('Добавлен сценарий:', e.detail.scenarioName);
    console.log('Всего сценариев:', e.detail.totalScenarios);
});
```

### Программный API

```javascript
// Статус всех модулей
const status = window.m2Enhancements.getModuleStatus();
console.log('Загруженные модули:', status.loadedModules);
console.log('Полностью загружен:', status.isFullyLoaded);

// Экспорт данных
if (window.excelExporter) {
    window.excelExporter.exportCurrentCalculator();
}

// Применение темы
if (window.darkTheme) {
    window.darkTheme.setTheme('dark');
}

// Валидация конкретного поля
if (window.advancedValidation) {
    const input = document.querySelector('#loanAmount');
    window.advancedValidation.validateField(input);
}

// Получение статистики валидации
if (window.advancedValidation) {
    const stats = window.advancedValidation.getValidationStats();
    console.log('Ошибки валидации:', stats.totalErrors);
    console.log('Успешные валидации:', stats.totalSuccesses);
}
```

## 💡 Примеры использования

### Интеграция в существующий калькулятор

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Ипотечный калькулятор - М2</title>

    <!-- Ваши существующие стили -->
    <link rel="stylesheet" href="calculator.css">
</head>
<body>
    <!-- Ваша существующая структура -->
    <div class="calculator-container">
        <h1>Ипотечный калькулятор</h1>

        <form class="calculator-form">
            <input type="number" id="propertyPrice" placeholder="Стоимость недвижимости">
            <input type="number" id="downPayment" placeholder="Первоначальный взнос">
            <input type="number" id="interestRate" placeholder="Процентная ставка">
            <input type="number" id="loanTerm" placeholder="Срок кредита">

            <button type="button" onclick="calculate()">Рассчитать</button>
        </form>

        <div id="results" style="display: none;">
            <!-- Ваши результаты -->
        </div>
    </div>

    <!-- Ваш существующий JavaScript -->
    <script src="calculator.js"></script>

    <!-- Подключение M2 Enhancements - одна строка! -->
    <script src="m2-enhancements-loader.js"></script>
</body>
</html>
```

После добавления этой строки автоматически появятся:
- 🌙 Переключатель темы в правом верхнем углу
- 📄 Панель шаблонов перед формой
- ✅ Валидация полей при вводе
- 📊 Кнопки для сравнения сценариев в результатах
- 📑 Кнопки экспорта в Excel

### Продвинутая настройка

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Ждем загрузки всех модулей
    setTimeout(() => {
        // Настройка темы
        if (window.darkTheme) {
            // Устанавливаем тему по умолчанию
            const savedTheme = localStorage.getItem('user_preferred_theme') || 'auto';
            window.darkTheme.setTheme(savedTheme);

            // Слушаем изменения темы
            document.addEventListener('themeChanged', (e) => {
                localStorage.setItem('user_preferred_theme', e.detail.theme);
                console.log('Сохранена тема:', e.detail.theme);
            });
        }

        // Настройка валидации
        if (window.advancedValidation) {
            // Увеличиваем время debounce для медленных устройств
            window.advancedValidation.debounceTime = 300;

            // Отключаем валидацию в реальном времени для определенных полей
            document.querySelectorAll('.no-realtime-validation').forEach(input => {
                input.dataset.noRealTimeValidation = 'true';
            });
        }

        // Настройка шаблонов
        if (window.calculationTemplates) {
            // Автоматически применяем шаблон из URL параметров
            const urlParams = new URLSearchParams(window.location.search);
            const templateId = urlParams.get('template');

            if (templateId) {
                window.calculationTemplates.applyTemplate(templateId);
            }
        }

        // Настройка Excel экспорта
        if (window.excelExporter) {
            // Добавляем кастомную информацию в экспорт
            window.excelExporter.customData = {
                source: 'М2.ru Calculator',
                version: '2.0',
                generated: new Date().toISOString()
            };
        }

    }, 1000);
});
```

### Создание кастомного шаблона

```javascript
// Создание шаблона программно
const customTemplate = {
    name: 'Мой кастомный шаблон',
    description: 'Шаблон для особых случаев',
    category: 'Мои шаблоны',
    icon: '⭐',
    params: {
        propertyPrice: 8000000,
        downPayment: 2400000,
        interestRate: 11.5,
        loanTerm: 25,
        income: 200000
    },
    tags: ['кастом', 'особый случай', 'высокий доход']
};

// Добавление в пользовательские шаблоны
if (window.calculationTemplates) {
    const templateId = 'custom_' + Date.now();
    window.calculationTemplates.userTemplates.set(templateId, customTemplate);
    window.calculationTemplates.saveUserTemplates();
    window.calculationTemplates.renderTemplates();
}
```

## 🚀 Производительность

### Размеры модулей (сжатые)

| Модуль | Размер (gzip) | Описание |
|--------|---------------|----------|
| Dark Theme | ~5KB | Переключение тем |
| Bundle Optimizer | ~4KB | Оптимизация загрузки |
| Advanced Validation | ~7KB | Умная валидация |
| Calculation Templates | ~8KB | Шаблоны расчетов |
| Scenario Comparison | ~7KB | Сравнение сценариев |
| Excel Export | ~6KB | Экспорт в XLSX |
| **Общий размер** | **~37KB** | **Все модули** |

### Оптимизации

- ⚡ **Lazy loading** - модули загружаются только при необходимости
- 🎯 **Debouncing** - валидация с задержкой 150мс
- 💾 **Кэширование** - шаблоны и настройки сохраняются локально
- 🗜️ **Минификация** - CSS сжимается на лету
- 📦 **Tree shaking** - загружаются только используемые функции

### Метрики производительности

```javascript
// Получение метрик Core Web Vitals
if (window.bundleOptimizer) {
    const metrics = window.bundleOptimizer.getPerformanceMetrics();

    console.log('First Paint:', metrics.firstPaint + 'мс');
    console.log('First Contentful Paint:', metrics.firstContentfulPaint + 'мс');
    console.log('DOM Content Loaded:', metrics.domContentLoaded + 'мс');
    console.log('Load Complete:', metrics.loadComplete + 'мс');
}
```

## 📱 Поддержка браузеров

### Полная поддержка

- **Chrome** 70+ ✅
- **Firefox** 65+ ✅
- **Safari** 12+ ✅
- **Edge** 79+ ✅

### Мобильные браузеры

- **iOS Safari** 12+ ✅
- **Chrome Mobile** 70+ ✅
- **Firefox Mobile** 65+ ✅
- **Samsung Internet** 10+ ✅

### Graceful degradation

В старых браузерах:
- Модули отключаются автоматически
- Базовый функционал калькулятора сохраняется
- Нет ошибок JavaScript
- Пользователь получает уведомление о рекомендациях по обновлению

```javascript
// Проверка поддержки браузера
if (!window.CSS || !window.CSS.supports || !window.fetch) {
    console.warn('Браузер не поддерживает M2 Enhancements');
    // Базовый функционал продолжает работать
}
```

## 🛠️ Отладка и диагностика

### Консольные команды

```javascript
// Информация о загруженных модулях
window.m2Enhancements.getModuleStatus();

// Статистика валидации
window.advancedValidation?.getValidationStats();

// Информация о шаблонах
window.calculationTemplates?.getTemplateStats();

// Экспорт всех настроек
window.m2Enhancements.exportStatus();

// Метрики производительности
window.bundleOptimizer?.getOptimizationStats();
```

### Debug режим

```javascript
// Включение подробного логирования
localStorage.setItem('m2_debug', 'true');
location.reload();

// Просмотр всех событий модулей
localStorage.setItem('m2_debug_events', 'true');
```

### Решение проблем

**Модули не загружаются:**
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что все файлы доступны
3. Проверьте поддержку браузера

**Валидация работает некорректно:**
1. Проверьте наличие id/name у полей ввода
2. Убедитесь, что поля имеют правильные типы
3. Проверьте конфигурацию валидации

**Темная тема не применяется:**
1. Проверьте CSS переменные в стилях
2. Убедитесь, что нет конфликтов с существующими стилями
3. Проверьте порядок подключения скриптов

## 📞 Поддержка и обратная связь

- **Документация**: README-ENHANCEMENTS.md
- **Примеры**: demo-page.html
- **Исходный код**: Все файлы с комментариями
- **Интеграция**: integration-guide.js

### Создание собственных модулей

```javascript
// Пример создания кастомного модуля
class CustomEnhancement {
    constructor() {
        this.name = 'custom-enhancement';
        this.version = '1.0.0';
    }

    init() {
        console.log('🎨 Custom Enhancement загружен');
        this.setupFeature();
    }

    setupFeature() {
        // Ваш код здесь
    }
}

// Регистрация в системе
window.customEnhancement = new CustomEnhancement();
window.customEnhancement.init();
```

---

## 📄 Лицензия

M2 Calculator Enhancements разработаны специально для экосистемы калькуляторов М2.ru

**© 2024 M2 Calculator Enhancements**

---

**Сделано с ❤️ для М2.ru**