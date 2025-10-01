# 🔧 Детальный план работ по доработке UI калькуляторов

## Что я буду делать — пошаговое описание

---

## 📁 Проблема 1: affordability_calculator.html

### Текущее состояние:
```html
<!-- В режиме "Базовый" блок results скрыт -->
<div id="results" style="display: none;">
    <div class="result-value">5 000 000 ₽</div>
</div>

<!-- Где-то ниже дубль этого же блока -->
<div class="result-value">5 000 000 ₽</div>
```

### Что буду делать:

**Шаг 1:** Найду JavaScript функцию, которая показывает/скрывает результаты
```javascript
// Сейчас примерно так:
function switchMode(mode) {
    if (mode === 'basic') {
        document.getElementById('results').style.display = 'none'; // ❌ Скрывает
    }
}
```

**Изменю на:**
```javascript
function switchMode(mode) {
    if (mode === 'basic') {
        document.getElementById('results').style.display = 'block'; // ✅ Показывает
    }
}
```

**Шаг 2:** Найду дублирующийся блок "Максимальная сумма кредита" и удалю один из них

**Шаг 3:** Изменю CSS цвет текста:
```css
/* Было */
.result-value {
    color: #0057FF; /* Синий - нечитаемо на фиолетовом */
}

/* Станет */
.result-value {
    color: #FFFFFF; /* Белый - читаемо */
}
```

**Тестирование:**
1. Открою калькулятор
2. Переключусь в "Базовый" режим
3. Введу данные и нажму "Рассчитать"
4. Проверю что результат отображается и текст белый

---

## 📁 Проблема 2: Toggle-кнопки во всех калькуляторах

### Текущее состояние:
```css
/* Сейчас в каждом калькуляторе свои стили */
.mode-btn {
    background: white;
    color: #0057FF;
    animation: some-animation;
}
.mode-btn.active {
    background: #0057FF;
    color: white;
}
```

### Что буду делать:

**Создам файл `m2-toggle-buttons.css`:**
```css
/* Единый стиль для ВСЕХ toggle-кнопок */
.m2-toggle-group {
    display: flex;
    gap: 8px;
    background: white;
    padding: 4px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.m2-toggle-btn {
    padding: 12px 24px;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #4F2CD9; /* Фиолетовый текст */
}

.m2-toggle-btn.active {
    background: #4F2CD9; /* Фиолетовый фон */
    color: #FFFFFF; /* Белый текст */
}
```

**В каждом HTML файле:**

**Было:**
```html
<div class="mode-toggle">
    <button class="mode-btn active">Базовый</button>
    <button class="mode-btn">Расширенный</button>
</div>
```

**Станет:**
```html
<link rel="stylesheet" href="m2-toggle-buttons.css">
<div class="m2-toggle-group">
    <button class="m2-toggle-btn active">Базовый</button>
    <button class="m2-toggle-btn">Расширенный</button>
</div>
```

**В JavaScript изменю селекторы:**
```javascript
// Было
document.querySelectorAll('.mode-btn')

// Станет
document.querySelectorAll('.m2-toggle-btn')
```

**Файлы которые изменю:**
- affordability_calculator.html (Базовый/Расширенный)
- mortgage_calculator.html (За наличные/В ипотеку)
- rental_profitability_calculator.html (За наличные/В ипотеку)
- rent_vs_buy_calculator.html (За наличные/В ипотеку)
- airbnb_calculator.html (Краткосрочная/Долгосрочная)
- new_vs_secondary_calculator.html (За наличные/В ипотеку)
- prepayment_calculator.html (За наличные/В ипотеку)

**Тестирование:**
1. Открою каждый калькулятор
2. Проверю что кнопки выглядят одинаково
3. Нажму на каждую кнопку — проверю что переключение работает
4. Проверю что расчёты продолжают работать

---

## 📁 Проблема 3: Breadcrumbs и логотип М2

### Текущее состояние:
```html
<a href="index.html" class="back-link">← Все калькуляторы</a>
<div class="logo">М²</div>
```

```css
.back-link {
    color: #007bff; /* ❌ Синий */
}
.logo {
    color: #000000; /* ❌ Чёрный */
}
```

### Что буду делать:

**В каждом HTML файле найду и изменю CSS:**
```css
.back-link,
.breadcrumb {
    color: #4F2CD9 !important; /* ✅ Фиолетовый */
}

.logo {
    color: #4F2CD9 !important; /* ✅ Фиолетовый */
}
```

Либо добавлю inline style (если нужно быстро):
```html
<a href="index.html" style="color: #4F2CD9;">← Все калькуляторы</a>
<div style="color: #4F2CD9;">М²</div>
```

**Файлы:** Все 8 калькуляторов + index.html

