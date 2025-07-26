-- Assign hardcoded roles for specific emails

-- Set admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@drjohnson.com';

-- Set doctor role  
UPDATE profiles 
SET role = 'doctor'
WHERE email = 'doctor@drjohnson.com';

-- Set specific patient emails if needed
UPDATE profiles 
SET role = 'patient'
WHERE email = 'patient@drjohnson.com';

-- You can add more hardcoded roles here:
-- UPDATE profiles SET role = 'admin' WHERE email = 'youradmin@email.com';
-- UPDATE profiles SET role = 'doctor' WHERE email = 'yourdoctor@email.com';

-- Verify the role assignments
SELECT 
  email,
  role,
  updated_at
FROM profiles 
WHERE role IN ('admin', 'doctor')
ORDER BY role;
