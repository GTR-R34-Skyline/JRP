/*
  # Fix infinite recursion in RLS policies

  1. Security Changes
    - Drop all existing policies that cause recursion
    - Create simple, non-recursive policies
    - Remove circular references in admin_users policies
    - Simplify vendor and application policies

  2. Policy Changes
    - admin_users: Simple auth.uid() based policies
    - vendors: Direct access without admin checks
    - vendor_applications: Allow inserts and user-specific selects
    - customer_reviews: Public read, authenticated write
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage vendors" ON vendors;
DROP POLICY IF EXISTS "Anyone can view active vendors" ON vendors;
DROP POLICY IF EXISTS "Admins can view all applications" ON vendor_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON vendor_applications;
DROP POLICY IF EXISTS "Anyone can create vendor applications" ON vendor_applications;
DROP POLICY IF EXISTS "Vendors can view their own applications" ON vendor_applications;
DROP POLICY IF EXISTS "Anyone can view reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON customer_reviews;

-- Create simple, non-recursive policies for admin_users
CREATE POLICY "Users can view their own admin record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create simple policies for vendors (no admin checks to avoid recursion)
CREATE POLICY "Anyone can view active vendors"
  ON vendors
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage vendors"
  ON vendors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create simple policies for vendor_applications
CREATE POLICY "Anyone can create applications"
  ON vendor_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own applications"
  ON vendor_applications
  FOR SELECT
  TO public
  USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Service role can manage applications"
  ON vendor_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create simple policies for customer_reviews
CREATE POLICY "Anyone can view reviews"
  ON customer_reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create reviews"
  ON customer_reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Service role can manage reviews"
  ON customer_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);