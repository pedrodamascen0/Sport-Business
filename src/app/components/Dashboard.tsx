import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    empresas: 0,
    alunos: 0,
    treinos: 0,
    pagamentos: 0,
  });

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
    {
      title: 'Empresas',
      value: stats.empresas,
      icon: Building2,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Alunos',
      value: stats.alunos,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Treinos',
      value: stats.treinos,
      icon: ClipboardList,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pagamentos',
      value: stats.pagamentos,
      icon: TrendingUp,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bem-vindo!</h2>
          <p className="text-gray-600 mb-4">
            Sistema de gestão completo para academias e assessorias esportivas.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2" />
              Cadastre empresas e configure dados bancários
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2" />
              Gerencie alunos e clientes
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2" />
              Crie e atribua planilhas de treino
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2" />
              Receba pagamentos via QR Code
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-black">
          <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleQuickActionClick('/empresas')}
              className="w-full text-left bg-indigo-950 text-white rounded-lg p-4 transition shadow-sm hover:bg-indigo-900 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <p className="font-medium">Cadastrar Empresa</p>
              <p className="text-sm opacity-90">Adicione uma nova empresa ao sistema</p>
            </button>
            <button
              type="button"
              onClick={handleQuickActionClick('/alunos')}
              className="w-full text-left bg-indigo-950 text-white rounded-lg p-4 transition shadow-sm hover:bg-indigo-900 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <p className="font-medium">Cadastrar Aluno</p>
              <p className="text-sm opacity-90">Registre um novo aluno ou cliente</p>
            </button>
            <button
              type="button"
              onClick={handleQuickActionClick('/treinos')}
              className="w-full text-left bg-indigo-950 text-white rounded-lg p-4 transition shadow-sm hover:bg-indigo-900 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <p className="font-medium">Criar Treino</p>
              <p className="text-sm opacity-90">Monte uma nova planilha de treino</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
