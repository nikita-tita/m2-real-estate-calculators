/**
 * M2 Calculators AI Assistant
 * ИИ-помощник для консультаций и рекомендаций по недвижимости
 */

class AIAssistant {
    constructor() {
        this.isActive = false;
        this.conversationHistory = [];
        this.userProfile = {};
        this.knowledgeBase = this.initKnowledgeBase();
        this.recommendations = new Map();
        this.contextualHelp = new Map();

        this.init();
    }

    init() {
        this.setupUI();
        this.loadUserProfile();
        this.setupContextualHelp();
        this.initializeChatBot();
        this.setupVoiceRecognition();
        this.loadMarketData();

        console.log('🤖 AI Assistant инициализирован');
    }

    initKnowledgeBase() {
        return {
            mortgage: {
                rules: {
                    maxLTV: 0.8, // максимальный LTV
                    minDownPayment: 0.15, // минимальный первоначальный взнос
                    maxDTI: 0.43, // максимальное соотношение долга к доходу
                    optimalLoanTerm: 20, // оптимальный срок кредита
                    riskThresholds: {
                        low: 0.3,
                        medium: 0.5,
                        high: 0.7
                    }
                },
                tips: [
                    'Рассмотрите досрочное погашение для экономии на процентах',
                    'Сравните предложения минимум 3-х банков',
                    'Учитывайте страховку при расчете общих расходов',
                    'Оптимальный срок кредита - 15-20 лет для большинства случаев'
                ]
            },
            rental: {
                rules: {
                    minCapRate: 0.06, // минимальная капитализация
                    optimalCapRate: 0.08, // оптимальная капитализация
                    maxVacancy: 0.1, // максимальная вакантность
                    minCashFlow: 5000, // минимальный денежный поток в месяц
                    riskFactors: ['location', 'propertyAge', 'marketTrends', 'vacancy']
                },
                tips: [
                    'Локация важнее состояния квартиры для доходности',
                    'Учитывайте расходы на управление и обслуживание',
                    'Диверсифицируйте портфель по районам и типам жилья',
                    'Исследуйте спрос на аренду в выбранном районе'
                ]
            },
            market: {
                trends: {
                    interestRates: 'умеренный рост',
                    propertyPrices: 'стабильный рост',
                    rentalYield: 'снижение в центре, рост в спальных районах',
                    marketSentiment: 'осторожный оптимизм'
                },
                predictions: {
                    nextQuarter: 'стабильность с локальными колебаниями',
                    nextYear: 'умеренный рост цен на 5-8%',
                    risks: ['изменение ключевой ставки', 'геополитические факторы']
                }
            }
        };
    }

    setupUI() {
        this.createChatWidget();
        this.injectStyles();
        this.setupEventListeners();
    }

