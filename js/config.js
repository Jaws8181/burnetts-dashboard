/**
 * ==========================================
 * CONFIGURATION - Supabase & App Settings
 * ==========================================
 * BWA project: xlkbmabqsjyxcreqrlrw (us-east-2)
 * Anon key is public by design — RLS policies protect data access.
 */

const SUPABASE_URL = 'https://xlkbmabqsjyxcreqrlrw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsa2JtYWJxc2p5eGNyZXFybHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1ODkzMTMsImV4cCI6MjA5ODE2NTMxM30.VQq-pc6QvqMQbUyOgk2cWtdNZiIv4rjmW9GSAAMVl1E';
const BURNETTS_CLIENT_ID = 'acbc5e5e-bba2-4888-979f-52782fd7b9f8';

// DEMO_MODE is set as a var in index.html before any CDN loads — do not redefine here.
// true  → demo logins, all data is demo (for Shane's meeting)
// false → Supabase Auth required, real order data loads

// Initialize Supabase Client
// Wrapped in try/catch so config.js always runs to completion even if Supabase throws
let supabase = null;
try {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.warn('Supabase init failed — demo mode will still work:', e.message);
}

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
