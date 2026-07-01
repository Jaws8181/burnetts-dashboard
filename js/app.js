/**
 * ==========================================
 * MAIN APPLICATION MODULE
 * ==========================================
 * Initializes the app, handles routing, and manages global state.
 */

const App = {
    /**
     * Initialize the application
     */
    async init() {
        // Set current date in header
        this.updateDate();

        // Setup login form handler
        this.setupLoginForm();

        // Setup logout handler
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());

        // Try to initialize PocketBase auth
        try {
            if (!DEMO_MODE) {
                await Auth.init();
            } else {
                console.log('Running in demo mode - PocketBase not configured');
                this.showLogin();
            }
        } catch (err) {
            console.log('PocketBase not available, running in demo mode');
            this.showLogin();
        }
    },

    /**
     * Setup login form event handler
     */
    setupLoginForm() {
        const form = document.getElementById('login-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('login-error');
            const btn = document.getElementById('login-btn');

            // Show loading state
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner inline-block mr-2"></span> Signing in...';
            errorEl.classList.add('hidden');

            try {
                if (!DEMO_MODE) {
                    // Production: Use PocketBase auth
                    await Auth.signIn(email, password);
                } else {
                    // Demo mode: Simulate authentication
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    const validEmails = ['admin@burnettsbutcher.com', 'shane@burnettsbutcher.com', 'staff@burnettsbutcher.com'];
                    if (validEmails.includes(email)) {
                        Auth.demoSignIn(email);
                    } else {
                        throw new Error('Invalid credentials. Use one of the demo emails listed below.');
                    }
                }
            } catch (err) {
                errorEl.textContent = err.message || 'Authentication failed. Please try again.';
                errorEl.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Sign In';
            }
        });
    },

    /**
     * Show the login screen
     */
    showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    },

    /**
     * Show the main application
     */
    showApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');

        // Update user info in sidebar
        this.updateUserInfo();

        // Build navigation based on role
        this.buildNavigation();

        // Navigate to default page
        const defaultPage = Router.getDefaultPage();
        Router.navigate(defaultPage);
    },

    /**
     * Update user info in sidebar
     */
    updateUserInfo() {
        const profile = Auth.currentProfile;
        if (!profile) return;

        document.getElementById('user-name').textContent = profile.full_name;
        document.getElementById('user-email').textContent = profile.email;
        document.getElementById('user-avatar').textContent = profile.full_name.split(' ').map(n => n[0]).join('');
        document.getElementById('sidebar-role').textContent = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
    },

    /**
     * Build sidebar navigation based on user role
     */
    buildNavigation() {
        const nav = document.getElementById('sidebar-nav');
        const role = Auth.getRole();
        const items = NAV_CONFIG[role] || NAV_CONFIG[ROLES.STAFF];

        nav.innerHTML = items.map(item => `
            <button class="nav-item w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-dark-900/50 rounded-xl transition-all"
                    data-page="${item.id}" onclick="Router.navigate('${item.id}')">
                <span class="text-gray-400">${ICONS[item.icon]}</span>
                <span>${item.label}</span>
            </button>
        `).join('');
    },

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            if (!DEMO_MODE) {
                await Auth.signOut();
            } else {
                Auth.currentUser = null;
                Auth.currentProfile = null;
                this.showLogin();
            }
        } catch (err) {
            console.error('Logout error:', err);
            this.showLogin();
        }
    },

    /**
     * Update date display
     */
    updateDate() {
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            const now = new Date();
            dateEl.textContent = now.toLocaleDateString('en-CA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
    },

    /**
     * Toggle sidebar on mobile
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    },

    /**
     * Close sidebar on mobile
     */
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const colors = {
            success: 'bg-green-900/90 border-green-700 text-green-200',
            error: 'bg-red-900/90 border-red-700 text-red-200',
            warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-200',
            info: 'bg-blue-900/90 border-blue-700 text-blue-200',
        };

        const icons = {
            success: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
            error: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
            warning: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"/></svg>',
            info: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        };

        const toast = document.createElement('div');
        toast.className = `toast fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[type]} shadow-2xl max-w-sm`;
        toast.innerHTML = `${icons[type]}<span class="text-sm">${message}</span>`;
        
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
