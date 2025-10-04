/**
 * M2 Result Animator - Animate result updates
 * Usage: M2Animator.update(elementId, newValue)
 */

(function() {
    'use strict';

    const M2Animator = {
        /**
         * Update element with animation
         * @param {string} elementId - Element ID
         * @param {string|number} newValue - New value to display
         * @param {string} animationType - Type of animation (pulse, bounce, highlight)
         */
        update: function(elementId, newValue, animationType = 'pulse') {
            const element = document.getElementById(elementId);
            if (!element) return;

            const oldValue = element.textContent;

            // Only animate if value changed
            if (oldValue === String(newValue)) return;

            // Apply animation class
            element.classList.add('m2-updated', `m2-${animationType}`);

            // Update value
            element.textContent = newValue;

            // Remove animation class after completion
            setTimeout(() => {
                element.classList.remove('m2-updated', `m2-${animationType}`);
            }, 600);
        },

        /**
         * Animate number counting
         * @param {string} elementId - Element ID
         * @param {number} targetValue - Target number
         * @param {number} duration - Animation duration in ms
         * @param {string} suffix - Suffix to add (e.g., ' ₽')
         */
        countTo: function(elementId, targetValue, duration = 800, suffix = '') {
            const element = document.getElementById(elementId);
            if (!element) return;

            const startValue = parseFloat(element.textContent.replace(/[^\d.-]/g, '')) || 0;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);

                const currentValue = startValue + (targetValue - startValue) * easeOut;
                element.textContent = this.formatNumber(currentValue) + suffix;

                // Add direction indicator
                if (targetValue > startValue) {
                    element.classList.add('up');
                } else if (targetValue < startValue) {
                    element.classList.add('down');
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.classList.remove('up', 'down');
                }
            };

            requestAnimationFrame(animate);
        },

        /**
         * Highlight element temporarily
         * @param {string} selector - CSS selector
         */
        highlight: function(selector) {
            const element = document.querySelector(selector);
            if (!element) return;

            element.classList.add('m2-highlighted');
            setTimeout(() => {
                element.classList.remove('m2-highlighted');
            }, 600);
        },

        /**
         * Slide in results with stagger
         * @param {string} containerSelector - Container selector
         */
        slideInResults: function(containerSelector) {
            const container = document.querySelector(containerSelector);
            if (!container) return;

            const items = container.querySelectorAll('.result-item, .breakdown-item, .recommendation-item');
            items.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.05}s`;
                item.classList.add('m2-slide-in');
            });
        },

        /**
         * Show error animation
         * @param {string} selector - CSS selector
         */
        showError: function(selector) {
            const element = document.querySelector(selector);
            if (!element) return;

            element.classList.add('m2-error');
            setTimeout(() => {
                element.classList.remove('m2-error');
            }, 400);
        },

        /**
         * Show success animation
         * @param {string} selector - CSS selector
         */
        showSuccess: function(selector) {
            const element = document.querySelector(selector);
            if (!element) return;

            element.classList.add('m2-success');
            setTimeout(() => {
                element.classList.remove('m2-success');
            }, 500);
        },

        /**
         * Format number for display
         */
        formatNumber: function(num) {
            return new Intl.NumberFormat('ru-RU', {
                maximumFractionDigits: 0
            }).format(num);
        },

        /**
         * Batch update multiple results
         * @param {Object} updates - Map of elementId -> newValue
         */
        batchUpdate: function(updates) {
            Object.entries(updates).forEach(([elementId, value], index) => {
                setTimeout(() => {
                    this.update(elementId, value);
                }, index * 50); // Stagger updates
            });
        },

        /**
         * Observer to auto-animate DOM changes
         */
        observeChanges: function(selector) {
            const elements = document.querySelectorAll(selector);

            elements.forEach(element => {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' || mutation.type === 'characterData') {
                            element.classList.add('m2-updated');
                            setTimeout(() => {
                                element.classList.remove('m2-updated');
                            }, 600);
                        }
                    });
                });

                observer.observe(element, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            });
        }
    };

    // Auto-observe result values on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            M2Animator.observeChanges('.result-value');
        });
    } else {
        M2Animator.observeChanges('.result-value');
    }

    // Expose to global scope
    window.M2Animator = M2Animator;
})();
