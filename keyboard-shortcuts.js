/**
 * M2 Keyboard Shortcuts - Universal keyboard navigation
 * Ctrl+Enter - Calculate
 * Ctrl+R - Reset form
 * Esc - Close modals/overlays
 */

(function() {
    'use strict';

    const M2Keyboard = {
        shortcuts: {
            calculate: ['Control+Enter', 'Meta+Enter'], // Ctrl/Cmd + Enter
            reset: ['Control+KeyR', 'Meta+KeyR'],       // Ctrl/Cmd + R
            escape: ['Escape']                           // Esc
        },

        /**
         * Initialize keyboard shortcuts
         */
        init: function() {
            document.addEventListener('keydown', this.handleKeyPress.bind(this));
            this.showShortcutHints();
        },

        /**
         * Handle keypress events
         */
        handleKeyPress: function(event) {
            const key = this.getKeyCombo(event);

            // Calculate shortcut
            if (this.shortcuts.calculate.includes(key)) {
                event.preventDefault();
                this.triggerCalculation();
                return;
            }

            // Reset shortcut
            if (this.shortcuts.reset.includes(key)) {
                event.preventDefault();
                this.confirmReset();
                return;
            }

            // Escape - close modals/overlays
            if (this.shortcuts.escape.includes(key)) {
                this.closeOverlays();
                return;
            }
        },

        /**
         * Get key combination string
         */
        getKeyCombo: function(event) {
            const parts = [];
            if (event.ctrlKey) parts.push('Control');
            if (event.metaKey) parts.push('Meta');
            if (event.altKey) parts.push('Alt');
            if (event.shiftKey) parts.push('Shift');

            if (event.code && !['Control', 'Meta', 'Alt', 'Shift'].includes(event.key)) {
                parts.push(event.code);
            }

            return parts.join('+');
        },

        /**
         * Trigger calculation
         */
        triggerCalculation: function() {
            // Find and call the calculator function
            const calculatorFunctions = [
                'calculateMortgage',
                'performMortgageCalculation',
                'calculateAffordability',
                'performCalculation',
                'calculate',
                'calculateProfitability',
                'calculateAirbnb',
                'compareOptions'
            ];

            for (const funcName of calculatorFunctions) {
                if (typeof window[funcName] === 'function') {
                    window[funcName]();
                    this.showToast('Расчёт выполнен', 'success');
                    return;
                }
            }

            // Try to click calculate button if function not found
            const calculateBtn = document.querySelector('[onclick*="calculate"], .calculate-btn, .btn-calculate');
            if (calculateBtn) {
                calculateBtn.click();
                this.showToast('Расчёт выполнен', 'success');
            }
        },

        /**
         * Confirm and reset form
         */
        confirmReset: function() {
            const resetBtn = document.querySelector('.reset-btn, [onclick*="reset"]');
            if (resetBtn) {
                resetBtn.click();
                this.showToast('Форма сброшена', 'info');
            }
        },

        /**
         * Close modals and overlays
         */
        closeOverlays: function() {
            // Close loading overlays
            const loadingOverlays = document.querySelectorAll('.m2-loading-overlay');
            loadingOverlays.forEach(overlay => overlay.remove());

            // Close modals
            const modals = document.querySelectorAll('.modal, .overlay');
            modals.forEach(modal => {
                if (modal.style.display !== 'none') {
                    modal.style.display = 'none';
                }
            });
        },

        /**
         * Show toast notification
         */
        showToast: function(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `m2-toast m2-toast-${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            // Trigger animation
            setTimeout(() => toast.classList.add('m2-toast-show'), 10);

            // Remove after 2 seconds
            setTimeout(() => {
                toast.classList.remove('m2-toast-show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        },

        /**
         * Show shortcut hints in footer or help section
         */
        showShortcutHints: function() {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlKey = isMac ? '⌘' : 'Ctrl';

            const hints = [
                { key: `${ctrlKey}+Enter`, action: 'Рассчитать' },
                { key: `${ctrlKey}+R`, action: 'Сбросить' },
                { key: 'Esc', action: 'Закрыть' }
            ];

            // Try to add to existing footer
            const footer = document.querySelector('.footer, footer');
            if (footer) {
                const shortcutsDiv = document.createElement('div');
                shortcutsDiv.className = 'm2-keyboard-hints';
                shortcutsDiv.innerHTML = `
                    <div class="m2-keyboard-hints-toggle" onclick="this.parentElement.classList.toggle('expanded')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                            <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h8M6 16h12"></path>
                        </svg>
                        <span>Горячие клавиши</span>
                    </div>
                    <div class="m2-keyboard-hints-list">
                        ${hints.map(h => `<div class="hint-item"><kbd>${h.key}</kbd> ${h.action}</div>`).join('')}
                    </div>
                `;
                footer.appendChild(shortcutsDiv);
            }
        }
    };

    // Inject CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .m2-toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1A1B22;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 10000;
        }

        .m2-toast-show {
            opacity: 1;
            transform: translateY(0);
        }

        .m2-toast-success {
            background: #00C27D;
        }

        .m2-toast-info {
            background: #4F2CD9;
        }

        .m2-toast-warning {
            background: #FFB800;
            color: #1A1B22;
        }

        .m2-keyboard-hints {
            margin-top: 20px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 13px;
        }

        .m2-keyboard-hints-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            color: #797981;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .m2-keyboard-hints-toggle:hover {
            color: #4F2CD9;
        }

        .m2-keyboard-hints-toggle svg {
            width: 16px;
            height: 16px;
        }

        .m2-keyboard-hints-list {
            display: none;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 8px;
            margin-top: 12px;
        }

        .m2-keyboard-hints.expanded .m2-keyboard-hints-list {
            display: grid;
        }

        .hint-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #1A1B22;
        }

        .hint-item kbd {
            background: white;
            border: 1px solid #E1E1E3;
            border-radius: 4px;
            padding: 2px 6px;
            font-family: 'SF Mono', Monaco, 'Courier New', monospace;
            font-size: 11px;
            font-weight: 600;
            color: #4F2CD9;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 768px) {
            .m2-toast {
                left: 16px;
                right: 16px;
                bottom: 16px;
            }

            .m2-keyboard-hints {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => M2Keyboard.init());
    } else {
        M2Keyboard.init();
    }

    // Expose to global scope
    window.M2Keyboard = M2Keyboard;
})();
