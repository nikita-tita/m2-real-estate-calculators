/**
 * Автоматическое добавление слайдеров ко всем полям ввода type="number"
 * Использование: добавить <script src="auto-sliders.js"></script> в конец <body>
 */

(function() {
    'use strict';

    // Конфигурация для разных типов полей
    const fieldConfigs = {
        // Стоимость недвижимости
        propertyPrice: { min: 500000, max: 50000000, step: 100000 },
        price: { min: 500000, max: 50000000, step: 100000 },
        purchasePrice: { min: 500000, max: 50000000, step: 100000 },

        // Первоначальный взнос
        downPayment: { min: 0, max: 20000000, step: 50000 },
        initialPayment: { min: 0, max: 20000000, step: 50000 },

        // Доход
        income: { min: 0, max: 1000000, step: 10000 },
        monthlyIncome: { min: 0, max: 1000000, step: 10000 },
        salary: { min: 0, max: 1000000, step: 10000 },

        // Аренда
        rent: { min: 5000, max: 500000, step: 5000 },
        monthlyRent: { min: 5000, max: 500000, step: 5000 },
        rentalIncome: { min: 5000, max: 500000, step: 5000 },

        // Процентная ставка
        interestRate: { min: 3, max: 25, step: 0.1 },
        rate: { min: 3, max: 25, step: 0.1 },

        // Срок кредита (в годах)
        loanTerm: { min: 1, max: 30, step: 1 },
        term: { min: 1, max: 30, step: 1 },

        // Срок кредита (в месяцах)
        loanTermMonths: { min: 12, max: 360, step: 12 },

        // Расходы
        expenses: { min: 0, max: 200000, step: 5000 },
        monthlyExpenses: { min: 0, max: 200000, step: 5000 },
        utilityExpenses: { min: 0, max: 50000, step: 1000 },

        // Налоги
        taxRate: { min: 0, max: 20, step: 0.5 },

        // Площадь
        area: { min: 10, max: 300, step: 1 },

        // Ремонт
        renovationCost: { min: 0, max: 10000000, step: 50000 },

        // Комиссия
        commission: { min: 0, max: 10, step: 0.5 }
    };

    // Функция для получения конфигурации по ID поля или атрибутам
    function getFieldConfig(input) {
        const id = input.id;
        const min = input.getAttribute('min');
        const max = input.getAttribute('max');
        const step = input.getAttribute('step');

        // Если у поля есть свои атрибуты min/max/step, используем их
        if (min && max) {
            return {
                min: parseFloat(min),
                max: parseFloat(max),
                step: parseFloat(step) || 1
            };
        }

        // Ищем по ID
        if (fieldConfigs[id]) {
            return fieldConfigs[id];
        }

        // Ищем по частичному совпадению ID
        for (const key in fieldConfigs) {
            if (id.toLowerCase().includes(key.toLowerCase())) {
                return fieldConfigs[key];
            }
        }

        // Дефолтная конфигурация для денежных полей
        return { min: 0, max: 10000000, step: 10000 };
    }

    // Функция форматирования чисел для меток слайдера
    function formatLabel(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1).replace('.0', '') + ' млн';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + ' тыс';
        }
        return value.toString();
    }

    // Функция создания слайдера для поля
    function createSliderForInput(input) {
        // Проверяем, не создан ли уже слайдер
        if (input.dataset.sliderCreated === 'true') {
            return;
        }

        // Проверяем, что это числовое поле
        if (input.type !== 'number') {
            return;
        }

        // Пропускаем поля с классом no-slider
        if (input.classList.contains('no-slider')) {
            return;
        }

        const config = getFieldConfig(input);
        const currentValue = parseFloat(input.value) || config.min;

        // Создаем контейнер для слайдера
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        sliderContainer.style.cssText = 'margin-top: 12px;';

        // Создаем слайдер
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'slider m2-range-slider';
        slider.min = config.min;
        slider.max = config.max;
        slider.step = config.step;
        slider.value = currentValue;
        slider.id = input.id + '_slider';

        // Создаем метки мин/макс
        const labels = document.createElement('div');
        labels.className = 'slider-labels';
        labels.style.cssText = 'display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #666;';
        labels.innerHTML = `
            <span>${formatLabel(config.min)}</span>
            <span>${formatLabel(config.max)}</span>
        `;

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(labels);

        // Вставляем слайдер после поля ввода
        const inputGroup = input.closest('.input-group') || input.parentElement;

        // Находим место для вставки (после quick-buttons если есть, иначе после input)
        const quickButtons = inputGroup.querySelector('.quick-buttons');
        if (quickButtons) {
            quickButtons.after(sliderContainer);
        } else {
            input.after(sliderContainer);
        }

        // Синхронизация слайдера и поля ввода
        slider.addEventListener('input', function() {
            input.value = this.value;
            // Триггерим событие input на поле для пересчета
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        input.addEventListener('input', function() {
            const val = parseFloat(this.value) || config.min;
            if (val >= config.min && val <= config.max) {
                slider.value = val;
            }
        });

        // Помечаем, что слайдер создан
        input.dataset.sliderCreated = 'true';
    }

    // Добавляем стили для слайдеров (если их еще нет)
    function addSliderStyles() {
        // Проверяем, не добавлены ли уже стили
        if (document.getElementById('m2-slider-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'm2-slider-styles';
        style.textContent = `
            .slider, .m2-range-slider {
                width: 100%;
                height: 8px;
                border-radius: 4px;
                background: #e9ecef;
                outline: none;
                -webkit-appearance: none;
                appearance: none;
                cursor: pointer;
            }

            .slider::-webkit-slider-thumb, .m2-range-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #4F2CD9;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 8px rgba(79,44,217,0.3);
                transition: all 0.2s ease;
            }

            .slider::-webkit-slider-thumb:hover, .m2-range-slider::-webkit-slider-thumb:hover {
                background: #3F23AE;
                box-shadow: 0 4px 12px rgba(79,44,217,0.4);
            }

            .slider::-moz-range-thumb, .m2-range-slider::-moz-range-thumb {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #4F2CD9;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 8px rgba(79,44,217,0.3);
                transition: all 0.2s ease;
            }

            .slider::-moz-range-thumb:hover, .m2-range-slider::-moz-range-thumb:hover {
                background: #3F23AE;
                box-shadow: 0 4px 12px rgba(79,44,217,0.4);
            }

            .slider-container {
                margin-top: 12px;
            }

            .slider-labels {
                display: flex;
                justify-content: space-between;
                margin-top: 8px;
                font-size: 12px;
                color: #666;
            }
        `;
        document.head.appendChild(style);
    }

    // Инициализация при загрузке страницы
    function init() {
        // Добавляем стили
        addSliderStyles();

        // Находим все числовые поля ввода
        const numberInputs = document.querySelectorAll('input[type="number"]');

        numberInputs.forEach(input => {
            createSliderForInput(input);
        });

        console.log(`[M2 Auto Sliders] Добавлено слайдеров: ${numberInputs.length}`);
    }

    // Запускаем инициализацию после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Экспортируем функции для ручного использования
    window.M2Sliders = {
        createSlider: createSliderForInput,
        init: init
    };
})();
