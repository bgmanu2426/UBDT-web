/* eslint-disable @typescript-eslint/no-unused-vars */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface MCQQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export async function generateMCQ(topic: string, questionCount: number): Promise<MCQQuestion[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Generate multiple choice questions about ${topic}. 
  Format the response as a JSON array with the following structure:
  [
    {
      "question_text": "the question",
      "options": ["option1", "option2", "option3", "option4"],
      "correct_answer": "the correct option",
      "explanation": "detailed explanation of the correct answer"
    },
    ...
  ]
  . Please generate exactly ${questionCount} questions.
    `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error('No candidate found in Gemini response');
  }
  const text = candidate.content.parts[0].text;
  console.log(text);
  try {
    if (!text) {
      throw new Error('Candidate text is undefined');
    }
    // Clean the text by trimming and extracting the JSON array if needed
    const trimmedText = text.trim();
    let jsonText = trimmedText;
    if (!trimmedText.startsWith('[')) {
      const startIdx = trimmedText.indexOf('[');
      const endIdx = trimmedText.lastIndexOf(']');
      if (startIdx === -1 || endIdx === -1) {
        throw new Error('Response does not contain valid JSON array brackets');
      }
      jsonText = trimmedText.slice(startIdx, endIdx + 1);
    }
    const parsed: MCQQuestion[] = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    throw new Error('Failed to parse Gemini response as JSON');
  }
}