// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(120deg, #2980b9, #3498db);
`;

const LoginBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 20px;

  h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 28px;
    font-weight: 600;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: #2c3e50;
    font-weight: 500;
    font-size: 14px;
  }

  input {
    padding: 12px;
    border: 2px solid #eee;
    border-radius: 6px;
    font-size: 16px;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
  }
`;

const Button = styled.button`
  padding: 14px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    background: #2980b9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 32px;
    color: #2c3e50;
    margin: 0;
    padding: 0;
  }
`;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        senha
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      // Configurar token no axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error(error.response?.data?.error || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginBox>
        <Logo>
          <h1>TechVendas Pro</h1>
        </Logo>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </FormGroup>
          <FormGroup>
            <label>Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>
      </LoginBox>
    </Container>
  );
}

export default Login;