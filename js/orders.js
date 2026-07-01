/**
 * ==========================================
 * ORDERS MODULE - Kanban Board
 * ==========================================
 * Drag-and-drop + tap-to-advance order management.
 * Features: countdown timers, sound alerts on new orders.
 */

const Orders = {
    timerInterval: null,
    soundEnabled: true,

    // Demo orders — pickup times set relative to now so timers are meaningful
    get demoOrders() {
        if (this._demoOrders) return this._demoOrders;
        const now = new Date();
        const t = (offsetMin) => {
            const d = new Date(now.getTime() + offsetMin * 60000);
            return d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true });
        };
        this._demoOrders = [
            { id: 1042, customer: 'Sarah Mitchell',  items: ['BBQ Box (Family)', 'AAA Ribeye x4'],          pickup_time: t(75),   status: 'new',       total: 187.50, phone: '705-555-0142' },
            { id: 1041, customer: 'Dave Thompson',   items: ['Thanksgiving Turkey Pack', 'Cranberry Sausage x6'], pickup_time: t(140),  status: 'new',       total: 245.00, phone: '705-555-0198' },
            { id: 1040, customer: 'Lisa Park',       items: ['Weekly Family Bundle', 'Bacon 1kg'],           pickup_time: t(25),   status: 'prepping',  total: 156.00, phone: '705-555-0167' },
            { id: 1039, customer: 'Mark Wilson',     items: ['Wagyu Tomahawk x2', 'Peppercorn Rub'],         pickup_time: t(50),   status: 'prepping',  total: 320.00, phone: '705-555-0234' },
            { id: 1038, customer: 'Jennifer Adams',  items: ['Ground Chuck 5lb', 'Cheddar Bacon Burgers x8'], pickup_time: t(-10),  status: 'prepping',  total: 89.50,  phone: '705-555-0189' },
            { id: 1037, customer: 'Robert Chen',     items: ['Summer BBQ Box', 'Jalapeño Sausage x12'],      pickup_time: t(30),   status: 'ready',     total: 210.00, phone: '705-555-0156' },
            { id: 1036, customer: 'Amanda Foster',   items: ['Striploin x3', 'Garlic Butter'],               pickup_time: t(10),   status: 'new',       total: 135.00, phone: '705-555-0201' },
            { id: 1035, customer: 'Chris Nguyen',    items: ['Pork Belly 2kg', 'Apple Cider Brine'],          pickup_time: t(110),  status: 'prepping',  total: 78.00,  phone: '705-555-0178' },
        ];
        return this._demoOrders;
    },

    /**
     * Render the orders Kanban board
     */
    render(container) {
        container.innerHTML = this.getTemplate();
        this.initDragAndDrop();
        this.populateColumns();
        this.startTimers();
        this.subscribeToNewOrders();
    },

    /**
     * Get Kanban board template
     */
    getTemplate() {
        return `
            <!-- Orders Header -->
            <div class="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2 bg-dark-800 border border-gray-700/50 rounded-xl px-4 py-2">
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input type="text" placeholder="Search orders..." id="order-search"
                            class="bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none w-32 md:w-48">
                    </div>
                    <!-- Sound toggle -->
                    <button onclick="Orders.toggleSound()" id="sound-btn" title="Toggle order alerts"
                        class="p-2 rounded-xl bg-dark-800 border border-gray-700/50 text-gray-400 hover:text-white transition-colors text-lg leading-none">
                        🔔
                    </button>
                </div>
                <button onclick="Orders.showNewOrderModal()"
                    class="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-brand-600/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    New Order
                </button>
            </div>

            <!-- Mobile Status Tabs -->
            <div class="flex md:hidden gap-2 mb-4 overflow-x-auto pb-1">
                <button onclick="Orders.filterByStatus('all')" id="tab-all"
                    class="status-tab flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 text-white transition-colors">
                    All
                </button>
                <button onclick="Orders.filterByStatus('new')" id="tab-new"
                    class="status-tab flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-dark-800 text-gray-400 border border-gray-700/50 transition-colors">
                    🔵 New
                </button>
                <button onclick="Orders.filterByStatus('prepping')" id="tab-prepping"
                    class="status-tab flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-dark-800 text-gray-400 border border-gray-700/50 transition-colors">
                    🟡 Prepping
                </button>
                <button onclick="Orders.filterByStatus('ready')" id="tab-ready"
                    class="status-tab flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-dark-800 text-gray-400 border border-gray-700/50 transition-colors">
                    🟢 Ready
                </button>
                <button onclick="Orders.filterByStatus('completed')" id="tab-completed"
                    class="status-tab flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-dark-800 text-gray-400 border border-gray-700/50 transition-colors">
                    ✅ Picked Up
                </button>
            </div>

            <!-- Kanban Board -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- New Orders Column -->
                <div class="kanban-column" data-status="new">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-3 h-3 rounded-full bg-blue-400"></div>
                        <h3 class="text-sm font-semibold text-white">New</h3>
                        <span class="text-xs bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded-full" id="count-new">0</span>
                    </div>
                    <div class="space-y-3 min-h-[200px] p-2 rounded-xl border-2 border-dashed border-transparent transition-colors"
                         id="column-new" data-status="new"></div>
                </div>

                <!-- Prepping Column -->
                <div class="kanban-column" data-status="prepping">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <h3 class="text-sm font-semibold text-white">Prepping</h3>
                        <span class="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full" id="count-prepping">0</span>
                    </div>
                    <div class="space-y-3 min-h-[200px] p-2 rounded-xl border-2 border-dashed border-transparent transition-colors"
                         id="column-prepping" data-status="prepping"></div>
                </div>

                <!-- Ready for Pickup Column -->
                <div class="kanban-column" data-status="ready">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-3 h-3 rounded-full bg-green-400"></div>
                        <h3 class="text-sm font-semibold text-white">Ready for Pickup</h3>
                        <span class="text-xs bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full" id="count-ready">0</span>
                    </div>
                    <div class="space-y-3 min-h-[200px] p-2 rounded-xl border-2 border-dashed border-transparent transition-colors"
                         id="column-ready" data-status="ready"></div>
                </div>

                <!-- Picked Up Column -->
                <div class="kanban-column" data-status="completed">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-3 h-3 rounded-full bg-gray-500"></div>
                        <h3 class="text-sm font-semibold text-gray-400">Picked Up</h3>
                        <span class="text-xs bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded-full" id="count-completed">0</span>
                    </div>
                    <div class="space-y-3 min-h-[200px] p-2 rounded-xl border-2 border-dashed border-transparent transition-colors"
                         id="column-completed" data-status="completed"></div>
                </div>
            </div>

            <!-- New Order Modal -->
            <div id="new-order-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center modal-overlay">
                <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-white">Create New Order</h3>
                        <button onclick="Orders.hideNewOrderModal()" class="text-gray-400 hover:text-white">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <form id="new-order-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Customer Name</label>
                            <input type="text" name="customer" required
                                class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                            <input type="tel" name="phone" required
                                class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Items (one per line)</label>
                            <textarea name="items" rows="3" required
                                class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Pickup Time</label>
                                <input type="time" name="pickup_time" required
                                    class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Total ($)</label>
                                <input type="number" name="total" step="0.01" required
                                    class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                            </div>
                        </div>
                        <button type="submit"
                            class="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors">
                            Create Order
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Populate Kanban columns with order cards
     */
    populateColumns() {
        ['new', 'prepping', 'ready', 'completed'].forEach(status => {
            const column  = document.getElementById(`column-${status}`);
            const countEl = document.getElementById(`count-${status}`);
            const orders  = this.demoOrders.filter(o => o.status === status);
            if (countEl) countEl.textContent = orders.length;
            if (column)  column.innerHTML = orders.map(o => this.getOrderCard(o)).join('');
        });
    },

    /**
     * Generate order card HTML
     */
    getOrderCard(order) {
        const borderColors = { new: 'border-l-blue-400', prepping: 'border-l-yellow-400', ready: 'border-l-green-400', completed: 'border-l-gray-600' };
        const timer = this.getTimerBadge(order);

        return `
            <div class="kanban-card bg-dark-800 border border-gray-700/50 ${borderColors[order.status] || 'border-l-gray-600'} border-l-4 rounded-xl p-4 shadow-sm"
                 draggable="true" data-order-id="${order.id}">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-mono text-gray-500">#${order.id}</span>
                    ${timer}
                </div>
                <h4 class="text-sm font-semibold text-white mb-1">${order.customer}</h4>
                <div class="space-y-0.5 mb-3">
                    ${order.items.map(item => `<p class="text-xs text-gray-400">• ${item}</p>`).join('')}
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-gray-700/50">
                    <span class="text-xs text-gray-500">${order.phone}</span>
                    ${Auth.canViewFinancials() ? `<span class="text-sm font-semibold text-brand-400">$${order.total.toFixed(2)}</span>` : ''}
                </div>
                ${this.getNextStatusButton(order)}
            </div>
        `;
    },

    /**
     * Countdown timer badge — color shifts as pickup approaches
     */
    getTimerBadge(order) {
        if (order.status === 'completed') {
            return `<span class="text-xs text-gray-500">${order.pickup_time}</span>`;
        }
        if (order.status === 'ready') {
            return `<span class="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">✓ READY</span>`;
        }

        // Calculate minutes remaining
        const minsLeft = this.minutesUntilPickup(order.pickup_time);

        if (minsLeft === null) {
            return `<span class="text-xs text-gray-400">${order.pickup_time}</span>`;
        }

        if (minsLeft < 0) {
            const late = Math.abs(minsLeft);
            return `<span class="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full animate-pulse">LATE ${late}m</span>`;
        }
        if (minsLeft < 15) {
            const label = minsLeft < 1 ? 'NOW' : `${minsLeft}m`;
            return `<span class="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full animate-pulse">⏰ ${label}</span>`;
        }
        if (minsLeft < 30) {
            return `<span class="text-xs font-semibold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">⏰ ${minsLeft}m</span>`;
        }
        if (minsLeft < 60) {
            return `<span class="text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">🕐 ${minsLeft}m</span>`;
        }
        const hrs = Math.floor(minsLeft / 60);
        const mins = minsLeft % 60;
        const label = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
        return `<span class="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">🕐 ${label}</span>`;
    },

    /**
     * Parse "2:30 PM" style time and return minutes from now
     */
    minutesUntilPickup(timeStr) {
        if (!timeStr) return null;
        try {
            const now = new Date();
            const pickup = new Date(now);
            // Handle both "2:30 PM" and "14:30" formats
            const match12 = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            const match24 = timeStr.match(/^(\d+):(\d+)$/);
            if (match12) {
                let h = parseInt(match12[1]);
                const m = parseInt(match12[2]);
                const ampm = match12[3].toUpperCase();
                if (ampm === 'PM' && h !== 12) h += 12;
                if (ampm === 'AM' && h === 12) h = 0;
                pickup.setHours(h, m, 0, 0);
            } else if (match24) {
                pickup.setHours(parseInt(match24[1]), parseInt(match24[2]), 0, 0);
            } else {
                return null;
            }
            return Math.round((pickup - now) / 60000);
        } catch {
            return null;
        }
    },

    /**
     * Start auto-refreshing timers every 30 seconds
     */
    startTimers() {
        this.stopTimers();
        this.timerInterval = setInterval(() => {
            // Refresh only timer badges, not full re-render
            this.demoOrders.forEach(order => {
                const card = document.querySelector(`[data-order-id="${order.id}"]`);
                if (!card) return;
                const badge = card.querySelector('.timer-badge');
                if (badge) {
                    badge.outerHTML = this.getTimerBadge(order);
                } else {
                    // Badge not found by class — re-render full columns
                    clearInterval(this.timerInterval);
                    this.populateColumns();
                    this.initDragAndDrop();
                    this.startTimers();
                }
            });
        }, 30000);
    },

    /**
     * Stop timers (call when navigating away)
     */
    stopTimers() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    /**
     * Get the "move to next status" button for a card
     */
    getNextStatusButton(order) {
        const next   = { new: 'prepping', prepping: 'ready', ready: 'completed' };
        const labels = { prepping: '▶ Start Prepping', ready: '✓ Mark Ready', completed: '✓ Picked Up' };
        const colors = {
            prepping:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30',
            ready:     'bg-green-500/20  text-green-300  border-green-500/30  hover:bg-green-500/30',
            completed: 'bg-gray-500/20   text-gray-300   border-gray-500/30   hover:bg-gray-500/30',
        };
        const nextStatus = next[order.status];
        if (!nextStatus) return '';
        return `<button onclick="Orders.updateOrderStatus(${order.id}, '${nextStatus}')"
            class="mt-2 w-full py-2.5 text-sm font-semibold rounded-lg border ${colors[nextStatus]} transition-colors active:scale-95">
            ${labels[nextStatus]}
        </button>`;
    },

    /**
     * Initialize drag and drop functionality (desktop)
     */
    initDragAndDrop() {
        setTimeout(() => {
            const columns = document.querySelectorAll('[id^="column-"]');
            document.querySelectorAll('.kanban-card').forEach(card => {
                card.addEventListener('dragstart', (e) => {
                    card.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', card.dataset.orderId);
                    e.dataTransfer.effectAllowed = 'move';
                });
                card.addEventListener('dragend', () => {
                    card.classList.remove('dragging');
                    columns.forEach(col => col.classList.remove('drag-over'));
                });
            });
            columns.forEach(column => {
                column.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    column.classList.add('drag-over');
                });
                column.addEventListener('dragleave', () => column.classList.remove('drag-over'));
                column.addEventListener('drop', (e) => {
                    e.preventDefault();
                    column.classList.remove('drag-over');
                    const orderId = parseInt(e.dataTransfer.getData('text/plain'));
                    this.updateOrderStatus(orderId, column.dataset.status);
                });
            });
        }, 100);
    },

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, newStatus) {
        const order = this.demoOrders.find(o => o.id === orderId);
        if (order) order.status = newStatus;
        this.populateColumns();
        this.initDragAndDrop();
        try {
            await pb.collection('orders').update(orderId, { status: newStatus });
        } catch {}
        const statusLabels = { prepping: 'Prepping', ready: 'Ready for Pickup', completed: 'Picked Up' };
        App.showToast(`#${orderId} → ${statusLabels[newStatus] || newStatus}`, 'success');
    },

    /**
     * Subscribe to PocketBase real-time new orders (production only)
     */
    subscribeToNewOrders() {
        if (DEMO_MODE) return;
        try {
            pb.collection('orders').subscribe('*', (e) => {
                if (e.action === 'create') {
                    this.demoOrders.push({
                        id: e.record.id,
                        customer:    e.record.customer    || 'New Customer',
                        items:       e.record.items       || [],
                        pickup_time: e.record.pickup_time || '',
                        status:      e.record.status      || 'new',
                        total:       e.record.total       || 0,
                        phone:       e.record.phone       || '',
                    });
                    this.populateColumns();
                    this.initDragAndDrop();
                    this.playNewOrderSound();
                    App.showToast(`🔔 New order from ${e.record.customer || 'customer'}!`, 'info');
                }
            });
        } catch (err) {
            console.log('Real-time subscription not available');
        }
    },

    /**
     * Play a 3-note chime using Web Audio API — no library needed
     */
    playNewOrderSound() {
        if (!this.soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [[523, 0], [659, 0.18], [784, 0.36]].forEach(([freq, delay]) => {
                const osc  = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, ctx.currentTime + delay);
                gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + delay + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.55);
                osc.start(ctx.currentTime + delay);
                osc.stop(ctx.currentTime + delay + 0.6);
            });
        } catch (err) {
            console.log('Audio not available');
        }
    },

    /**
     * Toggle sound on/off
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('sound-btn');
        if (btn) btn.textContent = this.soundEnabled ? '🔔' : '🔕';
        if (this.soundEnabled) this.playNewOrderSound(); // confirm it's on
    },

    /**
     * Show new order modal
     */
    showNewOrderModal() {
        document.getElementById('new-order-modal').classList.remove('hidden');
        const form = document.getElementById('new-order-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            // Convert HH:MM (from time input) to 12h display
            const rawTime = fd.get('pickup_time');
            const [hh, mm] = rawTime.split(':').map(Number);
            const ampm = hh >= 12 ? 'PM' : 'AM';
            const h12  = hh % 12 || 12;
            const displayTime = `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;

            const newOrder = {
                id:          Math.max(...this.demoOrders.map(o => typeof o.id === 'number' ? o.id : 0)) + 1,
                customer:    fd.get('customer'),
                phone:       fd.get('phone'),
                items:       fd.get('items').split('\n').filter(i => i.trim()),
                pickup_time: displayTime,
                total:       parseFloat(fd.get('total')),
                status:      'new',
            };
            this.demoOrders.push(newOrder);
            this.populateColumns();
            this.initDragAndDrop();
            this.hideNewOrderModal();
            form.reset();
            this.playNewOrderSound();
            App.showToast(`🔔 New order #${newOrder.id} — ${newOrder.customer}`, 'info');
        };
    },

    /**
     * Hide new order modal
     */
    hideNewOrderModal() {
        document.getElementById('new-order-modal').classList.add('hidden');
    },

    /**
     * Mobile: filter visible columns by status tab
     */
    filterByStatus(status) {
        this.activeFilter = status;
        document.querySelectorAll('.status-tab').forEach(t => {
            t.classList.remove('bg-brand-600', 'text-white');
            t.classList.add('bg-dark-800', 'text-gray-400', 'border', 'border-gray-700/50');
        });
        const active = document.getElementById(`tab-${status}`);
        if (active) {
            active.classList.add('bg-brand-600', 'text-white');
            active.classList.remove('bg-dark-800', 'text-gray-400', 'border', 'border-gray-700/50');
        }
        ['new', 'prepping', 'ready', 'completed'].forEach(s => {
            const col = document.getElementById(`column-${s}`)?.closest('.kanban-column');
            if (col) col.classList.toggle('hidden', status !== 'all' && status !== s);
        });
    },
};
