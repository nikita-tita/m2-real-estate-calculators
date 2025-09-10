// M2 Calculator Analytics System
class M2Analytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.interactions = [];
        
        this.initializeAnalytics();
    }
    
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    initializeAnalytics() {
        // Track page load
        this.trackEvent('page_load', {
            url: window.location.pathname,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_size: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.trackEvent('page_hidden');
            } else {
                this.trackEvent('page_visible');
            }
        });
        
        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_unload', {
                session_duration: Date.now() - this.startTime,
                interactions_count: this.interactions.length
            });
        });
        
        // Auto-initialize calculator tracking
        setTimeout(() => this.initializeCalculatorTracking(), 1000);
    }
    
    trackEvent(eventName, data = {}) {
        const event = {
            session_id: this.sessionId,
            event: eventName,
            timestamp: new Date().toISOString(),
            url: window.location.pathname,
            ...data
        };
        
        this.interactions.push(event);
        
        // Send to analytics endpoint (placeholder for future implementation)
        this.sendToAnalytics(event);
        
        // Store in localStorage for offline analysis
        this.storeLocalAnalytics(event);
    }
    
    trackCalculation(calculatorType, inputData, resultData) {
        this.trackEvent('calculation_performed', {
            calculator_type: calculatorType,
            input_data: this.sanitizeData(inputData),
            result_data: this.sanitizeData(resultData),
            calculation_time: new Date().toISOString()
        });
    }
    
    trackPDFExport(calculatorType, exportData) {
        this.trackEvent('pdf_exported', {
            calculator_type: calculatorType,
            export_data: this.sanitizeData(exportData)
        });
    }
    
    trackParameterChange(calculatorType, parameter, oldValue, newValue) {
        this.trackEvent('parameter_changed', {
            calculator_type: calculatorType,
            parameter: parameter,
            old_value: oldValue,
            new_value: newValue
        });
    }
    
    trackCalculatorInteraction(action, element = null) {
        this.trackEvent('calculator_interaction', {
            action: action,
            element: element ? element.id || element.className || element.tagName : null,
            calculator_type: this.detectCalculatorType()
        });
    }
    
    detectCalculatorType() {
        const url = window.location.pathname;
        if (url.includes('mortgage')) return 'mortgage';
        if (url.includes('affordability')) return 'affordability';
        if (url.includes('rent_vs_buy')) return 'rent_vs_buy';
        if (url.includes('airbnb')) return 'airbnb';
        if (url.includes('new_vs_secondary')) return 'new_vs_secondary';
        if (url.includes('rental_profitability')) return 'rental_profitability';
        return 'unknown';
    }
    
    initializeCalculatorTracking() {
        // Track button clicks
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.trackCalculatorInteraction('button_click', e.target);
            });
        });
        
        // Track input changes
        document.querySelectorAll('input, select').forEach(input => {
            let initialValue = input.value;
            
            input.addEventListener('change', (e) => {
                this.trackParameterChange(
                    this.detectCalculatorType(),
                    e.target.name || e.target.id,
                    initialValue,
                    e.target.value
                );
                initialValue = e.target.value;
            });
            
            input.addEventListener('focus', (e) => {
                this.trackCalculatorInteraction('input_focus', e.target);
            });
        });
        
        // Track form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                this.trackCalculatorInteraction('form_submit', e.target);
            });
        });
        
        // Track scroll events (throttled)
        let scrollTimer = null;
        window.addEventListener('scroll', () => {
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                this.trackCalculatorInteraction('scroll', null);
            }, 500);
        });
    }
    
    sanitizeData(data) {
        // Remove sensitive information and limit data size
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'number' || typeof value === 'string') {
                    // Limit string length
                    sanitized[key] = typeof value === 'string' 
                        ? value.substring(0, 100) 
                        : value;
                }
            }
            return sanitized;
        }
        return data;
    }
    
    sendToAnalytics(event) {
        // Placeholder for sending to analytics service
        // In production, this would send to Google Analytics, Mixpanel, etc.
        
        // For now, just log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Analytics Event:', event);
        }
        
        // Future: Send to analytics endpoint
        /*
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        }).catch(err => console.warn('Analytics send failed:', err));
        */
    }
    
    storeLocalAnalytics(event) {
        try {
            const key = 'm2_analytics_' + new Date().toISOString().split('T')[0];
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            existing.push(event);
            
            // Keep only last 100 events per day to avoid storage bloat
            if (existing.length > 100) {
                existing.splice(0, existing.length - 100);
            }
            
            localStorage.setItem(key, JSON.stringify(existing));
        } catch (error) {
            console.warn('Failed to store analytics locally:', error);
        }
    }
    
    // Public methods for manual tracking
    trackConversion(conversionType, value = null) {
        this.trackEvent('conversion', {
            conversion_type: conversionType,
            value: value,
            calculator_type: this.detectCalculatorType()
        });
    }
    
    trackError(errorType, errorMessage) {
        this.trackEvent('error', {
            error_type: errorType,
            error_message: errorMessage,
            calculator_type: this.detectCalculatorType()
        });
    }
    
    getSessionStats() {
        return {
            session_id: this.sessionId,
            duration: Date.now() - this.startTime,
            interactions: this.interactions.length,
            calculator_type: this.detectCalculatorType()
        };
    }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.m2Analytics = new M2Analytics();
    
    // Make it available globally for manual tracking
    window.trackCalculation = (inputData, resultData) => {
        window.m2Analytics.trackCalculation(
            window.m2Analytics.detectCalculatorType(),
            inputData,
            resultData
        );
    };
    
    window.trackPDFExport = (exportData) => {
        window.m2Analytics.trackPDFExport(
            window.m2Analytics.detectCalculatorType(),
            exportData
        );
    };
    
    window.trackConversion = (type, value) => {
        window.m2Analytics.trackConversion(type, value);
    };
    
    window.trackError = (type, message) => {
        window.m2Analytics.trackError(type, message);
    };
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = M2Analytics;
}