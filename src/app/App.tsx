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
import { useState } from 'react';
import { GuidedTour } from './components/GuidedTour';// Importe o componente que criamos

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




// 1. Defina os passos do seu tour
const tourSteps = [
  {
    targetId: 'logo-principal', // ID do elemento no HTML
    title: 'Bem-vindo ao Dashboard!',
    content: 'Este é o seu ponto de partida. Aqui você vê o resumo de tudo.',
  },
  {
    targetId: 'input-busca',
    title: 'Busca Rápida',
    content: 'Precisa encontrar algo? Digite aqui para buscar clientes ou produtos instantaneamente.',
  },
  {
    targetId: 'btn-novo-registro',
    title: 'Crie um Novo Registro',
    content: 'Clique aqui para adicionar um novo cliente ou venda ao sistema.',
  },
];

export function DisplayTour() {
  // 2. Estado para controlar se o tour está ativo
  const [isTourActive, setIsTourActive] = useState(true); // Começa ativo para teste

  const handleTourComplete = () => {
    setIsTourActive(false);
    // Opcional: Salvar no localStorage que o usuário já viu o tour
    localStorage.setItem('hasSeenTour', 'true');
    console.log("Tour finalizado pelo usuário.");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* 3. Renderize o componente do Tour */}
      <GuidedTour 
        steps={tourSteps} 
        active={isTourActive} 
        onComplete={handleTourComplete}
      />

      {/* 4. Elementos da sua página com IDs correspondentes */}
      <header className="flex items-center justify-between pb-8 border-b border-slate-200">
        <h1 id="logo-principal" className="text-3xl font-bold text-slate-900">
          My App Pro
        </h1>
        <div className="flex gap-4">
          <input 
            id="input-busca"
            type="search" 
            placeholder="Buscar..." 
            className="rounded-lg border border-slate-300 px-4 py-2 w-64"
          />
          <button 
            id="btn-novo-registro"
            className="rounded-lg bg-slate-900 px-5 py-2 text-white hover:bg-slate-800"
          >
            + Novo
          </button>
        </div>
      </header>

      <main className="mt-12">
        <p className="text-slate-600">Conteúdo principal do seu dashboard...</p>
        {/* ... resto do seu site ... */}
      </main>
    </div>
  );
}


