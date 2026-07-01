/**
 * ==========================================
 * USER MANAGEMENT MODULE (Superadmin Only)
 * ==========================================
 * Manage staff accounts, roles, and access.
 */

const Users = {
    demoUsers: [
        { id: 1, full_name: 'Shane Burnett', email: 'shane@burnettsbutcher.com', role: 'manager', status: 'active', last_login: '2024-06-09 08:30 AM' },
        { id: 2, full_name: 'Mike Johnson', email: 'staff@burnettsbutcher.com', role: 'staff', status: 'active', last_login: '2024-06-09 07:45 AM' },
        { id: 3, full_name: 'Sarah Williams', email: 'sarah@burnettsbutcher.com', role: 'staff', status: 'active', last_login: '2024-06-08 03:20 PM' },
        { id: 4, full_name: 'Tom Baker', email: 'tom@burnettsbutcher.com', role: 'staff', status: 'inactive', last_login: '2024-05-15 11:00 AM' },
        { id: 5, full_name: 'System Admin', email: 'admin@burnettsbutcher.com', role: 'superadmin', status: 'active', last_login: '2024-06-09 09:00 AM' },
    ],

    /**
     * Render user management view
     */
    render(container) {
        if (!Auth.canManageUsers()) {
            container.innerHTML = '<div class="text-center py-20"><p class="text-gray-400">Access Denied. Superadmin privileges required.</p></div>';
            return;
        }

        container.innerHTML = this.getTemplate();
    },

    /**
     * Get template
     */
    getTemplate() {
        return `
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <p class="text-sm text-gray-400">Manage staff accounts and access permissions</p>
                </div>
                <button onclick="Users.showAddUserModal()" 
                    class="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    Add Staff Member
                </button>
            </div>

            <!-- Users Table -->
            <div class="bg-dark-800 border border-gray-700/50 rounded-2xl overflow-hidden">
                <table class="data-table w-full">
                    <thead>
                        <tr class="border-b border-gray-700/50">
                            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">User</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Role</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Last Login</th>
                            <th class="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.demoUsers.map(user => this.getUserRow(user)).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Role Permissions Info -->
            <div class="mt-8 bg-dark-800 border border-gray-700/50 rounded-2xl p-6">
                <h3 class="text-lg font-semibold text-white mb-4">Role Permissions</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="p-4 bg-dark-900/50 rounded-xl">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-3 h-3 rounded-full bg-red-400"></div>
                            <h4 class="text-sm font-semibold text-white">Superadmin</h4>
                        </div>
                        <ul class="space-y-1 text-xs text-gray-400">
                            <li>• Full system access</li>
                            <li>• User management</li>
                            <li>• System settings & logs</li>
                            <li>• Financial data</li>
                            <li>• All order operations</li>
                        </ul>
                    </div>
                    <div class="p-4 bg-dark-900/50 rounded-xl">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-3 h-3 rounded-full bg-blue-400"></div>
                            <h4 class="text-sm font-semibold text-white">Manager</h4>
                        </div>
                        <ul class="space-y-1 text-xs text-gray-400">
                            <li>• Financial overview & charts</li>
                            <li>• Full inventory control</li>
                            <li>• Order management</li>
                            <li>• Revenue reports</li>
                            <li>• No user management</li>
                        </ul>
                    </div>
                    <div class="p-4 bg-dark-900/50 rounded-xl">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-3 h-3 rounded-full bg-green-400"></div>
                            <h4 class="text-sm font-semibold text-white">Staff</h4>
                        </div>
                        <ul class="space-y-1 text-xs text-gray-400">
                            <li>• Active orders Kanban board</li>
                            <li>• Drag & drop order status</li>
                            <li>• Basic inventory updates</li>
                            <li>• No financial data</li>
                            <li>• No sales charts</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Add User Modal -->
            <div id="add-user-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center modal-overlay">
                <div class="bg-dark-800 border border-gray-700/50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-white">Add Staff Member</h3>
                        <button onclick="Users.hideAddUserModal()" class="text-gray-400 hover:text-white">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <form id="add-user-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                            <input type="text" name="full_name" required
                                class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <input type="email" name="email" required
                                class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Role</label>
                            <select name="role" required
                                class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                                <option value="staff">Staff</option>
                                <option value="manager">Manager</option>
                                <option value="superadmin">Superadmin</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Temporary Password</label>
                            <input type="password" name="password" required minlength="8"
                                class="w-full px-3 py-2 bg-dark-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                        </div>
                        <button type="submit"
                            class="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors">
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Generate user table row
     */
    getUserRow(user) {
        const roleColors = {
            superadmin: 'bg-red-900/30 text-red-400 border-red-800/50',
            manager: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
            staff: 'bg-green-900/30 text-green-400 border-green-800/50',
        };

        const statusColors = {
            active: 'bg-green-400',
            inactive: 'bg-gray-500',
        };

        return `
            <tr class="border-b border-gray-700/30 hover:bg-brand-500/5">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-brand-500/20 rounded-lg flex items-center justify-center">
                            <span class="text-xs font-semibold text-brand-400">${user.full_name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-white">${user.full_name}</p>
                            <p class="text-xs text-gray-500">${user.email}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[user.role]}">${user.role}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full ${statusColors[user.status]}"></div>
                        <span class="text-sm text-gray-300 capitalize">${user.status}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm text-gray-400">${user.last_login}</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="Users.toggleStatus(${user.id})" class="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors" title="Toggle Status">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                        </button>
                        <button onclick="Users.removeUser(${user.id})" class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Remove User">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    /**
     * Toggle user active/inactive status
     */
    toggleStatus(userId) {
        const user = this.demoUsers.find(u => u.id === userId);
        if (user) {
            user.status = user.status === 'active' ? 'inactive' : 'active';
            const container = document.getElementById('page-content');
            this.render(container);
            App.showToast(`${user.full_name} is now ${user.status}`, 'success');
        }
    },

    /**
     * Remove user
     */
    removeUser(userId) {
        const user = this.demoUsers.find(u => u.id === userId);
        if (user && confirm(`Remove ${user.full_name} from the system?`)) {
            this.demoUsers = this.demoUsers.filter(u => u.id !== userId);
            const container = document.getElementById('page-content');
            this.render(container);
            App.showToast(`${user.full_name} removed`, 'success');
        }
    },

    /**
     * Show add user modal
     */
    showAddUserModal() {
        document.getElementById('add-user-modal').classList.remove('hidden');
        
        const form = document.getElementById('add-user-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const newUser = {
                id: Math.max(...this.demoUsers.map(u => u.id)) + 1,
                full_name: formData.get('full_name'),
                email: formData.get('email'),
                role: formData.get('role'),
                status: 'active',
                last_login: 'Never',
            };

            // In production, create Supabase auth user here
            this.demoUsers.push(newUser);
            this.hideAddUserModal();
            const container = document.getElementById('page-content');
            this.render(container);
            App.showToast(`${newUser.full_name} added as ${newUser.role}`, 'success');
        };
    },

    /**
     * Hide add user modal
     */
    hideAddUserModal() {
        document.getElementById('add-user-modal').classList.add('hidden');
    }
};
