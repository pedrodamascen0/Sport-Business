import { useEffect, useState } from 'react';
import { Plus, ClipboardList, Edit2, Trash2, X } from 'lucide-react';
import { supabase, Workout, Student, Company, WorkoutExercise } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export function Treinos() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'musculacao' as 'musculacao' | 'corrida' | 'funcional' | 'outro',
    student_id: '',
    company_id: '',
    observacoes: '',
  });
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    { nome: '', series: 3, repeticoes: '', carga: '', descanso: '', observacoes: '', ordem: 0 },
  ]);

  useEffect(() => {
    loadCompanies();
    loadWorkouts();
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
          .in('company_id', companyIds)
          .eq('status', 'ativo');

        setStudents(studentsData || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const loadWorkouts = async () => {
    if (!user) return;

    try {
      const { data: companiesData } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      const companyIds = companiesData?.map((c) => c.id) || [];

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .in('company_id', companyIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar treinos:', error);
      toast.error('Erro ao carregar treinos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (exercises.length === 0 || exercises.every((ex) => !ex.nome)) {
      toast.error('Adicione pelo menos um exercício');
      return;
    }

    const validExercises = exercises
      .filter((ex) => ex.nome.trim())
      .map((ex, index) => ({ ...ex, ordem: index }));

    setLoading(true);
    try {
      const workoutData = {
        ...formData,
        exercicios: validExercises,
      };

      if (editingId) {
        const { error } = await supabase
          .from('workouts')
          .update(workoutData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Treino atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('workouts')
          .insert([workoutData]);

        if (error) throw error;
        toast.success('Treino cadastrado com sucesso!');
      }

      resetForm();
      loadWorkouts();
    } catch (error: any) {
      console.error('Erro ao salvar treino:', error);
      toast.error(error.message || 'Erro ao salvar treino');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workout: Workout) => {
    setFormData({
      titulo: workout.titulo,
      descricao: workout.descricao || '',
      tipo: workout.tipo,
      student_id: workout.student_id,
      company_id: workout.company_id,
      observacoes: workout.observacoes || '',
    });
    setExercises(workout.exercicios.length > 0 ? workout.exercicios : [
      { nome: '', series: 3, repeticoes: '', carga: '', descanso: '', observacoes: '', ordem: 0 }
    ]);
    setEditingId(workout.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este treino?')) return;

    try {
      const { error } = await supabase.from('workouts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Treino excluído com sucesso!');
      loadWorkouts();
    } catch (error: any) {
      console.error('Erro ao excluir treino:', error);
      toast.error('Erro ao excluir treino');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'musculacao',
      student_id: '',
      company_id: '',
      observacoes: '',
    });
    setExercises([
      { nome: '', series: 3, repeticoes: '', carga: '', descanso: '', observacoes: '', ordem: 0 },
    ]);
    setEditingId(null);
    setShowForm(false);
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      { nome: '', series: 3, repeticoes: '', carga: '', descanso: '', observacoes: '', ordem: exercises.length },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.nome || 'Aluno não encontrado';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Treinos</h1>
          <p className="text-gray-600 mt-1">Gerencie as planilhas de treino</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Novo Treino
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingId ? 'Editar Treino' : 'Criar Novo Treino'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Treino *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="Ex: Treino A - Peito e Tríceps"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Treino *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  required
                >
                  <option value="musculacao">Musculação</option>
                  <option value="corrida">Corrida</option>
                  <option value="funcional">Funcional</option>
                  <option value="outro">Outro</option>
                </select>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                rows={2}
                placeholder="Descrição ou objetivo do treino"
              />
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Exercícios</h3>
                <button
                  type="button"
                  onClick={addExercise}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Exercício
                </button>
              </div>

              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nome do Exercício *
                        </label>
                        <input
                          type="text"
                          value={exercise.nome}
                          onChange={(e) => updateExercise(index, 'nome', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                          placeholder="Ex: Supino Reto"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Séries
                        </label>
                        <input
                          type="number"
                          value={exercise.series}
                          onChange={(e) => updateExercise(index, 'series', parseInt(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Repetições
                        </label>
                        <input
                          type="text"
                          value={exercise.repeticoes}
                          onChange={(e) => updateExercise(index, 'repeticoes', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                          placeholder="Ex: 12"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Carga
                        </label>
                        <input
                          type="text"
                          value={exercise.carga}
                          onChange={(e) => updateExercise(index, 'carga', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                          placeholder="Ex: 20kg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Descanso
                        </label>
                        <input
                          type="text"
                          value={exercise.descanso}
                          onChange={(e) => updateExercise(index, 'descanso', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                          placeholder="Ex: 60s"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <input
                        type="text"
                        value={exercise.observacoes}
                        onChange={(e) => updateExercise(index, 'observacoes', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        placeholder="Ex: Atenção à postura"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações Gerais
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                rows={2}
                placeholder="Observações gerais sobre o treino"
              />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{workout.titulo}</h3>
                  <p className="text-sm text-gray-500">
                    {workout.tipo.charAt(0).toUpperCase() + workout.tipo.slice(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Aluno:</span> {getStudentName(workout.student_id)}
              </p>
              {workout.descricao && (
                <p className="text-sm text-gray-600 mt-1">{workout.descricao}</p>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Exercícios ({workout.exercicios.length})
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {workout.exercicios.map((exercise, index) => (
                  <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-medium">{index + 1}. {exercise.nome}</span>
                    {exercise.series && exercise.repeticoes && (
                      <span className="ml-2 text-xs">
                        {exercise.series}x{exercise.repeticoes}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button
                onClick={() => handleEdit(workout)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(workout.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {workouts.length === 0 && !showForm && (
        <div className="text-center py-12">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treino cadastrado</h3>
          <p className="text-gray-600 mb-4">Comece criando sua primeira planilha de treino</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Criar Treino
          </button>
        </div>
      )}
    </div>
  );
}
