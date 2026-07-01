/**
 * ==========================================
 * CONFIGURATION - PocketBase & App Settings
 * ==========================================
 * Replace POCKETBASE_URL with your Railway deployment URL.
 * Format: https://your-service.up.railway.app
 */

const POCKETBASE_URL = 'https://pocketbase-production-81bc.up.railway.app';

// Set to true to show demo data without requiring PocketBase login
// Set to false when going live with real users
const DEMO_MODE = true;

// Initialize PocketBase Client
const pb = new PocketBase(POCKETBASE_URL);

// App Configuration
const APP_CONFIG = {
    appName: "Burnett's Dashboard",
    version: '1.0.0',
    lowStockThreshold: 5,
    currency: 'CAD',
    timezone: 'America/Toronto',
};

// Role Definitions
const ROLES = {
    SUPERADMIN: 'superadmin',
    MANAGER: 'manager',
    STAFF: 'staff',
};

// Navigation Configuration (Role-Based)
const NAV_CONFIG = {
    [ROLES.SUPERADMIN]: [
        { id: 'dashboard', label: 'Dashboard', icon: 'chart-bar' },
        { id: 'orders', label: 'Orders', icon: 'clipboard-list' },
        { id: 'inventory', label: 'Inventory', icon: 'archive' },
        { id: 'users', label: 'User Management', icon: 'users' },
        { id: 'settings', label: 'System Settings', icon: 'cog' },
    ],
    [ROLES.MANAGER]: [
        { id: 'dashboard', label: 'Dashboard', icon: 'chart-bar' },
        { id: 'orders', label: 'Orders', icon: 'clipboard-list' },
        { id: 'inventory', label: 'Inventory', icon: 'archive' },
    ],
    [ROLES.STAFF]: [
        { id: 'orders', label: 'Active Orders', icon: 'clipboard-list' },
        { id: 'inventory', label: 'Inventory', icon: 'archive' },
    ],
};

// Order Status Flow
const ORDER_STATUSES = {
    NEW: 'new',
    PREPPING: 'prepping',
    READY: 'ready',
    COMPLETED: 'completed',
};

// SVG Icons Map
const ICONS = {
    'chart-bar': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    'clipboard-list': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>',
    'archive': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>',
    'users': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
    'cog': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
};
