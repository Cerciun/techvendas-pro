// src/routes/suppliers.js
const express = require('express');
const router = express.Router();
const knex = require('knex');
const knexConfig = require('../config/database');
const db = knex(knexConfig.development);

// Listar todos os fornecedores
router.get('/', async (req, res) => {
    try {
        const fornecedores = await db('tb_fornecedores')
            .select('*')
            .orderBy('for_codigo');
        res.json(fornecedores);
    } catch (error) {
        console.error('Erro ao listar fornecedores:', error);
        res.status(500).json({ error: error.message });
    }
});

// Buscar fornecedor por ID
router.get('/:id', async (req, res) => {
    try {
        const fornecedor = await db('tb_fornecedores')
            .where('for_codigo', req.params.id)
            .first();
            
        if (!fornecedor) {
            return res.status(404).json({ error: 'Fornecedor não encontrado' });
        }
        
        res.json(fornecedor);
    } catch (error) {
        console.error('Erro ao buscar fornecedor:', error);
        res.status(500).json({ error: error.message });
    }
});

// Criar novo fornecedor
router.post('/', async (req, res) => {
    try {
        const { descricao, cidade } = req.body;
        
        const [id] = await db('tb_fornecedores').insert({
            for_descricao: descricao,
            for_cidade: cidade
        }).returning('for_codigo');
        
        res.status(201).json({ 
            message: 'Fornecedor criado com sucesso',
            id 
        });
    } catch (error) {
        console.error('Erro ao criar fornecedor:', error);
        res.status(500).json({ error: error.message });
    }
});

// Atualizar fornecedor
router.put('/:id', async (req, res) => {
    try {
        const { descricao, cidade } = req.body;
        
        await db('tb_fornecedores')
            .where('for_codigo', req.params.id)
            .update({
                for_descricao: descricao,
                for_cidade: cidade
            });

        res.json({ message: 'Fornecedor atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        res.status(500).json({ error: error.message });
    }
});

// Excluir fornecedor
router.delete('/:id', async (req, res) => {
    try {
        await db('tb_fornecedores')
            .where('for_codigo', req.params.id)
            .del();
            
        res.json({ message: 'Fornecedor excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;