**Тестирование:**
1. Открою каждую страницу
2. Проверю цвет стрелки "← Все калькуляторы" — должен быть #4F2CD9
3. Проверю цвет логотипа "М²" — должен быть #4F2CD9

---

## 📁 Проблема 4: Слайдеры для полей ввода

### Текущее состояние:
```html
<!-- В некоторых калькуляторах только input -->
<input type="number" id="price" value="5000000">
```

### Что буду делать:

**Найду существующий слайдер в rental_profitability_calculator.html:**
```html
<input type="number" id="price" value="5000000">
<input type="range" id="priceSlider" min="1000000" max="50000000" value="5000000">
```

```javascript
// Связка input и slider
document.getElementById('priceSlider').addEventListener('input', (e) => {
    document.getElementById('price').value = e.target.value;
    calculate();
});
```

**Добавлю такие же слайдеры везде:**

**В каждом калькуляторе:**
```html
<!-- Было -->
<div class="input-group">
    <label>Стоимость недвижимости</label>
    <input type="number" id="price" value="5000000">
</div>

<!-- Станет -->
<div class="input-group">
    <label>Стоимость недвижимости</label>
    <input type="number" id="price" value="5000000">
    <input type="range" id="priceSlider" class="m2-slider"
           min="1000000" max="50000000" step="100000" value="5000000">
</div>
```

**CSS для слайдера (создам m2-sliders.css):**
```css
.m2-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #E1E1E3;
    outline: none;
    margin-top: 12px;
    -webkit-appearance: none;
}

.m2-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #4F2CD9;
    cursor: pointer;
}

.m2-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #4F2CD9;
    cursor: pointer;
    border: none;
}
```

**JavaScript для связки:**
```javascript
// В каждом калькуляторе добавлю
function initSliders() {
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        const inputId = slider.id.replace('Slider', '');
        const input = document.getElementById(inputId);

        slider.addEventListener('input', (e) => {
            input.value = e.target.value;
            calculate(); // Вызов функции расчёта
        });

        input.addEventListener('input', (e) => {
            slider.value = e.target.value;
        });
    });
}

initSliders();
```

**Где добавлю слайдеры:**
- mortgage_calculator.html: цена, первоначальный взнос, срок, ставка
- affordability_calculator.html: доход, расходы, первоначальный взнос
- rent_vs_buy_calculator.html: цена, аренда, срок
- airbnb_calculator.html: цена, аренда краткосрочная, аренда долгосрочная
- new_vs_secondary_calculator.html: цены новостройки и вторички
- prepayment_calculator.html: сумма досрочного погашения

**Тестирование:**
1. Открою каждый калькулятор
2. Подвигаю слайдер — проверю что значение в input меняется
3. Введу значение в input — проверю что слайдер двигается
4. Проверю что расчёт происходит при изменении

---

## 📁 Проблема 5: Тултипы в rental_profitability_calculator.html

### Текущее состояние:
```html
<span class="help-icon">?</span>
<!-- Ничего не происходит при клике/наведении -->
```

### Что буду делать:

**HTML структура:**
```html
<span class="m2-tooltip">
    ?
    <span class="m2-tooltip-text">
        Валовая доходность — это процент дохода от аренды относительно
        стоимости недвижимости без учёта расходов
    </span>
</span>
```

**CSS (создам m2-tooltips.css):**
```css
.m2-tooltip {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #E1E1E3;
    color: #797981;
    font-size: 12px;
    cursor: help;
    margin-left: 8px;
}

.m2-tooltip:hover {
    background: #4F2CD9;
    color: white;
}

.m2-tooltip-text {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    bottom: 130%;
    left: 50%;
    transform: translateX(-50%);
    width: 220px;
    background: #4F2CD9;
    color: white;
    padding: 12px;
    border-radius: 8px;
    font-size: 13px;
    text-align: left;
    transition: opacity 0.2s;
    z-index: 1000;
}

.m2-tooltip:hover .m2-tooltip-text {
    visibility: visible;
    opacity: 1;
}

/* Стрелка вниз */
.m2-tooltip-text::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #4F2CD9;
}
```

**Где добавлю тултипы:**
- rental_profitability_calculator.html: "Валовая доходность", "Чистая доходность", "Срок окупаемости"
- airbnb_calculator.html: "Загрузка", "Операционные расходы"

**Тестирование:**
1. Наведу курсор на "?" — должна появиться подсказка
2. Проверю что подсказка читаема (белый текст на фиолетовом)
3. Уведу курсор — подсказка должна исчезнуть

---

## 📁 Проблема 6-7: rental_profitability_calculator.html

### Что буду делать:

