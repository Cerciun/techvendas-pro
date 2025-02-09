// src/routes/system.js
const express = require('express');
const router = express.Router();
const knex = require('knex');
const knexConfig = require('../config/database');
const db = knex(knexConfig.development);
const fs = require('fs').promises;
const path = require('path');

// Rota para realizar backup
router.post('/backup', async (req, res) => {
    const trx = await db.transaction();
    
    try {
        // Buscar dados das tabelas principais
        const produtos = await trx('tb_produtos').select('*');
        const fornecedores = await trx('tb_fornecedores').select('*');
        const vendas = await trx('tb_vendas').select('*');
        const itens = await trx('tb_itens').select('*');

        // Criar objeto com todos os dados
        const backupData = {
            timestamp: new Date().toISOString(),
            dados: {
                produtos,
                fornecedores,
                vendas,
                itens
            }
        };

        // Criar nome do arquivo com timestamp
        const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const backupDir = path.join(__dirname, '..', 'backups');
        
        // Criar diretório de backup se não existir
        await fs.mkdir(backupDir, { recursive: true });
        
        // Salvar arquivo de backup
        await fs.writeFile(
            path.join(backupDir, fileName),
            JSON.stringify(backupData, null, 2)
        );

        await trx.commit();
        res.json({ 
            message: 'Backup realizado com sucesso',
            fileName 
        });

    } catch (error) {
        await trx.rollback();
        console.error('Erro ao realizar backup:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para testar rollback
router.post('/rollback-test', async (req, res) => {
    const trx = await db.transaction();
    
    try {
        const { produtoId, quantidade } = req.body;

        // Verificar se o produto existe
        const produto = await trx('tb_produtos')
            .where('pro_codigo', produtoId)
            .first();

        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        // Tentar atualizar o produto (isso vai gerar o erro)
        const novaQuantidade = produto.pro_quantidade - quantidade;
        
        if (novaQuantidade < 0) {
            throw new Error('Quantidade insuficiente em estoque');
        }

        await trx('tb_produtos')
            .where('pro_codigo', produtoId)
            .update({ 
                pro_quantidade: novaQuantidade 
            });

        // Forçar um erro para testar o rollback
        throw new Error('Teste de rollback executado com sucesso!');

    } catch (error) {
        await trx.rollback();
        console.log('Rollback executado:', error.message);
        res.status(200).json({ 
            mensagem: 'Teste de rollback realizado!',
            detalhes: error.message
        });
    }
});

module.exports = router;