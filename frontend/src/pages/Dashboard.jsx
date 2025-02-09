// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../services/api';

const Container = styled.div`
  padding: 20px;
`;

const ErrorContainer = styled.div`
  background: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;

  h3 {
    margin-bottom: 10px;
  }

  button {
    background: #991b1b;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    margin-top: 10px;
    cursor: pointer;

    &:hover {
      background: #7f1d1d;
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const Card = styled.div`
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);

  h3 {
    color: #1f2937;
    margin-bottom: 15px;
  }

  p {
    font-size: 24px;
    color: #2563eb;
    font-weight: bold;
  }
`;

function Dashboard() {
  const [dados, setDados] = useState({
    totalVendas: 0,
    produtosEstoque: 0,
    vendaHoje: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados de vendas
      const [vendasResponse, produtosResponse] = await Promise.all([
        api.get('/sales'),
        api.get('/products')
      ]);

      const hoje = new Date().toISOString().split('T')[0];
      const vendasHoje = vendasResponse.data.filter(v => 
        v.ven_data?.split('T')[0] === hoje
      );

      setDados({
        totalVendas: vendasResponse.data.length,
        produtosEstoque: produtosResponse.data.length,
        vendaHoje: vendasHoje.length
      });
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  if (loading) {
    return (
      <Container>
        <h1>Carregando...</h1>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <h1>Dashboard</h1>
        <ErrorContainer>
          <h3>Erro ao carregar dados</h3>
          <p>{error}</p>
          <button onClick={carregarDados}>Tentar novamente</button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <h1>Dashboard</h1>
      <Grid>
        <Card>
          <h3>Total de Vendas</h3>
          <p>{dados.totalVendas}</p>
        </Card>
        <Card>
          <h3>Produtos em Estoque</h3>
          <p>{dados.produtosEstoque}</p>
        </Card>
        <Card>
          <h3>Vendas Hoje</h3>
          <p>{dados.vendaHoje}</p>
        </Card>
      </Grid>
    </Container>
  );
}

export default Dashboard;