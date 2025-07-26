-- This script should be run AFTER you've signed up with the admin and doctor emails
-- First, sign up through the app with these emails:
-- 1. admin@drjohnson.com
-- 2. doctor@drjohnson.com

-- Then find their user IDs and update their roles
-- You can find the user IDs by running this query first:
-- SELECT id, email FROM auth.users WHERE email IN ('admin@drjohnson.com', 'doctor@drjohnson.com');

-- Update user roles (replace the UUIDs with actual user IDs from the query above)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@drjohnson.com';
-- UPDATE profiles SET role = 'doctor' WHERE email = 'doctor@drjohnson.com';

-- Or if you want to update by ID directly:
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_ADMIN_USER_ID_HERE';
-- UPDATE profiles SET role = 'doctor' WHERE id = 'YOUR_DOCTOR_USER_ID_HERE';

-- Example with placeholder IDs (replace with actual IDs):
UPDATE profiles SET role = 'admin' 
WHERE email = 'admin@drjohnson.com' AND EXISTS (
  SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id
);

UPDATE profiles SET role = 'doctor' 
WHERE email = 'doctor@drjohnson.com' AND EXISTS (
  SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id
);
