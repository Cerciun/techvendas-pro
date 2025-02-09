// src/pages/Fornecedores.jsx
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

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [fornecedorEditando, setFornecedorEditando] = useState(null);

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/suppliers');
      setFornecedores(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Erro ao carregar fornecedores');
      setLoading(false);
    }
  };

  const deletarFornecedor = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este fornecedor?')) return;

    try {
      await axios.delete(`http://localhost:3000/api/suppliers/${id}`);
      toast.success('Fornecedor excluído com sucesso');
      carregarFornecedores();
    } catch (error) {
      toast.error('Erro ao excluir fornecedor');
    }
  };

  const abrirModal = (fornecedor = null) => {
    setFornecedorEditando(fornecedor ? { ...fornecedor } : {
      for_descricao: '',
      for_cidade: ''
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFornecedorEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (fornecedorEditando.for_codigo) {
        // Editando fornecedor existente
        await axios.put(`http://localhost:3000/api/suppliers/${fornecedorEditando.for_codigo}`, {
          descricao: fornecedorEditando.for_descricao,
          cidade: fornecedorEditando.for_cidade
        });
        toast.success('Fornecedor atualizado com sucesso');
      } else {
        // Criando novo fornecedor
        await axios.post('http://localhost:3000/api/suppliers', {
          descricao: fornecedorEditando.for_descricao,
          cidade: fornecedorEditando.for_cidade
        });
        toast.success('Fornecedor criado com sucesso');
      }
      fecharModal();
      carregarFornecedores();
    } catch (error) {
      toast.error(fornecedorEditando.for_codigo ? 
        'Erro ao atualizar fornecedor' : 
        'Erro ao criar fornecedor'
      );
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <Container>
      <h1>Fornecedores</h1>
      <Button onClick={() => abrirModal()}>
        Novo Fornecedor
      </Button>
      <br /><br />
      <Table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Cidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {fornecedores.map(fornecedor => (
            <tr key={fornecedor.for_codigo}>
              <td>{fornecedor.for_codigo}</td>
              <td>{fornecedor.for_descricao}</td>
              <td>{fornecedor.for_cidade}</td>
              <td>
                <Button onClick={() => abrirModal(fornecedor)}>
                  Editar
                </Button>
                <Button 
                  delete 
                  onClick={() => deletarFornecedor(fornecedor.for_codigo)}
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
            <h2>{fornecedorEditando.for_codigo ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Descrição:</label>
                <input
                  type="text"
                  value={fornecedorEditando.for_descricao}
                  onChange={e => setFornecedorEditando({
                    ...fornecedorEditando,
                    for_descricao: e.target.value
                  })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Cidade:</label>
                <input
                  type="text"
                  value={fornecedorEditando.for_cidade}
                  onChange={e => setFornecedorEditando({
                    ...fornecedorEditando,
                    for_cidade: e.target.value
                  })}
                  required
                />
              </FormGroup>
              <div>
                <Button type="submit">
                  {fornecedorEditando.for_codigo ? 'Atualizar' : 'Criar'}
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

export default Fornecedores;