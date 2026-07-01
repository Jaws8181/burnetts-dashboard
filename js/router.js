/**
 * ==========================================
 * ROUTER MODULE
 * ==========================================
 * Handles page navigation and dynamic content rendering.
 */

const Router = {
    currentPage: null,

    /**
     * Navigate to a specific page
     */
    navigate(pageId) {
        this.currentPage = pageId;
        this.updateNavigation(pageId);
        this.renderPage(pageId);
        // Close sidebar on mobile after navigating
        if (window.innerWidth < 768) App.closeSidebar();
    },

    /**
     * Update sidebar navigation active state
     */
    updateNavigation(activeId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === activeId) {
                item.classList.add('active');
            }
        });
    },

    /**
     * Render page content based on page ID
     */
    renderPage(pageId) {
        const content = document.getElementById('page-content');
        const title = document.getElementById('page-title');
        const subtitle = document.getElementById('page-subtitle');

        switch (pageId) {
            case 'dashboard':
                title.textContent = 'Dashboard';
                subtitle.textContent = `Welcome back, ${Auth.currentProfile?.full_name?.split(' ')[0] || 'User'}`;
                Dashboard.render(content);
                break;
            case 'orders':
                title.textContent = 'Orders';
                subtitle.textContent = 'Manage customer orders';
                Orders.render(content);
                break;
            case 'inventory':
                title.textContent = 'Inventory';
                subtitle.textContent = 'Stock levels & management';
                Inventory.render(content);
                break;
            case 'users':
                title.textContent = 'User Management';
                subtitle.textContent = 'Manage staff accounts';
                Users.render(content);
                break;
            case 'settings':
                title.textContent = 'System Settings';
                subtitle.textContent = 'Configuration & logs';
                Settings.render(content);
                break;
            default:
                content.innerHTML = '<p class="text-gray-400">Page not found.</p>';
        }
    },

    /**
     * Get the default page for the current user's role
     */
    getDefaultPage() {
        const role = Auth.getRole();
        if (role === ROLES.STAFF) return 'orders';
        return 'dashboard';
    }
};
