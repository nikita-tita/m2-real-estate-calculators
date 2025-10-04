/**
 * M2 Input Validation - Visual feedback for form inputs
 * Automatically adds checkmarks for valid inputs and warnings for invalid ones
 */

(function() {
    'use strict';

    const M2Validation = {
        /**
         * Initialize validation for all inputs in a container
         * @param {string} containerSelector - CSS selector for the container
         */
        init: function(containerSelector = 'body') {
            const container = document.querySelector(containerSelector);
            if (!container) return;

            const inputs = container.querySelectorAll('input[type="number"], input[type="text"], input[type="email"]');
            inputs.forEach(input => this.attachValidation(input));
        },

        /**
         * Attach validation to a specific input
         * @param {HTMLElement} input - Input element
         */
        attachValidation: function(input) {
            // Skip if already has validation
            if (input.dataset.m2ValidationAttached === 'true') return;

            // Wrap input in validation container
            const wrapper = document.createElement('div');
            wrapper.className = 'm2-input-wrapper';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            // Create feedback icon
            const icon = document.createElement('span');
            icon.className = 'm2-validation-icon';
            wrapper.appendChild(icon);

            // Create hint container for range suggestions
            const hint = document.createElement('div');
            hint.className = 'm2-input-hint';
            wrapper.appendChild(hint);

            // Add range hints if available
            this.addRangeHint(input, hint);

            // Attach validation listeners
            input.addEventListener('input', () => this.validate(input));
            input.addEventListener('blur', () => this.validate(input));

            input.dataset.m2ValidationAttached = 'true';

            // Initial validation
            if (input.value) {
                this.validate(input);
            }
        },

        /**
         * Validate input and update visual state
         * @param {HTMLElement} input - Input element
         */
        validate: function(input) {
            const wrapper = input.closest('.m2-input-wrapper');
            if (!wrapper) return;

            const icon = wrapper.querySelector('.m2-validation-icon');
            const value = input.value.trim();

            // Reset state
            wrapper.classList.remove('m2-valid', 'm2-invalid', 'm2-warning');
            icon.innerHTML = '';

            // Skip validation if empty (unless required)
            if (!value && !input.required) {
                return;
            }

            let state = 'valid';
            let message = '';

            // Check browser validity
            if (!input.checkValidity()) {
                state = 'invalid';
                message = input.validationMessage;
            } else if (input.type === 'number') {
                const numValue = parseFloat(value);
                const min = input.min ? parseFloat(input.min) : null;
                const max = input.max ? parseFloat(input.max) : null;

                // Check range warnings (not errors)
                if (min !== null && numValue < min) {
                    state = 'invalid';
                    message = `Минимум: ${this.formatNumber(min)}`;
                } else if (max !== null && numValue > max) {
                    state = 'invalid';
                    message = `Максимум: ${this.formatNumber(max)}`;
                } else if (this.isOutsideTypicalRange(input, numValue)) {
                    state = 'warning';
                    message = 'Необычное значение';
                }
            }

            // Update UI
            wrapper.classList.add(`m2-${state}`);

            if (state === 'valid') {
                icon.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C27D" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
            } else if (state === 'invalid') {
                icon.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4F37" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                `;
                icon.title = message;
            } else if (state === 'warning') {
                icon.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFB800" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                `;
                icon.title = message;
            }
        },

        /**
         * Check if value is outside typical range (for warnings)
         * @param {HTMLElement} input
         * @param {number} value
         */
        isOutsideTypicalRange: function(input, value) {
            const fieldName = input.id || input.name;
            const ranges = {
                propertyPrice: { min: 1000000, max: 100000000 },
                downPayment: { min: 0, max: 50000000 },
                monthlyIncome: { min: 30000, max: 1000000 },
                monthlyRent: { min: 10000, max: 500000 },
                interestRate: { min: 1, max: 30 },
                loanTerm: { min: 1, max: 30 }
            };

            const range = ranges[fieldName];
            if (!range) return false;

            return value < range.min || value > range.max;
        },

        /**
         * Add range hint below input
         * @param {HTMLElement} input
         * @param {HTMLElement} hintContainer
         */
        addRangeHint: function(input, hintContainer) {
            if (input.type !== 'number') return;

            const fieldName = input.id || input.name;
            const hints = {
                propertyPrice: 'Обычно: 3–50 млн ₽',
                downPayment: 'Обычно: 15–20% от стоимости',
                monthlyIncome: 'Обычно: 50–500 тыс ₽',
                monthlyRent: 'Обычно: 20–150 тыс ₽',
                interestRate: 'Обычно: 8–16%',
                loanTerm: 'Обычно: 10–30 лет',
                rentalIncome: 'Обычно: 30–100 тыс ₽/мес',
                occupancyRate: 'Обычно: 70–95%'
            };

            const hintText = hints[fieldName];
            if (hintText) {
                hintContainer.textContent = hintText;
            }
        },

        /**
         * Format number for display
         */
        formatNumber: function(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + ' млн';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(0) + ' тыс';
            }
            return num.toString();
        }
    };

    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .m2-input-wrapper {
            position: relative;
            width: 100%;
        }

        .m2-input-wrapper input {
            padding-right: 40px !important;
        }

        .m2-validation-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .m2-valid .m2-validation-icon,
        .m2-invalid .m2-validation-icon,
        .m2-warning .m2-validation-icon {
            opacity: 1;
        }

        .m2-valid input {
            border-color: #00C27D !important;
        }

        .m2-invalid input {
            border-color: #FF4F37 !important;
        }

        .m2-warning input {
            border-color: #FFB800 !important;
        }

        .m2-input-hint {
            font-size: 12px;
            color: #797981;
            margin-top: 4px;
            min-height: 18px;
        }

        .m2-invalid .m2-input-hint {
            color: #FF4F37;
        }

        .m2-warning .m2-input-hint {
            color: #FFB800;
        }
    `;
    document.head.appendChild(style);

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => M2Validation.init());
    } else {
        M2Validation.init();
    }

    // Expose to global scope
    window.M2Validation = M2Validation;
})();
