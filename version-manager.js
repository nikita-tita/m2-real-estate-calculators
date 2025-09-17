/**
 * M2 Calculators Version Manager
 * Управляет версиями модулей и их совместимостью
 */

class VersionManager {
    constructor() {
        this.currentVersion = '1.0.0';
        this.versionHistory = this.loadVersionHistory();
        this.modules = new Map();

        this.init();
    }

    init() {
        // Регистрируем обработчики версий
        this.setupVersionHandlers();

        // Проверяем совместимость при загрузке
        this.checkCompatibility();
    }

    setupVersionHandlers() {
        // Обработчик для обновления версий модулей
        document.addEventListener('moduleLoaded', (event) => {
            const { name, version } = event.detail;
            this.registerModuleVersion(name, version);
        });

        // Обработчик для миграции данных
        document.addEventListener('versionUpdate', (event) => {
            const { oldVersion, newVersion } = event.detail;
            this.performMigration(oldVersion, newVersion);
        });
    }

    registerModuleVersion(moduleName, version) {
        const moduleInfo = {
            name: moduleName,
            version: version,
            loadedAt: new Date(),
            compatible: this.isVersionCompatible(version)
        };

        this.modules.set(moduleName, moduleInfo);

        // Сохраняем информацию о модуле
        this.saveModuleInfo(moduleInfo);
    }

    isVersionCompatible(moduleVersion) {
        const parseVersion = (v) => v.split('.').map(Number);
        const [moduleMajor] = parseVersion(moduleVersion);
        const [systemMajor] = parseVersion(this.currentVersion);

        // Совместимость в рамках одной мажорной версии
        return moduleMajor === systemMajor;
    }

    checkCompatibility() {
        const incompatibleModules = [];

        this.modules.forEach((moduleInfo, name) => {
            if (!moduleInfo.compatible) {
                incompatibleModules.push(moduleInfo);
            }
        });

        if (incompatibleModules.length > 0) {
            this.handleIncompatibleModules(incompatibleModules);
        }
    }

    handleIncompatibleModules(modules) {
        console.warn('Обнаружены несовместимые модули:', modules);

        // Показываем предупреждение пользователю
        this.showCompatibilityWarning(modules);

        // Пытаемся обновить несовместимые модули
        modules.forEach(module => {
            this.attemptModuleUpdate(module.name);
        });
    }

    showCompatibilityWarning(modules) {
        const warning = document.createElement('div');
        warning.className = 'version-warning';
        warning.innerHTML = `
            <div class="warning-header">
                <span class="warning-icon">⚠️</span>
                <strong>Обнаружены устаревшие модули</strong>
            </div>
            <div class="warning-content">
                <p>Следующие модули могут работать некорректно:</p>
                <ul>
                    ${modules.map(m => `<li>${m.name} (v${m.version})</li>`).join('')}
                </ul>
                <button class="update-modules-btn" onclick="this.updateAllModules()">
                    Обновить все модули
                </button>
            </div>
            <button class="warning-close" onclick="this.parentElement.remove()">✕</button>
        `;

        this.injectWarningStyles();
        document.body.appendChild(warning);

        // Привязываем обработчик обновления
        warning.querySelector('.update-modules-btn').onclick = () => {
            this.updateAllIncompatibleModules();
            warning.remove();
        };
    }

    async updateAllIncompatibleModules() {
        if (window.M2AutoUpdater) {
            await window.M2AutoUpdater.forceUpdate();
        }
    }

    async attemptModuleUpdate(moduleName) {
        try {
            // Проверяем доступность обновления
            const updateInfo = await this.getModuleUpdateInfo(moduleName);

            if (updateInfo && updateInfo.available) {
                await this.updateModule(moduleName, updateInfo);
            }
        } catch (error) {
            console.error(`Не удалось обновить модуль ${moduleName}:`, error);
        }
    }

