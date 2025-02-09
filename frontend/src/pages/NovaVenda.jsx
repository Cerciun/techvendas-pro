// src/pages/NovaVenda.jsx
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import api from '../services/api';

// Componentes estilizados
const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    color: #2c3e50;
    font-size: 24px;
    margin: 0;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-2px);
  }

  h3 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 18px;
  }

  p {
    margin: 5px 0;
    color: #666;
  }

  ${props => props.outOfStock && `
    &::after {
      content: 'Sem Estoque';
      position: absolute;
      top: 10px;
      right: 10px;
      background: #e74c3c;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  `}
`;

const SearchBar = styled.div`
  margin-bottom: 20px;
  
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    
    &:focus {
      outline: none;
      border-color: #3498db;
    }
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  border-radius: 4px;
  background: ${props => props.disabled ? '#bdc3c7' : '#3498db'};
  color: white;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;

  &:hover {
    background: ${props => props.disabled ? '#bdc3c7' : '#2980b9'};
  }
`;

const Cart = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: fit-content;
  position: sticky;
  top: 20px;

  h2 {
    color: #2c3e50;
    margin: 0 0 20px 0;
  }

  @media (max-width: 768px) {
    position: static;
  }
`;

const CartItem = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid #eee;

  p {
    margin: 5px 0;
    color: #666;
  }

  .quantidade {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 5px 0;

    button {
      padding: 2px 8px;
      border: 1px solid #ddd;
      background: #f8f9fa;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #e9ecef;
      }

      &:disabled {
        background: #eee;
        cursor: not-allowed;
      }
    }
  }
`;

const RemoveButton = styled.button`
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background: #e74c3c;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #c0392b;
  }
`;

const CartTotal = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #eee;

  h3 {
    color: #2c3e50;
    margin: 0 0 20px 0;
  }
`;

const FinishButton = styled.button`
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 4px;
  background: ${props => props.disabled ? '#bdc3c7' : '#27ae60'};
  color: white;
  font-size: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;

  &:hover {
    background: ${props => props.disabled ? '#bdc3c7' : '#219a52'};
  }
`;

