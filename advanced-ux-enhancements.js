/**
 * Advanced UX Enhancement Utilities for M2 Calculators
 * Implements cognitive load management, progressive disclosure, and number visualization
 */

class AdvancedUXEnhancer {
    constructor() {
        this.loadingStates = new Map();
        this.validationErrors = new Map();
        this.disclaimerShown = false;
        
        // Initialize on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.setupGlobalStyles();
        this.initializeNumberFormatting();
        this.setupProgressiveDisclosure();
        this.initializeTooltips();
        this.setupMobileAdaptations();
        this.initializeValidation();
    }

    /**
     * Advanced Number Formatting with Color Coding
     */
    formatCurrency(amount, options = {}) {
        const {
            showSign = false,
            colorCode = true,
            abbreviate = false,
            precision = 0
        } = options;

        if (amount === null || amount === undefined || isNaN(amount)) {
            return '<span class="ux-value-neutral">—</span>';
        }

        let formattedNumber;
        let suffix = '';

        if (abbreviate && Math.abs(amount) >= 1000000) {
            if (Math.abs(amount) >= 1000000000) {
                formattedNumber = (amount / 1000000000).toFixed(1);
                suffix = ' млрд';
            } else {
                formattedNumber = (amount / 1000000).toFixed(1);
                suffix = ' млн';
            }
        } else {
            formattedNumber = new Intl.NumberFormat('ru-RU', {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision
            }).format(Math.abs(amount));
        }

        let colorClass = 'ux-value-neutral';
        let signSymbol = '';

        if (colorCode && amount !== 0) {
            if (amount > 0) {
                colorClass = 'ux-value-positive';
                signSymbol = showSign ? '+' : '';
            } else {
                colorClass = 'ux-value-negative';
                signSymbol = '−'; // em dash, not hyphen
            }
        }

        return `<span class="${colorClass}">${signSymbol}${formattedNumber}${suffix} ₽</span>`;
    }

    formatPercent(percent, options = {}) {
        const {
            showSign = false,
            colorCode = true,
            precision = 1,
            benchmark = null
        } = options;

        if (percent === null || percent === undefined || isNaN(percent)) {
            return '<span class="ux-value-neutral">—</span>';
        }

        const formattedPercent = percent.toFixed(precision);
        
        let colorClass = 'ux-value-neutral';
        let signSymbol = '';
        let benchmarkIndicator = '';

        if (colorCode && percent !== 0) {
            if (percent > 0) {
                colorClass = 'ux-value-positive';
                signSymbol = showSign ? '+' : '';
            } else {
                colorClass = 'ux-value-negative';
                signSymbol = '';
            }
        }

        // Add benchmark comparison
        if (benchmark !== null && percent !== 0) {
            if (percent > benchmark) {
                benchmarkIndicator = ` <span class="ux-benchmark-indicator ux-above-market" title="Выше рыночного (${benchmark}%)">↗</span>`;
            } else if (percent < benchmark) {
                benchmarkIndicator = ` <span class="ux-benchmark-indicator ux-below-market" title="Ниже рыночного (${benchmark}%)">↘</span>`;
            }
        }

        return `<span class="${colorClass}">${signSymbol}${formattedPercent}%</span>${benchmarkIndicator}`;
    }

    formatNumber(number, options = {}) {
        const {
            precision = 0,
            abbreviate = false,
            unit = ''
        } = options;

        if (number === null || number === undefined || isNaN(number)) {
            return '<span class="ux-value-neutral">—</span>';
        }

        let formattedNumber;
        let suffix = unit;

        if (abbreviate && Math.abs(number) >= 1000000) {
            if (Math.abs(number) >= 1000000000) {
                formattedNumber = (number / 1000000000).toFixed(1);
                suffix = ' млрд' + (unit ? ' ' + unit : '');
            } else {
                formattedNumber = (number / 1000000).toFixed(1);
                suffix = ' млн' + (unit ? ' ' + unit : '');
            }
        } else {
            formattedNumber = new Intl.NumberFormat('ru-RU', {
                minimumFractionDigits: precision,
                maximumFractionDigits: precision
            }).format(number);
        }

        return `<span class="ux-value-neutral">${formattedNumber}${suffix}</span>`;
    }

