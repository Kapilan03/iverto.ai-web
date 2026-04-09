-- Run this in your Supabase SQL Editor to clear out the manually injected users
-- This will fix the "Database error saving new user" bug when GoTrue tries to sign you up.

DELETE FROM auth.users 
WHERE email IN ('admin@school.com', 'staff@school.com', 'parent@school.com');
