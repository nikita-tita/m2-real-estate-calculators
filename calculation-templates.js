/**
 * Calculation Templates - система шаблонов расчетов для калькуляторов М2
 * Предустановленные наборы параметров для типовых ситуаций
 */

class CalculationTemplates {
    constructor() {
        this.templates = new Map();
        this.userTemplates = new Map();
        this.storageKey = 'm2_calculation_templates';
        this.currentCalculatorType = null;
    }

    /**
     * Инициализация системы шаблонов
     */
    init() {
        this.currentCalculatorType = this.detectCalculatorType();
        this.setupDefaultTemplates();
        this.loadUserTemplates();
        this.injectTemplateUI();
        this.setupEventListeners();

        console.log('📄 Система шаблонов расчетов инициализирована');
    }

    /**
     * Определение типа текущего калькулятора
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

        return 'generic';
    }

    /**
     * Настройка предустановленных шаблонов
     */
    setupDefaultTemplates() {
        // Шаблоны для ипотечного калькулятора
        if (this.currentCalculatorType === 'mortgage') {
            this.templates.set('mortgage_first_time', {
                name: '👶 Первая квартира',
                description: 'Стандартные параметры для покупки первого жилья',
                category: 'Популярные',
                icon: '🏠',
                params: {
                    propertyPrice: 5000000,
                    downPayment: 1000000,
                    loanAmount: 4000000,
                    interestRate: 13.5,
                    loanTerm: 20,
                    income: 100000
                },
                tags: ['первое жилье', 'молодая семья', 'стандарт']
            });

            this.templates.set('mortgage_family', {
                name: '👨‍👩‍👧‍👦 Семейная ипотека',
                description: 'Льготная ставка для семей с детьми',
                category: 'Льготные программы',
                icon: '👶',
                params: {
                    propertyPrice: 7000000,
                    downPayment: 1400000,
                    loanAmount: 5600000,
                    interestRate: 6.0,
                    loanTerm: 20,
                    income: 150000,
                    hasChildren: true,
                    familyMortgage: true
                },
                tags: ['семейная ипотека', 'льготы', 'дети']
            });

            this.templates.set('mortgage_it', {
                name: '💻 IT-ипотека',
                description: 'Специальная программа для IT-специалистов',
                category: 'Льготные программы',
                icon: '⚡',
                params: {
                    propertyPrice: 12000000,
                    downPayment: 2400000,
                    loanAmount: 9600000,
                    interestRate: 5.0,
                    loanTerm: 20,
                    income: 300000,
                    itMortgage: true
                },
                tags: ['IT ипотека', 'льготы', 'технологии']
            });

            this.templates.set('mortgage_refinance', {
                name: '🔄 Рефинансирование',
                description: 'Перекредитование существующего займа',
                category: 'Рефинансирование',
                icon: '🔀',
                params: {
                    loanAmount: 3500000,
                    interestRate: 11.5,
                    loanTerm: 15,
                    currentRate: 14.5,
                    refinancing: true
                },
                tags: ['рефинансирование', 'экономия', 'снижение ставки']
            });

            this.templates.set('mortgage_premium', {
                name: '💎 Премиум недвижимость',
                description: 'Покупка дорогой недвижимости',
                category: 'Премиум',
                icon: '🏰',
                params: {
                    propertyPrice: 25000000,
                    downPayment: 7500000,
                    loanAmount: 17500000,
                    interestRate: 12.0,
                    loanTerm: 25,
                    income: 500000
                },
                tags: ['премиум', 'элитное жилье', 'большая сумма']
            });
        }

        // Шаблоны для калькулятора доходности недвижимости
        if (this.currentCalculatorType === 'rental') {
            this.templates.set('rental_studio', {
                name: '🏠 Студия в центре',
                description: 'Инвестиции в студию для сдачи в аренду',
                category: 'Популярные',
                icon: '🏢',
                params: {
                    propertyPrice: 4000000,
                    monthlyRent: 35000,
                    managementFee: 10,
                    repairs: 50000,
                    taxes: 24000,
                    vacancy: 5
                },
                tags: ['студия', 'центр', 'аренда']
            });

            this.templates.set('rental_apartment', {
                name: '🏠 2-комнатная квартира',
                description: 'Стандартная двушка в спальном районе',
                category: 'Популярные',
                icon: '🏘️',
                params: {
                    propertyPrice: 7500000,
                    monthlyRent: 55000,
                    managementFee: 8,
                    repairs: 80000,
                    taxes: 45000,
                    vacancy: 3
                },
                tags: ['2к квартира', 'спальный район', 'семьи']
            });

            this.templates.set('rental_commercial', {
                name: '🏢 Коммерческая недвижимость',
                description: 'Офисное помещение под аренду',
                category: 'Коммерческая',
                icon: '🏢',
                params: {
                    propertyPrice: 15000000,
                    monthlyRent: 120000,
                    managementFee: 15,
                    repairs: 200000,
                    taxes: 300000,
                    vacancy: 10
                },
                tags: ['коммерческая', 'офис', 'бизнес']
            });

            this.templates.set('rental_suburban', {
                name: '🏡 Загородный дом',
                description: 'Дом в пригороде для долгосрочной аренды',
                category: 'Загородная',
                icon: '🌲',
                params: {
                    propertyPrice: 12000000,
                    monthlyRent: 80000,
                    managementFee: 5,
                    repairs: 150000,
                    taxes: 60000,
                    vacancy: 8,
                    utilities: 120000
                },
                tags: ['загородный дом', 'пригород', 'семьи']
            });
        }

        // Шаблоны для сравнения аренды и покупки
        if (this.currentCalculatorType === 'rent_vs_buy') {
            this.templates.set('rvb_young_professional', {
                name: '🎓 Молодой специалист',
                description: 'Выбор между арендой и покупкой для молодого профессионала',
                category: 'Жизненные ситуации',
                icon: '👨‍💼',
                params: {
                    propertyPrice: 6000000,
                    downPayment: 1200000,
                    monthlyRent: 45000,
                    interestRate: 13.5,
                    rentIncrease: 5,
                    propertyAppreciation: 3,
                    timeHorizon: 7
                },
                tags: ['молодой специалист', 'карьера', 'мобильность']
            });

            this.templates.set('rvb_family_settling', {
                name: '👨‍👩‍👧‍👦 Семья с детьми',
                description: 'Семья решает вопрос покупки vs аренды',
                category: 'Жизненные ситуации',
                icon: '👶',
                params: {
                    propertyPrice: 8500000,
                    downPayment: 2550000,
                    monthlyRent: 65000,
                    interestRate: 6.0,
                    rentIncrease: 4,
                    propertyAppreciation: 4,
                    timeHorizon: 15
                },
                tags: ['семья', 'дети', 'стабильность']
            });

            this.templates.set('rvb_retirement', {
                name: '👴 Предпенсионный возраст',
                description: 'Решение о недвижимости перед выходом на пенсию',
                category: 'Жизненные ситуации',
                icon: '🏖️',
                params: {
                    propertyPrice: 5000000,
                    downPayment: 2500000,
                    monthlyRent: 40000,
                    interestRate: 12.0,
                    rentIncrease: 3,
                    propertyAppreciation: 2,
                    timeHorizon: 10
                },
                tags: ['пенсия', 'накопления', 'консервативный подход']
            });
        }

        // Шаблоны для краткосрочной аренды
        if (this.currentCalculatorType === 'airbnb') {
            this.templates.set('airbnb_city_center', {
                name: '🏙️ Апартаменты в центре',
                description: 'Квартира в историческом центре для туристов',
                category: 'Туристические зоны',
                icon: '🗺️',
                params: {
                    propertyPrice: 8000000,
                    dailyRate: 4500,
                    occupancyRate: 65,
                    cleaningFee: 2000,
                    platformFee: 12,
                    managementFee: 20,
                    utilities: 8000
                },
                tags: ['центр города', 'туристы', 'высокий доход']
            });

            this.templates.set('airbnb_business_district', {
                name: '💼 Бизнес-район',
                description: 'Апартаменты для командировочных',
                category: 'Бизнес',
                icon: '🏢',
                params: {
                    propertyPrice: 12000000,
                    dailyRate: 6000,
                    occupancyRate: 55,
                    cleaningFee: 2500,
                    platformFee: 10,
                    managementFee: 15,
                    utilities: 12000
                },
                tags: ['бизнес-район', 'командировочные', 'премиум']
            });

            this.templates.set('airbnb_resort', {
                name: '🏖️ Курортная недвижимость',
                description: 'Апартаменты в курортной зоне',
                category: 'Курорты',
                icon: '🌊',
                params: {
                    propertyPrice: 15000000,
                    dailyRate: 8000,
                    occupancyRate: 45,
                    cleaningFee: 3000,
                    platformFee: 15,
                    managementFee: 25,
                    utilities: 15000,
                    seasonal: true
                },
                tags: ['курорт', 'сезонность', 'отдых']
            });
        }
    }

