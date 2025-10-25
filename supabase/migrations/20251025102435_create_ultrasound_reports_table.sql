/*
  # Create Ultrasound Reports Table

  1. New Tables
    - `ultrasound_reports`
      - `id` (uuid, primary key) - Unique identifier for each report
      - `patient_name` (text) - Name of the patient
      - `patient_age` (integer) - Age of the patient
      - `patient_gender` (text) - Gender of the patient
      - `examination_type` (text) - Type of ultrasound examination (e.g., Abdomen, Pelvis, Obstetric)
      - `examination_date` (date) - Date when the examination was performed
      - `indication` (text) - Clinical indication/reason for the examination
      - `findings` (text) - Detailed findings from the ultrasound
      - `impression` (text) - Clinical impression/conclusion
      - `recommendations` (text) - Follow-up recommendations if any
      - `referring_physician` (text) - Name of the referring physician
      - `radiologist_name` (text) - Name of the radiologist performing the examination
      - `created_at` (timestamptz) - Timestamp when the record was created
      - `updated_at` (timestamptz) - Timestamp when the record was last updated

  2. Security
    - Enable RLS on `ultrasound_reports` table
    - Add policy for authenticated users to view all reports
    - Add policy for authenticated users to insert new reports
    - Add policy for authenticated users to update reports
    - Add policy for authenticated users to delete reports

  3. Notes
    - All reports are accessible to authenticated users (suitable for medical staff access)
    - Timestamps are automatically managed with triggers
*/

-- Create the ultrasound_reports table
CREATE TABLE IF NOT EXISTS ultrasound_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_age integer NOT NULL,
  patient_gender text NOT NULL,
  examination_type text NOT NULL,
  examination_date date NOT NULL DEFAULT CURRENT_DATE,
  indication text NOT NULL,
  findings text NOT NULL,
  impression text NOT NULL,
  recommendations text DEFAULT '',
  referring_physician text DEFAULT '',
  radiologist_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ultrasound_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view all reports"
  ON ultrasound_reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reports"
  ON ultrasound_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reports"
  ON ultrasound_reports
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reports"
  ON ultrasound_reports
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ultrasound_reports_updated_at
  BEFORE UPDATE ON ultrasound_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();