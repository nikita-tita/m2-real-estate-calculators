/**
 * M2 Loading States - Universal loading indicators for calculators
 * Usage: M2Loading.show(containerSelector), M2Loading.hide(containerSelector)
 */

(function() {
    'use strict';

    const M2Loading = {
        /**
         * Show loading state on a container
         * @param {string} selector - CSS selector for the container
         */
        show: function(selector) {
            const container = document.querySelector(selector);
            if (!container) return;

            // Prevent multiple loading indicators
            if (container.querySelector('.m2-loading-overlay')) return;

            const overlay = document.createElement('div');
            overlay.className = 'm2-loading-overlay';
            overlay.innerHTML = `
                <div class="m2-loading-spinner">
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="#E1E1E3" stroke-width="4"/>
                        <circle cx="20" cy="20" r="18" fill="none" stroke="#4F2CD9" stroke-width="4"
                                stroke-dasharray="90 150" stroke-linecap="round">
                            <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20"
                                            dur="1s" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                    <div class="m2-loading-text">Расчёт...</div>
                </div>
            `;

            container.style.position = 'relative';
            container.appendChild(overlay);
        },

        /**
         * Hide loading state from a container
         * @param {string} selector - CSS selector for the container
         */
        hide: function(selector) {
            const container = document.querySelector(selector);
            if (!container) return;

            const overlay = container.querySelector('.m2-loading-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 200);
            }
        },

        /**
         * Wrap an async function with loading state
         * @param {string} selector - Container selector
         * @param {Function} fn - Async function to execute
         * @param {number} minDuration - Minimum loading duration in ms (default: 300)
         */
        wrap: async function(selector, fn, minDuration = 300) {
            this.show(selector);
            const startTime = Date.now();

            try {
                const result = await fn();
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, minDuration - elapsed);

                // Ensure loading is visible for at least minDuration
                if (remaining > 0) {
                    await new Promise(resolve => setTimeout(resolve, remaining));
                }

                return result;
            } finally {
                this.hide(selector);
            }
        }
    };

    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .m2-loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(2px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            border-radius: inherit;
            transition: opacity 0.2s ease;
        }

        .m2-loading-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .m2-loading-text {
            font-size: 14px;
            color: #797981;
            font-weight: 500;
        }

        /* Shimmer effect for skeleton loading */
        .m2-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: m2-shimmer 1.5s infinite;
            border-radius: 8px;
        }

        @keyframes m2-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        /* Calculating indicator for inputs */
        .m2-calculating {
            position: relative;
        }

        .m2-calculating::after {
            content: '';
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            border: 2px solid #E1E1E3;
            border-top-color: #4F2CD9;
            border-radius: 50%;
            animation: m2-spin 0.8s linear infinite;
        }

        @keyframes m2-spin {
            to { transform: translateY(-50%) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Expose to global scope
    window.M2Loading = M2Loading;
})();
