-- Fix doctor permissions to allow updating appointment status

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Doctors can update all appointments" ON appointments;

-- Create new policy to allow doctors to update appointment status
CREATE POLICY "Doctors can update appointment status" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'doctor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'doctor'
    )
  );

-- Also ensure admins can still update appointments
CREATE POLICY "Admins can update appointment status" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Verify the policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'appointments' 
  AND policyname LIKE '%update%'
ORDER BY policyname;
