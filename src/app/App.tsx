import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Empresas } from './components/Empresas';
import { Funcionarios } from './components/Funcionarios';
import { Alunos } from './components/Alunos';
import { Treinos } from './components/Treinos';
import { Pagamentos } from './components/Pagamentos';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Navigate to="/dashboard" replace />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresas"
        element={
          <ProtectedRoute>
            <Layout>
              <Empresas />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/funcionarios"
        element={
          <ProtectedRoute>
            <Layout>
              <Funcionarios />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alunos"
        element={
          <ProtectedRoute>
            <Layout>
              <Alunos />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/treinos"
        element={
          <ProtectedRoute>
            <Layout>
              <Treinos />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pagamentos"
        element={
          <ProtectedRoute>
            <Layout>
              <Pagamentos />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}
