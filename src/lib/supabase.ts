import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://satvijqnbmxcrbubrrqq.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdHZpanFuYm14Y3JidWJycnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODYwMjksImV4cCI6MjA5MTE2MjAyOX0.08L6gI42OKA_0hRLXVpwGZHonYUdKWjZwO2A2ZHAZDo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Company {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta: string;
  pix_key?: string;
  gateway_pagamento: 'mercadopago' | 'pagseguro';
  created_at: string;
  user_id: string;
}

export interface Student {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  company_id: string;
  plano?: string;
  status: 'ativo' | 'inativo' | 'pendente';
  created_at: string;
}

export interface Workout {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: 'musculacao' | 'corrida' | 'funcional' | 'outro';
  student_id: string;
  company_id: string;
  exercicios: WorkoutExercise[];
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  nome: string;
  series?: number;
  repeticoes?: string;
  carga?: string;
  descanso?: string;
  observacoes?: string;
  ordem: number;
}

export interface Payment {
  id: string;
  student_id: string;
  company_id: string;
  valor: number;
  status: 'pendente' | 'pago' | 'cancelado' | 'expirado';
  metodo: 'mercadopago' | 'pagseguro';
  qr_code?: string;
  qr_code_base64?: string;
  payment_id?: string;
  created_at: string;
  expires_at?: string;
  paid_at?: string;
}

export interface Employee {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  role: "gerente" | "treinador";
  company_id: string;
  status: "ativo" | "inativo";
  salario?: number;
  data_contratacao: string;
  created_at: string;
}
