/**
 * ==========================================
 * SETTINGS MODULE (Superadmin Only)
 * ==========================================
 * System configuration and error logs.
 */

const Settings = {
    demoLogs: [
        { timestamp: '2024-06-09 09:15:22', level: 'info', message: 'User shane@burnettsbutcher.com signed in', source: 'auth' },
        { timestamp: '2024-06-09 09:12:05', level: 'warning', message: 'Low stock threshold reached: Chicken Breast (2 remaining)', source: 'inventory' },
        { timestamp: '2024-06-09 08:45:33', level: 'error', message: 'Failed to send pickup notification SMS to +1-705-555-0142', source: 'notifications' },
        { timestamp: '2024-06-09 08:30:01', level: 'info', message: 'Daily backup completed successfully', source: 'system' },
        { timestamp: '2024-06-08 17:00:00', level: 'info', message: 'End-of-day report generated: $3,245.50 total sales', source: 'reports' },
        { timestamp: '2024-06-08 15:22:11', level: 'warning', message: 'Order #1035 pickup time exceeded by 30 minutes', source: 'orders' },
        { timestamp: '2024-06-08 14:05:44', level: 'error', message: 'Supabase connection timeout (retry succeeded)', source: 'database' },
        { timestamp: '2024-06-08 09:00:00', level: 'info', message: 'System started - version 1.0.0', source: 'system' },
    ],

    /**
     * Render settings view
     */
    render(container) {
        if (!Auth.canManageUsers()) {
            container.innerHTML = '<div class="text-center py-20"><p class="text-gray-400">Access Denied. Superadmin privileges required.</p></div>';
            return;
        }

        container.innerHTML = this.getTemplate();
    },

    /**
     * Get settings template
     */
    getTemplate() {
        return `
            <!-- System Info -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6">
                    <h3 class="text-sm font-semibold text-gray-400 mb-4">System Status</h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-300">Application</span>
                            <span class="flex items-center gap-1.5 text-sm text-green-400">
                                <div class="w-2 h-2 rounded-full bg-green-400"></div> Online
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-300">Database</span>
                            <span class="flex items-center gap-1.5 text-sm text-green-400">
                                <div class="w-2 h-2 rounded-full bg-green-400"></div> Connected
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-300">SMS Service</span>
                            <span class="flex items-center gap-1.5 text-sm text-yellow-400">
                                <div class="w-2 h-2 rounded-full bg-yellow-400"></div> Degraded
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-300">Version</span>
                            <span class="text-sm text-gray-400">${APP_CONFIG.version}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6">
                    <h3 class="text-sm font-semibold text-gray-400 mb-4">Configuration</h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-300">Low Stock Threshold</span>
                            <span class="text-sm text-white font-medium">${APP_CONFIG.lowStockThreshold} units</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-300">Currency</span>
                            <span class="text-sm text-white font-medium">${APP_CONFIG.currency}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-300">Timezone</span>
                            <span class="text-sm text-white font-medium">${APP_CONFIG.timezone}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-300">Auto-Backup</span>
                            <span class="text-sm text-green-400">Enabled</span>
                        </div>
                    </div>
                </div>

                <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6">
                    <h3 class="text-sm font-semibold text-gray-400 mb-4">Quick Actions</h3>
                    <div class="space-y-2">
                        <button class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-900/50 rounded-lg transition-colors">
                            Export All Data (CSV)
                        </button>
                        <button class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-900/50 rounded-lg transition-colors">
                            Run Manual Backup
                        </button>
                        <button class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-900/50 rounded-lg transition-colors">
                            Clear Error Logs
                        </button>
                        <button class="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors">
                            Reset Demo Data
                        </button>
                    </div>
                </div>
            </div>

            <!-- System Logs -->
            <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">System Logs</h3>
                    <div class="flex items-center gap-2">
                        <select class="bg-dark-900 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                            <option value="all">All Levels</option>
                            <option value="error">Errors Only</option>
                            <option value="warning">Warnings</option>
                            <option value="info">Info</option>
                        </select>
                    </div>
                </div>
                <div class="space-y-2 font-mono text-xs">
                    ${this.demoLogs.map(log => this.getLogEntry(log)).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Generate log entry HTML
     */
    getLogEntry(log) {
        const levelColors = {
            info: 'text-blue-400 bg-blue-900/20',
            warning: 'text-yellow-400 bg-yellow-900/20',
            error: 'text-red-400 bg-red-900/20',
        };

        return `
            <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-900/50 transition-colors">
                <span class="text-gray-600 whitespace-nowrap">${log.timestamp}</span>
                <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold ${levelColors[log.level]}">${log.level}</span>
                <span class="text-gray-500">[${log.source}]</span>
                <span class="text-gray-300 flex-1">${log.message}</span>
            </div>
        `;
    }
};
