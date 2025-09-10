// Универсальная система tooltips для калькуляторов недвижимости М2
// Использование: добавьте класс "tooltip" к элементу и атрибут data-tooltip="текст подсказки"

class TooltipSystem {
    constructor() {
        this.tooltips = new Map();
        this.currentTooltip = null;
        this.initializeTooltips();
        this.setupEventListeners();
    }

    // База знаний для терминов недвижимости
    getTooltipContent(term) {
        const tooltipDatabase = {
            'pdn': 'Показатель долговой нагрузки (ПДН) — отношение всех ежемесячных платежей по кредитам к доходу. Банки обычно одобряют кредиты при ПДН до 50%.',
            'mortgage-rate': 'Процентная ставка по ипотеке зависит от банка, программы кредитования, первоначального взноса и срока кредита. Текущие ставки: 12-18% годовых.',
            'down-payment': 'Первоначальный взнос — сумма, которую вы платите сразу при покупке. Минимум обычно 10-20% от стоимости недвижимости.',
            'monthly-income': 'Укажите ваш официальный ежемесячный доход (зарплата + другие постоянные доходы). Банки учитывают только подтвержденные доходы.',
            'monthly-expenses': 'Обязательные ежемесячные платежи: существующие кредиты, алименты, аренда жилья и др. Не включайте бытовые расходы.',
            'property-tax': 'Налог на недвижимость рассчитывается от кадастровой стоимости. Для жилых помещений ставка обычно 0.1-0.3% в год.',
            'income-tax': 'Подоходный налог с арендных доходов составляет 13% для резидентов РФ. При использовании налогового вычета может быть меньше.',
            'vacancy-rate': 'Процент времени, когда объект пустует без арендаторов. В среднем 5-10% в зависимости от региона и типа недвижимости.',
            'appreciation': 'Средний рост стоимости недвижимости в год. Исторически в России составляет 3-8% в зависимости от региона.',
            'management-fee': 'Плата управляющей компании за обслуживание недвижимости при сдаче в аренду. Обычно 5-10% от арендных доходов.',
            'cap-rate': 'Коэффициент капитализации — отношение чистого дохода к стоимости недвижимости. Показывает доходность без учета роста стоимости.',
            'gross-yield': 'Валовая доходность — отношение годового арендного дохода к стоимости недвижимости без учета расходов.',
            'net-yield': 'Чистая доходность — доходность с учетом всех расходов на содержание, налоги, управление и незанятость.',
            'payback-period': 'Срок окупаемости — время, за которое чистые доходы покроют первоначальные инвестиции.',
            'occupancy-rate': 'Загруженность — процент дней в году, когда объект занят гостями. Для Airbnb в среднем 50-70%.',
            'cleaning-fee': 'Плата за уборку после каждого гостя. В Москве обычно 1500-3000 рублей в зависимости от размера объекта.',
            'platform-commission': 'Комиссия платформы: Airbnb ~3%, Booking.com ~15%, Авито/Циан ~5%. Прямые бронирования без комиссии.',
            'seasonal-demand': 'Сезонность спроса влияет на загруженность и цены. Пик обычно май-сентябрь, спад январь-март.',
            'debt-service': 'Обслуживание долга — ежемесячные платежи по всем кредитам и займам, включая основной долг и проценты.',
            'debt-ratio': 'Соотношение долга к доходу — процент дохода, который тратится на выплату кредитов. Безопасный уровень до 40%.',
            'amortization': 'График погашения кредита, показывающий как меняется соотношение основного долга и процентов в платеже.',
            'prepayment': 'Досрочное погашение позволяет снизить переплату. Может быть частичным (уменьшение платежа/срока) или полным.',
            'ltv': 'Loan-to-Value — отношение суммы кредита к стоимости залога. Чем выше LTV, тем больше риск для банка.',
            'escrow': 'Эскроу-счет — специальный счет, где деньги покупателя блокируются до выполнения условий сделки.'
        };

        return tooltipDatabase[term] || null;
    }

    initializeTooltips() {
        // Инициализация элементов с tooltip
        document.addEventListener('DOMContentLoaded', () => {
            this.findAndSetupTooltips();
        });
    }

    findAndSetupTooltips() {
        // Поиск элементов с атрибутом data-tooltip
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            const tooltipTerm = element.getAttribute('data-tooltip-term');
            
            // Если указан термин, используем базу знаний
            const content = tooltipTerm ? this.getTooltipContent(tooltipTerm) : tooltipText;
            
            if (content) {
                this.setupTooltip(element, content);
            }
        });

        // Поиск элементов с классом tooltip-trigger
        const triggerElements = document.querySelectorAll('.tooltip-trigger');
        
        triggerElements.forEach(element => {
            const term = element.getAttribute('data-term');
            const content = this.getTooltipContent(term);
            
            if (content) {
                this.setupTooltip(element, content);
                // Добавляем визуальный индикатор
                element.style.borderBottom = '1px dashed #007bff';
                element.style.cursor = 'help';
            }
        });
    }

    setupTooltip(element, content) {
        element.addEventListener('mouseenter', (e) => {
            this.showTooltip(e.target, content);
        });

        element.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });

        // Поддержка мобильных устройств
        element.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                this.toggleTooltip(e.target, content);
            }
        });
    }

    showTooltip(element, content) {
        this.hideTooltip(); // Скрыть предыдущий tooltip

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.innerHTML = content;
        document.body.appendChild(tooltip);

        // Позиционирование
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 10;

        // Проверка выхода за границы экрана
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        if (top < 10) {
            top = rect.bottom + 10; // Показать снизу
            tooltip.classList.add('bottom');
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';

        // Анимация появления
        setTimeout(() => tooltip.classList.add('visible'), 10);

        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    toggleTooltip(element, content) {
        if (this.currentTooltip) {
            this.hideTooltip();
        } else {
            this.showTooltip(element, content);
        }
    }

    setupEventListeners() {
        // Скрытие tooltip при скролле
        window.addEventListener('scroll', () => {
            this.hideTooltip();
        });

        // Скрытие tooltip при изменении размера окна
        window.addEventListener('resize', () => {
            this.hideTooltip();
        });
    }

    // Метод для добавления нового tooltip программно
    addTooltip(element, content) {
        this.setupTooltip(element, content);
    }

    // Метод для обновления базы знаний
    updateTooltipDatabase(newTerms) {
        Object.assign(this.tooltipDatabase, newTerms);
    }
}

// CSS стили для tooltips (будут добавлены в head)
const tooltipStyles = `
<style id="tooltip-system-styles">
.tooltip-popup {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.4;
    max-width: 300px;
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
    transform: translateY(5px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tooltip-popup.visible {
    opacity: 1;
    transform: translateY(0);
}

.tooltip-popup.bottom::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-bottom-color: rgba(0, 0, 0, 0.9);
}

.tooltip-popup::before {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
}

.tooltip-trigger {
    position: relative;
}

.help-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: #007bff;
    color: white;
    border-radius: 50%;
    text-align: center;
    font-size: 12px;
    line-height: 16px;
    cursor: help;
    margin-left: 6px;
    vertical-align: middle;
}

.help-icon:hover {
    background: #0056b3;
}

@media (max-width: 768px) {
    .tooltip-popup {
        max-width: 250px;
        font-size: 13px;
        padding: 10px 14px;
    }
}
</style>
`;

// Инициализация системы tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем стили в head
    if (!document.getElementById('tooltip-system-styles')) {
        document.head.insertAdjacentHTML('beforeend', tooltipStyles);
    }
    
    // Создаем экземпляр системы tooltips
    window.tooltipSystem = new TooltipSystem();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TooltipSystem;
}