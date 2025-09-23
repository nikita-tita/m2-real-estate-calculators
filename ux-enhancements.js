// Универсальный модуль UX улучшений для всех калькуляторов
// Соблюдение 20 законов дизайна

class UXEnhancer {
    constructor() {
        this.debounceTimeout = null;
        this.isCalculating = false;
        
        this.init();
    }
    
    init() {
        // Применяем все улучшения после загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyEnhancements());
        } else {
            this.applyEnhancements();
        }
    }
    
    applyEnhancements() {
        this.improveInputFields();
        this.enhanceFittLaw();
        this.addVisualFeedback();
        this.optimizePerformance();
        this.improveGrouping();
        this.enhanceResponsiveness();
        this.addAccessibility();
    }
    
    // Закон Фиттса - минимальные размеры кнопок
    enhanceFittLaw() {
        const style = document.createElement('style');
        style.textContent = `
            .quick-btn, .btn, button:not(.toggle-icon) {
                min-height: 44px !important;
                min-width: 44px !important;
                padding: 12px 20px !important;
                transition: all 0.2s ease !important;
            }
            
            .quick-btn:hover, .btn:hover, button:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            }
            
            /* Закон близости - группировка */
            .input-group + .input-group {
                margin-top: 24px !important;
            }
            
            .results-section {
                border: 2px solid #e9ecef;
                border-radius: 12px;
                padding: 24px;
                background: #f8f9fa;
                margin-top: 32px;
            }
            
            /* Закон общего региона */
            .parameter-section {
                background: #ffffff;
                border: 1px solid #e9ecef;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            
            .parameter-section h3 {
                color: #3416b6;
                font-size: 18px;
                margin-bottom: 16px;
                border-bottom: 2px solid #e9ecef;
                padding-bottom: 8px;
            }
            
            /* Порог Доэрти - быстрая обратная связь */
            .input-field.calculating {
                background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%);
                background-size: 200% 100%;
                animation: shimmer 1s infinite;
            }
            
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            /* Закон Миллера - группировка по 7±2 элемента */
            .parameters-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                max-width: 900px; /* Ограничиваем ширину для лучшего восприятия */
            }
            
            /* Эффект фон Ресторфа - выделение главного результата */
            .main-result {
                background: linear-gradient(135deg, #3416b6, #4726d6);
                color: white;
                padding: 24px;
                border-radius: 16px;
                text-align: center;
                margin: 24px 0;
                box-shadow: 0 8px 25px rgba(52, 22, 182, 0.3);
            }
            
            .main-result .result-value {
                font-size: 36px;
                font-weight: 700;
                margin: 8px 0;
            }
            
            .main-result .result-label {
                font-size: 18px;
                opacity: 0.9;
            }
            
            /* Адаптивность - больше breakpoints */
            @media (max-width: 1024px) and (min-width: 769px) {
                .parameters-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .quick-btn {
                    font-size: 13px;
                    padding: 10px 16px !important;
                }
            }
            
            @media (max-width: 768px) {
                .parameters-grid {
                    grid-template-columns: 1fr;
                }
                
                .quick-btn {
                    min-height: 48px !important;
                    padding: 14px 20px !important;
                }
                
                .main-result .result-value {
                    font-size: 28px;
                }
            }
            
            @media (max-width: 480px) {
                .quick-btn {
                    width: 100%;
                    margin: 4px 0;
                }
                
                .quick-buttons {
                    flex-direction: column;
                    gap: 8px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Улучшение полей ввода
    improveInputFields() {
        const inputs = document.querySelectorAll('input[type="number"], input[type="text"], select');
        
        inputs.forEach(input => {
            // Добавляем только дебаунсинг для input событий без визуальных эффектов
            input.addEventListener('input', (e) => {
                e.target.classList.add('calculating');
                
                clearTimeout(this.debounceTimeout);
                this.debounceTimeout = setTimeout(() => {
                    e.target.classList.remove('calculating');
                }, 300);
            });
        });
    }
    
    // Визуальная обратная связь
    addVisualFeedback() {
        // Добавляем индикатор загрузки для результатов
        const resultElements = document.querySelectorAll('.result-value');
        
        resultElements.forEach(element => {
            element.style.transition = 'all 0.3s ease';
            
            // Создаем наблюдатель за изменениями
            const observer = new MutationObserver(() => {
                element.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    element.style.transform = '';
                }, 200);
            });
            
            observer.observe(element, { childList: true, characterData: true, subtree: true });
        });
    }
    
    // Оптимизация производительности
    optimizePerformance() {
        // Ленивая загрузка тяжелых элементов
        const charts = document.querySelectorAll('canvas, svg');
        
        if ('IntersectionObserver' in window) {
            const chartObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Запускаем отрисовку только при появлении в viewport
                        entry.target.style.opacity = '1';
                        chartObserver.unobserve(entry.target);
                    }
                });
            });
            
            charts.forEach(chart => {
                chart.style.opacity = '0';
                chart.style.transition = 'opacity 0.5s ease';
                chartObserver.observe(chart);
            });
        }
    }
    
    // Улучшение группировки элементов
    improveGrouping() {
        // Автоматически группируем связанные поля
        const inputGroups = document.querySelectorAll('.input-group');
        
        // Создаем секции по типам параметров
        const sections = new Map();
        
        inputGroups.forEach(group => {
            const label = group.querySelector('label');
            if (!label) return;
            
            const labelText = label.textContent.toLowerCase();
            let sectionType = 'general';
            
            if (labelText.includes('доход') || labelText.includes('зарплата')) {
                sectionType = 'income';
            } else if (labelText.includes('расход') || labelText.includes('платеж')) {
                sectionType = 'expenses';
            } else if (labelText.includes('стоимость') || labelText.includes('цена')) {
                sectionType = 'property';
            }
            
            if (!sections.has(sectionType)) {
                sections.set(sectionType, []);
            }
            sections.get(sectionType).push(group);
        });
        
        // Применяем группировку визуально
        sections.forEach((groups, type) => {
            if (groups.length > 1) {
                const wrapper = document.createElement('div');
                wrapper.className = 'parameter-section';
                
                const header = document.createElement('h3');
                const titles = {
                    'income': 'Доходы',
                    'expenses': 'Расходы',
                    'property': 'Недвижимость'
                };
                header.textContent = titles[type] || 'Параметры';
                
                wrapper.appendChild(header);
                
                const parent = groups[0].parentNode;
                parent.insertBefore(wrapper, groups[0]);
                
                groups.forEach(group => {
                    wrapper.appendChild(group);
                });
            }
        });
    }
    
    // Улучшение адаптивности
    enhanceResponsiveness() {
        // Динамическое изменение размеров в зависимости от экрана
        const updateLayout = () => {
            const screenWidth = window.innerWidth;
            const containers = document.querySelectorAll('.container, .calculator-container');
            
            containers.forEach(container => {
                if (screenWidth < 480) {
                    container.style.padding = '15px';
                } else if (screenWidth < 768) {
                    container.style.padding = '20px';
                } else {
                    container.style.padding = '30px';
                }
            });
        };
        
        updateLayout();
        window.addEventListener('resize', this.debounce(updateLayout, 250));
    }
    
    // Доступность
    addAccessibility() {
        // Добавляем ARIA метки
        const inputs = document.querySelectorAll('input, select');
        
        inputs.forEach((input, index) => {
            if (!input.id) {
                input.id = `field-${index}`;
            }
            
            const label = input.closest('.input-group')?.querySelector('label');
            if (label && !label.getAttribute('for')) {
                label.setAttribute('for', input.id);
            }
            
            // Добавляем описания для screen readers
            if (!input.getAttribute('aria-describedby')) {
                const description = input.closest('.input-group')?.querySelector('.description');
                if (description && !description.id) {
                    description.id = `desc-${index}`;
                    input.setAttribute('aria-describedby', description.id);
                }
            }
        });
        
        // Клавиатурная навигация
        this.addKeyboardNavigation();
    }
    
    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + 1-9 для быстрого перехода к полям
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                const inputs = document.querySelectorAll('input, select');
                if (inputs[index]) {
                    inputs[index].focus();
                }
            }
            
            // Escape для очистки фокуса
            if (e.key === 'Escape') {
                document.activeElement?.blur();
            }
        });
    }
    
    // Утилита дебаунсинга
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
    
    // Публичный метод для выделения главного результата
    highlightMainResult(selector) {
        const element = document.querySelector(selector);
        if (element && !element.classList.contains('main-result')) {
            element.classList.add('main-result');
        }
    }
    
    // Публичный метод для группировки результатов
    groupResults(resultSelectors) {
        const wrapper = document.createElement('div');
        wrapper.className = 'results-section';
        
        const header = document.createElement('h3');
        header.textContent = 'Результаты расчета';
        header.style.marginBottom = '20px';
        wrapper.appendChild(header);
        
        resultSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                wrapper.appendChild(element);
            }
        });
        
        // Вставляем группу после первого найденного элемента
        const firstResult = document.querySelector(resultSelectors[0]);
        if (firstResult && firstResult.parentNode) {
            firstResult.parentNode.insertBefore(wrapper, firstResult);
        }
    }
}

// Автоматическая инициализация
if (typeof window !== 'undefined') {
    window.uxEnhancer = new UXEnhancer();
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UXEnhancer;
}