// src/routes/products.js
const express = require('express');
const router = express.Router();
const knex = require('knex');
const knexConfig = require('../config/database');
const db = knex(knexConfig.development);

// Listar todos os produtos
router.get('/', async (req, res) => {
    try {
        const produtos = await db('tb_produtos')
            .select('*')
            .orderBy('pro_codigo');
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
    try {
        const produto = await db('tb_produtos')
            .where('pro_codigo', req.params.id)
            .first();
            
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json(produto);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ error: error.message });
    }
});

// Criar novo produto
router.post('/', async (req, res) => {
    try {
        const { descricao, valor, quantidade, fornecedor_id } = req.body;
        
        const [id] = await db('tb_produtos').insert({
            pro_descricao: descricao,
            pro_valor: valor,
            pro_quantidade: quantidade,
            tb_fornecedores_for_codigo: fornecedor_id
        }).returning('pro_codigo');
        
        res.status(201).json({ 
            message: 'Produto criado com sucesso',
            id 
        });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: error.message });
    }
});

// Atualizar produto (ADICIONE ESTA ROTA)
router.put('/:id', async (req, res) => {
    try {
        const { descricao, valor, quantidade } = req.body;
        
        await db('tb_produtos')
            .where('pro_codigo', req.params.id)
            .update({
                pro_descricao: descricao,
                pro_valor: valor,
                pro_quantidade: quantidade
            });

        res.json({ message: 'Produto atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: error.message });
    }
});

// Excluir produto
router.delete('/:id', async (req, res) => {
    try {
        await db('tb_produtos')
            .where('pro_codigo', req.params.id)
            .del();
            
        res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;