// Улучшенная система экспорта в PDF с поддержкой кириллицы
// Использует jsPDF с русскими шрифтами

class PDFExporter {
    constructor() {
        this.isLibraryLoaded = false;
        this.checkLibraryAvailability();
    }

    checkLibraryAvailability() {
        this.isLibraryLoaded = typeof window.jspdf !== 'undefined' || typeof window.jsPDF !== 'undefined';
        if (!this.isLibraryLoaded) {
            console.warn('jsPDF library not loaded');
            // Попытка динамической загрузки
            this.loadJsPDFLibrary();
        }
    }

    loadJsPDFLibrary() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            console.log('jsPDF loaded dynamically');
            this.isLibraryLoaded = true;
        };
        script.onerror = () => {
            console.error('Failed to load jsPDF library');
        };
        document.head.appendChild(script);
    }

    // Универсальный экспорт для любого калькулятора
    exportCalculatorToPDF(calculatorType, title, inputData, results, details = null) {
        if (!this.isLibraryLoaded) {
            this.showError('Библиотека PDF не загружена');
            return;
        }

        try {
            // Улучшенная проверка доступности jsPDF
            let jsPDF;
            if (window.jspdf && window.jspdf.jsPDF) {
                jsPDF = window.jspdf.jsPDF;
            } else if (window.jsPDF) {
                jsPDF = window.jsPDF;
            } else if (typeof jsPDF !== 'undefined') {
                // Глобальная переменная jsPDF
                jsPDF = window.jsPDF || jsPDF;
            } else {
                this.showError('Библиотека jsPDF не загружена. Попробуйте обновить страницу.');
                console.error('jsPDF not available. Available objects:', {
                    jspdf: typeof window.jspdf,
                    jsPDF: typeof window.jsPDF,
                    global_jsPDF: typeof jsPDF
                });
                return;
            }

            console.log('Creating PDF with jsPDF:', jsPDF);
            const doc = new jsPDF();

            // Настройка для кириллицы (fallback на Arial)
            this.setupCyrillicSupport(doc);

            // Заголовок
            this.addHeader(doc, title);

            // Параметры расчета
            this.addInputParameters(doc, inputData);

            // Основные результаты
            this.addResults(doc, results);

            // Детализация расчетов (если есть)
            if (details) {
                this.addCalculationDetails(doc, details);
            }

            // Футер
            this.addFooter(doc);

            // Сохранение файла
            const fileName = this.generateFileName(calculatorType, title);
            doc.save(fileName);

            this.showSuccess('PDF успешно сохранен');
        } catch (error) {
            console.error('PDF Export Error:', error);
            this.showError('Ошибка при создании PDF: ' + error.message);
        }
    }

    setupCyrillicSupport(doc) {
        // Устанавливаем Arial как основной шрифт (лучше поддерживает кириллицу)
        doc.setFont('Arial', 'normal');
        
        // Альтернативная стратегия: использование UTF-8 кодирования
        try {
            doc.setLanguage('ru');
        } catch (e) {
            // Игнорируем, если метод недоступен
        }
    }

    addHeader(doc, title) {
        const pageWidth = doc.internal.pageSize.width;
        
        // Логотип М2
        doc.setFontSize(24);
        doc.setFont('Arial', 'bold');
        doc.text('M2', 20, 25);
        
        // Заголовок
        doc.setFontSize(16);
        doc.setFont('Arial', 'bold');
        const titleText = this.prepareText(title);
        doc.text(titleText, 20, 40);
        
        // Линия разделитель
        doc.setLineWidth(0.5);
        doc.line(20, 50, pageWidth - 20, 50);
    }

    addInputParameters(doc, inputData) {
        let yPos = 65;
        
        doc.setFontSize(14);
        doc.setFont('Arial', 'bold');
        doc.text(this.prepareText('Параметры расчета:'), 20, yPos);
        
        yPos += 15;
        doc.setFontSize(11);
        doc.setFont('Arial', 'normal');
        
        Object.entries(inputData).forEach(([key, value]) => {
            const label = this.translateLabel(key);
            const formattedValue = this.formatValue(key, value);
            const text = `${label}: ${formattedValue}`;
            
            doc.text(this.prepareText(text), 25, yPos);
            yPos += 12;
            
            // Переход на новую страницу при необходимости
            if (yPos > 250) {
                doc.addPage();
                yPos = 30;
            }
        });
        
        return yPos + 10;
    }

    addResults(doc, results) {
        let yPos = this.findNextPosition(doc) || 150;
        
        doc.setFontSize(14);
        doc.setFont('Arial', 'bold');
        doc.text(this.prepareText('Результаты расчета:'), 20, yPos);
        
        yPos += 15;
        
        Object.entries(results).forEach(([key, value]) => {
            const label = this.translateLabel(key);
            const formattedValue = this.formatValue(key, value);
            
            // Основные результаты выделяем
            if (this.isMainResult(key)) {
                doc.setFontSize(13);
                doc.setFont('Arial', 'bold');
            } else {
                doc.setFontSize(11);
                doc.setFont('Arial', 'normal');
            }
            
            const text = `${label}: ${formattedValue}`;
            doc.text(this.prepareText(text), 25, yPos);
            yPos += 14;
            
            if (yPos > 250) {
                doc.addPage();
                yPos = 30;
            }
        });
        
        return yPos + 10;
    }

    addCalculationDetails(doc, details) {
        let yPos = this.findNextPosition(doc) || 200;
        
        // Проверяем, нужна ли новая страница
        if (yPos > 200) {
            doc.addPage();
            yPos = 30;
        }
        
        doc.setFontSize(14);
        doc.setFont('Arial', 'bold');
        doc.text(this.prepareText('Детализация расчетов:'), 20, yPos);
        yPos += 15;
        
        doc.setFontSize(10);
        doc.setFont('Arial', 'normal');
        
        details.forEach((step, index) => {
            const stepText = `${index + 1}. ${step.description}`;
            doc.text(this.prepareText(stepText), 25, yPos);
            yPos += 10;
            
            if (step.formula) {
                doc.setFont('Arial', 'italic');
                doc.text(this.prepareText(`   Формула: ${step.formula}`), 30, yPos);
                yPos += 8;
                doc.setFont('Arial', 'normal');
            }
            
            if (step.calculation) {
                doc.text(this.prepareText(`   Расчет: ${step.calculation}`), 30, yPos);
                yPos += 8;
            }
            
            if (step.result) {
                doc.setFont('Arial', 'bold');
                doc.text(this.prepareText(`   Результат: ${step.result}`), 30, yPos);
                yPos += 12;
                doc.setFont('Arial', 'normal');
            }
            
            if (yPos > 250) {
                doc.addPage();
                yPos = 30;
            }
        });
    }

    addFooter(doc) {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        
        // Линия разделитель
        doc.setLineWidth(0.5);
        doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
        
        // Текст футера
        doc.setFontSize(9);
        doc.setFont('Arial', 'normal');
        
        const footerText1 = this.prepareText('Документ создан с помощью М2 Платформы калькуляторов недвижимости');
        const footerText2 = this.prepareText(`Дата создания: ${new Date().toLocaleDateString('ru-RU')}`);
        
        doc.text(footerText1, 20, pageHeight - 20);
        doc.text(footerText2, 20, pageHeight - 10);
        
        // Номер страницы
        const pageNum = `Стр. ${doc.getCurrentPageInfo().pageNumber}`;
        doc.text(pageNum, pageWidth - 40, pageHeight - 10);
    }

    // Подготовка текста для корректного отображения кириллицы
    prepareText(text) {
        if (typeof text !== 'string') {
            text = String(text);
        }
        
        // Попытка исправить кодировку для кириллицы
        try {
            // Замена проблемных символов
            return text
                .replace(/[«»]/g, '"')
                .replace(/[–—]/g, '-')
                .replace(/№/g, 'No.')
                .replace(/…/g, '...')
                // Базовые символы валют
                .replace(/₽/g, 'руб.')
                .replace(/\$/g, 'USD')
                .replace(/€/g, 'EUR');
        } catch (e) {
            console.warn('Text preparation error:', e);
            return text;
        }
    }

    // Перевод ключей на русский
    translateLabel(key) {
        const translations = {
            // Общие параметры
            'propertyPrice': 'Стоимость недвижимости',
            'monthlyRent': 'Ежемесячная аренда',
            'monthlyExpenses': 'Ежемесячные расходы',
            'initialInvestment': 'Первоначальные инвестиции',
            'downPayment': 'Первоначальный взнос',
            'interestRate': 'Процентная ставка',
            'loanTerm': 'Срок кредита',
            
            // Результаты
            'grossYield': 'Валовая доходность',
            'netYield': 'Чистая доходность',
            'monthlyNetIncome': 'Чистый доход в месяц',
            'paybackPeriod': 'Срок окупаемости',
            'totalReturn': 'Общая доходность',
            'monthlyPayment': 'Ежемесячный платеж',
            'totalInterest': 'Переплата по кредиту',
            
            // Airbnb
            'dailyRate': 'Ставка за сутки',
            'occupancyRate': 'Загруженность',
            'cleaningFee': 'Плата за уборку',
            'platformCommission': 'Комиссия платформы',
            
            // Сравнение
            'newBuildPrice': 'Цена новостройки',
            'secondaryPrice': 'Цена вторички',
            'renovationCost': 'Стоимость ремонта'
        };
        
        return translations[key] || this.camelCaseToRussian(key);
    }

    // Преобразование camelCase в читаемый русский текст
    camelCaseToRussian(str) {
        return str
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase()
            .replace(/^\w/, c => c.toUpperCase());
    }

    // Форматирование значений
    formatValue(key, value) {
        if (typeof value === 'number') {
            // Денежные значения
            if (key.includes('Price') || key.includes('Income') || key.includes('Payment') || 
                key.includes('Cost') || key.includes('Fee') || key.includes('Expense')) {
                return new Intl.NumberFormat('ru-RU').format(Math.round(value)) + ' руб.';
            }
            
            // Проценты
            if (key.includes('Rate') || key.includes('Yield') || key.includes('percent') || 
                key.includes('Ratio') || value < 1 && value > 0) {
                return (value * 100).toFixed(1) + '%';
            }
            
            // Периоды времени
            if (key.includes('Period') || key.includes('Term')) {
                return value.toFixed(1) + ' лет';
            }
            
            // Обычные числа
            return new Intl.NumberFormat('ru-RU').format(value);
        }
        
        return String(value);
    }

    // Определение основных результатов для выделения
    isMainResult(key) {
        const mainResults = [
            'netYield', 'monthlyPayment', 'totalReturn', 
            'monthlyNetIncome', 'recommendation', 'result'
        ];
        return mainResults.some(result => key.includes(result));
    }

    // Поиск следующей позиции для размещения контента
    findNextPosition(doc) {
        // Простая логика определения позиции
        // В реальной реализации можно отслеживать текущую позицию
        return null;
    }

    // Генерация имени файла
    generateFileName(calculatorType, title) {
        const date = new Date().toISOString().slice(0, 10);
        const safeTitle = title
            .toLowerCase()
            .replace(/[^a-zа-яё0-9]/gi, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        return `m2-${calculatorType}-${safeTitle}-${date}.pdf`;
    }

    // Уведомления
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Создаем уведомление
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
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;

        notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Функции-помощники для различных типов калькуляторов

// Экспорт ипотечного калькулятора
function exportMortgageToPDF() {
    const exporter = new PDFExporter();
    
    const inputData = {
        propertyPrice: parseFloat(document.getElementById('propertyPrice')?.value) || 0,
        downPayment: parseFloat(document.getElementById('downPayment')?.value) || 0,
        interestRate: parseFloat(document.getElementById('interestRate')?.value) || 0,
        loanTerm: parseFloat(document.getElementById('loanTerm')?.value) || 0
    };

    // Calculate loan amount
    const loanAmount = inputData.propertyPrice - inputData.downPayment;

    const results = {
        loanAmount: loanAmount,
        monthlyPayment: parseFloat(document.getElementById('monthlyPayment')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        totalOverpayment: parseFloat(document.getElementById('totalOverpayment')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        totalAmount: parseFloat(document.getElementById('totalAmount')?.textContent?.replace(/[^\d.-]/g, '')) || 0
    };

    // Детализация расчетов
    const monthlyRate = inputData.interestRate / 12 / 100;
    const numberOfPayments = inputData.loanTerm * 12;
    
    const details = [
        {
            description: 'Расчет суммы кредита',
            formula: 'Сумма кредита = Стоимость недвижимости - Первоначальный взнос',
            calculation: `${inputData.propertyPrice.toLocaleString('ru-RU')} - ${inputData.downPayment.toLocaleString('ru-RU')}`,
            result: `${loanAmount.toLocaleString('ru-RU')} руб.`
        },
        {
            description: 'Расчет ежемесячного аннуитетного платежа',
            formula: 'ПМТ = S × [i × (1 + i)^n] / [(1 + i)^n - 1]',
            calculation: `S = ${loanAmount.toLocaleString('ru-RU')} руб., i = ${monthlyRate.toFixed(6)}, n = ${numberOfPayments}`,
            result: `${results.monthlyPayment.toLocaleString('ru-RU')} руб./мес`
        },
        {
            description: 'Расчет общей переплаты банку',
            formula: 'Переплата = (ПМТ × n) - S',
            calculation: `(${results.monthlyPayment.toLocaleString('ru-RU')} × ${numberOfPayments}) - ${loanAmount.toLocaleString('ru-RU')}`,
            result: `${results.totalOverpayment.toLocaleString('ru-RU')} руб.`
        },
        {
            description: 'Общая сумма выплат',
            formula: 'Общая сумма = Сумма кредита + Переплата',
            calculation: `${loanAmount.toLocaleString('ru-RU')} + ${results.totalOverpayment.toLocaleString('ru-RU')}`,
            result: `${results.totalAmount.toLocaleString('ru-RU')} руб.`
        }
    ];

    exporter.exportCalculatorToPDF(
        'mortgage',
        'Расчет ипотеки',
        inputData,
        results,
        details
    );
}

// Экспорт калькулятора доступности
function exportAffordabilityToPDF() {
    const exporter = new PDFExporter();
    
    const inputData = {
        monthlyIncome: parseFloat(document.getElementById('monthlyIncome')?.value) || 0,
        monthlyExpenses: parseFloat(document.getElementById('monthlyExpenses')?.value) || 0,
        interestRate: parseFloat(document.getElementById('interestRate')?.value) || 0,
        loanTerm: parseFloat(document.getElementById('loanTerm')?.value) || 0
    };

    const results = {
        maxLoanAmount: parseFloat(document.getElementById('maxLoanAmount')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        maxPropertyPrice: parseFloat(document.getElementById('maxPropertyPrice')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        debtRatio: parseFloat(document.getElementById('debtRatioValue')?.textContent?.replace(/[^\d.-]/g, '')) || 0
    };

    const details = [
        {
            description: 'Расчет максимального ежемесячного платежа',
            formula: 'Макс. платеж = (Доход - Расходы) × 0.5',
            calculation: `(${inputData.monthlyIncome.toLocaleString('ru-RU')} - ${inputData.monthlyExpenses.toLocaleString('ru-RU')}) × 0.5`,
            result: `${((inputData.monthlyIncome - inputData.monthlyExpenses) * 0.5).toLocaleString('ru-RU')} руб./мес`
        }
    ];

    exporter.exportCalculatorToPDF(
        'affordability',
        'Расчет доступности жилья',
        inputData,
        results,
        details
    );
}

// Экспорт калькулятора доходности
function exportProfitabilityToPDF() {
    const exporter = new PDFExporter();
    
    const inputData = {
        propertyPrice: parseFloat(document.getElementById('propertyPrice')?.value) || 0,
        monthlyRent: parseFloat(document.getElementById('monthlyRent')?.value) || 0,
        monthlyExpenses: parseFloat(document.getElementById('monthlyExpenses')?.value) || 0
    };

    const results = {
        grossYield: parseFloat(document.getElementById('grossYield')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        netYield: parseFloat(document.getElementById('netYield')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        monthlyNetIncome: parseFloat(document.getElementById('monthlyNetIncome')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        paybackPeriod: parseFloat(document.getElementById('paybackPeriod')?.textContent?.replace(/[^\d.-]/g, '')) || 0
    };

    const details = [
        {
            description: 'Расчет валовой доходности',
            formula: 'Валовая доходность = (Годовая аренда / Стоимость объекта) × 100%',
            calculation: `(${inputData.monthlyRent * 12} / ${inputData.propertyPrice}) × 100%`,
            result: `${results.grossYield}%`
        },
        {
            description: 'Расчет чистой доходности',
            formula: 'Чистая доходность = ((Аренда - Расходы) × 12 / Стоимость) × 100%',
            calculation: `((${inputData.monthlyRent} - ${inputData.monthlyExpenses}) × 12 / ${inputData.propertyPrice}) × 100%`,
            result: `${results.netYield}%`
        }
    ];

    exporter.exportCalculatorToPDF(
        'profitability', 
        'Расчет доходности недвижимости',
        inputData,
        results,
        details
    );
}

// Экспорт Airbnb калькулятора
function exportAirbnbToPDF() {
    const exporter = new PDFExporter();
    
    const inputData = {
        propertyPrice: parseFloat(document.getElementById('propertyPrice')?.value) || 0,
        dailyRate: parseFloat(document.getElementById('dailyRate')?.value) || 0,
        occupancyRate: parseFloat(document.getElementById('occupancyRate')?.value) || 0,
        operatingExpenses: parseFloat(document.getElementById('operatingExpenses')?.value) || 0
    };

    const results = {
        monthlyIncome: parseFloat(document.getElementById('monthlyIncome')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        netProfit: parseFloat(document.getElementById('netProfit')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        annualYield: parseFloat(document.getElementById('annualYield')?.textContent?.replace(/[^\d.-]/g, '')) || 0
    };

    exporter.exportCalculatorToPDF(
        'airbnb',
        'Расчет доходности краткосрочной аренды',
        inputData,
        results
    );
}

// Экспорт сравнения Аренда vs Покупка
function exportRentVsBuyToPDF() {
    const exporter = new PDFExporter();
    
    const inputData = {
        propertyPrice: parseFloat(document.getElementById('propertyPrice')?.value) || 0,
        monthlyRent: parseFloat(document.getElementById('monthlyRent')?.value) || 0,
        downPayment: parseFloat(document.getElementById('downPayment')?.value) || 0,
        interestRate: parseFloat(document.getElementById('interestRate')?.value) || 0,
        loanTerm: parseFloat(document.getElementById('loanTerm')?.value) || 0,
        comparisonPeriod: parseFloat(document.getElementById('comparisonPeriod')?.value) || 0
    };

    const results = {
        rentTotalCost: parseFloat(document.getElementById('rentTotalCost')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        buyTotalCost: parseFloat(document.getElementById('buyTotalCost')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        difference: parseFloat(document.getElementById('costDifference')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        recommendation: document.getElementById('recommendation')?.textContent || ''
    };

    const details = [
        {
            description: 'Расчет общей стоимости аренды',
            formula: 'Общая стоимость аренды = Месячная аренда × 12 × Период сравнения',
            calculation: `${inputData.monthlyRent.toLocaleString('ru-RU')} × 12 × ${inputData.comparisonPeriod}`,
            result: `${results.rentTotalCost.toLocaleString('ru-RU')} руб.`
        },
        {
            description: 'Расчет общей стоимости покупки',
            formula: 'Общая стоимость = Первый взнос + Общие выплаты по кредиту + Содержание',
            calculation: `Включает ипотечные платежи, налоги, обслуживание за ${inputData.comparisonPeriod} лет`,
            result: `${results.buyTotalCost.toLocaleString('ru-RU')} руб.`
        },
        {
            description: 'Разница в стоимости',
            formula: 'Разница = |Стоимость покупки - Стоимость аренды|',
            calculation: `|${results.buyTotalCost.toLocaleString('ru-RU')} - ${results.rentTotalCost.toLocaleString('ru-RU')}|`,
            result: `${results.difference.toLocaleString('ru-RU')} руб.`
        }
    ];

    exporter.exportCalculatorToPDF(
        'rent-vs-buy',
        'Сравнение: Аренда vs Покупка',
        inputData,
        results,
        details
    );
}

// Экспорт сравнения Новостройка vs Вторичка
function exportNewVsSecondaryToPDF() {
    const exporter = new PDFExporter();
    
    const inputData = {
        newBuildPrice: parseFloat(document.getElementById('newBuildPrice')?.value) || 0,
        secondaryPrice: parseFloat(document.getElementById('secondaryPrice')?.value) || 0,
        newBuildRenovation: parseFloat(document.getElementById('newBuildRenovation')?.value) || 0,
        secondaryRenovation: parseFloat(document.getElementById('secondaryRenovation')?.value) || 0
    };

    const results = {
        newBuildTotal: parseFloat(document.getElementById('newBuildTotal')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        secondaryTotal: parseFloat(document.getElementById('secondaryTotal')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        difference: parseFloat(document.getElementById('priceDifference')?.textContent?.replace(/[^\d.-]/g, '')) || 0,
        recommendation: document.getElementById('comparisonResult')?.textContent || ''
    };

    const details = [
        {
            description: 'Общая стоимость новостройки',
            formula: 'Общая стоимость = Цена + Ремонт + Дополнительные расходы',
            calculation: `${inputData.newBuildPrice.toLocaleString('ru-RU')} + ${inputData.newBuildRenovation.toLocaleString('ru-RU')}`,
            result: `${results.newBuildTotal.toLocaleString('ru-RU')} руб.`
        },
        {
            description: 'Общая стоимость вторички',
            formula: 'Общая стоимость = Цена + Ремонт + Дополнительные расходы',
            calculation: `${inputData.secondaryPrice.toLocaleString('ru-RU')} + ${inputData.secondaryRenovation.toLocaleString('ru-RU')}`,
            result: `${results.secondaryTotal.toLocaleString('ru-RU')} руб.`
        }
    ];

    exporter.exportCalculatorToPDF(
        'new-vs-secondary',
        'Сравнение: Новостройка vs Вторичка',
        inputData,
        results,
        details
    );
}

// Глобальная функция для легкого использования
function exportToPDF() {
    // Определяем тип калькулятора по URL или заголовку
    const path = window.location.pathname;
    const title = document.title;
    
    if (path.includes('mortgage') || title.includes('ипотек')) {
        exportMortgageToPDF();
    } else if (path.includes('affordability') || title.includes('доступность')) {
        exportAffordabilityToPDF();
    } else if (path.includes('rental') || path.includes('profitability') || title.includes('доходность')) {
        exportProfitabilityToPDF();
    } else if (path.includes('airbnb')) {
        exportAirbnbToPDF();
    } else if (path.includes('rent_vs_buy') || title.includes('Аренда vs Покупка')) {
        exportRentVsBuyToPDF();
    } else if (path.includes('new_vs_secondary') || title.includes('Новостройка vs')) {
        exportNewVsSecondaryToPDF();
    } else {
        // Универсальный экспорт
        const exporter = new PDFExporter();
        exporter.showError('Автоматическое определение типа калькулятора не удалось');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем доступность jsPDF
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        console.warn('jsPDF library not loaded. PDF export may not work properly.');
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PDFExporter, exportToPDF };
}