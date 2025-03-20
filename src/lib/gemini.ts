import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface MCQQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export async function generateMCQ(topic: string): Promise<MCQQuestion> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Generate a multiple choice questions about ${topic}. 
  Format the response as a JSON object with the following structure:
  {
    "question_text": "the question",
    "options": ["option1", "option2", "option3", "option4"],
    "correct_answer": "the correct option",
    "explanation": "detailed explanation of the correct answer"
  }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to parse Gemini response');
  }
}