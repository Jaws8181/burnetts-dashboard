/**
 * ==========================================
 * ORDERS MODULE - Kanban Board
 * ==========================================
 * Drag-and-drop order management with status columns.
 * Accessible to Staff, Manager, and Superadmin.
 */

const Orders = {
    // Demo order data (replaced by Supabase in production)
    demoOrders: [
        { id: 1042, customer: 'Sarah Mitchell', items: ['BBQ Box (Family)', 'AAA Ribeye x4'], pickup_time: '2:30 PM', status: 'new', total: 187.50, phone: '705-555-0142' },
        { id: 1041, customer: 'Dave Thompson', items: ['Thanksgiving Turkey Pack', 'Cranberry Sausage x6'], pickup_time: '4:00 PM', status: 'new', total: 245.00, phone: '705-555-0198' },
        { id: 1040, customer: 'Lisa Park', items: ['Weekly Family Bundle', 'Bacon 1kg'], pickup_time: '11:00 AM', status: 'prepping', total: 156.00, phone: '705-555-0167' },
        { id: 1039, customer: 'Mark Wilson', items: ['Wagyu Tomahawk x2', 'Peppercorn Rub'], pickup_time: '1:00 PM', status: 'prepping', total: 320.00, phone: '705-555-0234' },
        { id: 1038, customer: 'Jennifer Adams', items: ['Ground Chuck 5lb', 'Cheddar Bacon Burgers x8'], pickup_time: '12:30 PM', status: 'ready', total: 89.50, phone: '705-555-0189' },
        { id: 1037, customer: 'Robert Chen', items: ['Summer BBQ Box', 'Jalapeño Sausage x12'], pickup_time: '3:00 PM', status: 'ready', total: 210.00, phone: '705-555-0156' },
        { id: 1036, customer: 'Amanda Foster', items: ['Striploin x3', 'Garlic Butter'], pickup_time: '10:00 AM', status: 'new', total: 135.00, phone: '705-555-0201' },
        { id: 1035, customer: 'Chris Nguyen', items: ['Pork Belly 2kg', 'Apple Cider Brine'], pickup_time: '5:00 PM', status: 'prepping', total: 78.00, phone: '705-555-0178' },
    ],

    /**
     * Render the orders Kanban board
     */
    render(container) {
        container.innerHTML = this.getTemplate();
        this.initDragAndDrop();
        this.populateColumns();
    },

    /**
     * Get Kanban board template
     */
    getTemplate() {
        return `
            <!-- Orders Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 bg-dark-800 border border-gray-700/50 rounded-xl px-4 py-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input type="text" placeholder="Search orders..." id="order-search"
                            class="bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none w-48">
                    </div>
                </div>
                <button onclick="Orders.showNewOrderModal()" 
                    class="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-brand-600/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    New Order
                </button>
            </div>

            <!-- Kanban Board -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- New Orders Column -->
                <div class="kanban-column" data-status="new">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-blue-400"></div>
                            <h3 class="text-sm font-semibold text-white">New Orders</h3>
                            <span class="text-xs bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded-full" id="count-new">0</span>
                        </div>
                    </div>
                    <div class="space-y-3 min-h-[200px] p-2 rounded-xl border-2 border-dashed border-transparent transition-colors" 
                         id="column-new" data-status="new">
                    </div>
                </div>

                <!-- Prepping Column -->
                <div class="kanban-column" data-status="prepping">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <h3 class="text-sm font-semibold text-white">Prepping</h3>
                            <span class="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full" id="count-prepping">0</span>
                        </div>
                    </div>
                    <div class="space-y-3 min-h-[200px] p-2 rounded-xl border-2 border-dashed border-transparent transition-colors" 
                         id="column-prepping" data-status="prepping">
                    </div>
                </div>

                <!-- Ready for Pickup Column -->
                <div class="kanban-column" data-status="ready">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 rounded-full bg-green-400"></div>
                            <h3 class="text-sm font-semibold text-white">Ready for Pickup</h3>
                            <span class="text-xs bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full" id="count-ready">0</span>
                        </div>
                    </div>
                    <div class="space-y-3 min-h-[200px] p-2 rounded-xl border-2 border-dashed border-transparent transition-colors" 
                         id="column-ready" data-status="ready">
                    </div>
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
        const statuses = ['new', 'prepping', 'ready'];
        
        statuses.forEach(status => {
            const column = document.getElementById(`column-${status}`);
            const orders = this.demoOrders.filter(o => o.status === status);
            const countEl = document.getElementById(`count-${status}`);
            
            if (countEl) countEl.textContent = orders.length;
            
            column.innerHTML = orders.map(order => this.getOrderCard(order)).join('');
        });
    },

    /**
     * Generate order card HTML
     */
    getOrderCard(order) {
        const statusColors = {
            new: 'border-l-blue-400',
            prepping: 'border-l-yellow-400',
            ready: 'border-l-green-400',
        };

        return `
            <div class="kanban-card bg-dark-800 border border-gray-700/50 ${statusColors[order.status]} border-l-4 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                 draggable="true" data-order-id="${order.id}">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-mono text-gray-500">#${order.id}</span>
                    <span class="text-xs text-gray-400 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ${order.pickup_time}
                    </span>
                </div>
                <h4 class="text-sm font-semibold text-white mb-1">${order.customer}</h4>
                <div class="space-y-0.5 mb-3">
                    ${order.items.map(item => `<p class="text-xs text-gray-400">• ${item}</p>`).join('')}
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-gray-700/50">
                    <span class="text-xs text-gray-500">${order.phone}</span>
                    ${Auth.canViewFinancials() ? `<span class="text-sm font-semibold text-brand-400">$${order.total.toFixed(2)}</span>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Initialize drag and drop functionality
     */
    initDragAndDrop() {
        // Wait for DOM to be ready
        setTimeout(() => {
            const cards = document.querySelectorAll('.kanban-card');
            const columns = document.querySelectorAll('[id^="column-"]');

            cards.forEach(card => {
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

                column.addEventListener('dragleave', () => {
                    column.classList.remove('drag-over');
                });

                column.addEventListener('drop', (e) => {
                    e.preventDefault();
                    column.classList.remove('drag-over');
                    
                    const orderId = parseInt(e.dataTransfer.getData('text/plain'));
                    const newStatus = column.dataset.status;
                    
                    this.updateOrderStatus(orderId, newStatus);
                });
            });
        }, 100);
    },

    /**
     * Update order status (local + Supabase)
     */
    async updateOrderStatus(orderId, newStatus) {
        // Update local data
        const order = this.demoOrders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
        }

        // Re-render columns
        this.populateColumns();
        this.initDragAndDrop();

        // Update in PocketBase
        try {
            await pb.collection('orders').update(orderId, { status: newStatus });
        } catch (err) {
            console.log('Order status updated locally');
        }

        // Show toast notification
        App.showToast(`Order #${orderId} moved to ${newStatus}`, 'success');
    },

    /**
     * Show new order modal
     */
    showNewOrderModal() {
        document.getElementById('new-order-modal').classList.remove('hidden');
        
        // Handle form submission
        const form = document.getElementById('new-order-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const newOrder = {
                id: Math.max(...this.demoOrders.map(o => o.id)) + 1,
                customer: formData.get('customer'),
                phone: formData.get('phone'),
                items: formData.get('items').split('\n').filter(i => i.trim()),
                pickup_time: formData.get('pickup_time'),
                total: parseFloat(formData.get('total')),
                status: 'new',
            };

            this.demoOrders.push(newOrder);
            this.populateColumns();
            this.initDragAndDrop();
            this.hideNewOrderModal();
            form.reset();
            App.showToast(`Order #${newOrder.id} created`, 'success');
        };
    },

    /**
     * Hide new order modal
     */
    hideNewOrderModal() {
        document.getElementById('new-order-modal').classList.add('hidden');
    },
};
