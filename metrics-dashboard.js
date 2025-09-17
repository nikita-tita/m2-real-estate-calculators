/**
 * M2 Calculators Metrics Dashboard
 * Интерактивная панель для просмотра метрик и аналитики
 */

class MetricsDashboard {
    constructor() {
        this.isVisible = false;
        this.refreshInterval = null;
        this.charts = {};

        this.init();
    }

    init() {
        this.createDashboard();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    createDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'metrics-dashboard';
        dashboard.className = 'metrics-dashboard hidden';
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <div class="dashboard-title">
                    <span class="dashboard-icon">📊</span>
                    M2 Analytics Dashboard
                </div>
                <div class="dashboard-controls">
                    <button class="refresh-btn" title="Обновить данные">🔄</button>
                    <button class="export-btn" title="Экспорт данных">💾</button>
                    <button class="close-btn" title="Закрыть">✕</button>
                </div>
            </div>

            <div class="dashboard-content">
                <div class="metrics-grid">
                    <div class="metric-card visitor-info">
                        <div class="metric-header">
                            <span class="metric-icon">👥</span>
                            <h3>Посетители</h3>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="unique-visitors">0</div>
                            <div class="metric-details">
                                <div>Сегодня: <span id="today-visitors">0</span></div>
                                <div>Возвратов: <span id="visitor-returns">0</span></div>
                                <div>Статус: <span id="visitor-status">Новый</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card session-info">
                        <div class="metric-header">
                            <span class="metric-icon">⏱️</span>
                            <h3>Сессия</h3>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="session-duration">0s</div>
                            <div class="metric-details">
                                <div>События: <span id="total-events">0</span></div>
                                <div>Калькуляции: <span id="total-calculations">0</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card performance-info">
                        <div class="metric-header">
                            <span class="metric-icon">⚡</span>
                            <h3>Производительность</h3>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="page-load-time">0ms</div>
                            <div class="metric-details">
                                <div>Память: <span id="memory-usage">0MB</span></div>
                                <div>Ошибки: <span id="error-count">0</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-card features-info">
                        <div class="metric-header">
                            <span class="metric-icon">🎛️</span>
                            <h3>Использование функций</h3>
                        </div>
                        <div class="metric-content">
                            <div id="features-list"></div>
                        </div>
                    </div>

                    <div class="metric-card heatmap-preview">
                        <div class="metric-header">
                            <span class="metric-icon">🔥</span>
                            <h3>Тепловая карта кликов</h3>
                        </div>
                        <div class="metric-content">
                            <canvas id="heatmap-canvas" width="300" height="200"></canvas>
                        </div>
                    </div>
                </div>

                <div class="charts-section">
                    <div class="chart-container">
                        <h3>📈 График активности</h3>
                        <canvas id="activity-chart"></canvas>
                    </div>

                    <div class="chart-container">
                        <h3>📊 Популярность параметров</h3>
                        <div id="parameters-chart"></div>
                    </div>
                </div>

                <div class="detailed-metrics">
                    <div class="metrics-table">
                        <h3>📋 Детальные события</h3>
                        <div class="table-container">
                            <table id="events-table">
                                <thead>
                                    <tr>
                                        <th>Время</th>
                                        <th>Тип</th>
                                        <th>Элемент</th>
                                        <th>Детали</th>
                                    </tr>
                                </thead>
                                <tbody id="events-tbody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dashboard);
        this.injectStyles();
    }

