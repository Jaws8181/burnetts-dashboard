/**
 * ==========================================
 * AUTHENTICATION MODULE
 * ==========================================
 * Handles PocketBase auth, session management, and role-based routing.
 * PocketBase automatically persists sessions to localStorage.
 */

const Auth = {
    currentUser: null,
    currentProfile: null,

    /**
     * Initialize authentication state
     * PocketBase restores session from localStorage automatically.
     */
    async init() {
        // Check for existing valid session
        if (pb.authStore.isValid) {
            await this.handleSession(pb.authStore.model);
        }

        // Listen for auth state changes
        pb.authStore.onChange(async (token, model) => {
            if (model) {
                await this.handleSession(model);
            } else {
                this.handleSignOut();
            }
        });
    },

    /**
     * Sign in with email and password
     */
    async signIn(email, password) {
        // Demo mode — bypass PocketBase if URL not configured
        if (DEMO_MODE) {
            return this.demoSignIn(email);
        }

        try {
            const authData = await pb.collection('users').authWithPassword(email, password);
            return authData;
        } catch (err) {
            throw new Error('Invalid email or password');
        }
    },

    /**
     * Sign out the current user
     */
    async signOut() {
        pb.authStore.clear();
        this.handleSignOut();
    },

    /**
     * Handle successful session
     */
    async handleSession(model) {
        this.currentUser = model;

        // Try to fetch full profile from 'profiles' collection
        if (!DEMO_MODE) {
            try {
                const profile = await pb.collection('profiles').getOne(model.id);
                this.currentProfile = profile;
            } catch (err) {
                // Fallback: use model data directly (PocketBase users can have role field)
                this.currentProfile = {
                    id: model.id,
                    full_name: model.name || model.username || model.email,
                    email: model.email,
                    role: model.role || ROLES.STAFF,
                };
            }
        } else {
            // Demo mode profile
            this.currentProfile = this.getDemoProfile(model.email);
        }

        App.showApp();
    },

    /**
     * Handle sign out
     */
    handleSignOut() {
        this.currentUser = null;
        this.currentProfile = null;
        App.showLogin();
    },

    /**
     * Get user role
     */
    getRole() {
        return this.currentProfile?.role || ROLES.STAFF;
    },

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.getRole() === role;
    },

    /**
     * Check if user can access financial data
     */
    canViewFinancials() {
        const role = this.getRole();
        return role === ROLES.SUPERADMIN || role === ROLES.MANAGER;
    },

    /**
     * Check if user can manage users
     */
    canManageUsers() {
        return this.getRole() === ROLES.SUPERADMIN;
    },

    /**
     * Get demo profile for development/testing (no PocketBase needed)
     */
    getDemoProfile(email) {
        const demoProfiles = {
            'admin@burnettsbutcher.com': {
                id: 'demo-admin',
                full_name: 'System Admin',
                email: 'admin@burnettsbutcher.com',
                role: ROLES.SUPERADMIN,
            },
            'shane@burnettsbutcher.com': {
                id: 'demo-manager',
                full_name: 'Shane Burnett',
                email: 'shane@burnettsbutcher.com',
                role: ROLES.MANAGER,
            },
            'staff@burnettsbutcher.com': {
                id: 'demo-staff',
                full_name: 'Mike Johnson',
                email: 'staff@burnettsbutcher.com',
                role: ROLES.STAFF,
            },
        };

        return demoProfiles[email] || demoProfiles['staff@burnettsbutcher.com'];
    },

    /**
     * Demo sign-in — works without any backend
     */
    demoSignIn(email) {
        this.currentUser = { email, id: 'demo-' + Date.now() };
        this.currentProfile = this.getDemoProfile(email);
        App.showApp();
    }
};
