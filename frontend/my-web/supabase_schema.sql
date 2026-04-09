-- 1. Create a Profiles table to store custom user data like Role and Name
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'staff', 'parent')) NOT NULL DEFAULT 'parent',
  name TEXT NOT NULL,
  student_id TEXT
);

-- Turn on Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow read access to profiles for authenticated users
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. Create Students Table
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  photo TEXT DEFAULT '',
  attendance TEXT DEFAULT '100%'
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for admin/staff only" ON students FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- 3. Create Cameras Table
CREATE TABLE cameras (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'online',
  fps INTEGER DEFAULT 30,
  allowed_roles TEXT[] NOT NULL DEFAULT '{"admin"}',
  linked_student_id TEXT
);

ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON cameras FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Create Camera Zones Table
CREATE TABLE camera_zones (
  id TEXT PRIMARY KEY,
  camera_id TEXT NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
  x TEXT NOT NULL,
  y TEXT NOT NULL,
  w TEXT NOT NULL,
  h TEXT NOT NULL,
  label TEXT NOT NULL
);

ALTER TABLE camera_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON camera_zones FOR SELECT USING (auth.role() = 'authenticated');

-- ==========================================
-- SEED DATA (MOCK DATA)
-- ==========================================

-- Insert Students
INSERT INTO students (id, name, class, roll_no, parent_email, attendance) VALUES
  ('STU001', 'Ravi Kumar', '10-A', '01', 'parent@school.com', '92%'),
  ('STU002', 'Priya Singh', '9-B', '14', 'other@school.com', '87%'),
  ('STU003', 'Ankit Sharma', '10-A', '05', 'ankit.parent@school.com', '95%'),
  ('STU004', 'Meera Patel', '8-C', '22', 'meera.parent@school.com', '78%'),
  ('STU005', 'Arjun Verma', '9-B', '08', 'arjun.parent@school.com', '91%'),
  ('STU006', 'Sneha Reddy', '10-A', '11', 'sneha.parent@school.com', '89%'),
  ('STU007', 'Karan Nair', '8-C', '03', 'karan.parent@school.com', '94%'),
  ('STU008', 'Divya Iyer', '9-B', '19', 'divya.parent@school.com', '82%');

-- Insert Cameras
INSERT INTO cameras (id, name, location, status, fps, allowed_roles) VALUES
  ('CAM-01', 'Main Corridor', 'Building A — Ground Floor', 'online', 30, '{"admin", "staff", "parent"}'),
  ('CAM-02', 'Playground', 'Outdoor — East Wing', 'online', 25, '{"admin", "staff"}'),
  ('CAM-03', 'Library', 'Building B — First Floor', 'online', 30, '{"admin", "staff"}'),
  ('CAM-04', 'Cafeteria', 'Building A — Ground Floor', 'online', 30, '{"admin", "staff", "parent"}'),
  ('CAM-05', 'Main Gate', 'Entrance — Security Post', 'online', 30, '{"admin"}'),
  ('CAM-06', 'Science Lab', 'Building C — Second Floor', 'maintenance', 0, '{"admin", "staff"}');

-- Insert Zones
INSERT INTO camera_zones (id, camera_id, x, y, w, h, label) VALUES
  ('STU001_A', 'CAM-01', '12%', '35%', '18%', '50%', 'Zone A'),
  ('STU002_B', 'CAM-01', '35%', '30%', '16%', '55%', 'Zone B'),
  ('STU003_C', 'CAM-01', '58%', '38%', '17%', '48%', 'Zone C'),
  ('unknown_D', 'CAM-01', '78%', '40%', '15%', '45%', 'Unknown'),
  
  ('STU004_A', 'CAM-02', '8%', '32%', '17%', '52%', 'Zone A'),
  ('STU005_B', 'CAM-02', '30%', '36%', '16%', '48%', 'Zone B'),
  ('STU006_C', 'CAM-02', '52%', '30%', '18%', '54%', 'Zone C'),
  ('STU007_D', 'CAM-02', '74%', '34%', '17%', '50%', 'Zone D'),
  
  ('STU008_A', 'CAM-03', '15%', '38%', '20%', '48%', 'Zone A'),
  ('STU001_B', 'CAM-03', '42%', '32%', '18%', '52%', 'Zone B'),
  ('unknown_C', 'CAM-03', '68%', '36%', '16%', '50%', 'Unknown'),
  
  ('STU002_cafe', 'CAM-04', '10%', '34%', '16%', '50%', 'Zone A'),
  ('STU003_cafe', 'CAM-04', '32%', '30%', '18%', '54%', 'Zone B'),
  ('STU005_cafe', 'CAM-04', '55%', '38%', '15%', '46%', 'Zone C'),
  ('STU004_cafe', 'CAM-04', '76%', '32%', '17%', '52%', 'Zone D'),
  
  ('unknown_main1', 'CAM-05', '20%', '30%', '18%', '55%', 'Unknown 1'),
  ('unknown_main2', 'CAM-05', '50%', '35%', '16%', '50%', 'Unknown 2');
