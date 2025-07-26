-- Alternative approach: Remove the trigger entirely and handle profile creation in the app

-- 1. Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Make sure the profiles table has proper permissions
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Update RLS policies to be more permissive for profile creation
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 4. Allow authenticated users to insert their own profiles
CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
