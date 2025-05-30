import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateMCQ } from '../lib/gemini';
import { ArrowLeft, CheckCircle, XCircle, Plus, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Subject {
  id: string;
  name: string;
}

export default function SubjectQuestions() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [questionCount, setQuestionCount] = useState<number>(10);

  useEffect(() => {
    fetchSubjectAndQuestions();
  }, [subjectId]);

  async function fetchSubjectAndQuestions() {
    // Fetch subject details
    const { data: subjectData } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();

    if (subjectData) {
      setSubject(subjectData);
    }

    // Fetch questions
    const { data: questionsData, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subjectId);
    
    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(questionsData || []);
    }
    setLoading(false);
  }

  const handleGenerateQuestion = async () => {
    if (!subject) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      // Pass the selected number of questions into generateMCQ
      const mcq = await generateMCQ(subject.name, questionCount);
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const insertPayload = mcq.map((q) => ({
        subject_id: subjectId,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        user_id: userId,
      }));
      
      const { error } = await supabase.from('questions').insert(insertPayload);
      
      if (error) throw error;
      
      await fetchSubjectAndQuestions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to generate question. ${errorMessage}`);
      console.error('Error generating question:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);

    const isCorrect = answer === questions[currentIndex].correct_answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    await supabase.from('user_answers').insert({
      question_id: questions[currentIndex].id,
      selected_answer: answer,
      is_correct: isCorrect
    });
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setQuizCompleted(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading questions...</div>;
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl">
            You scored {score} out of {questions.length}.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center space-x-4">
            {/* ADD the dropdown for selecting question count */}
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="px-2 py-1 border rounded-md"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
            <button
              onClick={handleGenerateQuestion}
              disabled={generating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate Questions
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {questions.length === 0 ? (
          <div className="text-center py-8">
            <p>No questions available for this subject.</p>
            {/* <button
              onClick={handleGenerateQuestion}
              disabled={generating}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate First Question
            </button> */}
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="mb-4 text-sm text-gray-500">
                Question {currentIndex + 1} of {questions.length}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {questions[currentIndex].question_text}
              </h2>

              <div className="space-y-4">
                {questions[currentIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-lg border ${
                      selectedAnswer === option
                        ? option === questions[currentIndex].correct_answer
                          ? 'bg-green-50 border-green-500'
                          : 'bg-red-50 border-red-500'
                        : 'border-gray-200 hover:border-blue-500'
                    } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center">
                      {showExplanation && selectedAnswer === option && (
                        option === questions[currentIndex].correct_answer ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )
                      )}
                      {option}
                    </div>
                  </button>
                ))}
              </div>

              {showExplanation && (
                <>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Explanation</h3>
                    <p className="text-blue-800">{questions[currentIndex].explanation}</p>
                  </div>
                  <button
                    onClick={handleNext}
                    className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}