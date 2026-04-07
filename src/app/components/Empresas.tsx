import { useEffect, useState } from 'react';
import { Plus, Building2, Edit2, Trash2 } from 'lucide-react';
import InputMask from 'react-input-mask';
import { supabase, Company } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner'



export function Empresas() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'corrente',
    pix_key: '',
    gateway_pagamento: 'mercadopago' as 'mercadopago' | 'pagseguro',
  });

  useEffect(() => {
    loadCompanies();
  }, [user]);

  useEffect(() => {
    const storedLogo = localStorage.getItem('companyLogoUrl');
    if (storedLogo) {
      setLogoPreview(storedLogo);
    }
  }, []);

  const loadCompanies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      localStorage.setItem('companyLogoUrl', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('companies')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Empresa atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;
        toast.success('Empresa cadastrada com sucesso!');
      }

      resetForm();
      loadCompanies();
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      toast.error(error.message || 'Erro ao salvar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setFormData({
      razao_social: company.razao_social,
      nome_fantasia: company.nome_fantasia,
      cnpj: company.cnpj,
      email: company.email,
      telefone: company.telefone,
      banco: company.banco,
      agencia: company.agencia,
      conta: company.conta,
      tipo_conta: company.tipo_conta,
      pix_key: company.pix_key || '',
      gateway_pagamento: company.gateway_pagamento,
    });
    setEditingId(company.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta empresa?')) return;

    try {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
      toast.success('Empresa excluída com sucesso!');
      loadCompanies();
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error);
      toast.error('Erro ao excluir empresa');
    }
  };

  const resetForm = () => {
    setFormData({
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      email: '',
      telefone: '',
      banco: '',
      agencia: '',
      conta: '',
      tipo_conta: 'corrente',
      pix_key: '',
      gateway_pagamento: 'mercadopago',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-1">Gerencie as empresas cadastradas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nova Empresa
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingId ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razão Social *
                </label>
                <input
                  type="text"
                  value={formData.razao_social}
                  onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Fantasia *
                </label>
                <input
                  type="text"
                  value={formData.nome_fantasia}
                  onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ *
                </label>
                <InputMask
                  mask="99.999.999/9999-99"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Contato *
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
                <InputMask
                  mask="(99) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gateway de Pagamento *
                </label>
                <select
                  value={formData.gateway_pagamento}
                  onChange={(e) => setFormData({ ...formData, gateway_pagamento: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                >
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="pagseguro">PagSeguro</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo da Empresa
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {logoPreview && (
                  <div className="mt-4 flex items-center gap-4">
                    <div className="w-24 h-24 overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
                      <img
                        src={logoPreview}
                        alt="Prévia do logo da empresa"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Logo selecionada</p>
                      <p className="text-sm text-gray-500">Ela será exibida abaixo do nome do sistema.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Bancários</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banco *
                  </label>
                  <input
                    type="text"
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Ex: 001 - Banco do Brasil"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agência *
                  </label>
                  <input
                    type="text"
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conta *
                  </label>
                  <input
                    type="text"
                    value={formData.conta}
                    onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Conta *
                  </label>
                  <select
                    value={formData.tipo_conta}
                    onChange={(e) => setFormData({ ...formData, tipo_conta: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    required
                  >
                    <option value="corrente">Corrente</option>
                    <option value="poupanca">Poupança</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave PIX (opcional)
                </label>
                <input
                  type="text"
                  value={formData.pix_key}
                  onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Email, CPF, CNPJ ou chave aleatória"
                />
              </div>
            </div>

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
        {companies.map((company) => (
          <div
            key={company.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{company.nome_fantasia}</h3>
                  <p className="text-sm text-gray-500">{company.razao_social}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">CNPJ:</span> {company.cnpj}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {company.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Telefone:</span> {company.telefone}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Gateway:</span>{' '}
                {company.gateway_pagamento === 'mercadopago' ? 'Mercado Pago' : 'PagSeguro'}
              </p>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button
                onClick={() => handleEdit(company)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(company.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
          <p className="text-gray-600 mb-4">Comece cadastrando sua primeira empresa</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Cadastrar Empresa
          </button>
        </div>
      )}
    </div>
  );
}