    /**
     * Загрузка пользовательских шаблонов
     */
    loadUserTemplates() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const templates = JSON.parse(saved);
                this.userTemplates = new Map(Object.entries(templates));
            }
        } catch (error) {
            console.warn('Не удалось загрузить пользовательские шаблоны:', error);
        }
    }

    /**
     * Сохранение пользовательских шаблонов
     */
    saveUserTemplates() {
        try {
            const templatesObj = Object.fromEntries(this.userTemplates);
            localStorage.setItem(this.storageKey, JSON.stringify(templatesObj));
        } catch (error) {
            console.warn('Не удалось сохранить пользовательские шаблоны:', error);
        }
    }

    /**
     * Внедрение UI для работы с шаблонами
     */
    injectTemplateUI() {
        const calculatorContainer = document.querySelector('.calculator-container, form, .input-section');
        if (!calculatorContainer) return;

        const templatePanel = document.createElement('div');
        templatePanel.className = 'template-panel';
        templatePanel.innerHTML = `
            <div class="template-header">
                <h3>📄 Шаблоны расчетов</h3>
                <div class="template-actions">
                    <button class="toggle-templates-btn" title="Показать/скрыть шаблоны">
                        <i class="feather-icon" data-feather="folder"></i>
                    </button>
                    <button class="save-template-btn" title="Сохранить текущие параметры как шаблон">
                        <i class="feather-icon" data-feather="save"></i>
                        Сохранить
                    </button>
                </div>
            </div>
            <div class="template-content" style="display: none;">
                <div class="template-categories"></div>
                <div class="template-search">
                    <input type="text" placeholder="Поиск шаблонов..." id="template-search">
                    <i class="feather-icon" data-feather="search"></i>
                </div>
                <div class="template-list"></div>
            </div>
        `;

        // Вставляем панель в начало калькулятора
        calculatorContainer.insertBefore(templatePanel, calculatorContainer.firstChild);

        // Инициализируем иконки
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // Загружаем шаблоны
        this.renderTemplates();
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.toggle-templates-btn')) {
                this.toggleTemplatePanel();
            }

            if (e.target.matches('.save-template-btn')) {
                this.showSaveTemplateDialog();
            }

            if (e.target.matches('.template-item')) {
                const templateId = e.target.dataset.templateId;
                this.applyTemplate(templateId);
            }

            if (e.target.matches('.delete-template-btn')) {
                e.stopPropagation();
                const templateId = e.target.dataset.templateId;
                this.deleteTemplate(templateId);
            }

            if (e.target.matches('.edit-template-btn')) {
                e.stopPropagation();
                const templateId = e.target.dataset.templateId;
                this.editTemplate(templateId);
            }

            if (e.target.matches('.template-category-btn')) {
                this.filterByCategory(e.target.dataset.category);
            }
        });

        // Поиск шаблонов
        document.addEventListener('input', (e) => {
            if (e.target.matches('#template-search')) {
                this.filterTemplates(e.target.value);
            }
        });

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+T для открытия шаблонов
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTemplatePanel();
            }

            // Ctrl+S для сохранения шаблона
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && e.shiftKey) {
                e.preventDefault();
                this.showSaveTemplateDialog();
            }
        });
    }

    /**
     * Переключение видимости панели шаблонов
     */
    toggleTemplatePanel() {
        const content = document.querySelector('.template-content');
        const button = document.querySelector('.toggle-templates-btn');

        if (!content) return;

        const isVisible = content.style.display !== 'none';

        if (isVisible) {
            content.style.display = 'none';
            button.innerHTML = '<i class="feather-icon" data-feather="folder"></i>';
            button.title = 'Показать шаблоны';
        } else {
            content.style.display = 'block';
            button.innerHTML = '<i class="feather-icon" data-feather="folder-minus"></i>';
            button.title = 'Скрыть шаблоны';
            this.renderTemplates(); // Обновляем при показе
        }

        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Отрисовка шаблонов
     */
    renderTemplates() {
        this.renderCategories();
        this.renderTemplateList();
    }

    /**
     * Отрисовка категорий
     */
    renderCategories() {
        const container = document.querySelector('.template-categories');
        if (!container) return;

        const allTemplates = new Map([...this.templates, ...this.userTemplates]);
        const categories = new Set();

        // Собираем уникальные категории
        allTemplates.forEach(template => {
            if (template.category) {
                categories.add(template.category);
            }
        });

        const categoryButtons = Array.from(categories).map(category => {
            const count = Array.from(allTemplates.values()).filter(t => t.category === category).length;
            return `
                <button class="template-category-btn" data-category="${category}">
                    ${category} (${count})
                </button>
            `;
        }).join('');

        container.innerHTML = `
            <div class="category-buttons">
                <button class="template-category-btn active" data-category="">
                    Все (${allTemplates.size})
                </button>
                ${categoryButtons}
                <button class="template-category-btn" data-category="user">
                    Мои (${this.userTemplates.size})
                </button>
            </div>
        `;
    }

    /**
     * Отрисовка списка шаблонов
     */
    renderTemplateList(filter = '', category = '') {
        const container = document.querySelector('.template-list');
        if (!container) return;

        let templates = new Map([...this.templates, ...this.userTemplates]);

        // Фильтрация по категории
        if (category) {
            if (category === 'user') {
                templates = this.userTemplates;
            } else {
                templates = new Map(
                    Array.from(templates).filter(([id, template]) => template.category === category)
                );
            }
        }

        // Фильтрация по поисковому запросу
        if (filter) {
            const filterLower = filter.toLowerCase();
            templates = new Map(
                Array.from(templates).filter(([id, template]) => {
                    return template.name.toLowerCase().includes(filterLower) ||
                           template.description.toLowerCase().includes(filterLower) ||
                           (template.tags && template.tags.some(tag => tag.toLowerCase().includes(filterLower)));
                })
            );
        }

        if (templates.size === 0) {
            container.innerHTML = `
                <div class="no-templates">
                    <p>📝 Шаблоны не найдены</p>
                    <p>Создайте свой первый шаблон!</p>
                </div>
            `;
            return;
        }

        const templateItems = Array.from(templates.entries()).map(([id, template]) => {
            const isUserTemplate = this.userTemplates.has(id);
            const paramsPreview = this.generateParamsPreview(template.params);

            return `
                <div class="template-item" data-template-id="${id}">
                    <div class="template-icon">${template.icon || '📄'}</div>
                    <div class="template-info">
                        <div class="template-name">
                            ${template.name}
                            ${isUserTemplate ? '<span class="user-badge">МОЙ</span>' : ''}
                        </div>
                        <div class="template-description">${template.description}</div>
                        <div class="template-params">${paramsPreview}</div>
                        ${template.tags ? `
                            <div class="template-tags">
                                ${template.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="template-actions">
                        ${isUserTemplate ? `
                            <button class="edit-template-btn" data-template-id="${id}" title="Редактировать">
                                <i class="feather-icon" data-feather="edit-2"></i>
                            </button>
                            <button class="delete-template-btn" data-template-id="${id}" title="Удалить">
                                <i class="feather-icon" data-feather="trash-2"></i>
                            </button>
                        ` : ''}
                        <button class="apply-template-btn" title="Применить шаблон">
                            <i class="feather-icon" data-feather="play"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = templateItems;

        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * Генерация предварительного просмотра параметров
     */
    generateParamsPreview(params) {
        const keyParams = this.getKeyParameters(params);
        return keyParams.map(([key, value]) => {
            const label = this.getParameterLabel(key);
            const formatted = this.formatParameterValue(key, value);
            return `<span class="param-preview">${label}: ${formatted}</span>`;
        }).join(' • ');
    }

    /**
     * Получение ключевых параметров для предварительного просмотра
     */
    getKeyParameters(params) {
        const keyOrder = [
            'propertyPrice', 'loanAmount', 'interestRate', 'loanTerm',
            'monthlyRent', 'dailyRate', 'occupancyRate'
        ];

        const keyParams = [];
        const entries = Object.entries(params);

        // Сначала добавляем ключевые параметры в порядке приоритета
        keyOrder.forEach(key => {
            const entry = entries.find(([k, v]) => k === key && typeof v === 'number' && v > 0);
            if (entry && keyParams.length < 3) {
                keyParams.push(entry);
            }
        });

        // Если нужно больше параметров, добавляем остальные
        if (keyParams.length < 3) {
            entries.forEach(([key, value]) => {
                if (keyParams.length >= 3) return;
                if (!keyParams.find(([k]) => k === key) && typeof value === 'number' && value > 0) {
                    keyParams.push([key, value]);
                }
            });
        }

        return keyParams;
    }

    /**
     * Получение понятного названия параметра
     */
    getParameterLabel(key) {
        const labels = {
            propertyPrice: 'Стоимость',
            loanAmount: 'Кредит',
            interestRate: 'Ставка',
            loanTerm: 'Срок',
            monthlyRent: 'Аренда',
            dailyRate: 'За сутки',
            occupancyRate: 'Загрузка',
            downPayment: 'Взнос'
        };

        return labels[key] || key;
    }

    /**
     * Форматирование значения параметра
     */
    formatParameterValue(key, value) {
        if (key.includes('Rate') || key.includes('Percentage')) {
            return `${value}%`;
        }

        if (key.includes('Price') || key.includes('Amount') || key.includes('Payment') || key.includes('Rent')) {
            return this.formatMoney(value);
        }

        if (key.includes('Term') && key.includes('loan')) {
            return `${value} лет`;
        }

        return value.toString();
    }

    /**
     * Форматирование денежных сумм
     */
    formatMoney(amount) {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M ₽`;
        }
        if (amount >= 1000) {
            return `${Math.round(amount / 1000)}K ₽`;
        }
        return `${amount} ₽`;
    }

    /**
     * Применение шаблона
     */
    applyTemplate(templateId) {
        const template = this.templates.get(templateId) || this.userTemplates.get(templateId);
        if (!template) {
            this.showNotification('Шаблон не найден', 'error');
            return;
        }

        try {
            // Заполняем поля формы значениями из шаблона
            Object.entries(template.params).forEach(([key, value]) => {
                const input = document.querySelector(`#${key}, [name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = Boolean(value);
                    } else {
                        input.value = value;
                    }

                    // Вызываем событие изменения для триггера валидации и пересчета
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });

            this.showNotification(`Шаблон "${template.name}" применен`, 'success');

            // Запускаем пересчет калькулятора
            setTimeout(() => {
                this.triggerCalculation();
            }, 100);

            // Аналитика
            if (window.gtag) {
                gtag('event', 'template_applied', {
                    template_id: templateId,
                    template_name: template.name,
                    calculator_type: this.currentCalculatorType
                });
            }

        } catch (error) {
            console.error('Ошибка применения шаблона:', error);
            this.showNotification('Ошибка применения шаблона', 'error');
        }
    }

    /**
     * Запуск пересчета калькулятора
     */
    triggerCalculation() {
        // Ищем кнопку расчета
        const calculateBtn = document.querySelector('.calculate-btn, [onclick*="calculate"], button[type="submit"]');
        if (calculateBtn && !calculateBtn.disabled) {
            calculateBtn.click();
        }
    }

    /**
     * Показать диалог сохранения шаблона
     */
    showSaveTemplateDialog() {
        const currentParams = this.extractCurrentParams();
        if (Object.keys(currentParams).length === 0) {
            this.showNotification('Заполните параметры для создания шаблона', 'warning');
            return;
        }

        const dialog = this.createSaveTemplateDialog(currentParams);
        document.body.appendChild(dialog);
    }

    /**
     * Создание диалога сохранения шаблона
     */
    createSaveTemplateDialog(params) {
        const dialog = document.createElement('div');
        dialog.className = 'template-dialog-overlay';
        dialog.innerHTML = `
            <div class="template-dialog">
                <div class="dialog-header">
                    <h3>💾 Сохранить шаблон</h3>
                    <button class="close-dialog-btn">&times;</button>
                </div>
                <div class="dialog-body">
                    <div class="form-group">
                        <label>Название шаблона:</label>
                        <input type="text" id="template-name-input" placeholder="Например: Моя первая квартира" maxlength="50" required>
                    </div>
                    <div class="form-group">
                        <label>Описание:</label>
                        <textarea id="template-description-input" placeholder="Краткое описание шаблона" rows="3" maxlength="200"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Категория:</label>
                        <select id="template-category-input">
                            <option value="Мои шаблоны">Мои шаблоны</option>
                            <option value="Популярные">Популярные</option>
                            <option value="Специальные">Специальные</option>
                            <option value="Эксперименты">Эксперименты</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Иконка (эмодзи):</label>
                        <input type="text" id="template-icon-input" placeholder="📄" maxlength="2">
                        <div class="icon-suggestions">
                            <span class="icon-option" data-icon="🏠">🏠</span>
                            <span class="icon-option" data-icon="💰">💰</span>
                            <span class="icon-option" data-icon="📊">📊</span>
                            <span class="icon-option" data-icon="🎯">🎯</span>
                            <span class="icon-option" data-icon="⭐">⭐</span>
                            <span class="icon-option" data-icon="💡">💡</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Теги (через запятую):</label>
                        <input type="text" id="template-tags-input" placeholder="семья, первое жилье, экономия">
                    </div>
                    <div class="params-preview">
                        <h4>Параметры для сохранения:</h4>
                        <div class="params-list">
                            ${this.generateSaveParamsPreview(params)}
                        </div>
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="cancel-save-btn">Отмена</button>
                    <button class="confirm-save-btn">Сохранить шаблон</button>
                </div>
            </div>
        `;

        // Обработчики событий диалога
        dialog.addEventListener('click', (e) => {
            if (e.target.matches('.close-dialog-btn, .cancel-save-btn, .template-dialog-overlay')) {
                if (e.target === dialog || e.target.matches('.close-dialog-btn, .cancel-save-btn')) {
                    dialog.remove();
                }
            }

            if (e.target.matches('.confirm-save-btn')) {
                this.saveTemplate(params, dialog);
            }

            if (e.target.matches('.icon-option')) {
                document.getElementById('template-icon-input').value = e.target.dataset.icon;
            }
        });

        // Предотвращаем закрытие при клике на диалог
        dialog.querySelector('.template-dialog').addEventListener('click', (e) => {
            e.stopPropagation();
        });

        return dialog;
    }

    /**
     * Генерация предварительного просмотра параметров для сохранения
     */
    generateSaveParamsPreview(params) {
        return Object.entries(params).map(([key, value]) => {
            const label = this.getParameterLabel(key);
            const formatted = this.formatParameterValue(key, value);
            return `<div class="param-item">${label}: <strong>${formatted}</strong></div>`;
        }).join('');
    }

    /**
     * Извлечение текущих параметров калькулятора
     */
    extractCurrentParams() {
        const params = {};
        const inputs = document.querySelectorAll('input[type="number"], input[type="range"], select, input[type="checkbox"]');

        inputs.forEach(input => {
            if (input.id || input.name) {
                const key = input.id || input.name;

                if (input.type === 'checkbox') {
                    if (input.checked) {
                        params[key] = true;
                    }
                } else if (input.type === 'number' || input.type === 'range') {
                    const value = parseFloat(input.value);
                    if (!isNaN(value) && value !== 0) {
                        params[key] = value;
                    }
                } else if (input.value && input.value !== '') {
                    params[key] = input.value;
                }
            }
        });

        return params;
    }

    /**
     * Сохранение шаблона
     */
    saveTemplate(params, dialog) {
        const name = document.getElementById('template-name-input').value.trim();
        const description = document.getElementById('template-description-input').value.trim();
        const category = document.getElementById('template-category-input').value;
        const icon = document.getElementById('template-icon-input').value.trim() || '📄';
        const tagsStr = document.getElementById('template-tags-input').value.trim();

        if (!name) {
            this.showNotification('Введите название шаблона', 'warning');
            return;
        }

        const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        const templateId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const template = {
            name,
            description: description || 'Пользовательский шаблон',
            category,
            icon,
            params,
            tags,
            createdAt: new Date().toISOString(),
            calculatorType: this.currentCalculatorType
        };

        this.userTemplates.set(templateId, template);
        this.saveUserTemplates();

        dialog.remove();
        this.showNotification(`Шаблон "${name}" сохранен`, 'success');

        // Обновляем список шаблонов
        this.renderTemplates();

        // Аналитика
        if (window.gtag) {
            gtag('event', 'template_created', {
                template_name: name,
                calculator_type: this.currentCalculatorType,
                params_count: Object.keys(params).length
            });
        }
    }

    /**
     * Удаление пользовательского шаблона
     */
    deleteTemplate(templateId) {
        const template = this.userTemplates.get(templateId);
        if (!template) return;

        if (confirm(`Удалить шаблон "${template.name}"?`)) {
            this.userTemplates.delete(templateId);
            this.saveUserTemplates();
            this.renderTemplates();
            this.showNotification(`Шаблон "${template.name}" удален`, 'info');

            // Аналитика
            if (window.gtag) {
                gtag('event', 'template_deleted', {
                    template_name: template.name,
                    calculator_type: this.currentCalculatorType
                });
            }
        }
    }

    /**
     * Редактирование пользовательского шаблона
     */
    editTemplate(templateId) {
        const template = this.userTemplates.get(templateId);
        if (!template) return;

        // Показываем диалог редактирования (аналогично созданию, но с предзаполненными данными)
        const dialog = this.createEditTemplateDialog(template, templateId);
        document.body.appendChild(dialog);
    }

    /**
     * Создание диалога редактирования шаблона
     */
    createEditTemplateDialog(template, templateId) {
        const dialog = document.createElement('div');
        dialog.className = 'template-dialog-overlay';
        dialog.innerHTML = `
            <div class="template-dialog">
                <div class="dialog-header">
                    <h3>✏️ Редактировать шаблон</h3>
                    <button class="close-dialog-btn">&times;</button>
                </div>
                <div class="dialog-body">
                    <div class="form-group">
                        <label>Название шаблона:</label>
                        <input type="text" id="edit-template-name-input" value="${template.name}" maxlength="50" required>
                    </div>
                    <div class="form-group">
                        <label>Описание:</label>
                        <textarea id="edit-template-description-input" rows="3" maxlength="200">${template.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Категория:</label>
                        <select id="edit-template-category-input">
                            <option value="Мои шаблоны" ${template.category === 'Мои шаблоны' ? 'selected' : ''}>Мои шаблоны</option>
                            <option value="Популярные" ${template.category === 'Популярные' ? 'selected' : ''}>Популярные</option>
                            <option value="Специальные" ${template.category === 'Специальные' ? 'selected' : ''}>Специальные</option>
                            <option value="Эксперименты" ${template.category === 'Эксперименты' ? 'selected' : ''}>Эксперименты</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Иконка (эмодзи):</label>
                        <input type="text" id="edit-template-icon-input" value="${template.icon}" maxlength="2">
                        <div class="icon-suggestions">
                            <span class="icon-option" data-icon="🏠">🏠</span>
                            <span class="icon-option" data-icon="💰">💰</span>
                            <span class="icon-option" data-icon="📊">📊</span>
                            <span class="icon-option" data-icon="🎯">🎯</span>
                            <span class="icon-option" data-icon="⭐">⭐</span>
                            <span class="icon-option" data-icon="💡">💡</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Теги (через запятую):</label>
                        <input type="text" id="edit-template-tags-input" value="${(template.tags || []).join(', ')}">
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="cancel-edit-btn">Отмена</button>
                    <button class="confirm-edit-btn">Сохранить изменения</button>
                </div>
            </div>
        `;

        // Обработчики событий
        dialog.addEventListener('click', (e) => {
            if (e.target.matches('.close-dialog-btn, .cancel-edit-btn, .template-dialog-overlay')) {
                if (e.target === dialog || e.target.matches('.close-dialog-btn, .cancel-edit-btn')) {
                    dialog.remove();
                }
            }

            if (e.target.matches('.confirm-edit-btn')) {
                this.updateTemplate(templateId, dialog);
            }

            if (e.target.matches('.icon-option')) {
                document.getElementById('edit-template-icon-input').value = e.target.dataset.icon;
            }
        });

        dialog.querySelector('.template-dialog').addEventListener('click', (e) => {
            e.stopPropagation();
        });

        return dialog;
    }

    /**
     * Обновление шаблона
     */
    updateTemplate(templateId, dialog) {
        const name = document.getElementById('edit-template-name-input').value.trim();
        const description = document.getElementById('edit-template-description-input').value.trim();
        const category = document.getElementById('edit-template-category-input').value;
        const icon = document.getElementById('edit-template-icon-input').value.trim() || '📄';
        const tagsStr = document.getElementById('edit-template-tags-input').value.trim();

        if (!name) {
            this.showNotification('Введите название шаблона', 'warning');
            return;
        }

        const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        const existingTemplate = this.userTemplates.get(templateId);
        const updatedTemplate = {
            ...existingTemplate,
            name,
            description,
            category,
            icon,
            tags,
            updatedAt: new Date().toISOString()
        };

        this.userTemplates.set(templateId, updatedTemplate);
        this.saveUserTemplates();

        dialog.remove();
        this.showNotification(`Шаблон "${name}" обновлен`, 'success');
        this.renderTemplates();
    }

    /**
     * Фильтрация по категории
     */
    filterByCategory(category) {
        // Обновляем активную кнопку категории
        document.querySelectorAll('.template-category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        // Перерисовываем список с фильтром
        const searchValue = document.getElementById('template-search')?.value || '';
        this.renderTemplateList(searchValue, category);
    }

    /**
     * Фильтрация шаблонов по поисковому запросу
     */
    filterTemplates(query) {
        const activeCategory = document.querySelector('.template-category-btn.active')?.dataset.category || '';
        this.renderTemplateList(query, activeCategory);
    }

    /**
     * Экспорт всех пользовательских шаблонов
     */
    exportUserTemplates() {
        if (this.userTemplates.size === 0) {
            this.showNotification('Нет пользовательских шаблонов для экспорта', 'info');
            return;
        }

        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            calculatorType: this.currentCalculatorType,
            templates: Object.fromEntries(this.userTemplates)
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `m2_templates_${this.currentCalculatorType}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Шаблоны экспортированы', 'success');
    }

    /**
     * Импорт пользовательских шаблонов
     */
    importUserTemplates() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);

                    if (importData.templates) {
                        let importedCount = 0;

                        Object.entries(importData.templates).forEach(([id, template]) => {
                            // Генерируем новый ID чтобы избежать конфликтов
                            const newId = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            this.userTemplates.set(newId, {
                                ...template,
                                importedAt: new Date().toISOString()
                            });
                            importedCount++;
                        });

                        this.saveUserTemplates();
                        this.renderTemplates();

                        this.showNotification(`Импортировано ${importedCount} шаблонов`, 'success');
                    } else {
                        throw new Error('Неверный формат файла');
                    }
                } catch (error) {
                    console.error('Ошибка импорта:', error);
                    this.showNotification('Ошибка импорта шаблонов', 'error');
                }
            };

            reader.readAsText(file);
        });

        input.click();
    }

    /**
     * Получение статистики шаблонов
     */
    getTemplateStats() {
        return {
            totalTemplates: this.templates.size + this.userTemplates.size,
            defaultTemplates: this.templates.size,
            userTemplates: this.userTemplates.size,
            calculatorType: this.currentCalculatorType,
            categories: this.getCategories()
        };
    }

    /**
     * Получение списка категорий
     */
    getCategories() {
        const allTemplates = new Map([...this.templates, ...this.userTemplates]);
        const categories = new Set();

        allTemplates.forEach(template => {
            if (template.category) {
                categories.add(template.category);
            }
        });

        return Array.from(categories);
    }

    // Вспомогательные методы

    showNotification(message, type = 'info') {
        if (window.scenarioComparison?.showNotification) {
            window.scenarioComparison.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// CSS стили для системы шаблонов
const templateStyles = `
<style>
.template-panel {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    margin-bottom: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.template-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    background: linear-gradient(135deg, #3416b6, #5a67d8);
    color: white;
}

.template-header h3 {
    margin: 0;
    font-size: 1.1em;
    color: white;
}

.template-actions {
    display: flex;
    gap: 10px;
}

.toggle-templates-btn,
.save-template-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9em;
    transition: all 0.2s;
}

.toggle-templates-btn:hover,
.save-template-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

.template-content {
    padding: 20px;
}

.template-search {
    position: relative;
    margin-bottom: 15px;
}

.template-search input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.9em;
}

.template-search .feather-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    pointer-events: none;
}

.category-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

.template-category-btn {
    background: #e9ecef;
    color: #495057;
    border: 1px solid #ced4da;
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.85em;
    transition: all 0.2s;
}

.template-category-btn:hover {
    background: #dee2e6;
    transform: translateY(-1px);
}

.template-category-btn.active {
    background: #3416b6;
    color: white;
    border-color: #3416b6;
}

.template-list {
    max-height: 400px;
    overflow-y: auto;
}

.template-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 10px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.template-item:hover {
    border-color: #3416b6;
    box-shadow: 0 2px 8px rgba(52, 22, 182, 0.1);
    transform: translateY(-1px);
}

.template-icon {
    font-size: 24px;
    margin-right: 15px;
    text-align: center;
    min-width: 40px;
}

.template-info {
    flex: 1;
}

.template-name {
    font-weight: 600;
    color: #212529;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-badge {
    background: #28a745;
    color: white;
    font-size: 0.7em;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: normal;
}

.template-description {
    color: #6c757d;
    font-size: 0.9em;
    margin-bottom: 6px;
}

.template-params {
    font-size: 0.8em;
    color: #495057;
    margin-bottom: 6px;
}

.param-preview {
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 4px;
    margin-right: 6px;
}

.template-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.tag {
    background: #e3f2fd;
    color: #1976d2;
    font-size: 0.75em;
    padding: 2px 6px;
    border-radius: 10px;
}

.template-actions {
    display: flex;
    gap: 5px;
    margin-left: 10px;
}

.edit-template-btn,
.delete-template-btn,
.apply-template-btn {
    background: none;
    border: 1px solid #dee2e6;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.edit-template-btn:hover {
    background: #17a2b8;
    color: white;
    border-color: #17a2b8;
}

.delete-template-btn:hover {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
}

.apply-template-btn:hover {
    background: #28a745;
    color: white;
    border-color: #28a745;
}

.no-templates {
    text-align: center;
    padding: 40px 20px;
    color: #6c757d;
}

.no-templates p:first-child {
    font-size: 1.1em;
    margin-bottom: 5px;
}

/* Диалоги */
.template-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.template-dialog {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
    background: linear-gradient(135deg, #3416b6, #5a67d8);
    color: white;
    border-radius: 12px 12px 0 0;
}

.dialog-header h3 {
    margin: 0;
    color: white;
}

.close-dialog-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
}

.close-dialog-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.dialog-body {
    padding: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #495057;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 0.9em;
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: #3416b6;
    box-shadow: 0 0 0 0.2rem rgba(52, 22, 182, 0.25);
}

.icon-suggestions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.icon-option {
    display: inline-block;
    padding: 8px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
}

.icon-option:hover {
    background: #f8f9fa;
    border-color: #3416b6;
    transform: scale(1.1);
}

.params-preview {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-top: 15px;
}

.params-preview h4 {
    margin: 0 0 10px 0;
    font-size: 0.95em;
    color: #495057;
}

.params-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
}

