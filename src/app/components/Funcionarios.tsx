import { useEffect, useState } from 'react';
import { Plus, UserCheck, Edit2, Trash2, Shield, Award } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { supabase, Employee, Company } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export function Funcionarios() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    role: 'treinador' as 'gerente' | 'treinador',
    company_id: '',
    status: 'ativo' as 'ativo' | 'inativo',
    salario: '',
    data_contratacao: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadEmployees();
    loadCompanies();
  }, [user]);

  const loadEmployees = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    }
  };

  const loadCompanies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('nome_fantasia');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.company_id) {
      toast.error('Selecione uma empresa');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        salario: formData.salario ? parseFloat(formData.salario) : null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('employees')
          .update(dataToSave)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('employees')
          .insert([dataToSave]);

        if (error) throw error;
        toast.success('Funcionário cadastrado com sucesso!');
      }

      resetForm();
      loadEmployees();
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error);
      toast.error(error.message || 'Erro ao salvar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      nome: employee.nome,
      email: employee.email,
      telefone: employee.telefone,
      cpf: employee.cpf,
      role: employee.role,
      company_id: employee.company_id,
      status: employee.status,
      salario: employee.salario?.toString() || '',
      data_contratacao: employee.data_contratacao,
    });
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este funcionário?')) return;

    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
      toast.success('Funcionário excluído com sucesso!');
      loadEmployees();
    } catch (error: any) {
      console.error('Erro ao excluir funcionário:', error);
      toast.error('Erro ao excluir funcionário');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      role: 'treinador',
      company_id: '',
      status: 'ativo',
      salario: '',
      data_contratacao: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.nome_fantasia || 'N/A';
  };

  const getRoleInfo = (role: 'gerente' | 'treinador') => {
    if (role === 'gerente') {
      return {
        label: 'Gerente',
        icon: Shield,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        description: 'Acesso total à gestão e recebimento de pagamentos',
      };
    }
    return {
      label: 'Treinador',
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Acesso limitado a treinos e alunos',
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-600 mt-1">Gerencie gerentes e treinadores</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Novo Funcionário
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingId ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <IMaskInput
                  mask="(00) 00000-0000"
                  value={formData.telefone}
                  onAccept={(value: string) => setFormData({ ...formData, telefone: value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <IMaskInput
                  mask="000.000.000-00"
                  value={formData.cpf}
                  onAccept={(value: string) => setFormData({ ...formData, cpf: value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa *
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.nome_fantasia}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                >
                  <option value="treinador">Treinador</option>
                  <option value="gerente">Gerente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salário
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.salario}
                  onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Contratação *
                </label>
                <input
                  type="date"
                  value={formData.data_contratacao}
                  onChange={(e) => setFormData({ ...formData, data_contratacao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

            {formData.role === 'gerente' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-1">Permissões de Gerente</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Acesso completo ao sistema de gestão</li>
                      <li>• Visualização e gestão de pagamentos</li>
                      <li>• Gerenciamento de alunos e treinos</li>
                      <li>• Relatórios financeiros</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'treinador' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Permissões de Treinador</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Criação e edição de treinos</li>
                      <li>• Visualização de dados dos alunos</li>
                      <li>• Acesso limitado ao sistema</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => {
          const roleInfo = getRoleInfo(employee.role);
          const RoleIcon = roleInfo.icon;

          return (
            <div
              key={employee.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${roleInfo.bgColor} rounded-lg flex items-center justify-center`}>
                    <RoleIcon className={`w-6 h-6 ${roleInfo.color}`} />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{employee.nome}</h3>
                    <p className={`text-sm font-medium ${roleInfo.color}`}>{roleInfo.label}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    employee.status === 'ativo'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {employee.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {employee.email}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Telefone:</span> {employee.telefone}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">CPF:</span> {employee.cpf}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Empresa:</span> {getCompanyName(employee.company_id)}
                </p>
                {employee.salario && (
                  <p className="text-gray-600">
                    <span className="font-medium">Salário:</span> R${' '}
                    {employee.salario.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">Contratação:</span>{' '}
                  {new Date(employee.data_contratacao).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-3">{roleInfo.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {employees.length === 0 && !showForm && (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum funcionário cadastrado</h3>
          <p className="text-gray-600 mb-4">Comece cadastrando seu primeiro funcionário</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Cadastrar Funcionário
          </button>
        </div>
      )}
    </div>
  );
}