    setupEventListeners() {
        const dashboard = document.getElementById('metrics-dashboard');

        // Кнопки управления
        dashboard.querySelector('.close-btn').addEventListener('click', () => {
            this.hide();
        });

        dashboard.querySelector('.refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });

        dashboard.querySelector('.export-btn').addEventListener('click', () => {
            this.exportData();
        });

        // Клик вне дашборда для закрытия
        dashboard.addEventListener('click', (event) => {
            if (event.target === dashboard) {
                this.hide();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Alt+D для открытия дашборда
            if (event.ctrlKey && event.altKey && event.key === 'd') {
                event.preventDefault();
                this.toggle();
            }

            // Escape для закрытия
            if (event.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    show() {
        const dashboard = document.getElementById('metrics-dashboard');
        dashboard.classList.remove('hidden');
        this.isVisible = true;

        this.refreshData();
        this.startAutoRefresh();
    }

    hide() {
        const dashboard = document.getElementById('metrics-dashboard');
        dashboard.classList.add('hidden');
        this.isVisible = false;

        this.stopAutoRefresh();
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 5000); // обновляем каждые 5 секунд
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    refreshData() {
        if (!window.M2Analytics) return;

        const metrics = window.M2Analytics.getMetrics();
        const heatmapData = window.M2Analytics.getHeatmapData();
        const parameterUsage = window.M2Analytics.getParameterUsage();

        this.updateMetricCards(metrics);
        this.updateHeatmapPreview(heatmapData);
        this.updateParametersChart(parameterUsage);
        this.updateActivityChart();
        this.updateEventsTable();
    }

    updateMetricCards(metrics) {
        // Данные посетителей
        if (metrics.visitors) {
            document.getElementById('unique-visitors').textContent = metrics.visitors.uniqueVisitors.toLocaleString();
            document.getElementById('today-visitors').textContent = metrics.visitors.todayVisitors;
            document.getElementById('visitor-returns').textContent = metrics.visitors.visitCount;
            document.getElementById('visitor-status').textContent = metrics.visitors.isNewVisitor ? 'Новый' : 'Возвращается';
        }

        // Время сессии
        const duration = Math.floor(metrics.sessionDuration / 1000);
        document.getElementById('session-duration').textContent = this.formatDuration(duration);

        // События и калькуляции
        document.getElementById('total-events').textContent = window.M2Analytics.events.length;
        document.getElementById('total-calculations').textContent = metrics.calculations;

        // Производительность
        if (window.M2Analytics.performanceMetrics.pageLoad) {
            const loadTime = window.M2Analytics.performanceMetrics.pageLoad.totalTime;
            document.getElementById('page-load-time').textContent = Math.round(loadTime) + 'ms';
        }

        // Память
        if (window.M2Analytics.performanceMetrics.memory) {
            const memoryMB = Math.round(window.M2Analytics.performanceMetrics.memory.used / 1024 / 1024);
            document.getElementById('memory-usage').textContent = memoryMB + 'MB';
        }

        // Ошибки
        document.getElementById('error-count').textContent = metrics.errors;

        // Использованные функции
        const featuresContainer = document.getElementById('features-list');
        featuresContainer.innerHTML = '';

        metrics.featuresUsed.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            featureItem.innerHTML = `
                <span class="feature-name">${feature}</span>
                <span class="feature-badge">✓</span>
            `;
            featuresContainer.appendChild(featureItem);
        });
    }

    updateHeatmapPreview(heatmapData) {
        const canvas = document.getElementById('heatmap-canvas');
        const ctx = canvas.getContext('2d');

        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Рисуем тепловую карту
        Object.entries(heatmapData).forEach(([position, intensity]) => {
            const [x, y] = position.split(',').map(Number);

            // Масштабируем координаты под размер превью
            const scaledX = (x / window.innerWidth) * canvas.width;
            const scaledY = (y / window.innerHeight) * canvas.height;

            // Интенсивность определяет размер и прозрачность
            const size = Math.min(intensity * 2 + 5, 20);
            const alpha = Math.min(intensity * 0.1, 0.8);

            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(scaledX, scaledY, size, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    updateParametersChart(parameterUsage) {
        const container = document.getElementById('parameters-chart');
        container.innerHTML = '';

        const sortedParams = Object.entries(parameterUsage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10); // Топ 10 параметров

        const maxUsage = Math.max(...Object.values(parameterUsage));

        sortedParams.forEach(([param, usage]) => {
            const bar = document.createElement('div');
            bar.className = 'parameter-bar';

            const width = (usage / maxUsage) * 100;
            bar.innerHTML = `
                <div class="parameter-label">${param}</div>
                <div class="parameter-value-bar">
                    <div class="parameter-fill" style="width: ${width}%"></div>
                    <span class="parameter-count">${usage}</span>
                </div>
            `;

            container.appendChild(bar);
        });
    }

    updateActivityChart() {
        // Простой график активности (без внешних библиотек)
        const canvas = document.getElementById('activity-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 200;

        // Получаем данные активности за последний час
        const now = Date.now();
        const hourAgo = now - 60 * 60 * 1000;
        const events = window.M2Analytics.events.filter(e => e.timestamp >= hourAgo);

        // Группируем по минутам
        const activityByMinute = {};
        for (let i = 0; i < 60; i++) {
            const minute = hourAgo + i * 60 * 1000;
            activityByMinute[i] = events.filter(e =>
                e.timestamp >= minute && e.timestamp < minute + 60 * 1000
            ).length;
        }

        // Рисуем график
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;

        const maxActivity = Math.max(...Object.values(activityByMinute), 1);
        const stepX = canvas.width / 60;
        const stepY = canvas.height / maxActivity;

        ctx.beginPath();
        Object.entries(activityByMinute).forEach(([minute, activity], index) => {
            const x = index * stepX;
            const y = canvas.height - (activity * stepY);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    }

    updateEventsTable() {
        const tbody = document.getElementById('events-tbody');
        tbody.innerHTML = '';

        // Показываем последние 20 событий
        const recentEvents = window.M2Analytics.events.slice(-20).reverse();

        recentEvents.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatTime(event.timestamp)}</td>
                <td><span class="event-type-badge event-${event.type}">${event.type}</span></td>
                <td>${this.getEventElement(event)}</td>
                <td>${this.getEventDetails(event)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    async exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            metrics: window.M2Analytics.getMetrics(),
            heatmap: window.M2Analytics.getHeatmapData(),
            parameters: window.M2Analytics.getParameterUsage(),
            events: window.M2Analytics.events,
            session: {
                id: window.M2Analytics.sessionId,
                userId: window.M2Analytics.userId,
                startTime: window.M2Analytics.startTime,
                userAgent: navigator.userAgent,
                url: window.location.href
            }
        };

        // Создаем и скачиваем JSON файл
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `m2-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Утилиты форматирования
    formatDuration(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }

    getEventElement(event) {
        if (!event.element) return '-';
        return event.element.tagName + (event.element.id ? `#${event.element.id}` : '') +
            (event.element.className ? `.${event.element.className.split(' ')[0]}` : '');
    }

    getEventDetails(event) {
        switch (event.type) {
            case 'click':
                return `(${event.coordinates?.x}, ${event.coordinates?.y})`;
            case 'input':
                return `Length: ${event.valueLength || 0}`;
            case 'calculation':
                return event.calculatorType || 'Unknown';
            case 'error':
                return event.message?.substring(0, 50) + '...' || 'Unknown error';
            default:
                return '-';
        }
    }

    injectStyles() {
        if (document.querySelector('#metrics-dashboard-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'metrics-dashboard-styles';
        styles.textContent = `
            .metrics-dashboard {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }

            .metrics-dashboard.hidden {
                display: none;
            }

            .dashboard-content {
                background: white;
                border-radius: 15px;
                width: 95%;
                max-width: 1400px;
                height: 90%;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }

            .dashboard-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .dashboard-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 20px;
                font-weight: bold;
            }

            .dashboard-icon {
                font-size: 24px;
            }

            .dashboard-controls {
                display: flex;
                gap: 10px;
            }

            .dashboard-controls button {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }

            .dashboard-controls button:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .dashboard-content {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .metric-card {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                border-left: 4px solid #007bff;
            }

            .metric-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 15px;
            }

            .metric-header h3 {
                margin: 0;
                font-size: 16px;
                color: #333;
            }

            .metric-icon {
                font-size: 20px;
            }

            .metric-value {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }

            .metric-details {
                font-size: 14px;
                color: #666;
            }

            .metric-details div {
                margin: 5px 0;
            }

            .feature-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px 0;
                border-bottom: 1px solid #eee;
            }

            .feature-badge {
                color: green;
                font-size: 12px;
            }

            .charts-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }

            .chart-container {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
            }

            .chart-container h3 {
                margin: 0 0 15px 0;
                font-size: 16px;
                color: #333;
            }

            .parameter-bar {
                margin-bottom: 10px;
            }

            .parameter-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 3px;
            }

            .parameter-value-bar {
                position: relative;
                background: #e9ecef;
                height: 20px;
                border-radius: 10px;
                overflow: hidden;
            }

            .parameter-fill {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 100%;
                transition: width 0.3s ease;
            }

            .parameter-count {
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 12px;
                color: #333;
                font-weight: bold;
            }

            .metrics-table {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
            }

            .metrics-table h3 {
                margin: 0 0 15px 0;
                font-size: 16px;
                color: #333;
            }

            .table-container {
                max-height: 300px;
                overflow-y: auto;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }

            th {
                background: #e9ecef;
                padding: 10px;
                text-align: left;
                font-weight: 600;
                color: #333;
                position: sticky;
                top: 0;
            }

            td {
                padding: 8px 10px;
                border-bottom: 1px solid #eee;
            }

            .event-type-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
            }

            .event-click { background: #e3f2fd; color: #1976d2; }
            .event-input { background: #f3e5f5; color: #7b1fa2; }
            .event-calculation { background: #e8f5e8; color: #388e3c; }
            .event-error { background: #ffebee; color: #d32f2f; }
            .event-scroll { background: #fff3e0; color: #f57c00; }

            #heatmap-canvas {
                width: 100%;
                height: 150px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }

            #activity-chart {
                width: 100%;
                height: 150px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }

            @media (max-width: 768px) {
                .charts-section {
                    grid-template-columns: 1fr;
                }

                .metrics-grid {
                    grid-template-columns: 1fr;
                }

                .dashboard-content {
                    padding: 15px;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Публичные методы
    getDashboardData() {
        return {
            isVisible: this.isVisible,
            refreshInterval: this.refreshInterval,
            metrics: window.M2Analytics?.getMetrics(),
            heatmap: window.M2Analytics?.getHeatmapData(),
            parameters: window.M2Analytics?.getParameterUsage()
        };
    }
}

// Создаем экземпляр дашборда
const metricsDashboard = new MetricsDashboard();

// Добавляем в глобальную область
window.M2MetricsDashboard = metricsDashboard;

// Информируем систему о загрузке модуля
if (window.M2EnhancementsLoader) {
    window.M2EnhancementsLoader.registerModule('metrics-dashboard', metricsDashboard);
}

// Добавляем уведомление о доступности дашборда
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.M2Analytics && !localStorage.getItem('m2_dashboard_tip_shown')) {
            console.log('💡 Совет: Нажмите Ctrl+Alt+D чтобы открыть панель метрик');
            localStorage.setItem('m2_dashboard_tip_shown', 'true');
        }
    }, 3000);
});