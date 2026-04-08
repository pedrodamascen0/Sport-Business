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
      <div className="mb-8">        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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
          {/* Painel de boas-vindas */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transition hover:shadow-xl hover:border-indigo-200">
            <h2 className="text-3xl font-extrabold text-indigo-700 mb-4">Bem-vindo!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Sistema de gestão completo para academias e assessorias esportivas.
            </p>
            <ul className="space-y-4 text-gray-700">
              {[
                'Cadastre empresas e configure dados bancários',
                'Gerencie alunos e clientes',
                'Crie e atribua planilhas de treino',
                'Receba pagamentos via QR Code',
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm hover:bg-indigo-50 transition"
                >
                  <span className="w-3 h-3 bg-indigo-600 rounded-full mr-3 shadow-sm" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Painel de ações rápidas */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-5">Ações Rápidas</h2>
            <div className="space-y-4">
              {[
                {
                  title: 'Cadastrar Empresa',
                  desc: 'Adicione uma nova empresa ao sistema',
                  path: '/empresas',
                  icon: '🏢',
                },
                {
                  title: 'Cadastrar Aluno',
                  desc: 'Registre um novo aluno ou cliente',
                  path: '/alunos',
                  icon: '👤',
                },
                {
                  title: 'Criar Treino',
                  desc: 'Monte uma nova planilha de treino',
                  path: '/treinos',
                  icon: '💪',
                },
              ].map((action, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={handleQuickActionClick(action.path)}
                  className="w-full flex items-center gap-3 text-left bg-indigo-950 rounded-xl p-5 transition shadow-md hover:bg-indigo-900 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <p className="font-semibold">{action.title}</p>
                    <p className="text-sm opacity-90">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
  
  );
}