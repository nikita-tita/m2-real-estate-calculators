// Система сохранения и загрузки расчетов калькуляторов М2
// Использует localStorage для хранения данных в браузере

class CalculatorStorage {
    constructor(calculatorName) {
        this.calculatorName = calculatorName;
        this.storageKey = `m2-calculator-${calculatorName}`;
        this.autoSaveEnabled = true;
        this.autoSaveDelay = 2000; // 2 секунды
        this.autoSaveTimer = null;
        
        this.initializeStorage();
    }

    initializeStorage() {
        // Проверяем поддержку localStorage
        if (!this.isStorageSupported()) {
            console.warn('LocalStorage не поддерживается в этом браузере');
            return;
        }

        // Автоматически восстанавливаем последний расчет при загрузке страницы
        document.addEventListener('DOMContentLoaded', () => {
            this.autoRestore();
            this.setupAutoSave();
            this.addStorageButtons();
        });
    }

    isStorageSupported() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Сохранение текущего состояния калькулятора
    saveCalculation(name = null) {
        if (!this.isStorageSupported()) return false;

        const calculationData = this.extractCalculationData();
        const timestamp = new Date().toISOString();
        
        const saveData = {
            name: name || `Расчет от ${new Date().toLocaleString('ru-RU')}`,
            data: calculationData,
            timestamp: timestamp,
            calculatorType: this.calculatorName
        };

        try {
            if (name) {
                // Сохранение именованного расчета
                const savedCalculations = this.getSavedCalculations();
                savedCalculations[name] = saveData;
                localStorage.setItem(`${this.storageKey}-saved`, JSON.stringify(savedCalculations));
            } else {
                // Автосохранение последнего состояния
                localStorage.setItem(`${this.storageKey}-last`, JSON.stringify(saveData));
            }
            
            this.showNotification('Расчет сохранен', 'success');
            this.updateSavedCalculationsList();
            return true;
        } catch (e) {
            console.error('Ошибка при сохранении:', e);
            this.showNotification('Ошибка при сохранении', 'error');
            return false;
        }
    }

    // Загрузка сохраненного расчета
    loadCalculation(name = null) {
        if (!this.isStorageSupported()) return false;

        try {
            let saveData;
            
            if (name) {
                const savedCalculations = this.getSavedCalculations();
                saveData = savedCalculations[name];
            } else {
                const lastSave = localStorage.getItem(`${this.storageKey}-last`);
                saveData = lastSave ? JSON.parse(lastSave) : null;
            }

            if (saveData && saveData.data) {
                this.restoreCalculationData(saveData.data);
                this.triggerRecalculation();
                this.showNotification('Расчет загружен', 'success');
                return true;
            }
        } catch (e) {
            console.error('Ошибка при загрузке:', e);
            this.showNotification('Ошибка при загрузке', 'error');
        }
        
        return false;
    }

    // Получение всех сохраненных расчетов
    getSavedCalculations() {
        try {
            const saved = localStorage.getItem(`${this.storageKey}-saved`);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Ошибка при получении сохраненных расчетов:', e);
            return {};
        }
    }

    // Удаление сохраненного расчета
    deleteCalculation(name) {
        if (!this.isStorageSupported()) return false;

        try {
            const savedCalculations = this.getSavedCalculations();
            delete savedCalculations[name];
            localStorage.setItem(`${this.storageKey}-saved`, JSON.stringify(savedCalculations));
            this.updateSavedCalculationsList();
            this.showNotification('Расчет удален', 'success');
            return true;
        } catch (e) {
            console.error('Ошибка при удалении:', e);
            this.showNotification('Ошибка при удалении', 'error');
            return false;
        }
    }

