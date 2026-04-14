-- supabase_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS camps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camp_id UUID REFERENCES camps(id) ON DELETE CASCADE,
    ratings JSONB NOT NULL, -- expects {"food": 1, "bed": 1, "wifi": 1, "vibe": 1}
    comment TEXT,
    agency TEXT,
    role TEXT,
    rate NUMERIC,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Note: Policies (RLS) can be added here if needed, but for anon public access:
-- ALTER TABLE camps ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read" ON camps FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON camps FOR INSERT WITH CHECK (true);
-- And similarly for reviews.
