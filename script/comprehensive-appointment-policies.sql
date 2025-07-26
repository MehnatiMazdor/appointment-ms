-- Comprehensive fix for appointment policies
-- This replaces all existing appointment policies with clearer ones

-- Drop all existing appointment policies
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can update all appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update all appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update appointment status" ON appointments;
DROP POLICY IF EXISTS "Admins can update appointment status" ON appointments;

-- Create comprehensive policies

-- 1. SELECT policies (who can view appointments)
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Doctors can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'doctor'
    )
  );

-- 2. INSERT policies (who can create appointments)
CREATE POLICY "Users can create own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE policies (who can update appointments)
CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all appointments" ON appointments
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

CREATE POLICY "Doctors can update all appointments" ON appointments
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

-- Verify all policies are created
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'appointments'
ORDER BY cmd, policyname;
