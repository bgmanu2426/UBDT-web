import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SubjectQuestions from './components/SubjectQuestions';
import { Brain } from 'lucide-react';

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin">
          <Brain className="w-8 h-8 text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route
            path="/login"
            element={session ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/dashboard"
            element={session ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/subject/:subjectId"
            element={session ? <SubjectQuestions /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;