/*
  # Add Insert Policy for Subjects Table

  1. Security Changes
    - Add policy for authenticated users to create subjects
    - Add policy for authenticated users to update their own subjects
    - Add policy for authenticated users to delete their own subjects

  Note: The existing SELECT policy remains unchanged
*/

-- Add user_id column to subjects table to track ownership
ALTER TABLE subjects 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update the existing subjects to have a user_id (optional, as the table might be empty)
DO $$
BEGIN
  UPDATE subjects SET user_id = auth.uid() WHERE user_id IS NULL;
END $$;

-- Make user_id required for new rows
ALTER TABLE subjects 
ALTER COLUMN user_id SET NOT NULL;

-- Add policy for inserting subjects
CREATE POLICY "Users can create subjects"
ON subjects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add policy for updating subjects
CREATE POLICY "Users can update their own subjects"
ON subjects
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add policy for deleting subjects
CREATE POLICY "Users can delete their own subjects"
ON subjects
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);