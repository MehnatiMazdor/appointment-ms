-- Fix the profile creation issue

-- First, let's check what users exist without profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Create profiles for existing users who don't have them
INSERT INTO profiles (id, email, role)
SELECT 
  u.id,
  u.email,
  'patient' as role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Verify all users now have profiles
SELECT 
  u.email,
  p.role,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
ORDER BY p.created_at DESC;