    createChatWidget() {
        const widget = document.createElement('div');
        widget.id = 'ai-assistant-widget';
        widget.className = 'ai-widget collapsed';
        widget.innerHTML = `
            <div class="ai-widget-toggle" onclick="window.M2AI.toggle()">
                <span class="ai-icon">🤖</span>
                <span class="ai-text">AI Помощник</span>
                <div class="ai-status-indicator"></div>
            </div>

            <div class="ai-widget-panel">
                <div class="ai-header">
                    <div class="ai-avatar">🤖</div>
                    <div class="ai-info">
                        <div class="ai-name">М2 AI Консультант</div>
                        <div class="ai-status">Готов помочь с расчетами</div>
                    </div>
                    <button class="ai-close" onclick="window.M2AI.toggle()">✕</button>
                </div>

                <div class="ai-suggestions">
                    <div class="suggestion-title">Быстрые вопросы:</div>
                    <div class="suggestions-grid">
                        <button class="suggestion-btn" onclick="window.M2AI.askQuestion('Какой первоначальный взнос оптимален?')">
                            💰 Первоначальный взнос
                        </button>
                        <button class="suggestion-btn" onclick="window.M2AI.askQuestion('Как оценить доходность аренды?')">
                            📊 Доходность аренды
                        </button>
                        <button class="suggestion-btn" onclick="window.M2AI.askQuestion('В каком районе лучше купить?')">
                            📍 Выбор района
                        </button>
                        <button class="suggestion-btn" onclick="window.M2AI.askQuestion('Стоит ли брать ипотеку сейчас?')">
                            🏦 Рыночная ситуация
                        </button>
                    </div>
                </div>

                <div class="ai-chat-container">
                    <div class="ai-messages" id="ai-messages"></div>

                    <div class="ai-input-area">
                        <div class="ai-input-wrapper">
                            <input type="text" id="ai-input" placeholder="Задайте вопрос о недвижимости..." />
                            <button class="voice-btn" onclick="window.M2AI.startVoiceInput()" title="Голосовой ввод">🎤</button>
                            <button class="send-btn" onclick="window.M2AI.sendMessage()" title="Отправить">📤</button>
                        </div>
                        <div class="ai-typing-indicator" id="ai-typing" style="display: none;">
                            AI печатает<span class="dots">...</span>
                        </div>
                    </div>
                </div>

                <div class="ai-footer">
                    <div class="ai-disclaimer">
                        ⚠️ Рекомендации носят информационный характер
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
    }

    setupEventListeners() {
        const input = document.getElementById('ai-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });

            input.addEventListener('input', (e) => {
                this.handleTyping(e.target.value);
            });
        }
    }

    toggle() {
        const widget = document.getElementById('ai-assistant-widget');
        widget.classList.toggle('collapsed');
        this.isActive = !widget.classList.contains('collapsed');

        if (this.isActive && this.conversationHistory.length === 0) {
            this.showWelcomeMessage();
        }

        // Трекинг использования
        if (window.M2Analytics) {
            window.M2Analytics.trackFeatureUsage('ai_assistant');
        }
    }

    showWelcomeMessage() {
        const welcomeMessage = this.generateWelcomeMessage();
        this.addMessage('assistant', welcomeMessage);
    }

    generateWelcomeMessage() {
        const hour = new Date().getHours();
        let greeting = 'Добро пожаловать!';

        if (hour < 12) greeting = 'Доброе утро!';
        else if (hour < 18) greeting = 'Добрый день!';
        else greeting = 'Добрый вечер!';

        const currentPage = this.detectCurrentCalculator();
        let contextMessage = '';

        if (currentPage) {
            contextMessage = ` Вижу, что вы используете ${currentPage}. Могу помочь с расчетами и дать рекомендации.`;
        }

        return `${greeting} Я ваш AI-консультант по недвижимости.${contextMessage}\n\nЧем могу помочь? 🏠`;
    }

    detectCurrentCalculator() {
        const url = window.location.pathname;
        const calculators = {
            'mortgage_calculator.html': 'ипотечный калькулятор',
            'rental_profitability_calculator.html': 'калькулятор доходности аренды',
            'affordability_calculator.html': 'калькулятор доступности жилья',
            'rent_vs_buy_calculator.html': 'сравнение аренды и покупки',
            'airbnb_calculator.html': 'калькулятор краткосрочной аренды'
        };

        for (const [path, name] of Object.entries(calculators)) {
            if (url.includes(path)) {
                return name;
            }
        }

        return null;
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();

        if (!message) return;

        // Добавляем сообщение пользователя
        this.addMessage('user', message);
        input.value = '';

        // Показываем индикатор печати
        this.showTypingIndicator();

        // Генерируем ответ
        const response = await this.generateResponse(message);

        // Скрываем индикатор и показываем ответ
        this.hideTypingIndicator();
        this.addMessage('assistant', response);

        // Сохраняем в историю
        this.conversationHistory.push(
            { role: 'user', content: message, timestamp: Date.now() },
            { role: 'assistant', content: response, timestamp: Date.now() }
        );

        // Обновляем профиль пользователя
        this.updateUserProfile(message);
    }

    askQuestion(question) {
        const input = document.getElementById('ai-input');
        input.value = question;
        this.sendMessage();
    }

    addMessage(role, content) {
        const messagesContainer = document.getElementById('ai-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `ai-message ${role}-message`;

        const time = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="message-content">${this.formatMessage(content)}</div>
            <div class="message-time">${time}</div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        // Обработка markdown-подобного форматирования
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/💰|📊|📍|🏦|🏠|📈|📉|⚠️|✅|❌/g, '<span class="emoji">$&</span>');
    }

    showTypingIndicator() {
        document.getElementById('ai-typing').style.display = 'block';
    }

    hideTypingIndicator() {
        document.getElementById('ai-typing').style.display = 'none';
    }

    async generateResponse(message) {
        // Анализируем намерение пользователя
        const intent = this.analyzeIntent(message);
        const context = this.getContextualData();

        let response = '';

        switch (intent.type) {
            case 'mortgage_advice':
                response = this.generateMortgageAdvice(intent, context);
                break;
            case 'rental_advice':
                response = this.generateRentalAdvice(intent, context);
                break;
            case 'market_question':
                response = this.generateMarketInsight(intent, context);
                break;
            case 'calculation_help':
                response = this.generateCalculationHelp(intent, context);
                break;
            case 'general_question':
                response = this.generateGeneralAdvice(intent, context);
                break;
            default:
                response = this.generateFallbackResponse(message);
        }

        // Добавляем персонализированные рекомендации
        response += this.addPersonalizedRecommendations(intent, context);

        return response;
    }

    analyzeIntent(message) {
        const lowercaseMessage = message.toLowerCase();

        const intents = {
            mortgage_advice: [
                'ипотека', 'кредит', 'первоначальный взнос', 'процентная ставка',
                'срок кредита', 'досрочное погашение', 'банк', 'льготная ипотека'
            ],
            rental_advice: [
                'аренда', 'доходность', 'капитализация', 'инвестиции',
                'сдавать в аренду', 'арендная плата', 'окупаемость'
            ],
            market_question: [
                'рынок', 'цены', 'прогноз', 'тренд', 'когда покупать',
                'стоит ли покупать', 'ситуация на рынке', 'курс'
            ],
            calculation_help: [
                'как рассчитать', 'формула', 'считать', 'параметры',
                'что вводить', 'помочь с расчетом'
            ]
        };

        for (const [intentType, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => lowercaseMessage.includes(keyword))) {
                return {
                    type: intentType,
                    confidence: this.calculateConfidence(lowercaseMessage, keywords),
                    keywords: keywords.filter(k => lowercaseMessage.includes(k))
                };
            }
        }

        return { type: 'general_question', confidence: 0.5, keywords: [] };
    }

    calculateConfidence(message, keywords) {
        const matchedKeywords = keywords.filter(k => message.includes(k)).length;
        return Math.min(matchedKeywords / keywords.length * 2, 1);
    }

    getContextualData() {
        const currentCalculator = this.detectCurrentCalculator();
        const formData = this.extractFormData();
        const userMetrics = this.getUserMetrics();

        return {
            calculator: currentCalculator,
            formData: formData,
            metrics: userMetrics,
            timestamp: Date.now()
        };
    }

    extractFormData() {
        const data = {};
        const inputs = document.querySelectorAll('input[type="number"], select');

        inputs.forEach(input => {
            if (input.value && input.name) {
                data[input.name] = parseFloat(input.value) || input.value;
            }
        });

        return data;
    }

    generateMortgageAdvice(intent, context) {
        const { formData } = context;
        const kb = this.knowledgeBase.mortgage;
        let advice = '🏦 **Рекомендации по ипотеке:**\n\n';

        if (formData.propertyPrice && formData.downPayment) {
            const ltv = (formData.propertyPrice - formData.downPayment) / formData.propertyPrice;
            const downPaymentPercent = (formData.downPayment / formData.propertyPrice) * 100;

            if (ltv > kb.rules.maxLTV) {
                advice += `⚠️ LTV составляет ${(ltv * 100).toFixed(1)}%, что выше рекомендуемого максимума (${kb.rules.maxLTV * 100}%). Рассмотрите увеличение первоначального взноса.\n\n`;
            } else {
                advice += `✅ LTV в норме: ${(ltv * 100).toFixed(1)}%\n\n`;
            }

            if (downPaymentPercent < kb.rules.minDownPayment * 100) {
                advice += `💰 Рекомендую увеличить первоначальный взнос до ${kb.rules.minDownPayment * 100}% для лучших условий.\n\n`;
            }
        }

        if (formData.loanTerm) {
            if (formData.loanTerm > kb.rules.optimalLoanTerm) {
                advice += `📅 Срок кредита ${formData.loanTerm} лет. Сокращение до ${kb.rules.optimalLoanTerm} лет сэкономит значительные средства на процентах.\n\n`;
            }
        }

        // Добавляем общие советы
        advice += '**Полезные советы:**\n';
        kb.tips.forEach(tip => {
            advice += `• ${tip}\n`;
        });

        return advice;
    }

    generateRentalAdvice(intent, context) {
        const { formData } = context;
        const kb = this.knowledgeBase.rental;
        let advice = '📊 **Анализ инвестиций в аренду:**\n\n';

        if (formData.propertyPrice && formData.monthlyRent) {
            const annualRent = formData.monthlyRent * 12;
            const capRate = annualRent / formData.propertyPrice;

            advice += `**Капитализация:** ${(capRate * 100).toFixed(2)}%\n\n`;

            if (capRate < kb.rules.minCapRate) {
                advice += `⚠️ Капитализация ниже минимально рекомендуемой (${kb.rules.minCapRate * 100}%). Возможно, стоит пересмотреть цену или арендную плату.\n\n`;
            } else if (capRate >= kb.rules.optimalCapRate) {
                advice += `✅ Отличная капитализация! Объект выглядит привлекательно для инвестиций.\n\n`;
            } else {
                advice += `📈 Приемлемая капитализация, но есть потенциал для улучшения.\n\n`;
            }

            const monthlyNetIncome = formData.monthlyRent * 0.85; // с учетом расходов
            if (monthlyNetIncome < kb.rules.minCashFlow) {
                advice += `💸 Чистый денежный поток может быть низким. Учитывайте все расходы на содержание.\n\n`;
            }
        }

        advice += '**Ключевые факторы:**\n';
        kb.tips.forEach(tip => {
            advice += `• ${tip}\n`;
        });

        return advice;
    }

    generateMarketInsight(intent, context) {
        const kb = this.knowledgeBase.market;
        let insight = '📈 **Обзор рынка недвижимости:**\n\n';

        insight += `**Текущие тренды:**\n`;
        insight += `• Процентные ставки: ${kb.trends.interestRates}\n`;
        insight += `• Цены на недвижимость: ${kb.trends.propertyPrices}\n`;
        insight += `• Доходность аренды: ${kb.trends.rentalYield}\n`;
        insight += `• Настроения рынка: ${kb.trends.marketSentiment}\n\n`;

        insight += `**Прогнозы:**\n`;
        insight += `• Следующий квартал: ${kb.predictions.nextQuarter}\n`;
        insight += `• Следующий год: ${kb.predictions.nextYear}\n\n`;

        insight += `**Основные риски:**\n`;
        kb.predictions.risks.forEach(risk => {
            insight += `⚠️ ${risk}\n`;
        });

        insight += '\n**Рекомендация:** Внимательно следите за изменениями ключевой ставки ЦБ и геополитической ситуацией.';

        return insight;
    }

    generateCalculationHelp(intent, context) {
        const calculator = context.calculator;
        let help = '🧮 **Помощь с расчетами:**\n\n';

        if (calculator?.includes('ипотечный')) {
            help += `**Как заполнить ипотечный калькулятор:**\n`;
            help += `• **Стоимость недвижимости** - полная цена объекта\n`;
            help += `• **Первоначальный взнос** - сумма собственных средств\n`;
            help += `• **Процентная ставка** - годовая ставка по кредиту\n`;
            help += `• **Срок кредита** - период погашения в годах\n\n`;
            help += `💡 **Совет:** Попробуйте разные сценарии, изменяя первоначальный взнос и срок кредита.`;
        } else if (calculator?.includes('доходности')) {
            help += `**Параметры калькулятора доходности:**\n`;
            help += `• **Стоимость покупки** - цена приобретения с учетом всех расходов\n`;
            help += `• **Арендная плата** - ежемесячный доход от аренды\n`;
            help += `• **Расходы на управление** - комиссия управляющей компании\n`;
            help += `• **Вакантность** - процент времени без арендаторов\n\n`;
            help += `💡 **Совет:** Будьте консервативны в оценках и учитывайте все возможные расходы.`;
        } else {
            help += `**Общие принципы расчетов:**\n`;
            help += `• Используйте реальные рыночные данные\n`;
            help += `• Учитывайте все сопутствующие расходы\n`;
            help += `• Рассматривайте несколько сценариев\n`;
            help += `• Регулярно обновляйте исходные данные\n\n`;
            help += `❓ Если нужна помощь с конкретным параметром, просто спросите!`;
        }

        return help;
    }

    generateGeneralAdvice(intent, context) {
        const generalTips = [
            '🎯 **Определите свои цели:** инвестиции или собственное жилье',
            '💰 **Изучите рынок:** сравните цены в разных районах',
            '🏦 **Сравните банки:** условия кредитования могут сильно отличаться',
            '📊 **Рассчитайте риски:** учитывайте возможные изменения доходов',
            '🔍 **Проверьте документы:** юридическая чистота превыше всего'
        ];

        let advice = '💡 **Общие рекомендации по недвижимости:**\n\n';
        advice += generalTips.join('\n\n');
        advice += '\n\n🤖 Задайте более конкретный вопрос для детальной консультации!';

        return advice;
    }

    generateFallbackResponse(message) {
        const responses = [
            'Интересный вопрос! Могу помочь с расчетами недвижимости, ипотеки или инвестиций. Переформулируйте вопрос?',
            'Пока я специализируюсь на консультациях по недвижимости. Чем могу помочь в этой сфере?',
            'Не совсем понял вопрос. Попробуйте спросить о ипотеке, аренде или инвестициях в недвижимость.',
            'Моя экспертиза - в сфере недвижимости и финансов. О чем конкретно хотели узнать?'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    addPersonalizedRecommendations(intent, context) {
        const profile = this.userProfile;
        let recommendations = '';

        // Персонализация на основе истории использования
        if (profile.calculationsCount > 10) {
            recommendations += '\n\n🎖️ **Персональная рекомендация:** Вы активный пользователь! Рассмотрите возможность сохранения шаблонов расчетов для быстрого доступа.';
        }

        if (profile.preferredCalculator === 'rental') {
            recommendations += '\n\n💼 **Для инвестора:** Следите за изменениями в налоговом законодательстве и новыми льготами для арендодателей.';
        }

        if (context.formData.propertyPrice > 10000000) {
            recommendations += '\n\n🏛️ **Премиум сегмент:** В вашем ценовом диапазоне особенно важна экспертная оценка и юридическая проверка.';
        }

        return recommendations;
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.lang = 'ru-RU';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('ai-input').value = transcript;
                this.sendMessage();
            };

            this.recognition.onerror = (event) => {
                console.warn('Ошибка распознавания речи:', event.error);
            };
        }
    }

    startVoiceInput() {
        if (this.recognition) {
            try {
                this.recognition.start();
                const voiceBtn = document.querySelector('.voice-btn');
                voiceBtn.innerHTML = '🔴';
                voiceBtn.title = 'Говорите...';

                setTimeout(() => {
                    voiceBtn.innerHTML = '🎤';
                    voiceBtn.title = 'Голосовой ввод';
                }, 5000);
            } catch (error) {
                console.warn('Не удалось запустить распознавание речи:', error);
            }
        }
    }

    handleTyping(text) {
        // Автодополнение и подсказки во время ввода
        if (text.length > 3) {
            this.showAutocompleteSuggestions(text);
        }
    }

    showAutocompleteSuggestions(text) {
        const suggestions = this.generateAutocompleteSuggestions(text);

        if (suggestions.length > 0) {
            // Показываем подсказки (можно реализовать UI)
            console.log('Предложения:', suggestions);
        }
    }

    generateAutocompleteSuggestions(text) {
        const commonQuestions = [
            'Какой оптимальный первоначальный взнос?',
            'Как рассчитать доходность аренды?',
            'Стоит ли брать ипотеку сейчас?',
            'В каком районе лучше покупать недвижимость?',
            'Как сравнить предложения банков?',
            'Что такое капитализация в недвижимости?',
            'Как учесть риски при инвестициях?'
        ];

        return commonQuestions.filter(q =>
            q.toLowerCase().includes(text.toLowerCase())
        ).slice(0, 3);
    }

    loadUserProfile() {
        const stored = localStorage.getItem('m2_ai_user_profile');
        if (stored) {
            this.userProfile = JSON.parse(stored);
        } else {
            this.userProfile = {
                calculationsCount: 0,
                preferredCalculator: null,
                interactions: 0,
                lastSeen: Date.now()
            };
        }
    }

    updateUserProfile(message) {
        this.userProfile.interactions++;
        this.userProfile.lastSeen = Date.now();

        // Анализируем предпочтения пользователя
        const calculator = this.detectCurrentCalculator();
        if (calculator) {
            this.userProfile.preferredCalculator = calculator;
        }

        this.saveUserProfile();
    }

    saveUserProfile() {
        localStorage.setItem('m2_ai_user_profile', JSON.stringify(this.userProfile));
    }

    getUserMetrics() {
        if (window.M2Analytics) {
            return window.M2Analytics.getMetrics();
        }
        return {};
    }

    setupContextualHelp() {
        // Настраиваем контекстную помощь для разных элементов
        document.addEventListener('focus', (e) => {
            if (e.target.matches('input[type="number"], select')) {
                this.showContextualHelp(e.target);
            }
        }, true);
    }

    showContextualHelp(element) {
        const helpText = this.getHelpForElement(element);
        if (helpText && this.isActive) {
            this.addMessage('assistant', `💡 **Подсказка:** ${helpText}`);
        }
    }

    getHelpForElement(element) {
        const helpMap = {
            'propertyPrice': 'Укажите полную стоимость недвижимости, включая все дополнительные расходы',
            'downPayment': 'Рекомендуемый минимум - 20% от стоимости для лучших условий кредита',
            'interestRate': 'Текущие ставки по ипотеке составляют 7-12% годовых',
            'loanTerm': 'Оптимальный срок - 15-20 лет для баланса платежа и переплаты',
            'monthlyRent': 'Указывайте реальную рыночную арендную плату для точного расчета'
        };

        return helpMap[element.name] || helpMap[element.id];
    }

    loadMarketData() {
        // Симуляция загрузки актуальных рыночных данных
        this.marketData = {
            averageRates: {
                mortgage: 9.5,
                commercial: 12.0
            },
            priceIndex: 105.2,
            rentalYield: {
                residential: 6.8,
                commercial: 8.2
            },
            lastUpdated: Date.now()
        };
    }

    injectStyles() {
        if (document.querySelector('#ai-assistant-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-assistant-styles';
        styles.textContent = `
            .ai-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10003;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .ai-widget-toggle {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                position: relative;
            }

            .ai-widget-toggle:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
            }