    async getModuleUpdateInfo(moduleName) {
        try {
            const response = await fetch(`/modules/${moduleName}/update-info.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            // Обновление недоступно
        }
        return null;
    }

    async updateModule(moduleName, updateInfo) {
        // Логика обновления модуля
        const response = await fetch(updateInfo.downloadUrl);
        if (!response.ok) throw new Error('Failed to download update');

        const content = await response.text();

        // Сохраняем обновленный модуль
        localStorage.setItem(`m2_module_${moduleName}`, content);

        // Обновляем информацию о версии
        this.registerModuleVersion(moduleName, updateInfo.version);
    }

    performMigration(oldVersion, newVersion) {
        const migrations = this.getMigrations(oldVersion, newVersion);

        migrations.forEach(migration => {
            try {
                migration.execute();
                console.log(`Миграция ${migration.name} выполнена успешно`);
            } catch (error) {
                console.error(`Ошибка миграции ${migration.name}:`, error);
            }
        });
    }

    getMigrations(from, to) {
        const migrations = [];

        // Определяем необходимые миграции на основе версий
        if (this.compareVersions(from, '1.0.0') < 0) {
            migrations.push({
                name: 'migrate_to_1_0_0',
                execute: () => this.migrateTo100()
            });
        }

        return migrations;
    }

    migrateTo100() {
        // Миграция настроек к версии 1.0.0
        const oldSettings = localStorage.getItem('calculatorSettings');
        if (oldSettings) {
            const settings = JSON.parse(oldSettings);

            // Конвертируем старый формат в новый
            const newSettings = {
                ...settings,
                version: '1.0.0',
                migrationDate: new Date().toISOString()
            };

            localStorage.setItem('m2_settings', JSON.stringify(newSettings));
        }
    }

    compareVersions(version1, version2) {
        const parseVersion = (v) => v.split('.').map(Number);
        const [major1, minor1, patch1] = parseVersion(version1);
        const [major2, minor2, patch2] = parseVersion(version2);

        if (major1 !== major2) return major1 - major2;
        if (minor1 !== minor2) return minor1 - minor2;
        return patch1 - patch2;
    }

    loadVersionHistory() {
        const stored = localStorage.getItem('m2_version_history');
        return stored ? JSON.parse(stored) : [];
    }

    saveVersionHistory() {
        localStorage.setItem('m2_version_history', JSON.stringify(this.versionHistory));
    }

    saveModuleInfo(moduleInfo) {
        const modulesInfo = this.getStoredModulesInfo();
        modulesInfo[moduleInfo.name] = moduleInfo;
        localStorage.setItem('m2_modules_info', JSON.stringify(modulesInfo));
    }

    getStoredModulesInfo() {
        const stored = localStorage.getItem('m2_modules_info');
        return stored ? JSON.parse(stored) : {};
    }

    injectWarningStyles() {
        if (document.querySelector('#version-warning-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'version-warning-styles';
        styles.textContent = `
            .version-warning {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10002;
                max-width: 500px;
                animation: slideInTop 0.5s ease-out;
            }

            .warning-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 15px;
                font-size: 16px;
            }

            .warning-icon {
                font-size: 20px;
                animation: pulse 2s infinite;
            }

            .warning-content {
                font-size: 14px;
                line-height: 1.4;
            }

            .warning-content ul {
                margin: 10px 0;
                padding-left: 20px;
            }

            .warning-content li {
                margin: 5px 0;
            }

            .update-modules-btn {
                background: rgba(255,255,255,0.2);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
                transition: all 0.3s ease;
            }

            .update-modules-btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-1px);
            }

            .warning-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
            }

            .warning-close:hover {
                opacity: 1;
            }

            @keyframes slideInTop {
                from {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
            }

            @keyframes pulse {
                0%, 50%, 100% {
                    opacity: 1;
                }
                25%, 75% {
                    opacity: 0.5;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Публичные методы
    getCurrentVersion() {
        return this.currentVersion;
    }

    getModuleVersions() {
        const versions = {};
        this.modules.forEach((info, name) => {
            versions[name] = info.version;
        });
        return versions;
    }

    getVersionHistory() {
        return [...this.versionHistory];
    }

    getSystemInfo() {
        return {
            systemVersion: this.currentVersion,
            loadedModules: this.modules.size,
            moduleVersions: this.getModuleVersions(),
            lastUpdate: this.versionHistory[this.versionHistory.length - 1]?.date || null
        };
    }
}

// Создаем и экспортируем экземпляр
const versionManager = new VersionManager();

// Добавляем в глобальную область
window.M2VersionManager = versionManager;

// Информируем систему о загрузке модуля
if (window.M2EnhancementsLoader) {
    window.M2EnhancementsLoader.registerModule('version-manager', versionManager);
}