    /**
     * Progressive Disclosure Implementation
     */
    createDisclosureSection(title, content, options = {}) {
        const {
            initiallyOpen = false,
            priority = 'secondary',
            icon = '▼'
        } = options;

        const disclosureId = `disclosure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const section = document.createElement('div');
        section.className = `ux-disclosure-section ux-priority-${priority}`;
        section.innerHTML = `
            <button class="ux-disclosure-trigger" 
                    aria-expanded="${initiallyOpen}" 
                    aria-controls="${disclosureId}">
                <span class="ux-disclosure-icon ${initiallyOpen ? 'expanded' : ''}">${icon}</span>
                <span class="ux-disclosure-title">${title}</span>
            </button>
            <div class="ux-disclosure-content ${initiallyOpen ? 'open' : ''}" 
                 id="${disclosureId}" 
                 aria-hidden="${!initiallyOpen}">
                ${content}
            </div>
        `;

        // Add click handler
        const trigger = section.querySelector('.ux-disclosure-trigger');
        const contentDiv = section.querySelector('.ux-disclosure-content');
        const iconEl = section.querySelector('.ux-disclosure-icon');

        trigger.addEventListener('click', () => {
            const isOpen = contentDiv.classList.contains('open');
            
            if (isOpen) {
                contentDiv.classList.remove('open');
                iconEl.classList.remove('expanded');
                trigger.setAttribute('aria-expanded', 'false');
                contentDiv.setAttribute('aria-hidden', 'true');
            } else {
                contentDiv.classList.add('open');
                iconEl.classList.add('expanded');
                trigger.setAttribute('aria-expanded', 'true');
                contentDiv.setAttribute('aria-hidden', 'false');
            }
        });

        return section;
    }

    /**
     * Information Grouping (5-7 item rule)
     */
    groupInformation(container, maxItems = 6) {
        const items = container.querySelectorAll('.result-item, .metric-item, .calculation-step');
        
        if (items.length <= maxItems) {
            return; // No grouping needed
        }

        // Split into priority groups
        const priorityItems = Array.from(items).slice(0, maxItems);
        const detailItems = Array.from(items).slice(maxItems);

        // Create details section for overflow items
        const detailsContent = detailItems.map(item => item.outerHTML).join('');
        detailItems.forEach(item => item.remove());

        const disclosureSection = this.createDisclosureSection(
            'Подробные расчеты',
            detailsContent,
            { priority: 'secondary' }
        );

        container.appendChild(disclosureSection);
    }

    /**
     * Loading States
     */
    showLoadingState(element, hint = 'Выполняется расчет...') {
        const loadingId = `loading-${Date.now()}`;
        this.loadingStates.set(element, loadingId);

        element.classList.add('ux-loading');
        element.innerHTML = `
            <div class="ux-loading-indicator">
                <div class="ux-spinner"></div>
                <span class="ux-loading-hint">${hint}</span>
            </div>
        `;
    }

    hideLoadingState(element, content) {
        element.classList.remove('ux-loading');
        element.innerHTML = content;
        this.loadingStates.delete(element);
    }

    /**
     * Input Validation with Visual Feedback
     */
    setupInputValidation(input, validationRules) {
        const errorContainer = this.createErrorContainer(input);
        
        const validate = () => {
            const value = parseFloat(input.value);
            const errors = [];

            for (const rule of validationRules) {
                if (!rule.validate(value)) {
                    errors.push(rule.message);
                }
            }

            this.showValidationErrors(input, errorContainer, errors);
            return errors.length === 0;
        };

        input.addEventListener('input', () => {
            clearTimeout(input.validationTimeout);
            input.validationTimeout = setTimeout(validate, 300);
        });

        input.addEventListener('blur', validate);
        
        return validate;
    }

    createErrorContainer(input) {
        const container = document.createElement('div');
        container.className = 'ux-validation-errors';
        input.parentNode.insertBefore(container, input.nextSibling);
        return container;
    }

    showValidationErrors(input, container, errors) {
        if (errors.length > 0) {
            input.classList.add('ux-error');
            container.innerHTML = errors.map(error => 
                `<div class="ux-error-message">${error}</div>`
            ).join('');
            container.style.display = 'block';
        } else {
            input.classList.remove('ux-error');
            container.style.display = 'none';
        }
    }

    /**
     * Enhanced Tooltips with Formulas
     */
    createFormulaTooltip(element, formula, explanation) {
        const tooltip = document.createElement('div');
        tooltip.className = 'ux-formula-tooltip';
        tooltip.innerHTML = `
            <div class="ux-tooltip-header">Формула расчета</div>
            <div class="ux-tooltip-formula">${formula}</div>
            <div class="ux-tooltip-explanation">${explanation}</div>
        `;

        element.addEventListener('mouseenter', () => {
            document.body.appendChild(tooltip);
            this.positionTooltip(tooltip, element);
        });

        element.addEventListener('mouseleave', () => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
    }

    positionTooltip(tooltip, trigger) {
        const rect = trigger.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = (rect.bottom + window.scrollY + 10) + 'px';
        tooltip.style.left = (rect.left + window.scrollX) + 'px';
        tooltip.style.zIndex = '10000';
    }

    /**
     * Mobile Adaptations
     */
    setupMobileAdaptations() {
        if (window.innerWidth <= 768) {
            this.createMobileSummary();
            this.optimizeForMobile();
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768 && !document.querySelector('.ux-mobile-summary')) {
                this.createMobileSummary();
                this.optimizeForMobile();
            } else if (window.innerWidth > 768) {
                this.removeMobileAdaptations();
            }
        });
    }

    createMobileSummary() {
        const keyMetrics = document.querySelectorAll('.result-value.primary, .comparison-yield');
        if (keyMetrics.length === 0) return;

        const summary = document.createElement('div');
        summary.className = 'ux-mobile-summary';
        summary.innerHTML = '<h3>Ключевые показатели</h3>';

        keyMetrics.forEach(metric => {
            const label = metric.previousElementSibling?.textContent || 'Показатель';
            const value = metric.textContent;
            
            const item = document.createElement('div');
            item.className = 'ux-mobile-metric';
            item.innerHTML = `
                <span class="ux-mobile-label">${label}</span>
                <span class="ux-mobile-value">${value}</span>
            `;
            summary.appendChild(item);
        });

        const firstSection = document.querySelector('.results, .comparison-section');
        if (firstSection) {
            firstSection.parentNode.insertBefore(summary, firstSection);
        }
    }

    optimizeForMobile() {
        // Convert complex tables to cards
        const tables = document.querySelectorAll('table');
        tables.forEach(table => this.convertTableToCards(table));

        // Add sticky headers for long forms
        const forms = document.querySelectorAll('.inputs');
        forms.forEach(form => this.addStickyHeader(form));
    }

    convertTableToCards(table) {
        if (table.classList.contains('ux-mobile-converted')) return;

        const cards = document.createElement('div');
        cards.className = 'ux-mobile-cards';

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const card = document.createElement('div');
            card.className = 'ux-mobile-card';
            
            const cells = row.querySelectorAll('td');
            const headers = table.querySelectorAll('th');
            
            cells.forEach((cell, index) => {
                const header = headers[index]?.textContent || '';
                const cardItem = document.createElement('div');
                cardItem.className = 'ux-mobile-card-item';
                cardItem.innerHTML = `
                    <span class="ux-mobile-card-label">${header}</span>
                    <span class="ux-mobile-card-value">${cell.innerHTML}</span>
                `;
                card.appendChild(cardItem);
            });
            
            cards.appendChild(card);
        });

        table.style.display = 'none';
        table.parentNode.insertBefore(cards, table.nextSibling);
        table.classList.add('ux-mobile-converted');
    }

    removeMobileAdaptations() {
        const summary = document.querySelector('.ux-mobile-summary');
        if (summary) summary.remove();

        const cards = document.querySelectorAll('.ux-mobile-cards');
        cards.forEach(card => card.remove());

        const tables = document.querySelectorAll('table.ux-mobile-converted');
        tables.forEach(table => {
            table.style.display = '';
            table.classList.remove('ux-mobile-converted');
        });
    }

    /**
     * Context and Benchmarks
     */
    addBenchmarkContext(value, benchmark, type = 'percentage') {
        const comparison = type === 'percentage' ? 
            ((value - benchmark) / benchmark * 100).toFixed(1) :
            (value - benchmark);

        const isAbove = value > benchmark;
        const contextClass = isAbove ? 'ux-above-benchmark' : 'ux-below-benchmark';
        const contextText = isAbove ? 'выше среднего' : 'ниже среднего';
        const contextValue = type === 'percentage' ? `на ${Math.abs(comparison)}%` : `на ${Math.abs(comparison)}`;

        return `<span class="${contextClass}" title="Средний рыночный показатель: ${benchmark}${type === 'percentage' ? '%' : ''}">${contextText} ${contextValue}</span>`;
    }

    /**
     * Setup Global Styles
     */
    setupGlobalStyles() {
        if (document.getElementById('ux-enhancements-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ux-enhancements-styles';
        styles.textContent = `
            /* Advanced UX Enhancement Styles */
            .ux-value-positive { color: #28a745; font-weight: 600; }
            .ux-value-negative { color: #dc3545; font-weight: 600; }
            .ux-value-neutral { color: #6c757d; }
            
            .ux-benchmark-indicator {
                font-size: 0.8em;
                margin-left: 4px;
                opacity: 0.8;
            }
            
            .ux-above-market { color: #28a745; }
            .ux-below-market { color: #dc3545; }
            
            /* Progressive Disclosure */
            .ux-disclosure-section {
                margin: 20px 0;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .ux-disclosure-trigger {
                width: 100%;
                padding: 16px 20px;
                background: #f8f9fa;
                border: none;
                border-bottom: 1px solid #dee2e6;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 16px;
                font-weight: 500;
                transition: background-color 0.2s;
            }
            
            .ux-disclosure-trigger:hover {
                background: #e9ecef;
            }
            
            .ux-disclosure-icon {
                transition: transform 0.2s;
                font-size: 12px;
            }
            
            .ux-disclosure-icon.expanded {
                transform: rotate(180deg);
            }
            
            .ux-disclosure-content {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
                background: white;
            }
            
            .ux-disclosure-content.open {
                max-height: 1000px;
                padding: 20px;
            }
            
            /* Loading States */
            .ux-loading {
                position: relative;
                min-height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ux-loading-indicator {
                display: flex;
                align-items: center;
                gap: 12px;
                color: #6c757d;
            }
            
            .ux-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #007bff;
                border-radius: 50%;
                animation: ux-spin 1s linear infinite;
            }
            
            @keyframes ux-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .ux-loading-hint {
                font-size: 14px;
                font-style: italic;
            }
            
            /* Validation */
            .ux-error {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
            }
            
            .ux-validation-errors {
                display: none;
                margin-top: 4px;
            }
            
            .ux-error-message {
                color: #dc3545;
                font-size: 14px;
                margin-bottom: 4px;
            }
            
            /* Formula Tooltips */
            .ux-formula-tooltip {
                background: #333;
                color: white;
                padding: 12px;
                border-radius: 6px;
                font-size: 14px;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            
            .ux-tooltip-header {
                font-weight: 600;
                margin-bottom: 8px;
                color: #ffc107;
            }
            
            .ux-tooltip-formula {
                font-family: 'Courier New', monospace;
                background: rgba(255,255,255,0.1);
                padding: 6px;
                border-radius: 4px;
                margin-bottom: 8px;
            }
            
            .ux-tooltip-explanation {
                font-size: 12px;
                line-height: 1.4;
                opacity: 0.9;
            }
            
            /* Mobile Adaptations */
            .ux-mobile-summary {
                background: linear-gradient(135deg, #3416b6, #4726d6);
                color: white;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 20px;
            }
            
            .ux-mobile-summary h3 {
                margin: 0 0 16px 0;
                font-size: 18px;
            }
            
            .ux-mobile-metric {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255,255,255,0.2);
            }
            
            .ux-mobile-metric:last-child {
                border-bottom: none;
            }
            
            .ux-mobile-label {
                font-size: 14px;
                opacity: 0.9;
            }
            
            .ux-mobile-value {
                font-weight: 600;
                font-size: 16px;
            }
            
            .ux-mobile-cards {
                display: none;
            }
            
            @media (max-width: 768px) {
                .ux-mobile-cards {
                    display: block;
                }
                
                .ux-mobile-card {
                    background: white;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .ux-mobile-card-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #f8f9fa;
                }
                
                .ux-mobile-card-item:last-child {
                    border-bottom: none;
                }
                
                .ux-mobile-card-label {
                    font-size: 14px;
                    color: #666;
                    flex: 1;
                }
                
                .ux-mobile-card-value {
                    font-weight: 600;
                    text-align: right;
                }
            }
            
            /* Hierarchy and Grouping */
            .ux-priority-primary .ux-disclosure-trigger {
                background: linear-gradient(135deg, #3416b6, #4726d6);
                color: white;
                font-weight: 600;
            }
            
            .ux-priority-primary .ux-disclosure-trigger:hover {
                background: linear-gradient(135deg, #2610a0, #3d1fc4);
            }
            
            .ux-above-benchmark {
                color: #28a745;
                font-weight: 500;
            }
            
            .ux-below-benchmark {
                color: #dc3545;
                font-weight: 500;
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Initialize core systems
     */
    initializeNumberFormatting() {
        // Auto-format number inputs
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value) {
                    const value = parseFloat(input.value);
                    if (!isNaN(value)) {
                        input.setAttribute('data-formatted-value', this.formatNumber(value));
                    }
                }
            });
        });
    }

    setupProgressiveDisclosure() {
        // Auto-group long result lists
        document.querySelectorAll('.results').forEach(container => {
            this.groupInformation(container);
        });
    }

    initializeTooltips() {
        // Enhanced tooltip system is handled in tooltip-system.js
        // This is for formula-specific tooltips
        document.querySelectorAll('[data-formula]').forEach(element => {
            const formula = element.getAttribute('data-formula');
            const explanation = element.getAttribute('data-explanation') || '';
            this.createFormulaTooltip(element, formula, explanation);
        });
    }

    initializeValidation() {
        // Common validation rules
        const commonRules = {
            positive: {
                validate: (value) => value > 0,
                message: 'Значение должно быть больше 0'
            },
            percentage: {
                validate: (value) => value >= 0 && value <= 100,
                message: 'Процент должен быть от 0 до 100'
            },
            price: {
                validate: (value) => value >= 100000 && value <= 100000000,
                message: 'Стоимость должна быть от 100 тыс. до 100 млн ₽'
            }
        };

        // Auto-setup validation based on data attributes
        document.querySelectorAll('input[data-validation]').forEach(input => {
            const rules = input.getAttribute('data-validation').split(',')
                .map(rule => commonRules[rule.trim()])
                .filter(rule => rule);
            
            if (rules.length > 0) {
                this.setupInputValidation(input, rules);
            }
        });
    }
}

// Initialize globally
window.advancedUX = new AdvancedUXEnhancer();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedUXEnhancer;
}