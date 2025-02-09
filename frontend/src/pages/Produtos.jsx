// src/pages/Produtos.jsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background: #f8f9fa;
    font-weight: bold;
  }

  tr:hover {
    background: #f5f5f5;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.delete ? '#dc3545' : props.secondary ? '#6c757d' : '#007bff'};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    
    &:focus {
      outline: none;
      border-color: #007bff;
    }
  }
`;

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/products');
      setProdutos(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
      setLoading(false);
    }
  };

  const deletarProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`);
      toast.success('Produto excluído com sucesso');
      carregarProdutos();
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  };

  const abrirModal = (produto = null) => {
    setProdutoEditando(produto ? { ...produto } : {
      pro_descricao: '',
      pro_valor: '',
      pro_quantidade: ''
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setProdutoEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (produtoEditando.pro_codigo) {
        // Editando produto existente
        await axios.put(`http://localhost:3000/api/products/${produtoEditando.pro_codigo}`, {
          descricao: produtoEditando.pro_descricao,
          valor: Number(produtoEditando.pro_valor),
          quantidade: Number(produtoEditando.pro_quantidade)
        });
        toast.success('Produto atualizado com sucesso');
      } else {
        // Criando novo produto
        await axios.post('http://localhost:3000/api/products', {
          descricao: produtoEditando.pro_descricao,
          valor: Number(produtoEditando.pro_valor),
          quantidade: Number(produtoEditando.pro_quantidade)
        });
        toast.success('Produto criado com sucesso');
      }
      fecharModal();
      carregarProdutos();
    } catch (error) {
      toast.error(produtoEditando.pro_codigo ? 
        'Erro ao atualizar produto' : 
        'Erro ao criar produto'
      );
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <Container>
      <h1>Produtos</h1>
      <Button onClick={() => abrirModal()}>
        Novo Produto
      </Button>
      <br /><br />
      <Table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Quantidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(produto => (
            <tr key={produto.pro_codigo}>
              <td>{produto.pro_codigo}</td>
              <td>{produto.pro_descricao}</td>
              <td>R$ {Number(produto.pro_valor).toFixed(2)}</td>
              <td>{produto.pro_quantidade}</td>
              <td>
                <Button onClick={() => abrirModal(produto)}>
                  Editar
                </Button>
                <Button 
                  delete 
                  onClick={() => deletarProduto(produto.pro_codigo)}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {modalAberto && (
        <Modal>
          <ModalContent>
            <h2>{produtoEditando.pro_codigo ? 'Editar Produto' : 'Novo Produto'}</h2>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Descrição:</label>
                <input
                  type="text"
                  value={produtoEditando.pro_descricao}
                  onChange={e => setProdutoEditando({
                    ...produtoEditando,
                    pro_descricao: e.target.value
                  })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Valor:</label>
                <input
                  type="number"
                  step="0.01"
                  value={produtoEditando.pro_valor}
                  onChange={e => setProdutoEditando({
                    ...produtoEditando,
                    pro_valor: e.target.value
                  })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Quantidade:</label>
                <input
                  type="number"
                  value={produtoEditando.pro_quantidade}
                  onChange={e => setProdutoEditando({
                    ...produtoEditando,
                    pro_quantidade: e.target.value
                  })}
                  required
                />
              </FormGroup>
              <div>
                <Button type="submit">
                  {produtoEditando.pro_codigo ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" secondary onClick={fecharModal}>
                  Cancelar
                </Button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default Produtos;