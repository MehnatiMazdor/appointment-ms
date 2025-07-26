-- Manual setup for admin and doctor roles
-- Run this AFTER signing up through the app with the specified emails

-- First, check what users exist
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Then manually insert profiles for existing users if they don't exist
-- (This is a fallback in case the trigger didn't work)

-- Replace 'your-actual-user-id-here' with the actual UUID from the query above
-- INSERT INTO profiles (id, email, role) 
-- VALUES ('your-actual-user-id-here', 'admin@drjohnson.com', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- INSERT INTO profiles (id, email, role) 
-- VALUES ('your-actual-user-id-here', 'doctor@drjohnson.com', 'doctor')
-- ON CONFLICT (id) DO UPDATE SET role = 'doctor';

-- Or update existing profiles by email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@drjohnson.com';

UPDATE profiles 
SET role = 'doctor' 
WHERE email = 'doctor@drjohnson.com';

-- Verify the updates
SELECT 
  p.id,
  p.email,
  p.role,
  u.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY u.created_at DESC;
