// Компоненты header и footer для М2 калькуляторов
// На основе дизайна https://m2.ru/

function createHeader() {
    return `
    <header class="m2-header">
        <div class="m2-header-container">
            <div class="m2-logo">
                <a href="https://m2.ru/" target="_blank">
                    <div class="logo-icon">М2</div>
                    <div class="logo-text">Метр квадратный</div>
                </a>
            </div>
            
            <nav class="m2-nav">
                <div class="nav-section">
                    <a href="https://m2.ru/" class="nav-title">Частным лицам</a>
                    <div class="nav-dropdown">
                        <a href="https://m2.ru/moskva/novostroyki/">Новостройки</a>
                        <a href="https://m2.ru/ipoteka/">Ипотека</a>
                        <a href="https://m2.ru/ipoteka/calculator/">Ипотечный калькулятор</a>
                        <a href="https://m2.ru/services/deal/">Сделка</a>
                        <a href="https://m2.ru/services/guaranteed-deal/">Защита сделки</a>
                        <a href="https://m2.ru/services/proverka-yuridicheskoy-chistoty-kvartiry/">Проверка недвижимости</a>
                    </div>
                </div>
                
                <div class="nav-section">
                    <a href="https://m2.ru/rieltoram/" class="nav-title">Риелторам и агентствам</a>
                    <div class="nav-dropdown">
                        <a href="https://m2.ru/rieltoram/m2pro-novostroyki/">М2Pro Новостройки</a>
                        <a href="https://m2.ru/rieltoram/ipoteka/">Ипотека</a>
                        <a href="https://m2.ru/rieltoram/online-sdelka/">Онлайн-сделка</a>
                        <a href="https://m2.ru/rieltoram/sbr/">Сервис безопасных расчётов</a>
                        <a href="https://m2.ru/rieltoram/elreg/">Электронная регистрация</a>
                        <a href="https://m2.ru/rieltoram/proverka/">Проверка недвижимости</a>
                    </div>
                </div>
            </nav>
            
            <div class="m2-contacts">
                <a href="tel:+74951362818" class="phone-link">+7 495 136-28-18</a>
            </div>
        </div>
    </header>`;
}

