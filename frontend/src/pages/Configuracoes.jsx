// src/pages/Configuracoes.jsx
import { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;

  h2 {
    margin-top: 0;
    color: #2c3e50;
    margin-bottom: 15px;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: white;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 10px;
  font-size: 14px;
`;

function Configuracoes() {
  const [realizandoBackup, setRealizandoBackup] = useState(false);
  const [testandoRollback, setTestandoRollback] = useState(false);
  const [erroBackup, setErroBackup] = useState('');
  const [erroRollback, setErroRollback] = useState('');

  const realizarBackup = async () => {
    setRealizandoBackup(true);
    setErroBackup('');

    try {
      await axios.post('http://localhost:3000/api/system/backup');
      toast.success('Backup realizado com sucesso!');
    } catch (error) {
      setErroBackup('Erro ao realizar backup: ' + 
        (error.response?.data?.error || error.message));
      toast.error('Erro ao realizar backup');
    } finally {
      setRealizandoBackup(false);
    }
  };

  const testarRollback = async () => {
    setTestandoRollback(true);
    setErroRollback('');

    try {
      // Aqui você pode ajustar os parâmetros do teste conforme necessário
      await axios.post('http://localhost:3000/api/system/rollback-test', {
        produtoId: 1,
        quantidade: 1
      });
      toast.success('Teste de rollback concluído com sucesso!');
    } catch (error) {
      setErroRollback('Erro no teste de rollback: ' + 
        (error.response?.data?.error || error.message));
      toast.error('Erro no teste de rollback');
    } finally {
      setTestandoRollback(false);
    }
  };

  return (
    <Container>
      <h1>Configurações do Sistema</h1>

      <Card>
        <h2>Backup do Sistema</h2>
        <Button 
          onClick={realizarBackup}
          disabled={realizandoBackup}
        >
          {realizandoBackup ? 'Realizando Backup...' : 'Realizar Backup'}
        </Button>
        {erroBackup && <ErrorMessage>{erroBackup}</ErrorMessage>}
      </Card>

      <Card>
        <h2>Testes do Sistema</h2>
        <Button 
          onClick={testarRollback}
          disabled={testandoRollback}
        >
          {testandoRollback ? 'Testando...' : 'Testar Rollback'}
        </Button>
        {erroRollback && <ErrorMessage>{erroRollback}</ErrorMessage>}
      </Card>
    </Container>
  );
}

export default Configuracoes;