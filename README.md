# Burnett's Butcher Shop - Order & Inventory Management Dashboard

A production-ready, role-based SaaS dashboard built for Burnett's Butcher Shop to manage orders, track inventory, and analyze sales data.

## Features

*   **Role-Based Access Control (RBAC):**
    *   **Superadmin:** Full system access, user management, and system settings.
    *   **Manager (Shane):** Financial overview, full inventory control, and order management.
    *   **Staff:** Active orders Kanban board and basic inventory updates (no financial data access).
*   **Order Management (Kanban):** Drag-and-drop interface for moving orders through New -> Prepping -> Ready for Pickup.
*   **Inventory Tracking:** Real-time stock levels with visual "Low Stock" warnings.
*   **Financial Analytics:** Chart.js integration for weekly revenue tracking (Manager/Superadmin only).
*   **Modern UI/UX:** Built with Tailwind CSS for a responsive, sleek, and dark-themed interface.

## Tech Stack

*   **Frontend:** HTML5, Vanilla JavaScript
*   **Styling:** Tailwind CSS (via CDN)
*   **Charts:** Chart.js
*   **Backend & Auth:** Supabase (PostgreSQL, Authentication, Row Level Security)

---

## Setup Instructions

### 1. Supabase Project Setup

1.  Create a new project on [Supabase](https://supabase.com/).
2.  Go to **Project Settings -> API** and copy your `Project URL` and `anon public` key.
3.  Open `js/config.js` in this project and replace the placeholder values:

    ```javascript
    const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
    const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
    ```

### 2. Database Schema & RLS Policies (SQL)

Go to the **SQL Editor** in your Supabase dashboard and run the following commands to create the necessary tables and Row Level Security (RLS) policies.

#### Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Profiles Table (extends Supabase Auth)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'manager', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Inventory Table
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    items JSONB NOT NULL,
    pickup_time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('new', 'prepping', 'ready', 'completed')),
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

#### Setup Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PROFILES POLICIES
-- ==========================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Superadmins can read all profiles
CREATE POLICY "Superadmins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
    );

-- Superadmins can insert/update profiles
CREATE POLICY "Superadmins can manage profiles" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
    );

-- ==========================================
-- INVENTORY POLICIES
-- ==========================================

-- All authenticated users can view inventory
CREATE POLICY "Anyone can view inventory" ON inventory
    FOR SELECT USING (auth.role() = 'authenticated');

-- Staff can update stock levels
CREATE POLICY "Staff can update inventory" ON inventory
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Only Managers and Superadmins can insert/delete inventory items
CREATE POLICY "Managers/Admins can insert inventory" ON inventory
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'superadmin'))
    );

CREATE POLICY "Managers/Admins can delete inventory" ON inventory
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'superadmin'))
    );

-- ==========================================
-- ORDERS POLICIES
-- ==========================================

-- All authenticated users can view orders
CREATE POLICY "Anyone can view orders" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');

-- All authenticated users can update order status (Kanban drag & drop)
CREATE POLICY "Anyone can update orders" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- All authenticated users can create new orders
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only Superadmins can delete orders
CREATE POLICY "Only Superadmins can delete orders" ON orders
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
    );
```

#### Create a Trigger for New Users

This automatically creates a profile entry when a new user signs up via Supabase Auth.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'staff')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 3. Running the App

Simply open `index.html` in a web browser, or serve the directory using a local web server (e.g., VS Code Live Server, Python `http.server`).

*Note: If Supabase credentials are not provided in `config.js`, the app will automatically fall back to a fully functional **Demo Mode** using mock data.*

**Demo Credentials:**
*   **Superadmin:** `admin@burnettsbutcher.com`
*   **Manager:** `shane@burnettsbutcher.com`
*   **Staff:** `staff@burnettsbutcher.com`
*(Password can be anything in demo mode)*
