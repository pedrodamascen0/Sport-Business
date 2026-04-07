import { useEffect, useState } from 'react';
import { Plus, CreditCard, QrCode, CheckCircle, XCircle, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, Payment, Student, Company } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export function Pagamentos() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    student_id: '',
    company_id: '',
    valor: '',
    metodo: 'mercadopago' as 'mercadopago' | 'pagseguro',
  });

  useEffect(() => {
    loadCompanies();
    loadPayments();
  }, [user]);

  const loadCompanies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setCompanies(data || []);

      if (data && data.length > 0) {
        const companyIds = data.map((c) => c.id);
        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .in('company_id', companyIds);

        setStudents(studentsData || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const loadPayments = async () => {
    if (!user) return;

    try {
      const { data: companiesData } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      const companyIds = companiesData?.map((c) => c.id) || [];

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .in('company_id', companyIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar pagamentos:', error);
      toast.error('Erro ao carregar pagamentos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const valor = parseFloat(formData.valor);

      const company = companies.find((c) => c.id === formData.company_id);
      if (!company) {
        throw new Error('Empresa não encontrada');
      }

      const qrCodeData = `${formData.metodo}://payment?amount=${valor}&company=${company.nome_fantasia}`;

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error } = await supabase
        .from('payments')
        .insert([{
          student_id: formData.student_id,
          company_id: formData.company_id,
          valor,
          status: 'pendente',
          metodo: formData.metodo,
          qr_code: qrCodeData,
          expires_at: expiresAt.toISOString(),
        }]);

      if (error) throw error;

      toast.success('Cobrança gerada com sucesso!');
      resetForm();
      loadPayments();
    } catch (error: any) {
      console.error('Erro ao gerar cobrança:', error);
      toast.error(error.message || 'Erro ao gerar cobrança');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: 'pago' | 'cancelado') => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'pago') {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);

      if (error) throw error;

      toast.success(newStatus === 'pago' ? 'Pagamento confirmado!' : 'Pagamento cancelado');
      loadPayments();
      setSelectedPayment(null);
    } catch (error: any) {
      console.error('Erro ao atualizar pagamento:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      company_id: '',
      valor: '',
      metodo: 'mercadopago',
    });
    setShowForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelado':
      case 'expirado':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
      case 'expirado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.nome || 'Aluno não encontrado';
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.nome_fantasia || 'Empresa não encontrada';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie cobranças e pagamentos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nova Cobrança
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Gerar Nova Cobrança
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Aluno *
                </label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um aluno</option>
                  {students
                    .filter((s) => !formData.company_id || s.company_id === formData.company_id)
                    .map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pagamento *
                </label>
                <select
                  value={formData.metodo}
                  onChange={(e) => setFormData({ ...formData, metodo: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                >
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="pagseguro">PagSeguro</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Ao gerar a cobrança, um QR Code será criado para o aluno realizar o pagamento.
                O QR Code expira em 24 horas.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Gerando...' : 'Gerar Cobrança'}
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
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">
                    R$ {payment.valor.toFixed(2)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {payment.metodo === 'mercadopago' ? 'Mercado Pago' : 'PagSeguro'}
                  </p>
                </div>
              </div>
              {getStatusIcon(payment.status)}
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p className="text-gray-600">
                <span className="font-medium">Aluno:</span> {getStudentName(payment.student_id)}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Empresa:</span> {getCompanyName(payment.company_id)}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
            </div>

            {payment.status === 'pendente' && (
              <div className="border-t pt-4 mb-4">
                <button
                  onClick={() => setSelectedPayment(payment)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                >
                  <QrCode className="w-4 h-4" />
                  Ver QR Code
                </button>
              </div>
            )}

            {payment.status === 'pendente' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(payment.id, 'pago')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar
                </button>
                <button
                  onClick={() => handleUpdateStatus(payment.id, 'cancelado')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {payments.length === 0 && !showForm && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma cobrança gerada</h3>
          <p className="text-gray-600 mb-4">Comece gerando sua primeira cobrança</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Gerar Cobrança
          </button>
        </div>
      )}

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">QR Code de Pagamento</h3>
              <p className="text-gray-600">
                R$ {selectedPayment.valor.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {getStudentName(selectedPayment.student_id)}
              </p>
            </div>

            <div className="flex justify-center mb-6 bg-white p-6 rounded-lg border-2 border-gray-200">
              <QRCodeSVG
                value={selectedPayment.qr_code || ''}
                size={220}
                level="H"
                includeMargin
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 text-center">
                Escaneie o QR Code com o app do {selectedPayment.metodo === 'mercadopago' ? 'Mercado Pago' : 'PagSeguro'}
              </p>
            </div>

            <button
              onClick={() => setSelectedPayment(null)}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
