-- Run this in your Supabase SQL Editor to allow new users to save their profiles
-- Because there was no INSERT policy, the profiles were not being saved!

CREATE POLICY "Enable insert access for authenticated users" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" 
ON user_profiles FOR UPDATE
USING (auth.role() = 'authenticated');
