/*
  # Add PDF Attachment Support

  1. Changes
    - Add `pdf_file_name` column to store the original file name
    - Add `pdf_file_data` column to store the PDF file as base64 encoded text
    - Add `pdf_file_size` column to store file size in bytes

  2. Notes
    - PDFs are stored directly in the database as base64 encoded strings
    - This approach works well for moderate file sizes
    - File name and size are stored for display purposes
*/

-- Add columns for PDF attachment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ultrasound_reports' AND column_name = 'pdf_file_name'
  ) THEN
    ALTER TABLE ultrasound_reports ADD COLUMN pdf_file_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ultrasound_reports' AND column_name = 'pdf_file_data'
  ) THEN
    ALTER TABLE ultrasound_reports ADD COLUMN pdf_file_data text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ultrasound_reports' AND column_name = 'pdf_file_size'
  ) THEN
    ALTER TABLE ultrasound_reports ADD COLUMN pdf_file_size integer;
  END IF;
END $$;