**Цвет текста в результатах:**
```css
/* Найду блоки результатов */
.result-value,
.primary-result {
    color: #FFFFFF !important; /* Белый текст */
}

.result-block {
    background: #4F2CD9; /* Фиолетовый фон */
}
```

**Кнопка "Показать расчёты":**
```html
<!-- Было -->
<button class="show-calculations-btn">Показать расчёты</button>

<!-- Станет -->
<button class="m2-btn-primary">Показать расчёты</button>
```

```css
.m2-btn-primary {
    background: #4F2CD9;
    color: #FFFFFF;
    border: none;
    border-radius: 12px;
    padding: 14px 28px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.m2-btn-primary:hover {
    background: #3F23AE;
}
```

---

## 📁 Проблема 8-9: airbnb_calculator.html

### Что буду делать:

**Блок "Альтернативные вложения":**
```html
<!-- Добавлю описание -->
<div class="info-block">
    <h3>Данные для анализа альтернативных вложений</h3>
    <p class="help-text">
        Укажите параметры альтернативных инвестиций (депозит, облигации)
        для сравнения доходности с недвижимостью
    </p>
    <!-- ... поля ... -->
</div>
```

**Цвета блоков сравнения:**
```css
/* Красный блок краткосрочной аренды */
.comparison-card.shortterm {
    background: #dc3545; /* Красный */
    color: #FFFFFF !important; /* Белый текст */
}

.comparison-card.shortterm * {
    color: #FFFFFF !important; /* Весь текст внутри белый */
}

/* Зелёный блок долгосрочной аренды */
.comparison-card.longterm {
    background: #28a745; /* Зелёный */
    color: #FFFFFF !important;
}

.comparison-card.longterm * {
    color: #FFFFFF !important;
}

/* Блок сезонного анализа */
.seasonal-analysis {
    background: #4F2CD9; /* Фиолетовый */
    color: #FFFFFF !important;
}

.seasonal-analysis * {
    color: #FFFFFF !important;
}
```

---

## 📁 Проблема 10: rent_vs_buy_calculator.html

### Что буду делать:

**Кнопки экспорта:**
```html
<!-- Было -->
<button onclick="exportPDF()" style="background: red;">PDF</button>
<button onclick="exportExcel()" style="background: blue;">Excel</button>
<button onclick="reset()">Сбросить</button>

<!-- Станет -->
<div class="export-buttons">
    <button class="m2-btn-primary" onclick="exportPDF()">
        <svg>...</svg> Экспорт PDF
    </button>
    <button class="m2-btn-success" onclick="exportExcel()">
        <svg>...</svg> Экспорт Excel
    </button>
    <button class="m2-btn-secondary" onclick="reset()">
        Сбросить
    </button>
</div>
```

```css
.export-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 24px;
}

.m2-btn-primary {
    background: #4F2CD9;
    color: white;
}

.m2-btn-success {
    background: #28a745;
    color: white;
}

.m2-btn-secondary {
    background: #797981;
    color: white;
}

/* Все кнопки одинакового размера */
.export-buttons button {
    padding: 14px 28px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
```

---

## 📁 Проблема 11: new_vs_secondary_calculator.html

### Что буду делать:

**Кнопка "+ Добавить параметр":**
```html
<!-- Было -->
<button class="add-param-btn" style="background: green;">+ Добавить параметр</button>

<!-- Станет -->
<button class="m2-btn-primary add-param-btn">+ Добавить параметр</button>
```

**Симметрия параметров (CSS Grid):**
```html
<div class="parameter-row">
    <select class="param-type">...</select>
    <input type="text" class="param-name" placeholder="Название">
    <input type="text" class="param-new" placeholder="Новостройка">
    <input type="text" class="param-secondary" placeholder="Вторичка">
    <button class="delete-btn">🗑</button>
</div>
```

```css
.parameter-row {
    display: grid;
    grid-template-columns: 150px 200px 150px 150px 60px;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
}

.parameter-row select,
.parameter-row input {
    width: 100%;
    padding: 10px;
    border: 2px solid #E1E1E3;
    border-radius: 8px;
}

.delete-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: #dc3545;
    color: white;
    border-radius: 8px;
    cursor: pointer;
}
```

---

## 📁 Проблема 12: property_tax_calculator.html

### Что буду делать:

**Скопирую header из index.html:**
```html
<header class="m2-header">
    <div class="m2-header-container">
        <a href="index.html" class="m2-logo">М²</a>
        <nav>
            <a href="https://m2.ru/moskva/novostroyki/" target="_blank">Новостройки</a>
            <a href="https://m2.ru/ipoteka/" target="_blank">Ипотека</a>
            <!-- ... -->
        </nav>
    </div>
</header>
```

