/**
 * ==========================================
 * INVENTORY MODULE
 * ==========================================
 * Stock management with low-stock warnings.
 * Accessible to Staff (update only), Manager, and Superadmin.
 */

const Inventory = {
    // Demo inventory data
    demoInventory: [
        { id: 1, name: 'AAA Ribeye Steak', category: 'Beef', unit: 'lbs', stock: 24, price: 34.99, sku: 'BF-RIB-001' },
        { id: 2, name: 'AAA Striploin', category: 'Beef', unit: 'lbs', stock: 18, price: 29.99, sku: 'BF-STR-002' },
        { id: 3, name: 'Wagyu Tomahawk', category: 'Beef', unit: 'each', stock: 3, price: 119.99, sku: 'BF-WAG-003' },
        { id: 4, name: 'Ground Chuck', category: 'Beef', unit: 'lbs', stock: 45, price: 8.99, sku: 'BF-GND-004' },
        { id: 5, name: 'Chicken Breast', category: 'Chicken', unit: 'lbs', stock: 2, price: 12.99, sku: 'CK-BRS-001' },
        { id: 6, name: 'Chicken Thighs', category: 'Chicken', unit: 'lbs', stock: 15, price: 9.99, sku: 'CK-THG-002' },
        { id: 7, name: 'Whole Chicken', category: 'Chicken', unit: 'each', stock: 8, price: 18.99, sku: 'CK-WHL-003' },
        { id: 8, name: 'Pork Belly', category: 'Pork', unit: 'lbs', stock: 12, price: 14.99, sku: 'PK-BLY-001' },
        { id: 9, name: 'Pork Tenderloin', category: 'Pork', unit: 'lbs', stock: 4, price: 16.99, sku: 'PK-TND-002' },
        { id: 10, name: 'Baby Back Ribs', category: 'Pork', unit: 'rack', stock: 6, price: 24.99, sku: 'PK-RIB-003' },
        { id: 11, name: 'Smoked Bacon (1kg)', category: 'Bacon', unit: 'pkg', stock: 32, price: 14.99, sku: 'BC-SMK-001' },
        { id: 12, name: 'Peameal Bacon', category: 'Bacon', unit: 'pkg', stock: 1, price: 12.99, sku: 'BC-PML-002' },
        { id: 13, name: 'Italian Sausage', category: 'Sausages', unit: 'pkg (6)', stock: 20, price: 11.99, sku: 'SG-ITL-001' },
        { id: 14, name: 'Jalapeño Cheddar Sausage', category: 'Sausages', unit: 'pkg (6)', stock: 14, price: 13.99, sku: 'SG-JLP-002' },
        { id: 15, name: 'Breakfast Sausage', category: 'Sausages', unit: 'pkg (12)', stock: 3, price: 9.99, sku: 'SG-BRK-003' },
        { id: 16, name: 'BBQ Box (Family)', category: 'Packages', unit: 'box', stock: 7, price: 89.99, sku: 'PG-BBQ-001' },
        { id: 17, name: 'Weekly Family Bundle', category: 'Packages', unit: 'box', stock: 5, price: 129.99, sku: 'PG-WKL-002' },
        { id: 18, name: 'Summer Grill Pack', category: 'Packages', unit: 'box', stock: 0, price: 149.99, sku: 'PG-SUM-003' },
    ],

    currentFilter: 'all',
    sortField: 'name',
    sortDirection: 'asc',

    /**
     * Render inventory view
     */
    render(container) {
        container.innerHTML = this.getTemplate();
        this.renderTable();
        this.attachEventListeners();
    },

    /**
     * Get inventory page template
     */
    getTemplate() {
        const lowStockCount = this.demoInventory.filter(i => i.stock <= APP_CONFIG.lowStockThreshold).length;
        const outOfStockCount = this.demoInventory.filter(i => i.stock === 0).length;
        const totalValue = this.demoInventory.reduce((sum, i) => sum + (i.stock * i.price), 0);

        return `
            <!-- Inventory Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-dark-800 border border-gray-700/50 rounded-xl p-4">
                    <p class="text-xs text-gray-400 mb-1">Total SKUs</p>
                    <p class="text-xl font-bold text-white">${this.demoInventory.length}</p>
                </div>
                <div class="bg-dark-800 border border-gray-700/50 rounded-xl p-4">
                    <p class="text-xs text-gray-400 mb-1">Low Stock Items</p>
                    <p class="text-xl font-bold text-yellow-400">${lowStockCount}</p>
                </div>
                <div class="bg-dark-800 border border-gray-700/50 rounded-xl p-4">
                    <p class="text-xs text-gray-400 mb-1">Out of Stock</p>
                    <p class="text-xl font-bold text-red-400">${outOfStockCount}</p>
                </div>
                ${Auth.canViewFinancials() ? `
                <div class="bg-dark-800 border border-gray-700/50 rounded-xl p-4">
                    <p class="text-xs text-gray-400 mb-1">Inventory Value</p>
                    <p class="text-xl font-bold text-green-400">$${totalValue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</p>
                </div>` : `
                <div class="bg-dark-800 border border-gray-700/50 rounded-xl p-4">
                    <p class="text-xs text-gray-400 mb-1">Categories</p>
                    <p class="text-xl font-bold text-white">${[...new Set(this.demoInventory.map(i => i.category))].length}</p>
                </div>`}
            </div>

            <!-- Filters & Actions -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div class="flex items-center gap-3">
                    <!-- Search -->
                    <div class="flex items-center gap-2 bg-dark-800 border border-gray-700/50 rounded-xl px-4 py-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input type="text" placeholder="Search inventory..." id="inventory-search"
                            class="bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none w-48">
                    </div>
                    <!-- Category Filter -->
                    <select id="category-filter" class="bg-dark-800 border border-gray-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <option value="all">All Categories</option>
                        <option value="Beef">Beef</option>
                        <option value="Chicken">Chicken</option>
                        <option value="Pork">Pork</option>
                        <option value="Bacon">Bacon</option>
                        <option value="Sausages">Sausages</option>
                        <option value="Packages">Packages</option>
                    </select>
                    <!-- Stock Filter -->
                    <select id="stock-filter" class="bg-dark-800 border border-gray-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <option value="all">All Stock Levels</option>
                        <option value="low">Low Stock Only</option>
                        <option value="out">Out of Stock</option>
                        <option value="normal">Normal Stock</option>
                    </select>
                </div>
                <button onclick="Inventory.showAddItemModal()" 
                    class="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Add Item
                </button>
            </div>

            <!-- Inventory Table -->
            <div class="bg-dark-800 border border-gray-700/50 rounded-2xl overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="data-table w-full">
                        <thead>
                            <tr class="border-b border-gray-700/50">
                                <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onclick="Inventory.sort('name')">Product</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onclick="Inventory.sort('category')">Category</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onclick="Inventory.sort('stock')">Stock</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit</th>
                                ${Auth.canViewFinancials() ? '<th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onclick="Inventory.sort(\'price\')">Price</th>' : ''}
                                <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th class="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="inventory-tbody">
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Add/Edit Item Modal -->
            <div id="inventory-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center modal-overlay">
                <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-white" id="inventory-modal-title">Add Item</h3>
                        <button onclick="Inventory.hideModal()" class="text-gray-400 hover:text-white">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <form id="inventory-form" class="space-y-4">
                        <input type="hidden" name="id" id="item-id">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
                            <input type="text" name="name" id="item-name" required
                                class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>
                                <select name="category" id="item-category" required
                                    class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                                    <option value="Beef">Beef</option>
                                    <option value="Chicken">Chicken</option>
                                    <option value="Pork">Pork</option>
                                    <option value="Bacon">Bacon</option>
                                    <option value="Sausages">Sausages</option>
                                    <option value="Packages">Packages</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Unit</label>
                                <input type="text" name="unit" id="item-unit" required placeholder="lbs, each, pkg"
                                    class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Stock Quantity</label>
                                <input type="number" name="stock" id="item-stock" required min="0"
                                    class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Price ($)</label>
                                <input type="number" name="price" id="item-price" required step="0.01" min="0"
                                    class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                            </div>
                        </div>
                        <button type="submit"
                            class="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors">
                            Save Item
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Render table rows
     */
    renderTable() {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;

        let items = [...this.demoInventory];

        // Apply category filter
        const categoryFilter = document.getElementById('category-filter')?.value || 'all';
        if (categoryFilter !== 'all') {
            items = items.filter(i => i.category === categoryFilter);
        }

        // Apply stock filter
        const stockFilter = document.getElementById('stock-filter')?.value || 'all';
        if (stockFilter === 'low') {
            items = items.filter(i => i.stock > 0 && i.stock <= APP_CONFIG.lowStockThreshold);
        } else if (stockFilter === 'out') {
            items = items.filter(i => i.stock === 0);
        } else if (stockFilter === 'normal') {
            items = items.filter(i => i.stock > APP_CONFIG.lowStockThreshold);
        }

        // Apply search
        const search = document.getElementById('inventory-search')?.value?.toLowerCase() || '';
        if (search) {
            items = items.filter(i => 
                i.name.toLowerCase().includes(search) || 
                i.category.toLowerCase().includes(search) ||
                i.sku.toLowerCase().includes(search)
            );
        }

        // Apply sort
        items.sort((a, b) => {
            let valA = a[this.sortField];
            let valB = b[this.sortField];
            if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
            if (this.sortDirection === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });

        tbody.innerHTML = items.map(item => this.getTableRow(item)).join('');
    },

    /**
     * Generate table row HTML
     */
    getTableRow(item) {
        let statusBadge;
        if (item.stock === 0) {
            statusBadge = '<span class="low-stock-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800/50">Out of Stock</span>';
        } else if (item.stock <= APP_CONFIG.lowStockThreshold) {
            statusBadge = '<span class="low-stock-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-800/50">Low Stock</span>';
        } else {
            statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800/50">In Stock</span>';
        }

        return `
            <tr class="border-b border-gray-700/30 hover:bg-brand-500/5 transition-colors">
                <td class="px-6 py-4">
                    <div>
                        <p class="text-sm font-medium text-white">${item.name}</p>
                        <p class="text-xs text-gray-500">${item.sku}</p>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm text-gray-300">${item.category}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm font-semibold ${item.stock <= APP_CONFIG.lowStockThreshold ? (item.stock === 0 ? 'text-red-400' : 'text-yellow-400') : 'text-white'}">${item.stock}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm text-gray-400">${item.unit}</span>
                </td>
                ${Auth.canViewFinancials() ? `<td class="px-6 py-4"><span class="text-sm text-white">$${item.price.toFixed(2)}</span></td>` : ''}
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="Inventory.quickUpdate(${item.id})" class="p-1.5 text-gray-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors" title="Update Stock">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        ${Auth.canViewFinancials() ? `
                        <button onclick="Inventory.deleteItem(${item.id})" class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    },

    /**
     * Sort table by field
     */
    sort(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.renderTable();
    },

    /**
     * Attach event listeners for filters
     */
    attachEventListeners() {
        setTimeout(() => {
            const search = document.getElementById('inventory-search');
            const categoryFilter = document.getElementById('category-filter');
            const stockFilter = document.getElementById('stock-filter');

            if (search) search.addEventListener('input', () => this.renderTable());
            if (categoryFilter) categoryFilter.addEventListener('change', () => this.renderTable());
            if (stockFilter) stockFilter.addEventListener('change', () => this.renderTable());
        }, 100);
    },

    /**
     * Quick update stock quantity
     */
    quickUpdate(itemId) {
        const item = this.demoInventory.find(i => i.id === itemId);
        if (!item) return;

        const newStock = prompt(`Update stock for "${item.name}"\nCurrent: ${item.stock} ${item.unit}\n\nEnter new quantity:`);
        if (newStock !== null && !isNaN(newStock)) {
            item.stock = parseInt(newStock);
            this.renderTable();
            this.updateSupabase(item);
            App.showToast(`${item.name} stock updated to ${newStock}`, 'success');
        }
    },

    /**
     * Delete inventory item
     */
    deleteItem(itemId) {
        const item = this.demoInventory.find(i => i.id === itemId);
        if (!item) return;

        if (confirm(`Delete "${item.name}" from inventory?`)) {
            this.demoInventory = this.demoInventory.filter(i => i.id !== itemId);
            this.renderTable();
            App.showToast(`${item.name} removed from inventory`, 'success');
        }
    },

    /**
     * Show add item modal
     */
    showAddItemModal() {
        document.getElementById('inventory-modal').classList.remove('hidden');
        document.getElementById('inventory-modal-title').textContent = 'Add New Item';
        document.getElementById('inventory-form').reset();
        document.getElementById('item-id').value = '';

        const form = document.getElementById('inventory-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const newItem = {
                id: Math.max(...this.demoInventory.map(i => i.id)) + 1,
                name: formData.get('name'),
                category: formData.get('category'),
                unit: formData.get('unit'),
                stock: parseInt(formData.get('stock')),
                price: parseFloat(formData.get('price')),
                sku: `XX-${Date.now().toString(36).toUpperCase()}`,
            };

            this.demoInventory.push(newItem);
            this.renderTable();
            this.hideModal();
            App.showToast(`${newItem.name} added to inventory`, 'success');
        };
    },

    /**
     * Hide modal
     */
    hideModal() {
        document.getElementById('inventory-modal').classList.add('hidden');
    },

    /**
     * Update item in Supabase
     */
    async updatePocketBase(item) {
        try {
            await pb.collection('inventory').update(item.id, { quantity: item.stock });
        } catch (err) {
            console.log('Inventory updated locally');
        }
    }
};
