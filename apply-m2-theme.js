/**
 * Скрипт для быстрого применения стилей m2.ru ко всем калькуляторам
 */
(function() {
    // Добавляем ссылку на CSS, если её ещё нет
    if (!document.querySelector('link[href="m2-theme.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'm2-theme.css';
        document.head.appendChild(link);
    }

    // Обновляем цвет фона страницы
    document.body.style.backgroundColor = 'var(--m2-purple-bg)';

    // Обновляем цвет темы
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.content = '#6a4dff';
    }

    // Добавляем класс для применения стилей
    document.body.classList.add('m2-theme');

    // Создаем хедер в стиле m2.ru, если его нет
    if (!document.querySelector('.m2-header')) {
        const header = document.createElement('header');
        header.className = 'm2-header';
        header.style.backgroundColor = 'var(--m2-purple-bg)';
        header.style.padding = '16px 0';
        header.style.marginBottom = '20px';
        
        const headerContent = document.createElement('div');
        headerContent.className = 'm2-header-content';
        headerContent.style.maxWidth = '1200px';
        headerContent.style.margin = '0 auto';
        headerContent.style.padding = '0 20px';
        headerContent.style.display = 'flex';
        headerContent.style.justifyContent = 'space-between';
        headerContent.style.alignItems = 'center';
        
        const logo = document.createElement('a');
        logo.href = '/';
        logo.className = 'm2-logo';
        logo.innerHTML = '<strong>M2</strong>';
        logo.style.fontSize = '28px';
        logo.style.fontWeight = '700';
        logo.style.color = 'var(--m2-purple)';
        logo.style.textDecoration = 'none';
        
        headerContent.appendChild(logo);
        header.appendChild(headerContent);
        
        // Вставляем хедер в начало body
        document.body.insertBefore(header, document.body.firstChild);
    }

    // Обновляем стили контейнеров калькуляторов
    const calculatorContainers = document.querySelectorAll('.calculator-container, .calculator, .main-calculator, .calculator-section');
    calculatorContainers.forEach(container => {
        container.style.backgroundColor = 'var(--m2-white)';
        container.style.borderRadius = '12px';
        container.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
        container.style.padding = '24px';
        container.style.marginBottom = '24px';
    });

    console.log('M2 Theme applied successfully!');
})();