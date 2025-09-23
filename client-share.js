/**
 * Модуль для отправки результатов расчетов клиентам
 * Позволяет агентам по недвижимости отправлять результаты расчетов своим клиентам
 */

// Инициализация модуля отправки результатов
function initClientShare() {
    // Добавляем кнопку "Отправить клиенту" на страницу
    addShareButton();
    
    // Добавляем модальное окно для отправки результатов
    addShareModal();
    
    // Инициализируем обработчики событий
    initEventListeners();
}

// Добавление кнопки "Отправить клиенту"
function addShareButton() {
    const actionButtons = document.querySelector('.action-buttons');
    if (!actionButtons) return;
    
    // Проверяем, не добавлена ли уже кнопка
    if (!document.getElementById('share-btn')) {
        const shareButton = document.createElement('button');
        shareButton.id = 'share-btn';
        shareButton.className = 'btn-secondary share-btn';
        shareButton.innerHTML = '<span class="icon">📤</span> Отправить клиенту';
        actionButtons.appendChild(shareButton);
    }
}

// Добавление модального окна для отправки результатов
function addShareModal() {
    // Проверяем, не добавлено ли уже модальное окно
    if (document.getElementById('share-modal')) return;
    
    const modalHTML = `
    <div id="share-modal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Отправить расчет клиенту</h3>
            <div class="input-group">
                <label class="input-label">Имя клиента</label>
                <input type="text" id="client-name" class="input-field" placeholder="Введите имя клиента">
            </div>
            <div class="input-group">
                <label class="input-label">Email клиента</label>
                <input type="email" id="client-email" class="input-field" placeholder="Введите email клиента">
            </div>
            <div class="input-group">
                <label class="input-label">Телефон клиента</label>
                <input type="tel" id="client-phone" class="input-field" placeholder="Введите телефон клиента">
            </div>
            <div class="input-group">
                <label class="input-label">Комментарий</label>
                <textarea id="client-comment" class="input-field" placeholder="Добавьте комментарий к расчету"></textarea>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="add-m2-link" checked>
                <label for="add-m2-link">Добавить ссылку на расчет ставок от М2</label>
            </div>
            <button id="send-to-client-btn" class="btn-primary">Отправить</button>
        </div>
    </div>`;
    
    // Добавляем модальное окно в конец body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Добавляем стили для модального окна
    addModalStyles();
}

