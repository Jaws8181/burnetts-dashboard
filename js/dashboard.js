/**
 * ==========================================
 * DASHBOARD MODULE
 * ==========================================
 * Manager/Superadmin view with financial metrics and Chart.js analytics.
 * Staff users are NOT routed here.
 */

const Dashboard = {
    chart: null,

    /**
     * Render the dashboard view
     */
    render(container) {
        container.innerHTML = this.getTemplate();
        this.initChart();
        this.loadMetrics();
    },

    /**
     * Get dashboard HTML template
     */
    getTemplate() {
        return `
            <!-- Top Metrics Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${this.getMetricCard('Today\'s Sales', '$2,847.50', '+12.5%', 'up', 'dollar')}
                ${this.getMetricCard('Pending Orders', '14', '+3 new', 'up', 'order')}
                ${this.getMetricCard('Items Low Stock', '6', 'Needs attention', 'warning', 'warning')}
                ${this.getMetricCard('Completed Today', '23', '+8 vs yesterday', 'up', 'check')}
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Revenue Chart -->
                <div class="lg:col-span-2 bg-dark-800 border border-gray-700/50 rounded-2xl p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h3 class="text-lg font-semibold text-white">Weekly Revenue</h3>
                            <p class="text-sm text-gray-400">Last 7 days performance</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl font-bold text-white">$18,420</span>
                            <span class="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+8.2%</span>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="revenue-chart"></canvas>
                    </div>
                </div>

                <!-- Top Products -->
                <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Top Products</h3>
                    <div class="space-y-4">
                        ${this.getTopProduct('AAA Ribeye Steak', 47, '$1,645.00')}
                        ${this.getTopProduct('Wagyu Tomahawk', 12, '$1,440.00')}
                        ${this.getTopProduct('BBQ Box (Family)', 34, '$1,190.00')}
                        ${this.getTopProduct('Bacon (1kg)', 89, '$890.00')}
                        ${this.getTopProduct('Ground Chuck (5lb)', 56, '$672.00')}
                    </div>
                </div>
            </div>

            <!-- Recent Orders & Activity -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Recent Orders -->
                <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-white">Recent Orders</h3>
                        <button onclick="Router.navigate('orders')" class="text-sm text-brand-400 hover:text-brand-300">View All</button>
                    </div>
                    <div class="space-y-3">
                        ${this.getRecentOrder('#1042', 'Sarah Mitchell', 'BBQ Box + Ribeyes', 'ready', '$187.50')}
                        ${this.getRecentOrder('#1041', 'Dave Thompson', 'Thanksgiving Turkey Pack', 'prepping', '$245.00')}
                        ${this.getRecentOrder('#1040', 'Lisa Park', 'Weekly Family Bundle', 'new', '$156.00')}
                        ${this.getRecentOrder('#1039', 'Mark Wilson', 'Wagyu Tomahawk x2', 'completed', '$320.00')}
                    </div>
                </div>

                <!-- Activity Feed -->
                <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Activity Feed</h3>
                    <div class="space-y-4">
                        ${this.getActivityItem('Order #1042 marked as Ready', '2 min ago', 'green')}
                        ${this.getActivityItem('Low stock alert: Chicken Breast', '15 min ago', 'red')}
                        ${this.getActivityItem('New order #1042 received', '28 min ago', 'blue')}
                        ${this.getActivityItem('Inventory updated: Ground Chuck +50lbs', '1 hr ago', 'yellow')}
                        ${this.getActivityItem('Order #1038 picked up by customer', '2 hrs ago', 'gray')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate metric card HTML
     */
    getMetricCard(title, value, change, trend, type) {
        const iconColors = {
            dollar: 'bg-green-500/10 text-green-400',
            order: 'bg-blue-500/10 text-blue-400',
            warning: 'bg-yellow-500/10 text-yellow-400',
            check: 'bg-purple-500/10 text-purple-400',
        };

        const icons = {
            dollar: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            order: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>',
            warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
            check: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        };

        const trendColor = trend === 'up' ? 'text-green-400' : trend === 'warning' ? 'text-yellow-400' : 'text-red-400';

        return `
            <div class="metric-card bg-dark-800 border border-gray-700/50 rounded-2xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="p-2 rounded-xl ${iconColors[type]}">
                        ${icons[type]}
                    </div>
                    <span class="text-xs ${trendColor}">${change}</span>
                </div>
                <h4 class="text-2xl font-bold text-white mb-1">${value}</h4>
                <p class="text-sm text-gray-400">${title}</p>
            </div>
        `;
    },

    /**
     * Generate top product row
     */
    getTopProduct(name, sold, revenue) {
        const percentage = Math.min((sold / 100) * 100, 100);
        return `
            <div class="flex items-center gap-3">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                        <p class="text-sm font-medium text-white truncate">${name}</p>
                        <span class="text-xs text-gray-400">${sold} sold</span>
                    </div>
                    <div class="w-full bg-dark-900 rounded-full h-1.5">
                        <div class="bg-brand-500 h-1.5 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <span class="text-sm font-semibold text-brand-400 ml-2">${revenue}</span>
            </div>
        `;
    },

    /**
     * Generate recent order row
     */
    getRecentOrder(id, customer, items, status, total) {
        const statusClasses = {
            new: 'badge-new',
            prepping: 'badge-prepping',
            ready: 'badge-ready',
            completed: 'badge-completed',
        };

        return `
            <div class="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl">
                <div class="flex items-center gap-3">
                    <span class="text-xs font-mono text-gray-500">${id}</span>
                    <div>
                        <p class="text-sm font-medium text-white">${customer}</p>
                        <p class="text-xs text-gray-400">${items}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs px-2 py-1 rounded-full ${statusClasses[status]}">${status}</span>
                    <span class="text-sm font-semibold text-white">${total}</span>
                </div>
            </div>
        `;
    },

    /**
     * Generate activity feed item
     */
    getActivityItem(text, time, color) {
        const dotColors = {
            green: 'bg-green-400',
            red: 'bg-red-400',
            blue: 'bg-blue-400',
            yellow: 'bg-yellow-400',
            gray: 'bg-gray-400',
        };

        return `
            <div class="flex items-start gap-3">
                <div class="mt-2 w-2 h-2 rounded-full ${dotColors[color]} flex-shrink-0"></div>
                <div class="flex-1">
                    <p class="text-sm text-gray-300">${text}</p>
                    <p class="text-xs text-gray-500 mt-0.5">${time}</p>
                </div>
            </div>
        `;
    },

    /**
     * Initialize Chart.js revenue chart
     */
    initChart() {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;

        // Destroy existing chart if any
        if (this.chart) {
            this.chart.destroy();
        }

        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = [2100, 2450, 1980, 2800, 3200, 3650, 2240];

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Revenue ($)',
                    data,
                    borderColor: '#b08968',
                    backgroundColor: 'rgba(176, 137, 104, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#b08968',
                    pointBorderColor: '#b08968',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1f2e',
                        titleColor: '#fff',
                        bodyColor: '#9ca3af',
                        borderColor: '#374151',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => `Revenue: $${ctx.parsed.y.toLocaleString()}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(55, 65, 81, 0.3)' },
                        ticks: { color: '#9ca3af' }
                    },
                    y: {
                        grid: { color: 'rgba(55, 65, 81, 0.3)' },
                        ticks: {
                            color: '#9ca3af',
                            callback: (value) => '$' + value.toLocaleString()
                        }
                    }
                }
            }
        });
    },

    /**
     * Load metrics from Supabase (or use demo data)
     */
    async loadMetrics() {
        try {
            // Attempt to fetch from Supabase
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .gte('created_at', new Date().toISOString().split('T')[0]);

            if (error) throw error;

            // Update metrics with real data if available
            // For now, demo data is displayed in the template
        } catch (err) {
            console.log('Using demo data for dashboard metrics');
        }
    }
};