    // Извлечение данных из формы калькулятора
    extractCalculationData() {
        const data = {};
        
        // Получаем все input и select элементы
        const inputs = document.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (input.id) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    data[input.id] = input.checked;
                } else {
                    data[input.id] = input.value;
                }
            }
        });

        // Сохраняем состояние переключателей режимов
        const modeButtons = document.querySelectorAll('.mode-btn.active, .toggle-btn.active');
        modeButtons.forEach(btn => {
            const parent = btn.closest('.mode-switch, .payment-toggle');
            if (parent) {
                const key = parent.classList.contains('mode-switch') ? 'currentMode' : 'currentPaymentType';
                data[key] = btn.textContent.trim();
            }
        });

        return data;
    }

    // Восстановление данных в форму калькулятора
    restoreCalculationData(data) {
        Object.keys(data).forEach(key => {
            if (key === 'currentMode' || key === 'currentPaymentType') {
                // Восстанавливаем состояние переключателей
                this.restoreToggleState(key, data[key]);
                return;
            }

            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
            }
        });
    }

    // Восстановление состояния переключателей
    restoreToggleState(key, value) {
        const buttons = document.querySelectorAll('.mode-btn, .toggle-btn');
        buttons.forEach(btn => {
            if (btn.textContent.trim() === value) {
                btn.click();
            }
        });
    }

    // Автоматическое восстановление при загрузке страницы
    autoRestore() {
        const urlParams = new URLSearchParams(window.location.search);
        const autoRestore = urlParams.get('restore');
        
        if (autoRestore !== 'false') {
            this.loadCalculation(); // Загружаем последний расчет
        }
    }

    // Настройка автосохранения
    setupAutoSave() {
        if (!this.autoSaveEnabled) return;

        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.scheduleAutoSave();
            });
            input.addEventListener('change', () => {
                this.scheduleAutoSave();
            });
        });

        // Отслеживаем изменения в переключателях
        const toggleButtons = document.querySelectorAll('.mode-btn, .toggle-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.scheduleAutoSave();
            });
        });
    }

    // Планирование автосохранения с задержкой
    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.saveCalculation();
        }, this.autoSaveDelay);
    }

    // Принудительный пересчет результатов
    triggerRecalculation() {
        // Ищем основную функцию расчета в зависимости от типа калькулятора
        const recalcFunctions = [
            'calculateAffordability',
            'calculateProfitability', 
            'calculateAirbnb',
            'calculateComparison',
            'calculateMortgage',
            'calculate'
        ];

        for (const funcName of recalcFunctions) {
            if (typeof window[funcName] === 'function') {
                window[funcName]();
                break;
            }
        }

        // Вызываем событие для пользовательских обработчиков
        window.dispatchEvent(new CustomEvent('calculatorDataRestored'));
    }

    // Добавление кнопок управления сохранением
    addStorageButtons() {
        const existingButtons = document.querySelector('.action-buttons');
        if (!existingButtons) return;

        // Кнопка сохранения с именем
        const saveButton = document.createElement('button');
        saveButton.className = 'btn btn-secondary';
        saveButton.innerHTML = '💾 Сохранить расчет';
        saveButton.onclick = () => this.showSaveDialog();

        // Кнопка загрузки
        const loadButton = document.createElement('button');
        loadButton.className = 'btn btn-secondary';
        loadButton.innerHTML = '📁 Загрузить расчет';
        loadButton.onclick = () => this.showLoadDialog();

        existingButtons.insertBefore(saveButton, existingButtons.firstChild);
        existingButtons.insertBefore(loadButton, existingButtons.children[1]);
    }

    // Диалог сохранения
    showSaveDialog() {
        const name = prompt('Введите название для расчета:', `Расчет ${new Date().toLocaleDateString('ru-RU')}`);
        if (name && name.trim()) {
            this.saveCalculation(name.trim());
        }
    }

    // Диалог загрузки
    showLoadDialog() {
        const savedCalculations = this.getSavedCalculations();
        const names = Object.keys(savedCalculations);
        
        if (names.length === 0) {
            this.showNotification('Нет сохраненных расчетов', 'warning');
            return;
        }

        // Создаем простой список для выбора
        let message = 'Выберите расчет для загрузки:\n\n';
        names.forEach((name, index) => {
            const calc = savedCalculations[name];
            const date = new Date(calc.timestamp).toLocaleString('ru-RU');
            message += `${index + 1}. ${name} (${date})\n`;
        });
        
        const choice = prompt(message + '\nВведите номер расчета:');
        const index = parseInt(choice) - 1;
        
        if (index >= 0 && index < names.length) {
            this.loadCalculation(names[index]);
        }
    }

    // Обновление списка сохраненных расчетов
    updateSavedCalculationsList() {
        // Этот метод может быть переопределен для обновления UI
        const event = new CustomEvent('savedCalculationsUpdated', {
            detail: this.getSavedCalculations()
        });
        window.dispatchEvent(event);
    }

    // Показ уведомлений
    showNotification(message, type = 'info') {
        // Создаем простое уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10001;
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;

        // Цветовая схема в зависимости от типа
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#007bff'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Экспорт данных в JSON
    exportToJSON() {
        const data = {
            calculatorType: this.calculatorName,
            data: this.extractCalculationData(),
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `m2-calculator-${this.calculatorName}-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Данные экспортированы', 'success');
    }

    // Импорт данных из JSON
    importFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.calculatorType === this.calculatorName && data.data) {
                    this.restoreCalculationData(data.data);
                    this.triggerRecalculation();
                    this.showNotification('Данные импортированы', 'success');
                } else {
                    this.showNotification('Неверный формат файла', 'error');
                }
            } catch (error) {
                this.showNotification('Ошибка при импорте', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Очистка всех сохраненных данных
    clearAllData() {
        if (confirm('Удалить все сохраненные расчеты? Это действие нельзя отменить.')) {
            localStorage.removeItem(`${this.storageKey}-last`);
            localStorage.removeItem(`${this.storageKey}-saved`);
            this.showNotification('Все данные удалены', 'success');
            this.updateSavedCalculationsList();
        }
    }
}

// Функция для инициализации системы хранения
function initCalculatorStorage(calculatorName) {
    if (!calculatorName) {
        // Пытаемся определить тип калькулятора по URL или title
        const path = window.location.pathname;
        const title = document.title;
        
        if (path.includes('mortgage') || title.includes('ипотек')) {
            calculatorName = 'mortgage';
        } else if (path.includes('affordability') || title.includes('доступность')) {
            calculatorName = 'affordability';
        } else if (path.includes('rental') || path.includes('profitability')) {
            calculatorName = 'profitability';
        } else if (path.includes('airbnb')) {
            calculatorName = 'airbnb';
        } else if (path.includes('vs') || title.includes('vs')) {
            calculatorName = 'comparison';
        } else {
            calculatorName = 'default';
        }
    }

    return new CalculatorStorage(calculatorName);
}

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Создаем глобальный экземпляр системы хранения
    window.calculatorStorage = initCalculatorStorage();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CalculatorStorage, initCalculatorStorage };
}