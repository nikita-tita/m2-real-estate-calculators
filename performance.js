// M2 Calculators Performance Optimization
class PerformanceOptimizer {
    constructor() {
        this.criticalResources = [
            '/analytics.js',
            '/components.js',
            '/pdf-export.js'
        ];
        
        this.init();
    }
    
    init() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Optimize image loading
        this.optimizeImageLoading();
        
        // Defer non-critical scripts
        this.deferNonCriticalScripts();
        
        // Monitor performance
        this.monitorPerformance();
    }
    
    preloadCriticalResources() {
        this.criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = resource;
            document.head.appendChild(link);
        });
    }
    
    optimizeImageLoading() {
        // Lazy load images that are not in viewport
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
    
    deferNonCriticalScripts() {
        // Mark non-critical scripts for deferred loading
        const nonCriticalScripts = document.querySelectorAll('script[data-defer]');
        
        nonCriticalScripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.src = script.src || script.dataset.src;
            newScript.async = true;
            
            // Load after page is fully loaded
            if (document.readyState === 'complete') {
                document.head.appendChild(newScript);
            } else {
                window.addEventListener('load', () => {
                    document.head.appendChild(newScript);
                });
            }
        });
    }
    
    monitorPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                // Wait a bit for all resources to load
                setTimeout(() => {
                    this.reportPerformanceMetrics();
                }, 1000);
            });
        }
    }
    
    reportPerformanceMetrics() {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (!perfData) return;
        
        const metrics = {
            dns_lookup: perfData.domainLookupEnd - perfData.domainLookupStart,
            tcp_connect: perfData.connectEnd - perfData.connectStart,
            ssl_handshake: perfData.secureConnectionStart ? perfData.connectEnd - perfData.secureConnectionStart : 0,
            ttfb: perfData.responseStart - perfData.requestStart,
            content_download: perfData.responseEnd - perfData.responseStart,
            dom_processing: perfData.domContentLoadedEventEnd - perfData.responseEnd,
            total_load_time: perfData.loadEventEnd - perfData.navigationStart
        };
        
        // Send performance data to analytics
        if (window.m2Analytics) {
            window.m2Analytics.trackEvent('performance_metrics', metrics);
        }
        
        // Log performance issues
        if (metrics.total_load_time > 3000) {
            console.warn('Slow page load detected:', metrics.total_load_time + 'ms');
        }
        
        if (metrics.ttfb > 1000) {
            console.warn('Slow TTFB detected:', metrics.ttfb + 'ms');
        }
    }
    
    // Prefetch resources for likely next page
    prefetchNextPage(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }
    
    // Preconnect to external domains
    preconnectToDomain(domain) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        document.head.appendChild(link);
    }
    
    // Optimize CSS delivery
    optimizeCSSDelivery() {
        // Inline critical CSS and defer non-critical
        const stylesheets = document.querySelectorAll('link[rel=\"stylesheet\"][data-defer]');
        
        stylesheets.forEach(stylesheet => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = stylesheet.href;
            link.onload = function() {
                this.rel = 'stylesheet';
            };
            
            document.head.appendChild(link);
            stylesheet.remove();
        });
    }
    
    // Compress and cache data
    compressData(data) {
        try {
            return JSON.stringify(data);
        } catch (error) {
            console.warn('Data compression failed:', error);
            return data;
        }
    }
    
    // Debounce function for performance
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
    
    // Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Resource Hints for better performance
class ResourceHints {
    static addDNSPrefetch(domains) {
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
    
    static addPreconnect(domains) {
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
    
    static addPreload(resources) {
        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = resource.as || 'script';
            link.href = resource.href;
            if (resource.type) link.type = resource.type;
            document.head.appendChild(link);
        });
    }
}

// Initialize performance optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize performance optimizer
    window.performanceOptimizer = new PerformanceOptimizer();
    
    // Add resource hints for external domains
    ResourceHints.addPreconnect([
        'https://cdnjs.cloudflare.com'
    ]);
    
    // Preload critical calculator scripts based on page
    const currentPage = window.location.pathname;
    const criticalScripts = [];
    
    if (currentPage.includes('mortgage') || currentPage === '/') {
        criticalScripts.push({
            href: '/tooltip-system.js',
            as: 'script'
        });
    }
    
    if (criticalScripts.length > 0) {
        ResourceHints.addPreload(criticalScripts);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceOptimizer, ResourceHints };
}