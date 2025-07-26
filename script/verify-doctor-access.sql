-- Verify doctor has proper access to appointments

-- Check current policies on appointments table
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'appointments'
ORDER BY policyname;

-- Check if doctor role exists in profiles
SELECT 
  email,
  role,
  created_at
FROM profiles 
WHERE role = 'doctor';

-- Test query that should work for doctors
-- (This is what the app is trying to do)
-- SELECT * FROM appointments WHERE id = 'some-id';
-- UPDATE appointments SET status = 'cancelled' WHERE id = 'some-id';
