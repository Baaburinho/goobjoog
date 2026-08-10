-- Enable PostGIS extension for geospatial mapping of properties
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. ROLES TABLE
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- 'administrator', 'landlord', 'tenant', 'accountant'
);

-- Seed Roles
INSERT INTO roles (name) VALUES 
('administrator'),
('landlord'),
('tenant')
ON CONFLICT (name) DO NOTHING;

-- 2. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL, -- Format: +252XXXXXXXXX
    is_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CITIES & DISTRICTS TABLES
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL -- e.g., Mogadishu, Hargeisa, Garowe, Kismayo
);

CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    city_id INT REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(city_id, name)
);

-- Seed Cities and Districts
INSERT INTO cities (id, name) VALUES 
(1, 'Mogadishu'),
(2, 'Hargeisa'),
(3, 'Garowe'),
(4, 'Kismayo'),
(5, 'Baidoa'),
(6, 'Galkayo'),
(7, 'Bosaso'),
(8, 'Burao'),
(9, 'Beledweyne'),
(10, 'Dhusamareb'),
(11, 'Jowhar'),
(12, 'Berbera')
ON CONFLICT (id) DO NOTHING;

INSERT INTO districts (city_id, name) VALUES 
(1, 'Hodan'),
(1, 'Wadajir'),
(1, 'Howlwadaag'),
(1, 'Bondhere'),
(2, '26 June'),
(2, 'Ahmed Dhagax'),
(2, 'Koodbuur'),
(3, 'Toxob'),
(3, 'Hodman'),
(4, 'Calanley'),
(4, 'Shaqaalaha'),
(5, 'Isha'),
(5, 'Wadajir'),
(6, 'Horumar'),
(6, 'Wadajir'),
(7, 'Laasgurey'),
(7, 'Bandar'),
(8, 'Togdheer'),
(8, 'Oktoobar'),
(9, 'Koshin'),
(9, 'Hawo Taako'),
(10, 'Dayax'),
(11, 'Hantiwadaag'),
(12, 'Berbera Port')
ON CONFLICT DO NOTHING;

-- 4. HOUSES (PROPERTIES) TABLE
CREATE TABLE houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id INT REFERENCES cities(id) ON DELETE RESTRICT,
    district_id INT REFERENCES districts(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price_per_month DECIMAL(12, 2) NOT NULL, -- Stored in USD
    deposit_amount DECIMAL(12, 2) DEFAULT 0.00,
    rooms_count INT NOT NULL CHECK (rooms_count > 0),
    bathrooms_count INT NOT NULL DEFAULT 1,
    facilities JSONB DEFAULT '{}'::jsonb, -- e.g., {"wifi": true, "water_24_7": true, "parking": false}
    coordinates GEOMETRY(Point, 4326), -- PostGIS point for geographic searches
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'rented', 'suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for spatial searching of properties
CREATE INDEX idx_houses_coordinates ON houses USING GIST (coordinates);
CREATE INDEX idx_houses_price_rooms ON houses (price_per_month, rooms_count);

-- 5. HOUSE IMAGES TABLE
CREATE TABLE house_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. RENTAL APPLICATIONS TABLE
CREATE TABLE rental_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    proposed_start_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    landlord_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, house_id, status) -- Prevent multiple active applications for the same house
);

-- 7. HOUSE TOURS & VIEWING BOOKINGS TABLE
CREATE TABLE house_tours (
    id TEXT PRIMARY KEY,
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    house_title TEXT NOT NULL,
    tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_name TEXT NOT NULL,
    tenant_phone TEXT NOT NULL,
    landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tour_date DATE NOT NULL,
    tour_time_slot VARCHAR(20) NOT NULL CHECK (tour_time_slot IN ('morning', 'afternoon', 'evening')),
    tour_type VARCHAR(20) DEFAULT 'in_person' CHECK (tour_type IN ('in_person', 'video_call')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. COMPLAINTS TABLE
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    house_id UUID REFERENCES houses(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
