/**
 * M2 Calculators Auto-Updater System
 * Обеспечивает автоматическое обновление системы улучшений
 */

class AutoUpdater {
    constructor() {
        this.version = '1.0.0';
        this.updateCheckInterval = 24 * 60 * 60 * 1000; // 24 часа
        this.updateUrl = '/version.json';
        this.moduleBaseUrl = '/modules/';
        this.lastCheck = this.getLastCheckTime();

        this.init();
    }

    init() {
        // Проверяем обновления при загрузке
        this.checkForUpdates();

        // Устанавливаем периодическую проверку
        setInterval(() => {
            this.checkForUpdates();
        }, this.updateCheckInterval);
    }

    async checkForUpdates() {
        try {
            const response = await fetch(this.updateUrl);
            if (!response.ok) return;

            const versionInfo = await response.json();

            if (this.isNewerVersion(versionInfo.version, this.version)) {
                await this.performUpdate(versionInfo);
            }

            this.setLastCheckTime();
        } catch (error) {
            console.warn('Auto-update check failed:', error);
        }
    }

    isNewerVersion(newVersion, currentVersion) {
        const parseVersion = (v) => v.split('.').map(Number);
        const [newMajor, newMinor, newPatch] = parseVersion(newVersion);
        const [currMajor, currMinor, currPatch] = parseVersion(currentVersion);

        if (newMajor > currMajor) return true;
        if (newMajor < currMajor) return false;

        if (newMinor > currMinor) return true;
        if (newMinor < currMinor) return false;

        return newPatch > currPatch;
    }

    async performUpdate(versionInfo) {
        const { modules, version, changes } = versionInfo;

        // Обновляем модули
        for (const module of modules) {
            await this.updateModule(module);
        }

        // Обновляем версию
        this.version = version;
        this.saveVersion();

        // Показываем уведомление об обновлении
        this.showUpdateNotification(changes);

        // Перезагружаем обновленные модули
        this.reloadModules(modules);
    }

    async updateModule(module) {
        try {
            const response = await fetch(this.moduleBaseUrl + module.file);
            if (!response.ok) return false;

            const content = await response.text();

            // Сохраняем в localStorage для кэширования
            localStorage.setItem(`m2_module_${module.name}`, content);

            return true;
        } catch (error) {
            console.error(`Failed to update module ${module.name}:`, error);
            return false;
        }
    }

    reloadModules(modules) {
        modules.forEach(module => {
            // Удаляем старый скрипт
            const oldScript = document.querySelector(`script[data-module="${module.name}"]`);
            if (oldScript) {
                oldScript.remove();
            }

            // Загружаем новый
            const script = document.createElement('script');
            script.src = this.moduleBaseUrl + module.file + '?v=' + Date.now();
            script.setAttribute('data-module', module.name);
            document.head.appendChild(script);
        });
    }

    showUpdateNotification(changes) {
        // Создаем стильное уведомление
        const notification = document.createElement('div');
        notification.className = 'auto-update-notification';
        notification.innerHTML = `
            <div class="update-header">
                <span class="update-icon">🚀</span>
                <strong>Система обновлена до версии ${this.version}!</strong>
            </div>
            <div class="update-changes">
                ${changes.map(change => `<div class="change-item">• ${change}</div>`).join('')}
            </div>
            <button class="update-close" onclick="this.parentElement.remove()">✕</button>
        `;

        // Добавляем стили
        this.injectUpdateStyles();

        document.body.appendChild(notification);

        // Автоматически скрываем через 10 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    injectUpdateStyles() {
        if (document.querySelector('#auto-updater-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'auto-updater-styles';
        styles.textContent = `
            .auto-update-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10001;
                max-width: 400px;
                animation: slideInRight 0.5s ease-out;
            }

            .update-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
            }

            .update-icon {
                font-size: 20px;
                animation: bounce 1s infinite;
            }

            .update-changes {
                font-size: 14px;
                opacity: 0.9;
                line-height: 1.4;
            }

            .change-item {
                margin: 3px 0;
            }

            .update-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                opacity: 0.7;
            }

            .update-close:hover {
                opacity: 1;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-3px);
                }
                60% {
                    transform: translateY(-1px);
                }
            }
        `;

        document.head.appendChild(styles);
    }

    getLastCheckTime() {
        return parseInt(localStorage.getItem('m2_last_update_check') || '0');
    }

    setLastCheckTime() {
        localStorage.setItem('m2_last_update_check', Date.now().toString());
    }

    saveVersion() {
        localStorage.setItem('m2_current_version', this.version);
    }

    // Публичные методы для внешнего использования
    forceUpdate() {
        this.checkForUpdates();
    }

    getVersion() {
        return this.version;
    }

    getUpdateStatus() {
        return {
            version: this.version,
            lastCheck: new Date(this.lastCheck),
            nextCheck: new Date(Date.now() + this.updateCheckInterval)
        };
    }
}

// Создаем и экспортируем экземпляр
const autoUpdater = new AutoUpdater();

// Добавляем в глобальную область
window.M2AutoUpdater = autoUpdater;

// Информируем систему о загрузке модуля
if (window.M2EnhancementsLoader) {
    window.M2EnhancementsLoader.registerModule('auto-updater', autoUpdater);
}