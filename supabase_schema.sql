-- =======================================================
-- GoobJoog Somali House Renting System - Supabase Schema
-- =======================================================

-- 1. PROFILES (USERS) TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{tenant}',
    upgrade_status TEXT DEFAULT 'none' CHECK (upgrade_status IN ('none', 'pending', 'approved')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) optionally, or allow all read/write
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.profiles FOR DELETE USING (true);

-- Seed initial test users
INSERT INTO public.profiles (id, full_name, phone, email, username, password, roles, upgrade_status, is_verified)
VALUES
    ('u-admin1', 'Super Administrator', '252615550001', 'admin@goobjoog.com', 'admin', 'admin123', '{administrator}', 'none', true),
    ('u-land1', 'Hassan Geedi (Landlord)', '252615551100', 'hassan@landlord.so', 'landlord', 'landlord123', '{homeowner}', 'none', true),
    ('u-tenant1', 'Abdi Omar (Tenant)', '252619992233', 'abdi@tenant.so', 'tenant', 'tenant123', '{tenant}', 'none', true)
ON CONFLICT (username) DO NOTHING;


-- 2. HOUSES (LISTINGS) TABLE
CREATE TABLE IF NOT EXISTS public.houses (
    id TEXT PRIMARY KEY,
    landlord_id TEXT NOT NULL,
    landlord_name TEXT NOT NULL,
    landlord_phone TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price_per_month NUMERIC NOT NULL,
    deposit_amount NUMERIC DEFAULT 0,
    rooms_count INTEGER DEFAULT 1,
    bathrooms_count INTEGER DEFAULT 1,
    wifi BOOLEAN DEFAULT FALSE,
    water_24_7 BOOLEAN DEFAULT FALSE,
    parking BOOLEAN DEFAULT FALSE,
    latitude NUMERIC,
    longitude NUMERIC,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented', 'suspended')),
    image_url TEXT NOT NULL,
    additional_images TEXT[] DEFAULT '{}',
    rating_sum NUMERIC DEFAULT 0,
    rating_count NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.houses FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.houses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.houses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.houses FOR DELETE USING (true);

-- Seed default properties
INSERT INTO public.houses (
    id, landlord_id, landlord_name, landlord_phone, city, district, 
    title, description, price_per_month, deposit_amount, rooms_count, bathrooms_count, 
    wifi, water_24_7, parking, latitude, longitude, status, image_url, additional_images
)
VALUES
    (
        'h-1', 'u-land1', 'Hassan Geedi (Landlord)', '252615551100', 'Mogadishu', 'Hodan',
        'Premium Somali Villa', 'Beautiful 4-bedroom villa with reliable security, near km4 street.',
        550, 1100, 4, 3, true, true, true, 2.042, 45.321, 'available',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', '{}'
    ),
    (
        'h-2', 'u-land1', 'Hassan Geedi (Landlord)', '252615551100', 'Hargeisa', '26 June',
        'Standard Apartment', 'Spacious 2-bedroom apartment with constant water flow and solar power.',
        320, 320, 2, 2, false, true, true, 9.562, 44.065, 'available',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', '{}'
    )
ON CONFLICT (id) DO NOTHING;


-- 3. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY,
    house_id TEXT NOT NULL,
    house_title TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    tenant_name TEXT NOT NULL,
    tenant_phone TEXT NOT NULL,
    proposed_start_date TEXT,
    monthly_rent NUMERIC NOT NULL,
    deposit_paid NUMERIC DEFAULT 0,
    months_paid INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'rented')),
    landlord_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.applications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.applications FOR DELETE USING (true);


-- 4. HOUSE TOURS & VIEWING BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.house_tours (
    id TEXT PRIMARY KEY,
    house_id TEXT NOT NULL,
    house_title TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    tenant_name TEXT NOT NULL,
    tenant_phone TEXT NOT NULL,
    landlord_id TEXT NOT NULL,
    tour_date TEXT NOT NULL,
    tour_time_slot TEXT NOT NULL CHECK (tour_time_slot IN ('morning', 'afternoon', 'evening')),
    tour_type TEXT DEFAULT 'in_person' CHECK (tour_type IN ('in_person', 'video_call')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.house_tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.house_tours FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.house_tours FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.house_tours FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.house_tours FOR DELETE USING (true);

-- Seed initial house tours
INSERT INTO public.house_tours (
    id, house_id, house_title, tenant_id, tenant_name, tenant_phone, 
    landlord_id, tour_date, tour_time_slot, tour_type, status, notes
)
VALUES
    (
        'tour-101', 'h-1', 'Premium Somali Villa', 'u-tenant1', 'Abdi Omar (Tenant)', '252619992233',
        'u-land1', '2026-08-12', 'afternoon', 'in_person', 'confirmed', 'Looking forward to viewing the 4-bedroom villa.'
    ),
    (
        'tour-102', 'h-2', 'Standard Apartment', 'u-tenant1', 'Abdi Omar (Tenant)', '252619992233',
        'u-land1', '2026-08-14', 'morning', 'video_call', 'pending', 'Requesting a live video tour walkthrough.'
    )
ON CONFLICT (id) DO NOTHING;



-- 5. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY,
    reporter_name TEXT NOT NULL,
    reporter_phone TEXT NOT NULL,
    house_title TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    resolution_notes TEXT DEFAULT '',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.complaints FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.complaints FOR DELETE USING (true);


-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.audit_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.audit_logs FOR DELETE USING (true);
