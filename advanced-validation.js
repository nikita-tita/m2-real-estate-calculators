/**
 * Advanced Validation - улучшенная система валидации для калькуляторов М2
 * Реализует интеллектуальную валидацию с предотвращением ошибок
 */

class AdvancedValidation {
    constructor() {
        this.validators = new Map();
        this.rules = new Map();
        this.errorMessages = new Map();
        this.realTimeValidation = true;
        this.debounceTime = 150; // мс для debounce
        this.validationHistory = new Map();
    }

    /**
     * Инициализация системы валидации
     */
    init() {
        this.setupDefaultValidators();
        this.setupDefaultRules();
        this.setupEventListeners();
        this.initializeFormValidation();

        console.log('✅ Расширенная система валидации инициализирована');
    }

    /**
     * Настройка стандартных валидаторов
     */
    setupDefaultValidators() {
        // Валидатор положительных чисел
        this.validators.set('positive', {
            validate: (value) => parseFloat(value) > 0,
            message: 'Значение должно быть больше нуля'
        });

        // Валидатор диапазона
        this.validators.set('range', {
            validate: (value, min, max) => {
                const num = parseFloat(value);
                return num >= min && num <= max;
            },
            message: (min, max) => `Значение должно быть от ${min} до ${max}`
        });

        // Валидатор процентов
        this.validators.set('percentage', {
            validate: (value) => {
                const num = parseFloat(value);
                return num >= 0 && num <= 100;
            },
            message: 'Процент должен быть от 0 до 100'
        });

        // Валидатор ставки (расширенный)
        this.validators.set('interestRate', {
            validate: (value) => {
                const num = parseFloat(value);
                return num >= 0.1 && num <= 50;
            },
            message: 'Процентная ставка должна быть от 0.1% до 50%'
        });

        // Валидатор суммы кредита
        this.validators.set('loanAmount', {
            validate: (value) => {
                const num = parseFloat(value);
                return num >= 100000 && num <= 100000000; // от 100 тыс до 100 млн
            },
            message: 'Сумма кредита должна быть от 100 000 до 100 000 000 рублей'
        });

        // Валидатор срока кредита
        this.validators.set('loanTerm', {
            validate: (value) => {
                const num = parseFloat(value);
                return num >= 1 && num <= 50;
            },
            message: 'Срок кредита должен быть от 1 до 50 лет'
        });

        // Валидатор первоначального взноса
        this.validators.set('downPayment', {
            validate: (value, propertyPrice) => {
                const payment = parseFloat(value);
                const price = parseFloat(propertyPrice) || 0;
                if (price === 0) return true; // Если цена не указана, пропускаем
                return payment >= price * 0.1 && payment <= price * 0.9;
            },
            message: 'Первоначальный взнос должен быть от 10% до 90% от стоимости'
        });

        // Валидатор дохода
        this.validators.set('income', {
            validate: (value) => {
                const num = parseFloat(value);
                return num >= 15000 && num <= 10000000; // от МРОТ до 10 млн
            },
            message: 'Доход должен быть от 15 000 до 10 000 000 рублей'
        });

        // Валидатор стоимости недвижимости
        this.validators.set('propertyPrice', {
            validate: (value) => {
                const num = parseFloat(value);
                return num >= 500000 && num <= 500000000; // от 500 тыс до 500 млн
            },
            message: 'Стоимость недвижимости должна быть от 500 000 до 500 000 000 рублей'
        });

        // Валидатор арендной платы
        this.validators.set('monthlyRent', {
            validate: (value) => {
                const num = parseFloat(value);
                return num >= 5000 && num <= 5000000;
            },
            message: 'Арендная плата должна быть от 5 000 до 5 000 000 рублей'
        });

        // Интеллектуальный валидатор соотношений
        this.validators.set('smartRatio', {
            validate: (value, relatedValue, ratio) => {
                const num1 = parseFloat(value);
                const num2 = parseFloat(relatedValue);
                if (num2 === 0) return true;
                return (num1 / num2) <= ratio;
            },
            message: (ratio) => `Соотношение не должно превышать ${ratio * 100}%`
        });

        // Валидатор логических зависимостей
        this.validators.set('logical', {
            validate: (value, condition, expectedResult) => {
                return condition ? (value === expectedResult) : true;
            },
            message: 'Значение не соответствует логическим условиям'
        });
    }

