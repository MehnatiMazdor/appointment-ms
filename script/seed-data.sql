-- Insert sample admin user (you'll need to sign up with this email first)
INSERT INTO profiles (id, email, role) 
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@drjohnson.com',
  'admin'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Insert sample doctor user (you'll need to sign up with this email first)
INSERT INTO profiles (id, email, role) 
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  'doctor@drjohnson.com',
  'doctor'
) ON CONFLICT (id) DO UPDATE SET role = 'doctor';

-- Note: To use these accounts, you need to:
-- 1. Sign up with these email addresses through the app
-- 2. Update the UUIDs above with the actual user IDs from auth.users table
-- 3. Run this script again

-- You can find the actual user IDs by running:
-- SELECT id, email FROM auth.users WHERE email IN ('admin@drjohnson.com', 'doctor@drjohnson.com');
