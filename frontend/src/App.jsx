// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { GlobalStyle } from './styles/global';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NovaVenda from './pages/NovaVenda';
import Produtos from './pages/Produtos';
import Fornecedores from './pages/Fornecedores';
import Configuracoes from './pages/Configuracoes';

function RotaProtegida({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <RotaProtegida>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flex: 1, padding: '20px', background: '#f0f2f5' }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/venda" element={<NovaVenda />} />
                  <Route path="/produtos" element={<Produtos />} />
                  <Route path="/fornecedores" element={<Fornecedores />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                </Routes>
              </main>
            </div>
          </RotaProtegida>
        } />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;