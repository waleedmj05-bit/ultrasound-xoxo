/*
  # Update RLS Policies for Public Access

  1. Changes
    - Drop existing authentication-only policies
    - Create new policies that allow public access (anon role)
    - This allows the application to work without user authentication

  2. Security
    - Policies now allow anonymous users to perform all operations
    - Suitable for internal medical staff applications where authentication isn't required
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view all reports" ON ultrasound_reports;
DROP POLICY IF EXISTS "Authenticated users can insert reports" ON ultrasound_reports;
DROP POLICY IF EXISTS "Authenticated users can update reports" ON ultrasound_reports;
DROP POLICY IF EXISTS "Authenticated users can delete reports" ON ultrasound_reports;

-- Create new policies for public access
CREATE POLICY "Public users can view all reports"
  ON ultrasound_reports
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public users can insert reports"
  ON ultrasound_reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public users can update reports"
  ON ultrasound_reports
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public users can delete reports"
  ON ultrasound_reports
  FOR DELETE
  TO anon
  USING (true);