function createFooter() {
    return `
    <footer class="m2-footer">
        <div class="m2-footer-container">
            <div class="footer-sections">
                <div class="footer-section">
                    <h4>Частным лицам</h4>
                    <ul>
                        <li><a href="https://m2.ru/moskva/novostroyki/">Новостройки</a></li>
                        <li><a href="https://m2.ru/ipoteka/">Ипотека</a></li>
                        <li><a href="https://m2.ru/ipoteka/calculator/">Ипотечный калькулятор</a></li>
                        <li><a href="https://m2.ru/services/deal/">Сделка</a></li>
                        <li><a href="https://m2.ru/services/guaranteed-deal/">Защита сделки</a></li>
                        <li><a href="https://m2.ru/services/proverka-yuridicheskoy-chistoty-kvartiry/">Проверка недвижимости</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Риелторам и агентствам</h4>
                    <ul>
                        <li><a href="https://m2.ru/rieltoram/m2pro-novostroyki/">М2Pro Новостройки</a></li>
                        <li><a href="https://m2.ru/rieltoram/ipoteka/">Ипотека</a></li>
                        <li><a href="https://m2.ru/rieltoram/online-sdelka/">Онлайн-сделка</a></li>
                        <li><a href="https://m2.ru/rieltoram/sbr/">Сервис безопасных расчётов</a></li>
                        <li><a href="https://m2.ru/rieltoram/elreg/">Электронная регистрация</a></li>
                        <li><a href="https://m2.ru/rieltoram/proverka/">Проверка недвижимости</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>О компании</h4>
                    <ul>
                        <li><a href="https://m2.ru/about/">О компании</a></li>
                        <li><a href="https://m2.ru/vacancies/">Вакансии</a></li>
                        <li><a href="https://m2.ru/it/">ИТ-деятельность</a></li>
                        <li><a href="https://m2.ru/support/">Помощь</a></li>
                        <li><a href="https://m2.ru/partners/">Наши партнёры</a></li>
                        <li><a href="https://m2.ru/media/">М2 Медиа</a></li>
                        <li><a href="https://m2.ru/pr/">Новости М2</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Калькуляторы М2</h4>
                    <ul>
                        <li><a href="/mortgage_calculator.html">Ипотечный калькулятор</a></li>
                        <li><a href="/affordability_calculator.html">Доступность жилья</a></li>
                        <li><a href="/rental_profitability_calculator.html">Доходность недвижимости</a></li>
                        <li><a href="/airbnb_calculator.html">Краткосрочная аренда</a></li>
                        <li><a href="/rent_vs_buy_calculator.html">Аренда vs Покупка</a></li>
                        <li><a href="/new_vs_secondary_calculator.html">Новостройка vs Вторичка</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Контакты</h4>
                    <div class="contact-info">
                        <a href="tel:+74951362818" class="phone">+7 495 136-28-18</a>
                        <a href="tel:+74952300021" class="phone">+7 495 230-00-21</a>
                    </div>
                    
                    <div class="social-links">
                        <a href="https://vk.com/metr_kvadratnyy" target="_blank" class="social-link vk">ВКонтакте</a>
                        <a href="https://t.me/metrkvadratny/" target="_blank" class="social-link telegram">Telegram</a>
                    </div>
                    
                    <div class="app-links">
                        <a href="https://apps.rustore.ru/app/ru.m2" target="_blank" class="app-link">RuStore</a>
                        <a href="https://apps.apple.com/ru/app/m2" target="_blank" class="app-link">App Store</a>
                        <a href="https://play.google.com/store/apps/details?id=ru.m2" target="_blank" class="app-link">Google Play</a>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <div class="footer-logo">
                    <a href="https://m2.ru/" target="_blank">
                        <span class="logo-icon">М2</span>
                        <span class="logo-text">Метр квадратный</span>
                    </a>
                </div>
                
                <div class="footer-links">
                    <a href="https://m2.ru/data-security/">Безопасность данных</a>
                    <a href="https://m2.ru/docs/clients/">Клиентские документы</a>
                    <a href="https://m2.ru/about/">О компании</a>
                    <a href="https://m2.ru/support/">Помощь</a>
                </div>
                
                <div class="footer-copy">
                    <p>© 2024 М2 — Метр квадратный. Все права защищены.</p>
                </div>
            </div>
        </div>
    </footer>`;
}

function createHeaderStyles() {
    return `
    <style id="m2-header-styles">
        .m2-header {
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .m2-header-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 70px;
        }

        .m2-logo a {
            display: flex;
            align-items: center;
            text-decoration: none;
            color: #3416b6;
        }

        .m2-logo .logo-icon {
            font-size: 28px;
            font-weight: 700;
            margin-right: 8px;
        }

        .m2-logo .logo-text {
            font-size: 14px;
            font-weight: 500;
            color: #666;
        }

        .m2-nav {
            display: flex;
            gap: 40px;
            align-items: center;
        }

        .nav-section {
            position: relative;
        }

        .nav-title {
            color: #211f2e;
            font-weight: 500;
            text-decoration: none;
            padding: 10px 0;
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
        }

        .nav-title:hover {
            color: #3416b6;
            border-bottom-color: #3416b6;
        }

        .nav-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            background: #fff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-radius: 8px;
            padding: 12px 0;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            min-width: 220px;
            z-index: 100;
        }

        .nav-section:hover .nav-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .nav-dropdown a {
            display: block;
            padding: 8px 20px;
            color: #211f2e;
            text-decoration: none;
            transition: background 0.2s ease;
        }

        .nav-dropdown a:hover {
            background: #f8f9fa;
            color: #3416b6;
        }

        .m2-contacts .phone-link {
            color: #3416b6;
            font-weight: 600;
            text-decoration: none;
            font-size: 16px;
        }

        .m2-contacts .phone-link:hover {
            color: #2610a0;
        }

        @media (max-width: 768px) {
            .m2-header-container {
                padding: 0 15px;
                height: 60px;
            }

            .m2-nav {
                display: none;
            }

            .m2-logo .logo-text {
                display: none;
            }

            .m2-contacts .phone-link {
                font-size: 14px;
            }
        }
    </style>`;
}

