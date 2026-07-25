/**
 * ==========================================
 * AUTHENTICATION MODULE
 * ==========================================
 * Handles Supabase auth, session management, and role-based routing.
 * Supabase persists sessions to localStorage automatically.
 */

const Auth = {
    currentUser: null,
    currentProfile: null,

    /**
     * Initialize authentication state
     * Supabase restores session from localStorage automatically.
     */
    async init() {
        // Check for existing valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await this.handleSession(session.user);
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                await this.handleSession(session.user);
            } else {
                this.handleSignOut();
            }
        });
    },

    /**
     * Sign in with email and password
     */
    async signIn(email, password) {
        // Demo mode — bypass Supabase auth
        if (DEMO_MODE) {
            return this.demoSignIn(email);
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        } catch (err) {
            throw new Error('Invalid email or password');
        }
    },

    /**
     * Sign out the current user
     */
    async signOut() {
        await supabase.auth.signOut();
        this.handleSignOut();
    },

    /**
     * Handle successful session
     */
    async handleSession(user) {
        this.currentUser = user;

        // Try to fetch full profile from Supabase profiles table
        if (!DEMO_MODE) {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    this.currentProfile = profile;
                } else {
                    // Fallback: assign role by email
                    this.currentProfile = {
                        id: user.id,
                        full_name: user.email,
                        email: user.email,
                        role: this.getRoleByEmail(user.email),
                    };
                }
            } catch (err) {
                this.currentProfile = {
                    id: user.id,
                    full_name: user.email,
                    email: user.email,
                    role: this.getRoleByEmail(user.email),
                };
            }
        } else {
            // Demo mode profile
            this.currentProfile = this.getDemoProfile(user.email);
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
     * Assign role based on email — used when Profiles collection has no record yet
     */
    getRoleByEmail(email) {
        if (email === 'admin@burnettsbutcher.com') return ROLES.SUPERADMIN;
        if (email === 'shane@burnettsbutcher.com') return ROLES.MANAGER;
        return ROLES.STAFF;
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