.param-item {
    background: white;
    padding: 8px 10px;
    border-radius: 4px;
    font-size: 0.85em;
    border-left: 3px solid #3416b6;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
    border-radius: 0 0 12px 12px;
}

.cancel-save-btn,
.cancel-edit-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.cancel-save-btn:hover,
.cancel-edit-btn:hover {
    background: #545b62;
}

.confirm-save-btn,
.confirm-edit-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.confirm-save-btn:hover,
.confirm-edit-btn:hover {
    background: #218838;
}

/* Темная тема */
[data-theme="dark"] .template-panel {
    background: var(--bg-secondary);
    border-color: var(--border-color);
}

[data-theme="dark"] .template-content {
    color: var(--text-primary);
}

[data-theme="dark"] .template-item {
    background: var(--card-bg);
    border-color: var(--border-color);
    color: var(--text-primary);
}

[data-theme="dark"] .template-dialog {
    background: var(--card-bg);
    color: var(--text-primary);
}

[data-theme="dark"] .dialog-footer {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
}

[data-theme="dark"] .params-preview,
[data-theme="dark"] .param-item {
    background: var(--bg-tertiary);
}

/* Адаптивность */
@media (max-width: 768px) {
    .template-header {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }

    .template-actions {
        justify-content: center;
    }

    .template-item {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
    }

    .template-icon {
        margin: 0 0 10px 0;
        align-self: center;
    }

    .template-actions {
        justify-content: center;
        margin-top: 10px;
        margin-left: 0;
    }

    .category-buttons {
        justify-content: center;
    }

    .template-dialog {
        margin: 10px;
        max-width: none;
    }

    .params-list {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Инъекция стилей
if (!document.querySelector('#template-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'template-styles';
    styleElement.innerHTML = templateStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Глобальная инициализация
window.CalculationTemplates = CalculationTemplates;

// Автоматическая инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.calculationTemplates = new CalculationTemplates();
        window.calculationTemplates.init();
    });
} else {
    setTimeout(() => {
        window.calculationTemplates = new CalculationTemplates();
        window.calculationTemplates.init();
    }, 0);
}

export { CalculationTemplates };