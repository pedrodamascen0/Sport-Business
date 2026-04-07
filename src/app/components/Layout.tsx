import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  ClipboardList,
  CreditCard,
  LogOut,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const { signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const storedLogo = localStorage.getItem('companyLogoUrl');
    if (storedLogo) {
      setCompanyLogoUrl(storedLogo);
    }
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Building2, label: 'Empresas', path: '/empresas' },
    { icon: Users, label: 'Alunos', path: '/alunos' },
    { icon: ClipboardList, label: 'Treinos', path: '/treinos' },
    { icon: CreditCard, label: 'Pagamentos', path: '/pagamentos' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-indigo-900">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-4 bg-indigo-950">
            <h1 className="text-xl font-bold text-white">SportManager</h1>
          </div>
          {companyLogoUrl && (
            <div className="px-4 py-4 flex justify-center bg-indigo-900">
              <img
                src={companyLogoUrl}
                alt="Logo da empresa"
                className="w-20 h-20 rounded-xl object-contain bg-white p-2 shadow-sm"
              />
            </div>
          )}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-indigo-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-indigo-100 rounded-lg hover:bg-indigo-800 transition"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 flex flex-col w-64 bg-indigo-900 z-50">
            <div className="flex items-center justify-between h-16 px-4 bg-indigo-950">
              <h1 className="text-xl font-bold text-white">SportManager</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-indigo-800">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-indigo-100 rounded-lg hover:bg-indigo-800 transition"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Header Mobile */}
        <header className="md:hidden flex flex-col bg-white border-b border-gray-200">
          <div className="flex items-center h-16 px-4">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="ml-4 text-xl font-bold text-gray-900">SportManager</h1>
          </div>
          {companyLogoUrl && (
            <div className="px-4 pb-4">
              <img
                src={companyLogoUrl}
                alt="Logo da empresa"
                className="w-20 h-20 rounded-xl object-contain bg-white p-2 shadow-sm"
              />
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