    /**
     * Настройка правил валидации по полям
     */
    setupDefaultRules() {
        // Правила для ипотечного калькулятора
        this.rules.set('loanAmount', [
            { validator: 'loanAmount' },
            { validator: 'positive' }
        ]);

        this.rules.set('interestRate', [
            { validator: 'interestRate' }
        ]);

        this.rules.set('loanTerm', [
            { validator: 'loanTerm' }
        ]);

        this.rules.set('downPayment', [
            { validator: 'positive' },
            { validator: 'downPayment', params: ['propertyPrice'] }
        ]);

        // Правила для калькулятора доходности
        this.rules.set('propertyPrice', [
            { validator: 'propertyPrice' }
        ]);

        this.rules.set('monthlyRent', [
            { validator: 'monthlyRent' }
        ]);

        this.rules.set('income', [
            { validator: 'income' }
        ]);

        // Правила для процентных полей
        this.rules.set('managementFee', [
            { validator: 'range', params: [0, 50] }
        ]);

        this.rules.set('vacancyRate', [
            { validator: 'percentage' }
        ]);

        this.rules.set('appreciationRate', [
            { validator: 'range', params: [0, 20] }
        ]);

        // Умные правила для связанных полей
        this.rules.set('monthlyPayment', [
            { validator: 'smartRatio', params: ['income', 0.45] } // не более 45% от дохода
        ]);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Валидация в реальном времени
        document.addEventListener('input', this.debounce((e) => {
            if (this.shouldValidate(e.target)) {
                this.validateField(e.target);
            }
        }, this.debounceTime));

        // Валидация при потере фокуса
        document.addEventListener('blur', (e) => {
            if (this.shouldValidate(e.target)) {
                this.validateField(e.target);
                this.updateRelatedFields(e.target);
            }
        }, true);

        // Валидация при отправке формы
        document.addEventListener('submit', (e) => {
            if (!this.validateForm(e.target)) {
                e.preventDefault();
                this.showFormErrors(e.target);
            }
        });

        // Автокоррекция значений
        document.addEventListener('change', (e) => {
            if (this.shouldValidate(e.target)) {
                this.autoCorrectValue(e.target);
            }
        });
    }

    /**
     * Проверка, нужно ли валидировать поле
     */
    shouldValidate(element) {
        return element.matches('input[type="number"], input[type="range"], select') &&
               !element.disabled &&
               element.closest('.calculator-container, form');
    }

    /**
     * Инициализация валидации для всех форм
     */
    initializeFormValidation() {
        const forms = document.querySelectorAll('form, .calculator-container');
        forms.forEach(form => {
            this.enhanceForm(form);
        });
    }

    /**
     * Улучшение формы валидацией
     */
    enhanceForm(form) {
        // Добавляем контейнеры для ошибок
        const inputs = form.querySelectorAll('input[type="number"], input[type="range"], select');
        inputs.forEach(input => {
            this.enhanceInput(input);
        });

        // Добавляем индикатор общего состояния формы
        this.addFormStatusIndicator(form);
    }

    /**
     * Улучшение поля ввода
     */
    enhanceInput(input) {
        const container = input.closest('.input-group, .form-group') || input.parentElement;

        // Создаем контейнер для ошибки
        let errorContainer = container.querySelector('.validation-error');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'validation-error';
            container.appendChild(errorContainer);
        }

        // Добавляем визуальные индикаторы
        input.classList.add('validation-enabled');

        // Добавляем подсказки
        this.addInputHints(input);

