/**
 * ==========================================
 * INVENTORY MODULE
 * ==========================================
 * Reads/writes from Supabase inventory table.
 * Manager+ can edit all fields, toggle order form visibility, and upload images.
 */

const Inventory = {
    items: [],          // loaded from Supabase
    currentFilter: 'all',
    sortField: 'name',
    sortDirection: 'asc',

    // ─── Load from Supabase ────────────────────────────────────────────────────

    async loadItems() {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('client_id', BURNETTS_CLIENT_ID)
                .eq('active', true)
                .order('category')
                .order('name');
            if (error) throw error;
            this.items = data || [];
        } catch (err) {
            console.warn('[BWA] Inventory load failed:', err.message);
            this.items = [];
        }
    },

    // ─── Render ────────────────────────────────────────────────────────────────

    async render(container) {
        container.innerHTML = `
            <div class="flex items-center justify-center py-12 text-gray-400">
                <svg class="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Loading inventory...
            </div>`;
        await this.loadItems();
        container.innerHTML = this.getTemplate();
        this.renderTable();
        this.attachEventListeners();
    },

    getTemplate() {
        const low   = this.items.filter(i => i.stock > 0 && i.stock <= APP_CONFIG.lowStockThreshold).length;
        const out   = this.items.filter(i => i.stock === 0).length;
        const total = this.items.reduce((s, i) => s + (i.stock * parseFloat(i.price)), 0);
        const onForm = this.items.filter(i => i.show_on_order_form).length;

        return `
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-dark-800 border border-gray-700/50 rounded-xl p-4">
                    <p class="text-xs text-gray-400 mb-1">Total SKUs</p>
                    <p class="text-xl font-bold text-white">${this.items.length}</p>
                </div>
                <div class="bg-dark-800 border border-gray-700/50 rounded-xl p-4">
                    <p class="text-xs text-gray-400 mb-1">Low Stock</p>
                    <p class="text-xl font-bold text-yellow-400">${low}</p>
                </div>
                <div class="bg-dark-800 border border-gray-700/50 rounded-xl p-4">
                    <p class="text-xs text-gray-400 mb-1">On Order Form</p>
                    <p class="text-xl font-bold text-brand-400">${onForm}</p>
                </div>
                ${Auth.canViewFinancials() ? `
                <div class="bg-dark-800 border border-gray-700/50 rounded-xl p-4">
                    <p class="text-xs text-gray-400 mb-1">Inventory Value</p>
                    <p class="text-xl font-bold text-green-400">$${total.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</p>
                </div>` : `
                <div class="bg-dark-800 border border-gray-700/50 rounded-xl p-4">
                    <p class="text-xs text-gray-400 mb-1">Out of Stock</p>
                    <p class="text-xl font-bold text-red-400">${out}</p>
                </div>`}
            </div>

            <!-- Filters & Add -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div class="flex items-center gap-3 flex-wrap">
                    <div class="flex items-center gap-2 bg-dark-800 border border-gray-700/50 rounded-xl px-4 py-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input type="text" placeholder="Search inventory..." id="inventory-search"
                            class="bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none w-44">
                    </div>
                    <select id="category-filter" class="bg-dark-800 border border-gray-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <option value="all">All Categories</option>
                        <option value="Beef">Beef</option>
                        <option value="Chicken">Chicken</option>
                        <option value="Pork">Pork</option>
                        <option value="Bacon">Bacon</option>
                        <option value="Sausages">Sausages</option>
                        <option value="Packages">Packages</option>
                    </select>
                    <select id="stock-filter" class="bg-dark-800 border border-gray-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                        <option value="all">All Stock Levels</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                        <option value="normal">Normal Stock</option>
                    </select>
                </div>
                ${Auth.canViewFinancials() ? `
                <button onclick="Inventory.showAddItemModal()"
                    class="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Add Item
                </button>` : ''}
            </div>

            <!-- Table -->
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
                                ${Auth.canViewFinancials() ? '<th class="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Form</th>' : ''}
                                ${Auth.canViewFinancials() ? '<th class="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>' : ''}
                            </tr>
                        </thead>
                        <tbody id="inventory-tbody"></tbody>
                    </table>
                </div>
            </div>

            <!-- Add/Edit Modal -->
            <div id="inventory-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center modal-overlay">
                <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-screen overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-white" id="inventory-modal-title">Add Item</h3>
                        <button onclick="Inventory.hideModal()" class="text-gray-400 hover:text-white">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <form id="inventory-form" class="space-y-4">
                        <input type="hidden" id="item-id">

                        <!-- Image upload -->
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Product Photo</label>
                            <div id="image-preview-wrap" class="hidden mb-2">
                                <img id="image-preview" src="" alt="Preview" class="w-full h-40 object-cover rounded-xl border border-gray-600">
                            </div>
                            <label for="item-image-file" class="flex items-center gap-3 px-4 py-3 bg-dark-900 border border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-brand-500 transition-colors">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <span id="image-label" class="text-sm text-gray-400">Upload photo (JPG, PNG, WebP — max 5MB)</span>
                            </label>
                            <input type="file" id="item-image-file" accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden">
                        </div>

                        <!-- Name -->
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
                            <input type="text" id="item-name" required
                                class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        </div>

                        <!-- Category + Unit -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>
                                <select id="item-category" required
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
                                <input type="text" id="item-unit" required placeholder="lbs, each, pkg"
                                    class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                            </div>
                        </div>

                        <!-- Stock + Price -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Stock Quantity</label>
                                <input type="number" id="item-stock" required min="0"
                                    class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-1">Price ($)</label>
                                <input type="number" id="item-price" required step="0.01" min="0"
                                    class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                            </div>
                        </div>

                        <!-- Order form toggle -->
                        <div class="flex items-center justify-between p-3 bg-dark-900 rounded-xl border border-gray-700/50">
                            <div>
                                <p class="text-sm font-medium text-white">Show on Order Form</p>
                                <p class="text-xs text-gray-400">Customers can order this item online</p>
                            </div>
                            <button type="button" id="order-form-toggle"
                                onclick="Inventory.toggleOrderFormBtn()"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none">
                                <span id="order-form-toggle-knob" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                            </button>
                        </div>

                        <button type="submit" id="inventory-save-btn"
                            class="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors">
                            Save Item
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    // ─── Table rendering ───────────────────────────────────────────────────────

    renderTable() {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;

        let items = [...this.items];

        const cat   = document.getElementById('category-filter')?.value || 'all';
        const stock = document.getElementById('stock-filter')?.value   || 'all';
        const q     = document.getElementById('inventory-search')?.value?.toLowerCase() || '';

        if (cat !== 'all')    items = items.filter(i => i.category === cat);
        if (stock === 'low')  items = items.filter(i => i.stock > 0 && i.stock <= APP_CONFIG.lowStockThreshold);
        if (stock === 'out')  items = items.filter(i => i.stock === 0);
        if (stock === 'normal') items = items.filter(i => i.stock > APP_CONFIG.lowStockThreshold);
        if (q) items = items.filter(i =>
            i.name.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q) ||
            (i.sku || '').toLowerCase().includes(q)
        );

        items.sort((a, b) => {
            let va = a[this.sortField], vb = b[this.sortField];
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (this.sortDirection === 'asc') return va > vb ? 1 : -1;
            return va < vb ? 1 : -1;
        });

        tbody.innerHTML = items.length
            ? items.map(item => this.getTableRow(item)).join('')
            : `<tr><td colspan="8" class="px-6 py-10 text-center text-gray-500">No items found</td></tr>`;
    },

    getTableRow(item) {
        const stock = parseInt(item.stock) || 0;
        let statusBadge;
        if (stock === 0) {
            statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800/50">Out of Stock</span>';
        } else if (stock <= APP_CONFIG.lowStockThreshold) {
            statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-800/50">Low Stock</span>';
        } else {
            statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800/50">In Stock</span>';
        }

        const safeId = JSON.stringify(item.id);

        // Order form toggle pill
        const toggleBtn = Auth.canViewFinancials() ? `
            <td class="px-6 py-4 text-center">
                <button onclick="Inventory.toggleOrderForm(${safeId})"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${item.show_on_order_form ? 'bg-brand-600' : 'bg-gray-600'}"
                    title="${item.show_on_order_form ? 'Remove from order form' : 'Add to order form'}">
                    <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.show_on_order_form ? 'translate-x-6' : 'translate-x-1'}"></span>
                </button>
            </td>` : '';

        const actionsCol = Auth.canViewFinancials() ? `
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="Inventory.showEditModal(${safeId})" class="p-1.5 text-gray-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors" title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                    <button onclick="Inventory.deleteItem(${safeId})" class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </td>` : '';

        return `
            <tr class="border-b border-gray-700/30 hover:bg-brand-500/5 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        ${item.image_url
                            ? `<img src="${item.image_url}" alt="${item.name}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0">`
                            : `<div class="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0 text-gray-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                               </div>`}
                        <div>
                            <p class="text-sm font-medium text-white">${item.name}</p>
                            <p class="text-xs text-gray-500">${item.sku || ''}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4"><span class="text-sm text-gray-300">${item.category}</span></td>
                <td class="px-6 py-4">
                    <span class="text-sm font-semibold ${stock === 0 ? 'text-red-400' : stock <= APP_CONFIG.lowStockThreshold ? 'text-yellow-400' : 'text-white'}">${stock}</span>
                </td>
                <td class="px-6 py-4"><span class="text-sm text-gray-400">${item.unit}</span></td>
                ${Auth.canViewFinancials() ? `<td class="px-6 py-4"><span class="text-sm text-white">$${parseFloat(item.price).toFixed(2)}</span></td>` : ''}
                <td class="px-6 py-4">${statusBadge}</td>
                ${toggleBtn}
                ${actionsCol}
            </tr>`;
    },

    // ─── Order form toggle (inline in table) ───────────────────────────────────

    async toggleOrderForm(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;
        const newVal = !item.show_on_order_form;
        item.show_on_order_form = newVal;
        this.renderTable();
        try {
            await supabase.from('inventory')
                .update({ show_on_order_form: newVal, updated_at: new Date().toISOString() })
                .eq('id', itemId);
            App.showToast(`${item.name} ${newVal ? 'added to' : 'removed from'} order form`, 'success');
        } catch (err) {
            item.show_on_order_form = !newVal; // revert
            this.renderTable();
            App.showToast('Failed to update — please try again', 'error');
        }
    },

    // ─── Sort ──────────────────────────────────────────────────────────────────

    sort(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.renderTable();
    },

    // ─── Filters ───────────────────────────────────────────────────────────────

    attachEventListeners() {
        setTimeout(() => {
            document.getElementById('inventory-search')?.addEventListener('input', () => this.renderTable());
            document.getElementById('category-filter')?.addEventListener('change', () => this.renderTable());
            document.getElementById('stock-filter')?.addEventListener('change', () => this.renderTable());
            // Image file picker preview
            document.getElementById('item-image-file')?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                document.getElementById('image-label').textContent = file.name;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    document.getElementById('image-preview').src = ev.target.result;
                    document.getElementById('image-preview-wrap').classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            });
        }, 100);
    },

    // ─── Modal helpers ─────────────────────────────────────────────────────────

    _orderFormOn: false,

    toggleOrderFormBtn() {
        this._orderFormOn = !this._orderFormOn;
        this._updateToggleUI();
    },

    _updateToggleUI() {
        const btn  = document.getElementById('order-form-toggle');
        const knob = document.getElementById('order-form-toggle-knob');
        if (!btn || !knob) return;
        btn.className  = `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${this._orderFormOn ? 'bg-brand-600' : 'bg-gray-600'}`;
        knob.className = `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${this._orderFormOn ? 'translate-x-6' : 'translate-x-1'}`;
    },

    hideModal() {
        document.getElementById('inventory-modal').classList.add('hidden');
        document.getElementById('item-image-file').value = '';
        document.getElementById('image-label').textContent = 'Upload photo (JPG, PNG, WebP — max 5MB)';
        document.getElementById('image-preview-wrap').classList.add('hidden');
        document.getElementById('image-preview').src = '';
    },

    _openModal(title, item = null) {
        document.getElementById('inventory-modal').classList.remove('hidden');
        document.getElementById('inventory-modal-title').textContent = title;

        document.getElementById('item-id').value       = item?.id || '';
        document.getElementById('item-name').value     = item?.name || '';
        document.getElementById('item-category').value = item?.category || 'Beef';
        document.getElementById('item-unit').value     = item?.unit || '';
        document.getElementById('item-stock').value    = item?.stock ?? '';
        document.getElementById('item-price').value    = item ? parseFloat(item.price).toFixed(2) : '';

        // Image preview
        if (item?.image_url) {
            document.getElementById('image-preview').src = item.image_url;
            document.getElementById('image-preview-wrap').classList.remove('hidden');
            document.getElementById('image-label').textContent = 'Replace photo';
        }

        this._orderFormOn = item?.show_on_order_form || false;
        this._updateToggleUI();
    },

    // ─── Add item ──────────────────────────────────────────────────────────────

    showAddItemModal() {
        this._openModal('Add New Item');
        document.getElementById('inventory-form').onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('inventory-save-btn');
            btn.disabled = true;
            btn.textContent = 'Saving...';
            try {
                const imageUrl = await this._uploadImage(null);
                const { data, error } = await supabase.from('inventory').insert({
                    client_id:          BURNETTS_CLIENT_ID,
                    name:               document.getElementById('item-name').value,
                    category:           document.getElementById('item-category').value,
                    unit:               document.getElementById('item-unit').value,
                    stock:              parseInt(document.getElementById('item-stock').value) || 0,
                    price:              parseFloat(document.getElementById('item-price').value) || 0,
                    show_on_order_form: this._orderFormOn,
                    image_url:          imageUrl || null,
                    sku:                'XX-' + Date.now().toString(36).toUpperCase(),
                }).select().single();
                if (error) throw error;
                this.items.push(data);
                this.renderTable();
                this.hideModal();
                App.showToast(`${data.name} added`, 'success');
            } catch (err) {
                App.showToast('Save failed: ' + err.message, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save Item';
            }
        };
    },

    // ─── Edit item ─────────────────────────────────────────────────────────────

    showEditModal(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;
        this._openModal('Edit Item', item);

        document.getElementById('inventory-form').onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('inventory-save-btn');
            btn.disabled = true;
            btn.textContent = 'Saving...';
            try {
                const imageUrl = await this._uploadImage(item.image_url);
                const updates = {
                    name:               document.getElementById('item-name').value,
                    category:           document.getElementById('item-category').value,
                    unit:               document.getElementById('item-unit').value,
                    stock:              parseInt(document.getElementById('item-stock').value) || 0,
                    price:              parseFloat(document.getElementById('item-price').value) || 0,
                    show_on_order_form: this._orderFormOn,
                    image_url:          imageUrl,
                    updated_at:         new Date().toISOString(),
                };
                const { error } = await supabase.from('inventory').update(updates).eq('id', item.id);
                if (error) throw error;
                Object.assign(item, updates);
                this.renderTable();
                this.hideModal();
                App.showToast(`${item.name} updated`, 'success');
            } catch (err) {
                App.showToast('Save failed: ' + err.message, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save Item';
            }
        };
    },

    // ─── Delete ────────────────────────────────────────────────────────────────

    async deleteItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;
        if (!confirm(`Delete "${item.name}" from inventory?`)) return;
        try {
            const { error } = await supabase.from('inventory').update({ active: false }).eq('id', itemId);
            if (error) throw error;
            this.items = this.items.filter(i => i.id !== itemId);
            this.renderTable();
            App.showToast(`${item.name} removed`, 'success');
        } catch (err) {
            App.showToast('Delete failed: ' + err.message, 'error');
        }
    },

    // ─── Image upload ──────────────────────────────────────────────────────────

    async _uploadImage(existingUrl) {
        const fileInput = document.getElementById('item-image-file');
        const file = fileInput?.files[0];
        if (!file) return existingUrl || null; // no new file — keep existing

        const ext  = file.name.split('.').pop();
        const path = `burnetts/${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from('inventory-images')
            .upload(path, file, { upsert: true, contentType: file.type });
        if (error) throw new Error('Image upload failed: ' + error.message);

        const { data } = supabase.storage.from('inventory-images').getPublicUrl(path);
        return data.publicUrl;
    },
};