function NovaVenda() {
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processandoVenda, setProcessandoVenda] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  const carregarProdutos = useCallback(async () => {
    try {
      const response = await api.get('/products');
      setProdutos(response.data);
      setProdutosFiltrados(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos. Verifique se o servidor está rodando.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  useEffect(() => {
    const resultados = produtos.filter(produto =>
      produto.pro_descricao.toLowerCase().includes(termoBusca.toLowerCase())
    );
    setProdutosFiltrados(resultados);
  }, [termoBusca, produtos]);

  const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.pro_codigo === produto.pro_codigo);
    
    if (itemExistente) {
      if (itemExistente.quantidade >= produto.pro_quantidade) {
        toast.warning('Quantidade máxima atingida');
        return;
      }
      
      setCarrinho(carrinho.map(item => 
        item.pro_codigo === produto.pro_codigo
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }
    
    toast.success(`${produto.pro_descricao} adicionado ao carrinho`);
  };

  const removerDoCarrinho = (produtoId) => {
    const produto = carrinho.find(item => item.pro_codigo === produtoId);
    setCarrinho(carrinho.filter(item => item.pro_codigo !== produtoId));
    
    if (produto) {
      toast.info(`${produto.pro_descricao} removido do carrinho`);
    }
  };

  const alterarQuantidade = (produtoId, delta) => {
    setCarrinho(carrinho.map(item => {
      if (item.pro_codigo === produtoId) {
        const novaQuantidade = item.quantidade + delta;
        const produto = produtos.find(p => p.pro_codigo === produtoId);
        
        if (novaQuantidade <= 0) {
          return null;
        }
        
        if (novaQuantidade > produto.pro_quantidade) {
          toast.warning('Quantidade máxima atingida');
          return item;
        }
        
        return { ...item, quantidade: novaQuantidade };
      }
      return item;
    }).filter(Boolean));
  };

  const finalizarVenda = async () => {
    if (processandoVenda) return;

    try {
      setProcessandoVenda(true);

      if (carrinho.length === 0) {
        toast.error('Adicione produtos ao carrinho');
        return;
      }

      const dadosVenda = {
        itens: carrinho.map(item => ({
          produto_id: Number(item.pro_codigo),
          quantidade: Number(item.quantidade),
          valor_parcial: Number((item.pro_valor * item.quantidade).toFixed(2))
        })),
        valor_total: Number(valorTotal.toFixed(2))
      };

      console.log('Enviando dados da venda:', dadosVenda);

      const response = await api.post('/sales', dadosVenda);
      console.log('Resposta do servidor:', response.data);

      toast.success('Venda realizada com sucesso!');
      setCarrinho([]);
      await carregarProdutos();

    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      
      let mensagemErro = 'Erro ao finalizar venda';
      if (error.response?.data?.error) {
        mensagemErro = error.response.data
        mensagemErro = error.response.data.error;
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      toast.error(mensagemErro);
    } finally {
      setProcessandoVenda(false);
    }
  };

  const valorTotal = carrinho.reduce((total, item) => 
    total + (Number(item.pro_valor) * item.quantidade), 0
  );

  if (loading) {
    return (
      <Container>
        <LoadingOverlay>
          <div>Carregando produtos...</div>
        </LoadingOverlay>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Nova Venda</h1>
      </Header>

      <SearchBar>
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />
      </SearchBar>

      <Content>
        <ProductList>
          {produtosFiltrados.map(produto => (
            <ProductCard 
              key={produto.pro_codigo}
              outOfStock={produto.pro_quantidade === 0}
            >
              <h3>{produto.pro_descricao}</h3>
              <p>Preço: R$ {Number(produto.pro_valor).toFixed(2)}</p>
              <p>Estoque: {produto.pro_quantidade}</p>
              <AddButton 
                onClick={() => adicionarAoCarrinho(produto)}
                disabled={produto.pro_quantidade === 0}
              >
                {produto.pro_quantidade === 0 ? 'Sem Estoque' : 'Adicionar ao Carrinho'}
              </AddButton>
            </ProductCard>
          ))}
          {produtosFiltrados.length === 0 && (
            <div>Nenhum produto encontrado</div>
          )}
        </ProductList>

        <Cart>
          <h2>Carrinho {carrinho.length > 0 && `(${carrinho.length} ${carrinho.length === 1 ? 'item' : 'itens'})`}</h2>
          {carrinho.length === 0 ? (
            <p>Carrinho vazio</p>
          ) : (
            carrinho.map(item => (
              <CartItem key={item.pro_codigo}>
                <p>{item.pro_descricao}</p>
                <div className="quantidade">
                  <button 
                    onClick={() => alterarQuantidade(item.pro_codigo, -1)}
                    disabled={item.quantidade <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantidade}</span>
                  <button 
                    onClick={() => alterarQuantidade(item.pro_codigo, 1)}
                    disabled={item.quantidade >= item.pro_quantidade}
                  >
                    +
                  </button>
                  <span>x R$ {Number(item.pro_valor).toFixed(2)}</span>
                </div>
                <p>Total: R$ {(Number(item.pro_valor) * item.quantidade).toFixed(2)}</p>
                <RemoveButton onClick={() => removerDoCarrinho(item.pro_codigo)}>
                  Remover
                </RemoveButton>
              </CartItem>
            ))
          )}
          
          <CartTotal>
            <h3>Total: R$ {valorTotal.toFixed(2)}</h3>
            <FinishButton 
              onClick={finalizarVenda}
              disabled={carrinho.length === 0 || processandoVenda}
            >
              {processandoVenda ? 'Processando...' : 'Finalizar Venda'}
            </FinishButton>
          </CartTotal>
        </Cart>
      </Content>
    </Container>
  );
}

export default NovaVenda;