            .ai-icon {
                font-size: 18px;
            }

            .ai-text {
                font-weight: 600;
                font-size: 14px;
            }

            .ai-status-indicator {
                width: 8px;
                height: 8px;
                background: #4ade80;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            .ai-widget-panel {
                position: absolute;
                bottom: 60px;
                right: 0;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.8) translateY(20px);
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
            }

            .ai-widget:not(.collapsed) .ai-widget-panel {
                transform: scale(1) translateY(0);
                opacity: 1;
                pointer-events: all;
            }

            .ai-widget.collapsed .ai-widget-toggle .ai-text::after {
                content: ' (1)';
                background: #ff4757;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                margin-left: 5px;
            }

            .ai-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .ai-avatar {
                font-size: 24px;
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ai-info {
                flex: 1;
            }

            .ai-name {
                font-weight: 600;
                font-size: 16px;
            }

            .ai-status {
                font-size: 12px;
                opacity: 0.9;
            }

            .ai-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
            }

            .ai-suggestions {
                padding: 15px 20px;
                border-bottom: 1px solid #eee;
            }

            .suggestion-title {
                font-size: 12px;
                font-weight: 600;
                color: #666;
                margin-bottom: 10px;
            }

            .suggestions-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }

            .suggestion-btn {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 11px;
                cursor: pointer;
                text-align: left;
                transition: all 0.2s ease;
            }

            .suggestion-btn:hover {
                background: #e9ecef;
                border-color: #adb5bd;
            }

            .ai-chat-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 0;
            }

            .ai-messages {
                flex: 1;
                padding: 15px 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .ai-message {
                max-width: 85%;
                animation: messageSlideIn 0.3s ease-out;
            }

            .user-message {
                align-self: flex-end;
            }

            .user-message .message-content {
                background: #007bff;
                color: white;
                padding: 10px 15px;
                border-radius: 18px 18px 5px 18px;
                font-size: 14px;
            }

            .assistant-message .message-content {
                background: #f8f9fa;
                color: #333;
                padding: 12px 15px;
                border-radius: 18px 18px 18px 5px;
                font-size: 14px;
                line-height: 1.4;
            }

            .message-time {
                font-size: 10px;
                color: #999;
                margin-top: 4px;
                text-align: right;
            }

            .user-message .message-time {
                text-align: right;
            }

            .assistant-message .message-time {
                text-align: left;
            }

            .ai-input-area {
                padding: 15px 20px;
                border-top: 1px solid #eee;
            }

            .ai-input-wrapper {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            #ai-input {
                flex: 1;
                border: 1px solid #ddd;
                border-radius: 20px;
                padding: 10px 15px;
                font-size: 14px;
                outline: none;
            }

            #ai-input:focus {
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
            }

            .voice-btn, .send-btn {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                transition: all 0.2s ease;
            }

            .voice-btn:hover, .send-btn:hover {
                background: #e9ecef;
            }

            .send-btn {
                background: #007bff;
                border-color: #007bff;
                color: white;
            }

            .send-btn:hover {
                background: #0056b3;
            }

            .ai-typing-indicator {
                font-size: 12px;
                color: #999;
                margin-top: 5px;
                font-style: italic;
            }

            .dots {
                animation: typingDots 1.5s infinite;
            }

            .ai-footer {
                padding: 10px 20px;
                border-top: 1px solid #eee;
                background: #f8f9fa;
            }

            .ai-disclaimer {
                font-size: 10px;
                color: #666;
                text-align: center;
            }

            .emoji {
                font-size: 16px;
            }

            /* Анимации */
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            @keyframes messageSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes typingDots {
                0%, 60%, 100% { opacity: 0; }
                30% { opacity: 1; }
            }

            /* Адаптивность */
            @media (max-width: 768px) {
                .ai-widget {
                    bottom: 90px;
                    right: 10px;
                }

                .ai-widget-panel {
                    width: calc(100vw - 20px);
                    max-width: 350px;
                    height: 450px;
                }

                .suggestions-grid {
                    grid-template-columns: 1fr;
                }
            }

            /* Скрытие на очень маленьких экранах */
            @media (max-width: 480px) {
                .ai-widget-toggle .ai-text {
                    display: none;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Публичные методы
    getConversationHistory() {
        return this.conversationHistory;
    }

    clearConversation() {
        this.conversationHistory = [];
        document.getElementById('ai-messages').innerHTML = '';
        this.showWelcomeMessage();
    }

    exportConversation() {
        const exportData = {
            timestamp: new Date().toISOString(),
            conversation: this.conversationHistory,
            userProfile: this.userProfile,
            context: this.getContextualData()
        };

        return JSON.stringify(exportData, null, 2);
    }

    getAIStatus() {
        return {
            isActive: this.isActive,
            conversationLength: this.conversationHistory.length,
            userProfile: this.userProfile,
            hasVoiceSupport: !!this.recognition,
            lastInteraction: this.userProfile.lastSeen
        };
    }
}

// Создаем экземпляр AI Assistant
const aiAssistant = new AIAssistant();

// Добавляем в глобальную область
window.M2AI = aiAssistant;

// Информируем систему о загрузке модуля
if (window.M2EnhancementsLoader) {
    window.M2EnhancementsLoader.registerModule('ai-assistant', aiAssistant);
}

console.log('🤖 AI Assistant загружен и готов к работе');