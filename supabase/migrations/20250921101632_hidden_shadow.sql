/*
  # Create vendor_photos table

  1. New Tables
    - `vendor_photos`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, foreign key to vendors table)
      - `photo_url` (text, URL to the photo)
      - `photo_type` (text, type of photo: 'profile', 'document', 'gallery')
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `vendor_photos` table
    - Add policy for public to view photos
    - Add policy for public to insert photos (for registration)
    - Add policy for service role to manage photos
*/

CREATE TABLE IF NOT EXISTS vendor_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  photo_type text NOT NULL CHECK (photo_type IN ('profile', 'document', 'gallery')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendor_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vendor photos"
  ON vendor_photos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can upload vendor photos"
  ON vendor_photos
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Service role can manage vendor photos"
  ON vendor_photos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);