// Добавление стилей для модального окна
function addModalStyles() {
    // Проверяем, не добавлены ли уже стили
    if (document.getElementById('share-modal-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'share-modal-styles';
    styleElement.textContent = `
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            overflow: auto;
            animation: fadeIn 0.3s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .modal-content {
            background-color: #fff;
            margin: 10% auto;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            width: 90%;
            max-width: 500px;
            position: relative;
            animation: slideIn 0.3s;
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .close-modal {
            position: absolute;
            right: 20px;
            top: 15px;
            font-size: 28px;
            font-weight: bold;
            color: #aaa;
            cursor: pointer;
            transition: color 0.3s;
        }
        
        .close-modal:hover {
            color: #333;
        }
        
        .share-btn {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .checkbox-group {
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        #send-to-client-btn {
            width: 100%;
            margin-top: 20px;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Инициализация обработчиков событий
function initEventListeners() {
    // Открытие модального окна при клике на кнопку "Отправить клиенту"
    const shareBtn = document.getElementById('share-btn');
    const modal = document.getElementById('share-modal');
    const closeModal = document.querySelector('.close-modal');
    const sendToClientBtn = document.getElementById('send-to-client-btn');
    
    if (shareBtn && modal) {
        shareBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }
    
    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Закрытие модального окна при клике вне его области
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Отправка результатов клиенту
    if (sendToClientBtn) {
        sendToClientBtn.addEventListener('click', sendResultsToClient);
    }
}

// Функция отправки результатов клиенту
function sendResultsToClient() {
    const clientName = document.getElementById('client-name').value;
    const clientEmail = document.getElementById('client-email').value;
    const clientPhone = document.getElementById('client-phone').value;
    const clientComment = document.getElementById('client-comment').value;
    const addM2Link = document.getElementById('add-m2-link').checked;
    
    // Валидация данных
    if (!clientName || !clientEmail) {
        showNotification('Пожалуйста, заполните обязательные поля', 'error');
        return;
    }
    
    // Получение результатов расчета
    const calculationResults = getCalculationResults();
    
    // Имитация отправки данных (в реальном проекте здесь будет API-запрос)
    showNotification('Отправка результатов...', 'info');
    
    // Имитация успешной отправки
    setTimeout(() => {
        showNotification('Результаты успешно отправлены клиенту!', 'success');
        document.getElementById('share-modal').style.display = 'none';
        
        // Сохраняем информацию о клиенте для будущих расчетов
        saveClientInfo(clientName, clientEmail, clientPhone);
        
        // Логирование события для аналитики
        logShareEvent(clientEmail, calculationResults);
    }, 1500);
}

// Получение результатов расчета
function getCalculationResults() {
    // Получаем данные из результатов расчета
    const results = {};
    
    // Определяем тип калькулятора
    const calculatorType = document.title.includes('Ипотечный') ? 'mortgage' : 
                          document.title.includes('Доходность') ? 'rental' : 'other';
    
    // Собираем данные в зависимости от типа калькулятора
    if (calculatorType === 'mortgage') {
        const monthlyPayment = document.querySelector('.result-value.monthly-payment')?.textContent;
        const totalPayment = document.querySelector('.result-value.total-payment')?.textContent;
        const overpayment = document.querySelector('.result-value.overpayment')?.textContent;
        
        if (monthlyPayment) results.monthlyPayment = monthlyPayment;
        if (totalPayment) results.totalPayment = totalPayment;
        if (overpayment) results.overpayment = overpayment;
    } else if (calculatorType === 'rental') {
        const yield = document.querySelector('.result-value.yield')?.textContent;
        const roi = document.querySelector('.result-value.roi')?.textContent;
        
        if (yield) results.yield = yield;
        if (roi) results.roi = roi;
    }
    
    // Добавляем общие данные
    results.calculatorType = calculatorType;
    results.timestamp = new Date().toISOString();
    
    return results;
}

// Сохранение информации о клиенте
function saveClientInfo(name, email, phone) {
    try {
        const clientsData = JSON.parse(localStorage.getItem('m2-clients')) || [];
        
        // Проверяем, есть ли уже такой клиент
        const existingClientIndex = clientsData.findIndex(client => client.email === email);
        
        if (existingClientIndex >= 0) {
            // Обновляем данные существующего клиента
            clientsData[existingClientIndex] = {
                name,
                email,
                phone,
                lastContact: new Date().toISOString()
            };
        } else {
            // Добавляем нового клиента
            clientsData.push({
                name,
                email,
                phone,
                firstContact: new Date().toISOString(),
                lastContact: new Date().toISOString()
            });
        }
        
        localStorage.setItem('m2-clients', JSON.stringify(clientsData));
    } catch (error) {
        console.error('Ошибка при сохранении данных клиента:', error);
    }
}

// Логирование события отправки для аналитики
function logShareEvent(clientEmail, results) {
    if (typeof trackEvent === 'function') {
        trackEvent('share_calculation', {
            calculator_type: results.calculatorType,
            client_email_domain: clientEmail.split('@')[1],
            timestamp: new Date().toISOString()
        });
    }
}

// Показ уведомления
function showNotification(message, type = 'info') {
    // Проверяем, существует ли контейнер для уведомлений
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
        `;
        document.body.appendChild(notificationContainer);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    
    // Стили для уведомления
    notification.style.cssText = `
        background-color: ${type === 'error' ? '#ff5252' : type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s, fadeOut 0.5s 3s forwards;
        max-width: 300px;
    `;
    
    // Добавляем стили для анимаций, если их еще нет
    if (!document.getElementById('notification-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'notification-styles';
        styleElement.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Добавляем уведомление в контейнер
    notificationContainer.appendChild(notification);
    
    // Удаляем уведомление через 3.5 секунды
    setTimeout(() => {
        notification.remove();
    }, 3500);
}

// Автоматически инициализируем модуль при загрузке страницы
document.addEventListener('DOMContentLoaded', initClientShare);

// Экспортируем функции для использования в других модулях
window.clientShare = {
    init: initClientShare,
    sendResults: sendResultsToClient,
    showNotification: showNotification
};