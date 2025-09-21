/*
  # Allow public vendor registration

  1. Security Changes
    - Add INSERT policy for vendors table to allow public registration
    - Allow anonymous users to create vendor records
    - Maintain existing SELECT policies for viewing active vendors
*/

-- Allow anyone to register as a vendor (INSERT policy)
CREATE POLICY "Anyone can register as vendor"
  ON vendors
  FOR INSERT
  TO public
  WITH CHECK (true);