function createFooterStyles() {
    return `
    <style id="m2-footer-styles">
        .m2-footer {
            background: #211f2e;
            color: #fff;
            padding: 40px 0 20px;
            margin-top: 80px;
        }

        .m2-footer-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .footer-sections {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 40px;
            margin-bottom: 40px;
        }

        .footer-section h4 {
            color: #fff;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }

        .footer-section ul {
            list-style: none;
            padding: 0;
        }

        .footer-section li {
            margin-bottom: 12px;
        }

        .footer-section a {
            color: #b8b5c3;
            text-decoration: none;
            transition: color 0.2s ease;
        }

        .footer-section a:hover {
            color: #fff;
        }

        .contact-info {
            margin-bottom: 20px;
        }

        .contact-info .phone {
            display: block;
            color: #3416b6;
            font-weight: 600;
            text-decoration: none;
            margin-bottom: 8px;
            font-size: 16px;
        }

        .contact-info .phone:hover {
            color: #4726d6;
        }

        .social-links {
            margin-bottom: 20px;
        }

        .social-link {
            display: inline-block;
            margin-right: 15px;
            color: #b8b5c3;
            text-decoration: none;
            font-size: 14px;
        }

        .social-link:hover {
            color: #3416b6;
        }

        .app-links {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .app-link {
            color: #b8b5c3;
            text-decoration: none;
            font-size: 14px;
        }

        .app-link:hover {
            color: #fff;
        }

        .footer-bottom {
            border-top: 1px solid #3a3847;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }

        .footer-logo a {
            display: flex;
            align-items: center;
            text-decoration: none;
            color: #3416b6;
        }

        .footer-logo .logo-icon {
            font-size: 24px;
            font-weight: 700;
            margin-right: 8px;
        }

        .footer-logo .logo-text {
            font-size: 14px;
            color: #b8b5c3;
        }

        .footer-links {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        .footer-links a {
            color: #b8b5c3;
            text-decoration: none;
            font-size: 14px;
        }

        .footer-links a:hover {
            color: #fff;
        }

        .footer-copy p {
            color: #b8b5c3;
            font-size: 14px;
            margin: 0;
        }

        @media (max-width: 768px) {
            .footer-sections {
                grid-template-columns: 1fr;
                gap: 30px;
            }

            .footer-bottom {
                flex-direction: column;
                text-align: center;
                gap: 15px;
            }

            .footer-links {
                justify-content: center;
            }

            .m2-footer {
                padding: 30px 0 15px;
                margin-top: 40px;
            }
        }
    </style>`;
}

// Функция для инициализации header и footer
function initializeM2Components() {
    // Добавляем стили
    if (!document.getElementById('m2-header-styles')) {
        document.head.insertAdjacentHTML('beforeend', createHeaderStyles());
    }
    if (!document.getElementById('m2-footer-styles')) {
        document.head.insertAdjacentHTML('beforeend', createFooterStyles());
    }

    // Добавляем header в начало body
    const existingHeader = document.querySelector('.m2-header');
    if (!existingHeader) {
        document.body.insertAdjacentHTML('afterbegin', createHeader());
    }

    // Добавляем footer в конец body
    const existingFooter = document.querySelector('.m2-footer');
    if (!existingFooter) {
        document.body.insertAdjacentHTML('beforeend', createFooter());
    }
}

// Автоматическая инициализация при загрузке
document.addEventListener('DOMContentLoaded', initializeM2Components);

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        createHeader, 
        createFooter, 
        createHeaderStyles, 
        createFooterStyles, 
        initializeM2Components 
    };
}