/*
  # MCQ Generator Database Schema

  1. New Tables
    - subjects
      - id (uuid, primary key)
      - name (text)
      - created_at (timestamp)
    
    - questions
      - id (uuid, primary key)
      - subject_id (uuid, foreign key)
      - question_text (text)
      - options (jsonb)
      - correct_answer (text)
      - explanation (text)
      - created_at (timestamp)
      - user_id (uuid, foreign key)
    
    - user_answers
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - question_id (uuid, foreign key)
      - selected_answer (text)
      - is_correct (boolean)
      - answered_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create subjects table
CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id),
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Create user_answers table
CREATE TABLE user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  question_id uuid REFERENCES questions(id),
  selected_answer text NOT NULL,
  is_correct boolean NOT NULL,
  answered_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read subjects" ON subjects
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can read all questions" ON questions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create questions" ON questions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their answers" ON user_answers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create answers" ON user_answers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);