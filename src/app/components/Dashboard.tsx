import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { GuidedTour } from './GuidedTour'; 

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isTourActive, setIsTourActive] = useState(true);

  const [stats, setStats] = useState({
    empresas: 0,
    alunos: 0,
    treinos: 0,
    pagamentos: 0,
  });

  // 1. CONFIGURAÇÃO DOS PASSOS (Atualizado com os 3 itens)
  const tourSteps = [
    {
      targetId: 'btn-acao-empresa',
      title: 'Gestão de Empresas',
      content: 'Clique aqui para gerenciar suas unidades e dados bancários.',
    },
    {
      targetId: 'btn-acao-aluno',
      title: 'Cadastrar Alunos',
      content: 'Adicione novos alunos ao sistema de forma rápida.',
    },
    {
      targetId: 'btn-acao-treino',
      title: 'Criar Treinos',
      content: 'Monte e atribua planilhas de treino personalizadas.',
    }
  ];

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    try {
      const [empresasRes, alunosRes, treinosRes, pagamentosRes] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('workouts').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        empresas: empresasRes.count || 0,
        alunos: alunosRes.count || 0,
        treinos: treinosRes.count || 0,
        pagamentos: pagamentosRes.count || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleQuickActionClick = (path: string) => () => {
    navigate(path);
  };

  const statCards = [
    { id: 'card-stats-empresas', title: 'Empresas', value: stats.empresas, icon: Building2, textColor: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'card-stats-alunos', title: 'Alunos', value: stats.alunos, icon: Users, textColor: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'card-stats-treinos', title: 'Treinos', value: stats.treinos, icon: ClipboardList, textColor: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'card-stats-pagamentos', title: 'Pagamentos', value: stats.pagamentos, icon: TrendingUp, textColor: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  return (
    <div className="p-6">
      <GuidedTour 
        steps={tourSteps} 
        active={isTourActive} 
        onComplete={() => setIsTourActive(false)} 
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} id={stat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de boas-vindas */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-3xl font-extrabold text-indigo-700 mb-4">Bem-vindo!</h2>
          <p className="text-gray-600 mb-6">Sistema de gestão completo para academias e assessorias esportivas.</p>
          <ul className="space-y-4">
            {['Cadastre empresas', 'Gerencie alunos', 'Crie treinos', 'Receba via QR Code'].map((item, index) => (
              <li key={index} className="flex items-center bg-gray-50 rounded-lg p-3">
                <span className="w-3 h-3 bg-indigo-600 rounded-full mr-3" />
                <span className="font-medium text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Painel de ações rápidas */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-5">Ações Rápidas</h2>
          <div className="space-y-4">
            
            <button
              id="btn-acao-empresa"
              onClick={handleQuickActionClick('/empresas')}
              className="w-full flex items-center gap-4 bg-indigo-950/40 rounded-xl p-5 hover:bg-indigo-900/60 transition"
            >
              <span className="text-2xl">🏢</span>
              <div><p className="font-semibold">Cadastrar Empresa</p></div>
            </button>

            <button
              id="btn-acao-aluno"
              onClick={handleQuickActionClick('/alunos')}
              className="w-full flex items-center gap-4 bg-indigo-950/40 rounded-xl p-5 hover:bg-indigo-900/60 transition"
            >
              <span className="text-2xl">👤</span>
              <div><p className="font-semibold">Cadastrar Aluno</p></div>
            </button>

            <button
              id="btn-acao-treino"
              onClick={handleQuickActionClick('/treinos')}
              className="w-full flex items-center gap-4 bg-indigo-950/40 rounded-xl p-5 hover:bg-indigo-900/60 transition"
            >
              <span className="text-2xl">💪</span>
              <div><p className="font-semibold">Criar Treino</p></div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}