**Добавлю breadcrumb:**
```html
<div class="breadcrumb-container">
    <a href="index.html" class="breadcrumb" style="color: #4F2CD9;">
        ← Все калькуляторы
    </a>
</div>
```

**Добавлю логотип:**
```html
<div class="logo" style="color: #4F2CD9;">М²</div>
```

**Скопирую footer из index.html** со всеми правильными ссылками

---

## 📁 Проблема 13: index.html — иконка

### Что буду делать:

**Найду иконку "Детальная аналитика":**
```html
<!-- Было (например растровая картинка) -->
<img src="analytics.png">

<!-- Станет (SVG как у других) -->
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
</svg>
```

---

## 📁 Проблема 14-15: Footer и Header ссылки

### Что буду делать:

**В каждом HTML файле найду footer и обновлю:**
```html
<footer>
    <div class="footer-section">
        <h3>О компании</h3>
        <a href="https://m2.ru/about/" target="_blank" rel="noopener">О компании</a>
        <a href="https://m2.ru/vacancies/" target="_blank" rel="noopener">Вакансии</a>
        <a href="https://m2.ru/it/" target="_blank" rel="noopener">ИТ-деятельность</a>
        <a href="https://m2.ru/support/" target="_blank" rel="noopener">Помощь</a>
        <a href="https://m2.ru/partners/" target="_blank" rel="noopener">Наши партнёры</a>
        <a href="https://m2.ru/media/" target="_blank" rel="noopener">М2 Медиа</a>
        <a href="https://m2.ru/pr/" target="_blank" rel="noopener">Новости М2</a>
    </div>
    <!-- ... остальные секции ... -->
</footer>
```

**В header добавлю target="_blank":**
```html
<!-- Было -->
<a href="https://m2.ru/moskva/novostroyki/">Новостройки</a>

<!-- Станет -->
<a href="https://m2.ru/moskva/novostroyki/" target="_blank" rel="noopener">Новостройки</a>
```

---

## 🧪 Тестирование перед деплоем

### Что буду делать:

1. **Запущу локальный сервер:**
```bash
cd /Users/fatbookpro/m2-calculators
python3 -m http.server 8080
```

2. **Открою каждый калькулятор по очереди:**
   - http://localhost:8080/index.html
   - http://localhost:8080/mortgage_calculator.html
   - http://localhost:8080/affordability_calculator.html
   - ... все 8 калькуляторов

3. **Для каждого калькулятора проверю:**
   - ✅ Цвета toggle-кнопок (фиолетовые активные)
   - ✅ Цвет breadcrumb и логотипа (#4F2CD9)
   - ✅ Слайдеры работают и двигаются
   - ✅ Ввожу данные → нажимаю "Рассчитать" → получаю результат
   - ✅ Результаты белым текстом на фиолетовом
   - ✅ Все ссылки в footer актуальные
   - ✅ Ссылки в header открываются в новых вкладках
   - ✅ JavaScript расчёты работают корректно

4. **Проверю на Mobile (DevTools):**
   - Переключусь в режим iPhone/Android
   - Проверю что всё адаптивно

5. **Только после успешных тестов:**
```bash
git add .
git commit -m "Описание изменений"
git push origin main
npx vercel --prod
```

---

## 📋 Чеклист после каждого этапа

Перед деплоем буду проходить по этому списку:

- [ ] Локально всё работает
- [ ] JavaScript расчёты не сломаны
- [ ] Все кнопки кликабельны
- [ ] Цвета соответствуют М2 (#4F2CD9)
- [ ] На Mobile всё адаптивно
- [ ] Яндекс.Метрика работает (проверю в консоли)
- [ ] Нет ошибок в console.log

**Только после всех галочек ✅ → деплой на Vercel**

---

## ⏱️ Время на каждый этап

- **Этап 1** (Toggle-кнопки, цвета текста): 2 часа
- **Этап 2** (Слайдеры): 2 часа
- **Этап 3** (Тултипы): 1 час
- **Этап 4** (Footer/Header): 1 час
- **Этап 5** (Специфичные калькуляторы): 3 часа
- **Тестирование**: 1 час

**Итого:** 10 часов чистого времени

Буду делать по этапам, после каждого — тестирование и деплой.

---

## 🚨 Что НЕ буду делать

❌ НЕ буду переписывать всё с нуля
❌ НЕ буду трогать формулы расчётов
❌ НЕ буду удалять существующий функционал
❌ НЕ буду создавать новую структуру файлов
❌ НЕ буду менять логику JavaScript (только селекторы если нужно)

✅ Буду работать с существующим кодом
✅ Буду добавлять минимум изменений
✅ Буду тестировать перед каждым деплоем
✅ Буду делать коммиты после каждого этапа

Если что-то пойдёт не так — смогу откатиться к предыдущему коммиту.
