-- Run this to check if everything is set up correctly

-- Check if tables exist
SELECT 'profiles table exists' as status WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'profiles'
);

SELECT 'appointments table exists' as status WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'appointments'
);

-- Check users and their roles
SELECT 
  u.email,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY p.created_at DESC;

-- Check appointments count
SELECT 
  status,
  COUNT(*) as count
FROM appointments 
GROUP BY status;
