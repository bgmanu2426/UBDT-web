# 🧠 MCQ Generator

> An interactive learning platform that generates custom multiple-choice questions using AI.

![MCQ Generator](https://img.shields.io/badge/HACKATHON-UBDT-blue)

## ✨ Features

- 📚 Create custom subjects for your learning needs
- 🤖 AI-powered question generation using Google Gemini
- 📝 Interactive quiz interface with immediate feedback
- 📊 Score tracking and result summaries
- 🔢 Customize number of questions (5, 10, 15, or 20)
- 👤 User authentication with Supabase

## 🚀 Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Backend/Auth/Database**: Supabase
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)
- A Supabase account
- A Google Gemini API key

## 🛠️ Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd UBDT-web
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Environment setup**

Create a `.env` file in the root directory based on the `sample.env`:

```
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. **Database setup**

Run the Supabase migrations to set up your database schema:

```bash
npx supabase migration up
```

5. **Start the development server**

```bash
pnpm dev
```

## 🎮 Usage Guide

1. **Sign up/Sign in** - Create an account or log in with your credentials
2. **Create a Subject** - Add a new subject you want to practice
3. **Generate Questions** - Select a subject, choose the number of questions, and generate a quiz
4. **Take the Quiz** - Answer questions and get immediate feedback
5. **View Results** - See your score after completing the quiz

## 📱 Application Structure

- **Login** - User authentication
- **Dashboard** - Subject management
- **SubjectQuestions** - Question generation and quiz interface
