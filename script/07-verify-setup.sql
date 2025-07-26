-- Step 7: Verify everything is working

-- Check if tables exist
SELECT 
  table_name,
  'exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'appointments');

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'appointments');

-- Check if policies exist
SELECT 
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public';

-- Check if trigger exists
SELECT 
  trigger_name,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
