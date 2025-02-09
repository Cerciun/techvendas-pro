# TechVendas Pro

Sistema completo de gestão de vendas de produtos de tecnologia, com controle de estoque, fornecedores e diferentes níveis de acesso.

## 🚀 Funcionalidades

### Gestão de Vendas
- Realizar vendas com controle de estoque automático
- Visualização de histórico de vendas
- Cancelamento de vendas com rollback automático

### Gestão de Produtos
- Cadastro e edição de produtos
- Controle de estoque
- Vinculação com fornecedores

### Gestão de Fornecedores
- Cadastro e edição de fornecedores
- Visualização de produtos por fornecedor

### Sistema de Usuários
- Diferentes níveis de acesso:
  - Admin: Acesso total ao sistema
  - Gerente: Gestão de produtos e vendas
  - Vendedor: Realizar vendas e consultas

### Recursos Técnicos
- Backup automático do banco de dados
- Sistema de logs
- Testes de rollback
- Autenticação JWT
- Interface responsiva

## 🛠️ Tecnologias

### Frontend
- React.js
- Styled Components
- React Router DOM
- Axios
- React Toastify

### Backend
- Node.js
- Express
- PostgreSQL
- Knex.js
- JSON Web Token
- Bcrypt

## 📦 Instalação

### Pré-requisitos
- Node.js v16+
- PostgreSQL 12+
- Git

### Configuração do Banco de Dados
```sql
CREATE DATABASE techvendas;
```

### Backend
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/techvendas-pro.git

# Acesse a pasta do backend
cd techvendas-pro/backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações
npm run migrate

# Inicie o servidor
npm start
```

### Frontend
```bash
# Acesse a pasta do frontend
cd ../frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env

# Inicie a aplicação
npm run dev
```

## 🔑 Variáveis de Ambiente

### Backend (.env)
```env
PORT=3000
DATABASE_URL=postgres://usuario:senha@localhost:5432/techvendas
JWT_SECRET=sua_chave_secreta
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📱 Telas do Sistema

### Login
- Autenticação segura
- Controle de sessão
- Recuperação de senha

### Dashboard
- Resumo de vendas
- Produtos mais vendidos
- Alertas de estoque baixo

### Vendas
- Carrinho de compras
- Seleção de produtos
- Finalização de venda
- Histórico de vendas

### Produtos
- Listagem com filtros
- Cadastro/Edição
- Controle de estoque

### Fornecedores
- Cadastro completo
- Visualização de produtos
- Histórico de fornecimento

### Configurações
- Backup do sistema
- Testes de integridade
- Logs do sistema

## 🔒 Segurança

- Autenticação via JWT
- Senhas criptografadas com Bcrypt
- Controle de sessão
- Proteção contra SQL Injection
- Validação de dados

## 💻 Comandos Úteis

```bash
# Backend
npm run dev     # Executa em modo desenvolvimento
npm start       # Executa em modo produção
npm run migrate # Executa migrações do banco

# Frontend
npm run dev   # Inicia em modo desenvolvimento
npm run build # Gera build de produção
npm run lint  # Executa verificação de código
```

## 👥 Autor

- **Nome**: Edgar Henrique
- **GitHub**: [cerciun](https://github.com/cerciun)
- **Email**: edgarhenrique@gmail.com

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 💡 Implementações Futuras

- [ ] Relatórios em PDF
- [ ] Integração com API de pagamentos
- [ ] App mobile
- [ ] Módulo fiscal
- [ ] Múltiplas filiais
