/**
 * M2 Calculators Mobile Optimizer
 * Оптимизация интерфейса и производительности для мобильных устройств
 */

class MobileOptimizer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.touchSupport = this.detectTouch();
        this.deviceOrientation = this.getOrientation();
        this.viewport = this.getViewport();

        this.swipeGestures = new Map();
        this.touchStartTime = 0;
        this.lastTap = 0;

        this.init();
    }

    init() {
        if (this.isMobile || this.isTablet) {
            this.optimizeForMobile();
            this.setupTouchGestures();
            this.optimizeScrolling();
            this.setupOrientationHandling();
            this.optimizeFormInputs();
            this.setupMobileValidation();
            this.optimizeCalculatorLayout();
        }

        this.setupResponsiveImages();
        this.optimizePerformance();
        this.setupAccessibility();
    }

    detectMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['mobile', 'android', 'iphone', 'ipod', 'blackberry', 'windows phone'];
        return mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
               window.innerWidth <= 768;
    }

    detectTablet() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /ipad|android(?!.*mobile)|tablet/.test(userAgent) ||
               (window.innerWidth > 768 && window.innerWidth <= 1024);
    }

    detectTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    getViewport() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.devicePixelRatio || 1
        };
    }

    optimizeForMobile() {
        // Добавляем мобильные метатеги если их нет
        this.ensureViewportMeta();

        // Применяем мобильные стили
        this.injectMobileStyles();

        // Оптимизируем размеры элементов
        this.optimizeElementSizes();

        // Улучшаем читаемость
        this.optimizeTypography();

        // Оптимизируем кнопки для касаний
        this.optimizeTouchTargets();

        console.log('📱 Мобильная оптимизация активирована');
    }

    ensureViewportMeta() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }

        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }

    optimizeElementSizes() {
        // Увеличиваем размеры форм на мобильных
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (this.isMobile) {
                input.style.fontSize = '16px'; // Предотвращает зум на iOS
                input.style.minHeight = '44px'; // Рекомендуемый размер касания
                input.style.padding = '12px 16px';
            }
        });

        // Увеличиваем кнопки
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            if (this.isMobile) {
                button.style.minHeight = '48px';
                button.style.minWidth = '48px';
                button.style.padding = '12px 24px';
                button.style.fontSize = '16px';
            }
        });
    }

    optimizeTypography() {
        const style = document.createElement('style');
        style.id = 'mobile-typography-optimizer';
        style.textContent = `
            @media (max-width: 768px) {
                body {
                    font-size: 16px !important;
                    line-height: 1.5 !important;
                }

                h1 { font-size: 1.75rem !important; }
                h2 { font-size: 1.5rem !important; }
                h3 { font-size: 1.25rem !important; }
                h4 { font-size: 1.1rem !important; }

                p, div, span {
                    font-size: 16px !important;
                    line-height: 1.5 !important;
                }

                .small-text {
                    font-size: 14px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    optimizeTouchTargets() {
        const touchElements = document.querySelectorAll('a, button, input, select, textarea, [onclick], [ontouchstart]');

        touchElements.forEach(element => {
            const rect = element.getBoundingClientRect();

            // Минимальный размер касания 44x44px (рекомендация Apple)
            if (rect.width < 44 || rect.height < 44) {
                element.style.minWidth = '44px';
                element.style.minHeight = '44px';
                element.style.display = 'inline-flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
            }

            // Добавляем отступы между касаемыми элементами
            element.style.margin = '4px';
        });
    }

    setupTouchGestures() {
        let startX, startY, endX, endY;

        document.addEventListener('touchstart', (e) => {
            this.touchStartTime = Date.now();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - this.touchStartTime;

            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Обработка свайпов
            if (distance > 50 && touchDuration < 300) {
                const direction = this.getSwipeDirection(deltaX, deltaY);
                this.handleSwipe(direction, e.target);
            }

            // Обработка двойного тапа
            if (touchDuration < 300 && distance < 10) {
                this.handleTap(e.target, touchEndTime);
            }
        }, { passive: true });

        // Предотвращаем случайные касания
        document.addEventListener('touchmove', (e) => {
            // Разрешаем скролл только по вертикали для основного контента
            if (e.target.closest('.calculator-container, .form-container')) {
                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - startX);
                const deltaY = Math.abs(touch.clientY - startY);

                if (deltaX > deltaY) {
                    e.preventDefault(); // Блокируем горизонтальный скролл
                }
            }
        }, { passive: false });
    }

    getSwipeDirection(deltaX, deltaY) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    handleSwipe(direction, target) {
        // Свайп влево/вправо для переключения между вкладками или сценариями
        if (direction === 'left' || direction === 'right') {
            const tabContainer = target.closest('.tab-container, .scenario-container');
            if (tabContainer) {
                this.switchTab(tabContainer, direction);
            }
        }

        // Свайп вверх для сворачивания результатов
        if (direction === 'up') {
            const resultContainer = target.closest('.result-container');
            if (resultContainer) {
                this.minimizeResults(resultContainer);
            }
        }

        // Свайп вниз для разворачивания результатов
        if (direction === 'down') {
            const minimizedResults = document.querySelector('.result-container.minimized');
            if (minimizedResults) {
                this.expandResults(minimizedResults);
            }
        }
    }

    handleTap(target, currentTime) {
        const timeSinceLastTap = currentTime - this.lastTap;

        if (timeSinceLastTap < 300) {
            // Двойной тап - увеличиваем текст или показываем детали
            this.handleDoubleTap(target);
        }

        this.lastTap = currentTime;
    }

    handleDoubleTap(target) {
        const inputField = target.closest('input, select, textarea');
        if (inputField) {
            // Двойной тап на поле ввода - показываем подсказку
            this.showFieldTooltip(inputField);
            return;
        }

        const resultValue = target.closest('.result-value, .metric-value');
        if (resultValue) {
            // Двойной тап на результате - показываем детальную информацию
            this.showResultDetails(resultValue);
            return;
        }
    }

    optimizeScrolling() {
        // Улучшенная прокрутка для мобильных устройств
        const style = document.createElement('style');
        style.id = 'mobile-scroll-optimizer';
        style.textContent = `
            @media (max-width: 768px) {
                * {
                    -webkit-overflow-scrolling: touch;
                    scroll-behavior: smooth;
                }

                body {
                    overscroll-behavior: contain;
                }

                .scroll-container {
                    -webkit-overflow-scrolling: touch;
                    overflow-y: auto;
                    height: calc(100vh - 60px);
                }

                /* Убираем горизонтальную прокрутку */
                body, html {
                    overflow-x: hidden;
                    width: 100%;
                    max-width: 100%;
                }
            }
        `;
        document.head.appendChild(style);

        // Добавляем плавную прокрутку к результатам после расчета
        this.setupSmoothScrollToResults();
    }

    setupSmoothScrollToResults() {
        // Перехватываем событие завершения расчета
        document.addEventListener('calculationComplete', () => {
            if (this.isMobile) {
                const resultsContainer = document.querySelector('.results-container, .result-container, #results');
                if (resultsContainer) {
                    setTimeout(() => {
                        resultsContainer.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 300);
                }
            }
        });
    }

    setupOrientationHandling() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        window.addEventListener('resize', this.debounce(() => {
            this.handleViewportChange();
        }, 300));
    }

    handleOrientationChange() {
        const newOrientation = this.getOrientation();

        if (newOrientation !== this.deviceOrientation) {
            this.deviceOrientation = newOrientation;

            // Перестраиваем layout для новой ориентации
            this.adjustLayoutForOrientation(newOrientation);

            // Принудительно пересчитываем размеры
            this.recalculateViewport();
        }
    }

    adjustLayoutForOrientation(orientation) {
        const containers = document.querySelectorAll('.calculator-container, .form-container');

        containers.forEach(container => {
            if (orientation === 'landscape' && this.isMobile) {
                // В альбомной ориентации делаем layout более компактным
                container.style.padding = '10px';
                container.style.gap = '10px';
            } else {
                // В портретной ориентации больше отступы
                container.style.padding = '20px';
                container.style.gap = '20px';
            }
        });
    }

    handleViewportChange() {
        this.viewport = this.getViewport();

        // Обновляем CSS custom properties для адаптивного дизайна
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        document.documentElement.style.setProperty('--vw', `${window.innerWidth * 0.01}px`);
    }

    optimizeFormInputs() {
        const inputs = document.querySelectorAll('input[type="number"], input[type="tel"]');

        inputs.forEach(input => {
            // Добавляем числовую клавиатуру для мобильных
            if (this.isMobile) {
                input.setAttribute('inputmode', 'numeric');
                input.setAttribute('pattern', '[0-9]*');
            }

            // Улучшаем UX ввода
            this.enhanceInputUX(input);
        });

        // Оптимизируем селекты
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            this.enhanceSelectUX(select);
        });
    }

    enhanceInputUX(input) {
        // Автоматическое выделение текста при фокусе
        input.addEventListener('focus', () => {
            if (this.isMobile) {
                setTimeout(() => input.select(), 100);
            }
        });

        // Показываем индикатор валидации
        input.addEventListener('input', () => {
            this.showMobileValidationFeedback(input);
        });

        // Добавляем кнопки +/- для числовых полей
        if (input.type === 'number' && this.isMobile) {
            this.addNumericControls(input);
        }
    }

    addNumericControls(input) {
        const wrapper = document.createElement('div');
        wrapper.className = 'mobile-numeric-input';

        const decreaseBtn = document.createElement('button');
        decreaseBtn.type = 'button';
        decreaseBtn.className = 'numeric-control decrease';
        decreaseBtn.innerHTML = '−';
        decreaseBtn.addEventListener('click', () => {
            const step = parseFloat(input.step) || 1;
            const current = parseFloat(input.value) || 0;
            input.value = Math.max(current - step, parseFloat(input.min) || -Infinity);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        const increaseBtn = document.createElement('button');
        increaseBtn.type = 'button';
        increaseBtn.className = 'numeric-control increase';
        increaseBtn.innerHTML = '+';
        increaseBtn.addEventListener('click', () => {
            const step = parseFloat(input.step) || 1;
            const current = parseFloat(input.value) || 0;
            input.value = Math.min(current + step, parseFloat(input.max) || Infinity);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(decreaseBtn);
        wrapper.appendChild(input);
        wrapper.appendChild(increaseBtn);

        this.injectNumericControlsStyles();
    }

    enhanceSelectUX(select) {
        if (this.isMobile) {
            // Увеличиваем размер селекта для мобильных
            select.style.fontSize = '16px';
            select.style.minHeight = '44px';
            select.style.padding = '12px';
        }
    }

    setupMobileValidation() {
        const forms = document.querySelectorAll('form, .calculator-form');

        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateMobileForm(form)) {
                    e.preventDefault();
                    this.showMobileValidationSummary(form);
                }
            });
        });
    }

    showMobileValidationFeedback(input) {
        const existingFeedback = input.parentNode.querySelector('.mobile-validation-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        if (!input.checkValidity()) {
            const feedback = document.createElement('div');
            feedback.className = 'mobile-validation-feedback error';
            feedback.textContent = input.validationMessage;
            input.parentNode.appendChild(feedback);

            // Вибрация на ошибке (если поддерживается)
            if ('vibrate' in navigator) {
                navigator.vibrate(100);
            }
        } else if (input.value.trim()) {
            const feedback = document.createElement('div');
            feedback.className = 'mobile-validation-feedback success';
            feedback.innerHTML = '✓';
            input.parentNode.appendChild(feedback);
        }
    }

    optimizeCalculatorLayout() {
        if (!this.isMobile) return;

        // Создаем мобильный layout для калькулятора
        const calculators = document.querySelectorAll('.calculator-container, .calculator');

        calculators.forEach(calculator => {
            this.createMobileLayout(calculator);
        });
    }

    createMobileLayout(calculator) {
        // Создаем складную секцию для параметров
        const inputSection = calculator.querySelector('.input-section, .form-section');
        if (inputSection) {
            this.makeCollapsible(inputSection, 'Параметры расчета', true);
        }

        // Создаем складную секцию для результатов
        const resultSection = calculator.querySelector('.result-section, .results');
        if (resultSection) {
            this.makeCollapsible(resultSection, 'Результаты', false);
        }

        // Добавляем плавающую кнопку расчета
        this.addFloatingCalculateButton(calculator);
    }

    makeCollapsible(section, title, expanded = true) {
        const header = document.createElement('div');
        header.className = 'mobile-section-header';
        header.innerHTML = `
            <h3>${title}</h3>
            <span class="toggle-icon">${expanded ? '−' : '+'}</span>
        `;

        const content = document.createElement('div');
        content.className = 'mobile-section-content';
        content.style.display = expanded ? 'block' : 'none';

        // Перемещаем содержимое в content
        while (section.firstChild) {
            content.appendChild(section.firstChild);
        }

        section.appendChild(header);
        section.appendChild(content);
        section.classList.add('mobile-collapsible-section');

        header.addEventListener('click', () => {
            const isVisible = content.style.display !== 'none';
            content.style.display = isVisible ? 'none' : 'block';
            header.querySelector('.toggle-icon').textContent = isVisible ? '+' : '−';

            // Анимация
            if (!isVisible) {
                content.style.animation = 'slideDown 0.3s ease-out';
            }
        });
    }

    addFloatingCalculateButton(calculator) {
        const existingBtn = calculator.querySelector('.calculate-btn, .btn-calculate');
        if (!existingBtn) return;

        const floatingBtn = document.createElement('button');
        floatingBtn.type = 'button';
        floatingBtn.className = 'floating-calculate-btn';
        floatingBtn.innerHTML = '🧮 Рассчитать';

        floatingBtn.addEventListener('click', () => {
            existingBtn.click();
        });

        document.body.appendChild(floatingBtn);

        // Показываем/скрываем кнопку в зависимости от прокрутки
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop && scrollTop > 200) {
                floatingBtn.style.transform = 'translateY(100px)';
            } else {
                floatingBtn.style.transform = 'translateY(0)';
            }

            lastScrollTop = scrollTop;
        });
    }

    setupResponsiveImages() {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            // Ленивая загрузка для мобильных
            if (this.isMobile && 'loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            }

            // Делаем изображения адаптивными
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });
    }

    optimizePerformance() {
        if (this.isMobile) {
            // Отключаем анимации для слабых устройств
            if (this.isLowEndDevice()) {
                this.disableAnimations();
            }

            // Оптимизируем частоту обновления
            this.optimizeUpdateFrequency();

            // Включаем аппаратное ускорение для ключевых элементов
            this.enableHardwareAcceleration();
        }
    }

    isLowEndDevice() {
        // Простая эвристика для определения слабых устройств
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        const connection = navigator.connection?.effectiveType;

        return memory < 2 || cores < 4 || connection === 'slow-2g' || connection === '2g';
    }

    disableAnimations() {
        const style = document.createElement('style');
        style.id = 'disable-animations';
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }

    enableHardwareAcceleration() {
        const elements = document.querySelectorAll('.floating-calculate-btn, .mobile-section-content, .result-container');

        elements.forEach(element => {
            element.style.transform = 'translateZ(0)';
            element.style.willChange = 'transform';
        });
    }

    setupAccessibility() {
        // Улучшенная доступность для мобильных устройств

        // Увеличиваем контрастность на ярком солнце
        if (this.isMobile) {
            this.enhanceContrast();
        }

        // Добавляем голосовые подсказки
        this.setupVoiceGuidance();

        // Улучшаем навигацию с клавиатуры
        this.enhanceKeyboardNavigation();
    }

    enhanceContrast() {
        const style = document.createElement('style');
        style.id = 'mobile-contrast-enhancement';
        style.textContent = `
            @media (max-width: 768px) and (prefers-contrast: high) {
                body {
                    background: #ffffff !important;
                    color: #000000 !important;
                }

                .btn, button {
                    border: 2px solid #000000 !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                }

                .btn:hover, button:hover {
                    background: #000000 !important;
                    color: #ffffff !important;
                }

                input, select, textarea {
                    border: 2px solid #000000 !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    injectMobileStyles() {
        const style = document.createElement('style');
        style.id = 'mobile-optimizer-styles';
        style.textContent = `
            @media (max-width: 768px) {
                .container {
                    padding: 10px !important;
                    margin: 0 !important;
                    max-width: 100% !important;
                }

                .form-grid {
                    grid-template-columns: 1fr !important;
                    gap: 15px !important;
                }

                .result-grid {
                    grid-template-columns: 1fr !important;
                    gap: 10px !important;
                }

                .mobile-collapsible-section {
                    margin-bottom: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .mobile-section-header {
                    background: #f8f9fa;
                    padding: 15px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    user-select: none;
                }

                .mobile-section-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .mobile-section-content {
                    padding: 15px;
                }

                .floating-calculate-btn {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 25px;
                    padding: 15px 25px;
                    font-size: 16px;
                    font-weight: bold;
                    box-shadow: 0 4px 20px rgba(0, 123, 255, 0.3);
                    z-index: 1000;
                    transition: transform 0.3s ease;
                    cursor: pointer;
                }

                .floating-calculate-btn:active {
                    transform: scale(0.95);
                }

                .mobile-numeric-input {
                    display: flex;
                    align-items: center;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    overflow: hidden;
                }

                .numeric-control {
                    background: #f8f9fa;
                    border: none;
                    width: 44px;
                    height: 44px;
                    font-size: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    user-select: none;
                }

                .numeric-control:active {
                    background: #e9ecef;
                }

                .mobile-numeric-input input {
                    border: none !important;
                    text-align: center;
                    flex: 1;
                }

                .mobile-validation-feedback {
                    font-size: 14px;
                    margin-top: 5px;
                    padding: 5px 10px;
                    border-radius: 4px;
                }

                .mobile-validation-feedback.error {
                    background: #ffebee;
                    color: #c62828;
                    border: 1px solid #ffcdd2;
                }

                .mobile-validation-feedback.success {
                    background: #e8f5e8;
                    color: #2e7d32;
                    border: 1px solid #c8e6c9;
                    text-align: center;
                    font-weight: bold;
                }

                /* Скрываем desktop элементы на мобильных */
                .desktop-only {
                    display: none !important;
                }

                /* Показываем mobile элементы только на мобильных */
                .mobile-only {
                    display: block !important;
                }

                /* Адаптивные таблицы */
                table {
                    font-size: 14px;
                    overflow-x: auto;
                    display: block;
                    white-space: nowrap;
                }

                /* Улучшенные модальные окна */
                .modal {
                    padding: 10px !important;
                }

                .modal-content {
                    margin: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    height: 100% !important;
                    border-radius: 0 !important;
                }
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    injectNumericControlsStyles() {
        if (document.querySelector('#numeric-controls-styles')) return;

        const style = document.createElement('style');
        style.id = 'numeric-controls-styles';
        style.textContent = `
            .mobile-numeric-input {
                display: flex;
                align-items: center;
                border: 1px solid #ddd;
                border-radius: 6px;
                overflow: hidden;
                background: white;
            }

            .numeric-control {
                background: #f8f9fa;
                border: none;
                width: 44px;
                height: 44px;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                user-select: none;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }

            .numeric-control:hover {
                background: #e9ecef;
            }

            .numeric-control:active {
                background: #dee2e6;
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
    }

    // Утилиты
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

    recalculateViewport() {
        // Принудительный пересчет viewport для решения проблем с iOS Safari
        setTimeout(() => {
            window.scrollTo(0, 0);
            this.viewport = this.getViewport();
            this.handleViewportChange();
        }, 100);
    }

    // Публичные методы
    getDeviceInfo() {
        return {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            touchSupport: this.touchSupport,
            orientation: this.deviceOrientation,
            viewport: this.viewport
        };
    }

    enableMobileOptimizations() {
        if (!this.isMobile) {
            this.isMobile = true;
            this.optimizeForMobile();
        }
    }

    disableMobileOptimizations() {
        const styles = document.querySelectorAll('#mobile-optimizer-styles, #mobile-typography-optimizer, #mobile-scroll-optimizer');
        styles.forEach(style => style.remove());

        const floatingBtn = document.querySelector('.floating-calculate-btn');
        if (floatingBtn) floatingBtn.remove();
    }
}

// Создаем экземпляр оптимизатора
const mobileOptimizer = new MobileOptimizer();

// Добавляем в глобальную область
window.M2MobileOptimizer = mobileOptimizer;

// Информируем систему о загрузке модуля
if (window.M2EnhancementsLoader) {
    window.M2EnhancementsLoader.registerModule('mobile-optimizer', mobileOptimizer);
}

// Логируем информацию об устройстве
console.log('📱 Mobile Optimizer загружен:', mobileOptimizer.getDeviceInfo());