        // Добавляем индикатор валидности
        this.addValidityIndicator(input);
    }

    /**
     * Добавление подсказок к полю
     */
    addInputHints(input) {
        const fieldName = input.id || input.name;
        const hints = this.getFieldHints(fieldName);

        if (hints.length > 0) {
            let hintContainer = input.parentElement.querySelector('.input-hints');
            if (!hintContainer) {
                hintContainer = document.createElement('div');
                hintContainer.className = 'input-hints';
                input.parentElement.appendChild(hintContainer);
            }

            hintContainer.innerHTML = hints.map(hint =>
                `<span class="hint-item">${hint}</span>`
            ).join('');
        }
    }

    /**
     * Получение подсказок для поля
     */
    getFieldHints(fieldName) {
        const hints = {
            'loanAmount': ['Минимум: 100 000 ₽', 'Максимум: 100 000 000 ₽'],
            'interestRate': ['Обычно: 7-15%', 'Зависит от банка и программы'],
            'loanTerm': ['Стандартно: 15-30 лет', 'Максимум: 50 лет'],
            'downPayment': ['Минимум: 10% от стоимости', 'Рекомендуем: 20% и более'],
            'income': ['Подтвержденный доход', 'Учитывается созаемщики'],
            'propertyPrice': ['Рыночная стоимость', 'По данным оценки'],
            'monthlyRent': ['Среднерыночная ставка', 'С учетом состояния объекта']
        };

        return hints[fieldName] || [];
    }

    /**
     * Добавление индикатора валидности
     */
    addValidityIndicator(input) {
        const indicator = document.createElement('span');
        indicator.className = 'validity-indicator';
        input.parentElement.appendChild(indicator);
    }

    /**
     * Валидация одного поля
     */
    async validateField(input) {
        const fieldName = input.id || input.name;
        const value = input.value;
        const rules = this.rules.get(fieldName) || [];

        // Очищаем предыдущие ошибки
        this.clearFieldErrors(input);

        // Пропускаем пустые поля (если они не обязательные)
        if (!value && !input.required) {
            this.setFieldState(input, 'neutral');
            return true;
        }

        let isValid = true;
        let errorMessage = '';

        // Проверяем каждое правило
        for (const rule of rules) {
            const validator = this.validators.get(rule.validator);
            if (!validator) continue;

            // Получаем параметры для валидатора
            const params = this.getValidationParams(rule, input);

            // Выполняем валидацию
            const validationResult = validator.validate(value, ...params);

            if (!validationResult) {
                isValid = false;
                errorMessage = typeof validator.message === 'function'
                    ? validator.message(...params)
                    : validator.message;
                break;
            }
        }

        // Дополнительная контекстная валидация
        if (isValid) {
            const contextValidation = await this.performContextValidation(input, value);
            if (!contextValidation.isValid) {
                isValid = false;
                errorMessage = contextValidation.message;
            }
        }

        // Обновляем состояние поля
        if (isValid) {
            this.setFieldState(input, 'valid');
            this.recordValidationSuccess(fieldName);
        } else {
            this.setFieldState(input, 'invalid');
            this.showFieldError(input, errorMessage);
            this.recordValidationError(fieldName, errorMessage);
        }

        // Обновляем состояние формы
        this.updateFormState(input);

        return isValid;
    }

    /**
     * Получение параметров для валидации
     */
    getValidationParams(rule, input) {
        if (!rule.params) return [];

        return rule.params.map(param => {
            if (typeof param === 'string') {
                // Ищем связанное поле
                const relatedField = input.closest('form, .calculator-container')?.querySelector(`#${param}, [name="${param}"]`);
                return relatedField ? relatedField.value : '';
            }
            return param;
        });
    }

    /**
     * Контекстная валидация (учитывает связи между полями)
     */
    async performContextValidation(input, value) {
        const fieldName = input.id || input.name;
        const form = input.closest('form, .calculator-container');

        // Специфичные проверки для ипотечного калькулятора
        if (fieldName === 'loanAmount' && form) {
            const propertyPrice = form.querySelector('#propertyPrice, [name="propertyPrice"]')?.value;
            const downPayment = form.querySelector('#downPayment, [name="downPayment"]')?.value;

            if (propertyPrice && downPayment) {
                const maxLoan = parseFloat(propertyPrice) - parseFloat(downPayment);
                if (parseFloat(value) > maxLoan) {
                    return {
                        isValid: false,
                        message: `Сумма кредита не может превышать ${this.formatNumber(maxLoan)} ₽ (стоимость минус взнос)`
                    };
                }
            }
        }

        // Проверка доступности ипотеки
        if (fieldName === 'monthlyPayment' || fieldName === 'income') {
            const monthlyPayment = parseFloat(form?.querySelector('#monthlyPayment, [name="monthlyPayment"]')?.value || 0);
            const income = parseFloat(form?.querySelector('#income, [name="income"]')?.value || 0);

            if (monthlyPayment && income) {
                const ratio = monthlyPayment / income;
                if (ratio > 0.45) {
                    return {
                        isValid: false,
                        message: `Платеж превышает 45% от дохода (текущий: ${(ratio * 100).toFixed(1)}%). Банк может отказать в кредите.`
                    };
                }
            }
        }

        // Проверка доходности недвижимости
        if ((fieldName === 'monthlyRent' || fieldName === 'propertyPrice') && form) {
            const rent = parseFloat(form.querySelector('#monthlyRent, [name="monthlyRent"]')?.value || 0);
            const price = parseFloat(form.querySelector('#propertyPrice, [name="propertyPrice"]')?.value || 0);

            if (rent && price) {
                const annualYield = (rent * 12) / price * 100;
                if (annualYield < 3) {
                    return {
                        isValid: false,
                        message: `Низкая доходность (${annualYield.toFixed(2)}% годовых). Рассмотрите другие варианты инвестиций.`
                    };
                }
            }
        }

        return { isValid: true };
    }

    /**
     * Установка состояния поля
     */
    setFieldState(input, state) {
        // Удаляем предыдущие классы состояния
        input.classList.remove('field-valid', 'field-invalid', 'field-neutral');

        // Добавляем новый класс
        input.classList.add(`field-${state}`);

        // Обновляем индикатор
        const indicator = input.parentElement.querySelector('.validity-indicator');
        if (indicator) {
            indicator.className = `validity-indicator indicator-${state}`;
            indicator.textContent = this.getIndicatorText(state);
        }
    }

    /**
     * Получение текста индикатора
     */
    getIndicatorText(state) {
        const texts = {
            'valid': '✓',
            'invalid': '✗',
            'neutral': ''
        };
        return texts[state] || '';
    }

    /**
     * Показать ошибку поля
     */
    showFieldError(input, message) {
        const errorContainer = input.parentElement.querySelector('.validation-error');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    }

    /**
     * Очистить ошибки поля
     */
    clearFieldErrors(input) {
        const errorContainer = input.parentElement.querySelector('.validation-error');
        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none';
        }
    }

    /**
     * Автокоррекция значений
     */
    autoCorrectValue(input) {
        const fieldName = input.id || input.name;
        let value = parseFloat(input.value);

        if (isNaN(value)) return;

        // Автокоррекция для разных типов полей
        switch (fieldName) {
            case 'interestRate':
                if (value > 1 && value < 100) {
                    // Возможно пользователь ввел в долях (0.15 вместо 15)
                    if (value < 1) {
                        input.value = (value * 100).toFixed(2);
                        this.showAutoCorrection(input, 'Переведено в проценты');
                    }
                }
                break;

            case 'loanAmount':
            case 'propertyPrice':
                // Округляем до тысяч
                const rounded = Math.round(value / 1000) * 1000;
                if (rounded !== value && Math.abs(rounded - value) < value * 0.01) {
                    input.value = rounded;
                    this.showAutoCorrection(input, 'Округлено до тысяч');
                }
                break;

            case 'downPayment':
                // Проверяем, возможно пользователь ввел процент вместо суммы
                const form = input.closest('form, .calculator-container');
                const propertyPrice = form?.querySelector('#propertyPrice, [name="propertyPrice"]')?.value;

                if (propertyPrice && value > 0 && value <= 100) {
                    const correctedValue = parseFloat(propertyPrice) * value / 100;
                    if (confirm(`Вы имели в виду ${value}% от стоимости (${this.formatNumber(correctedValue)} ₽)?`)) {
                        input.value = correctedValue;
                        this.showAutoCorrection(input, 'Переведено из процентов в сумму');
                    }
                }
                break;
        }
    }

    /**
     * Показать уведомление об автокоррекции
     */
    showAutoCorrection(input, message) {
        const notification = document.createElement('div');
        notification.className = 'autocorrect-notification';
        notification.textContent = `💡 ${message}`;

        input.parentElement.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Обновление связанных полей
     */
    updateRelatedFields(input) {
        const fieldName = input.id || input.name;
        const form = input.closest('form, .calculator-container');

        if (!form) return;

        // Обновляем связанные поля при изменении стоимости недвижимости
        if (fieldName === 'propertyPrice') {
            const downPaymentField = form.querySelector('#downPayment, [name="downPayment"]');
            if (downPaymentField && downPaymentField.value) {
                this.validateField(downPaymentField);
            }
        }

        // Обновляем расчет при изменении ключевых параметров
        if (['loanAmount', 'interestRate', 'loanTerm'].includes(fieldName)) {
            this.triggerRecalculation(form);
        }
    }

    /**
     * Запуск пересчета калькулятора
     */
    triggerRecalculation(form) {
        // Находим и вызываем функцию расчета
        const calculateButton = form.querySelector('[onclick*="calculate"], .calculate-btn');
        if (calculateButton && !calculateButton.disabled) {
            // Небольшая задержка для завершения валидации
            setTimeout(() => {
                calculateButton.click();
            }, 100);
        }
    }

    /**
     * Валидация всей формы
     */
    async validateForm(form) {
        const inputs = form.querySelectorAll('input[type="number"], input[type="range"], select');
        let isFormValid = true;

        // Валидируем все поля
        for (const input of inputs) {
            if (this.shouldValidate(input)) {
                const isValid = await this.validateField(input);
                if (!isValid) {
                    isFormValid = false;
                }
            }
        }

        // Обновляем состояние формы
        this.updateFormState(form);

        return isFormValid;
    }

    /**
     * Добавление индикатора состояния формы
     */
    addFormStatusIndicator(form) {
        let indicator = form.querySelector('.form-status-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'form-status-indicator';

            // Ищем подходящее место для размещения
            const submitBtn = form.querySelector('[type="submit"], .calculate-btn');
            if (submitBtn) {
                submitBtn.parentElement.insertBefore(indicator, submitBtn);
            } else {
                form.appendChild(indicator);
            }
        }
    }

    /**
     * Обновление состояния формы
     */
    updateFormState(form) {
        const inputs = form.querySelectorAll('.validation-enabled');
        let validCount = 0;
        let invalidCount = 0;
        let totalCount = 0;

        inputs.forEach(input => {
            if (input.classList.contains('field-valid')) validCount++;
            else if (input.classList.contains('field-invalid')) invalidCount++;
            totalCount++;
        });

        const indicator = form.querySelector('.form-status-indicator');
        if (indicator && totalCount > 0) {
            const percentage = Math.round((validCount / totalCount) * 100);

            indicator.innerHTML = `
                <div class="form-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="progress-text">Заполнено: ${validCount}/${totalCount}</span>
                </div>
            `;

            if (invalidCount > 0) {
                indicator.innerHTML += `<div class="form-errors">Ошибок: ${invalidCount}</div>`;
            }
        }
    }

    /**
     * Показать ошибки формы
     */
    showFormErrors(form) {
        const invalidFields = form.querySelectorAll('.field-invalid');

        if (invalidFields.length > 0) {
            // Прокручиваем к первому полю с ошибкой
            invalidFields[0].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Фокусируемся на поле
            invalidFields[0].focus();

            // Показываем общее уведомление
            this.showNotification(
                `Исправьте ${invalidFields.length} ${this.pluralize(invalidFields.length, ['ошибку', 'ошибки', 'ошибок'])} в форме`,
                'error'
            );
        }
    }

    /**
     * Запись успешной валидации в историю
     */
    recordValidationSuccess(fieldName) {
        if (!this.validationHistory.has(fieldName)) {
            this.validationHistory.set(fieldName, { errors: 0, successes: 0 });
        }

        const stats = this.validationHistory.get(fieldName);
        stats.successes++;
    }

    /**
     * Запись ошибки валидации в историю
     */
    recordValidationError(fieldName, error) {
        if (!this.validationHistory.has(fieldName)) {
            this.validationHistory.set(fieldName, { errors: 0, successes: 0 });
        }

        const stats = this.validationHistory.get(fieldName);
        stats.errors++;

        // Отправляем в аналитику (если нужно)
        if (window.gtag) {
            gtag('event', 'validation_error', {
                field_name: fieldName,
                error_message: error
            });
        }
    }

    /**
     * Получение статистики валидации
     */
    getValidationStats() {
        const stats = {
            totalFields: this.validationHistory.size,
            totalErrors: 0,
            totalSuccesses: 0,
            fieldStats: {}
        };

        this.validationHistory.forEach((data, fieldName) => {
            stats.totalErrors += data.errors;
            stats.totalSuccesses += data.successes;
            stats.fieldStats[fieldName] = data;
        });

        return stats;
    }

    // Вспомогательные методы

    formatNumber(num) {
        return new Intl.NumberFormat('ru-RU').format(Math.round(num));
    }

    pluralize(count, forms) {
        const mod10 = count % 10;
        const mod100 = count % 100;

        if (mod100 >= 11 && mod100 <= 14) {
            return forms[2];
        }

        if (mod10 === 1) return forms[0];
        if (mod10 >= 2 && mod10 <= 4) return forms[1];
        return forms[2];
    }

    showNotification(message, type = 'info') {
        // Используем существующую систему уведомлений или создаем простую
        if (window.scenarioComparison?.showNotification) {
            window.scenarioComparison.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
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
}

// CSS стили для расширенной валидации
const validationStyles = `
<style>
.validation-enabled {
    position: relative;
}

.field-valid {
    border-color: #28a745 !important;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.field-invalid {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    animation: shake 0.3s ease-in-out;
}

.field-neutral {
    border-color: #ced4da;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.validation-error {
    display: none;
    color: #dc3545;
    font-size: 0.875em;
    margin-top: 4px;
    padding: 4px 8px;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    position: relative;
}

.validation-error::before {
    content: "⚠️ ";
    margin-right: 4px;
}

.validity-indicator {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: bold;
    font-size: 14px;
    pointer-events: none;
}

.indicator-valid {
    color: #28a745;
}

.indicator-invalid {
    color: #dc3545;
}

.indicator-neutral {
    color: #6c757d;
}

.input-hints {
    margin-top: 4px;
    font-size: 0.8em;
    color: #6c757d;
}

.hint-item {
    display: inline-block;
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 3px;
    margin-right: 6px;
    margin-bottom: 2px;
}

.form-status-indicator {
    margin: 15px 0;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 4px solid #3416b6;
}

.form-progress {
    display: flex;
    align-items: center;
    gap: 10px;
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #28a745, #20c997);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.9em;
    font-weight: 500;
    color: #495057;
    min-width: 120px;
}

.form-errors {
    margin-top: 5px;
    color: #dc3545;
    font-size: 0.9em;
    font-weight: 500;
}

.autocorrect-notification {
    position: absolute;
    top: -35px;
    left: 0;
    background: #17a2b8;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    z-index: 1000;
    animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Улучшения для полей ввода */
.validation-enabled:focus {
    outline: none;
    transition: all 0.2s ease;
}

.validation-enabled[type="number"]::-webkit-outer-spin-button,
.validation-enabled[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.validation-enabled[type="number"] {
    -moz-appearance: textfield;
}

/* Стили для тултипов */
.validation-enabled[data-tooltip] {
    position: relative;
}

.validation-enabled[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    white-space: nowrap;
    z-index: 1000;
    margin-bottom: 5px;
}

/* Адаптивность */
@media (max-width: 768px) {
    .validity-indicator {
        right: 12px;
        font-size: 16px;
    }

    .validation-error {
        font-size: 0.8em;
        padding: 6px;
    }

    .form-progress {
        flex-direction: column;
        gap: 8px;
    }

    .progress-text {
        min-width: auto;
        text-align: center;
    }

    .autocorrect-notification {
        position: static;
        margin: 5px 0;
        animation: none;
    }
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
    .validation-error {
        background: #2d1b1e;
        border-color: #842029;
        color: #ea868f;
    }

    .hint-item {
        background: #343a40;
        color: #adb5bd;
    }

    .form-status-indicator {
        background: #343a40;
        color: #adb5bd;
    }

    .progress-bar {
        background: #495057;
    }
}

/* Анимации загрузки для медленных валидаций */
.validation-loading {
    position: relative;
}

.validation-loading::after {
    content: "";
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3416b6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: translateY(-50%) rotate(0deg); }
    100% { transform: translateY(-50%) rotate(360deg); }
}
</style>
`;

// Инъекция стилей
if (!document.querySelector('#advanced-validation-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'advanced-validation-styles';
    styleElement.innerHTML = validationStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Глобальная инициализация
window.AdvancedValidation = AdvancedValidation;

// Автоматическая инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.advancedValidation = new AdvancedValidation();
        window.advancedValidation.init();
    });
} else {
    setTimeout(() => {
        window.advancedValidation = new AdvancedValidation();
        window.advancedValidation.init();
    }, 0);
}

export { AdvancedValidation };