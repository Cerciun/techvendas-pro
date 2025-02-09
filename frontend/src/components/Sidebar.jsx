// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 20px 0;
  min-height: 100vh;
`;

const Logo = styled.div`
  padding: 0 20px;
  margin-bottom: 30px;
  
  h1 {
    color: white;
    font-size: 1.5rem;
    margin: 0;
  }
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: ${props => props.active ? 'white' : '#bdc3c7'};
  text-decoration: none;
  background: ${props => props.active ? '#34495e' : 'transparent'};

  &:hover {
    background: #34495e;
    color: white;
  }
`;

const UserInfo = styled.div`
  padding: 20px;
  border-top: 1px solid #34495e;
  margin-top: auto;

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #bdc3c7;
  }

  button {
    background: none;
    border: none;
    color: #e74c3c;
    padding: 5px 0;
    cursor: pointer;
    font-size: 0.9rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

function Sidebar() {
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const temPermissao = (permissao) => {
    return usuario.permissoes?.includes(permissao);
  };

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      permissao: 'visualizar_vendas'
    },
    {
      path: '/venda',
      label: 'Nova Venda',
      permissao: 'realizar_vendas'
    },
    {
      path: '/produtos',
      label: 'Produtos',
      permissao: 'visualizar_produtos'
    },
    {
      path: '/fornecedores',
      label: 'Fornecedores',
      permissao: 'visualizar_fornecedores'
    },
    {
      path: '/configuracoes',
      label: 'Configurações',
      permissao: 'configurar_sistema'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  };

  return (
    <SidebarContainer>
      <Logo>
        <h1>TechVendas Pro</h1>
      </Logo>

      <nav>
        {menuItems.map(item => 
          temPermissao(item.permissao) && (
            <MenuItem 
              key={item.path}
              to={item.path}
              active={location.pathname === item.path ? 1 : 0}
            >
              {item.label}
            </MenuItem>
          )
        )}
      </nav>

      <UserInfo>
        <p>Usuário: {usuario.nome}</p>
        <p>Tipo: {usuario.tipo}</p>
        <button onClick={handleLogout}>Sair</button>
      </UserInfo>
    </SidebarContainer>
  );
}

export default Sidebar;