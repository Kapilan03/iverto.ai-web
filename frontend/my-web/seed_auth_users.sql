-- Enable pgcrypto extension for password encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_uid UUID := gen_random_uuid();
  staff_uid UUID := gen_random_uuid();
  parent_uid UUID := gen_random_uuid();
BEGIN
  -----------------------------------------------
  -- 1. Create Admin User
  -----------------------------------------------
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, role, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  )
  VALUES (
    admin_uid, 
    'admin@school.com', 
    crypt('admin123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{}', 
    'authenticated', 
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO public.user_profiles (id, email, role, name)
  VALUES (admin_uid, 'admin@school.com', 'admin', 'Admin User');

  -----------------------------------------------
  -- 2. Create Staff User
  -----------------------------------------------
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, role, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  )
  VALUES (
    staff_uid, 
    'staff@school.com', 
    crypt('staff123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{}', 
    'authenticated', 
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO public.user_profiles (id, email, role, name)
  VALUES (staff_uid, 'staff@school.com', 'staff', 'Staff User');

  -----------------------------------------------
  -- 3. Create Parent User
  -----------------------------------------------
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, role, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  )
  VALUES (
    parent_uid, 
    'parent@school.com', 
    crypt('parent123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{}', 
    'authenticated', 
    now(), now(), '', '', '', ''
  );
  
  INSERT INTO public.user_profiles (id, email, role, name, student_id)
  VALUES (parent_uid, 'parent@school.com', 'parent', 'Parent User', 'STU001');

END $$;
