# Configuração do Supabase - SportManager

## 🚀 Passo a Passo para Configurar o Banco de Dados

### 1. Criar Tabelas no Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor** (ícone de banco de dados na barra lateral)
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo `supabase-schema.sql`
5. Cole no editor e clique em **Run**

Isso criará todas as tabelas necessárias:
- `companies` - Empresas
- `students` - Alunos
- `workouts` - Treinos
- `payments` - Pagamentos

### 2. Configurar a Chave Supabase Anon Key

1. No Supabase Dashboard, vá em **Settings** > **API**
2. Copie a **anon/public key**
3. Abra o arquivo `src/lib/supabase.ts`
4. Substitua o valor de `supabaseAnonKey` pela sua chave real

```typescript
const supabaseAnonKey = 'SUA_CHAVE_ANON_AQUI';
```

### 3. Configurar APIs de Pagamento (Opcional)

Se você quiser integrar com as APIs reais do Mercado Pago ou PagSeguro:

#### Mercado Pago
1. Crie uma conta em https://www.mercadopago.com.br/developers
2. Obtenha seu Access Token
3. No Supabase Dashboard, vá em **Settings** > **Vault**
4. Adicione um novo secret:
   - Name: `MERCADOPAGO_ACCESS_TOKEN`
   - Value: seu access token do Mercado Pago

#### PagSeguro
1. Crie uma conta em https://dev.pagseguro.uol.com.br
2. Obtenha seu Token de Integração
3. No Supabase Dashboard, vá em **Settings** > **Vault**
4. Adicione um novo secret:
   - Name: `PAGSEGURO_TOKEN`
   - Value: seu token do PagSeguro

## 📋 Estrutura do Banco de Dados

### Tabela: companies
Armazena informações das empresas (academias, assessorias)
- Razão Social e Nome Fantasia
- CNPJ, Email, Telefone
- Dados Bancários (Banco, Agência, Conta, Tipo de Conta, Chave PIX)
- Gateway de Pagamento (Mercado Pago ou PagSeguro)

### Tabela: students
Cadastro de alunos e clientes
- Nome, Email, Telefone, CPF
- Data de Nascimento
- Endereço completo
- Plano contratado
- Status (ativo, inativo, pendente)

### Tabela: workouts
Planilhas de treino
- Título e descrição
- Tipo (musculação, corrida, funcional, outro)
- Lista de exercícios (JSON)
- Observações

### Tabela: payments
Controle de pagamentos
- Valor e status
- Método (Mercado Pago ou PagSeguro)
- QR Code gerado
- Datas de criação, expiração e pagamento

## 🔒 Segurança

O banco está configurado com Row Level Security (RLS), garantindo que:
- Usuários só veem dados das suas próprias empresas
- Não é possível acessar dados de outros usuários
- Todas as operações são validadas no nível do banco de dados

## ✅ Testando a Configuração

Após configurar:
1. Crie uma conta no sistema (página de login)
2. Cadastre uma empresa
3. Cadastre um aluno
4. Crie uma planilha de treino
5. Gere uma cobrança

Se tudo estiver configurado corretamente, você conseguirá realizar todas essas operações sem erros!

## ⚠️ Observações Importantes

- **Chave Anon Key**: Certifique-se de usar a chave anon/public, NÃO a service_role key
- **URLs**: Mantenha a URL do Supabase correta em `src/lib/supabase.ts`
- **RLS**: As políticas de segurança estão ativas, isso é bom para proteção dos dados
- **Backup**: Sempre faça backup antes de modificar o banco de dados

## 🆘 Problemas Comuns

### "relation does not exist"
- Verifique se você executou o SQL schema corretamente
- Confirme que todas as tabelas foram criadas

### "JWT expired" ou problemas de autenticação
- Verifique se a anon key está correta
- Tente fazer logout e login novamente

### Erros de permissão
- Verifique se o RLS está configurado corretamente
- Confirme que as policies foram criadas

## 📞 Suporte

Para mais informações, consulte a [documentação oficial do Supabase](https://supabase.com/docs).
