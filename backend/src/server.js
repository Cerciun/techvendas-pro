// src/server.js
const express = require('express');
const cors = require('cors');
const knex = require('knex');
const knexConfig = require('./config/database');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para CORS
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para processar JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = knex(knexConfig.development);

// Middleware para disponibilizar a conexão do banco para as rotas
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Middleware de log para debug
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Routes
const productRoutes = require('./routes/products');
const supplierRoutes = require('./routes/suppliers');
const saleRoutes = require('./routes/sales');
const systemRoutes = require('./routes/system');

const { router: authRouter, authMiddleware, verificarPermissao } = require('./routes/auth');

console.log('Registrando rotas...');

// Registrar rotas
app.use('/api/auth', authRouter);
app.use('/api/products', authMiddleware, verificarPermissao('visualizar_produtos'), productRoutes);
app.use('/api/suppliers', authMiddleware, verificarPermissao('visualizar_fornecedores'), supplierRoutes);
app.use('/api/sales', authMiddleware, verificarPermissao('visualizar_vendas'), saleRoutes);
app.use('/api/system', authMiddleware, verificarPermissao('configurar_sistema'), systemRoutes);

// Rota básica para teste
app.get('/', (req, res) => {
    res.json({ 
        message: 'TechVendas API está rodando',
        version: '1.0.0',
        timestamp: new Date()
    });
});

// Middleware para tratar rotas não encontradas
app.use((req, res, next) => {
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.path
    });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro na aplicação:', err);
    
    // Se for um erro do Knex
    if (err.code) {
        switch (err.code) {
            case '23505': // Violação de unique
                return res.status(409).json({
                    error: 'Registro duplicado',
                    detail: err.detail
                });
            case '23503': // Violação de foreign key
                return res.status(409).json({
                    error: 'Registro relacionado não existe',
                    detail: err.detail
                });
            default:
                console.error('Erro do banco de dados:', err);
        }
    }

    res.status(err.status || 500).json({ 
        error: 'Ocorreu um erro no servidor',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`URL da API: http://localhost:${port}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = app;