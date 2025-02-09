// src/routes/sales.js
const express = require('express');
const router = express.Router();
const knex = require('knex');
const knexConfig = require('../config/database');
const db = knex(knexConfig.development);

// Listar todas as vendas
router.get('/', async (req, res) => {
    try {
        const vendas = await db('tb_vendas')
            .select(
                'tb_vendas.*',
                db.raw('COUNT(tb_itens.ite_codigo) as total_itens'),
                db.raw('SUM(tb_itens.ite_quantidade) as total_produtos')
            )
            .leftJoin('tb_itens', 'tb_vendas.ven_codigo', 'tb_itens.tb_vendas_ven_codigo')
            .groupBy('tb_vendas.ven_codigo')
            .orderBy('ven_data', 'desc');

        res.json(vendas);
    } catch (error) {
        console.error('Erro ao listar vendas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Buscar venda por ID
router.get('/:id', async (req, res) => {
    try {
        const venda = await db('tb_vendas')
            .where('ven_codigo', req.params.id)
            .first();

        if (!venda) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        const itens = await db('tb_itens')
            .select(
                'tb_itens.*',
                'tb_produtos.pro_descricao',
                'tb_produtos.pro_valor',
                'tb_fornecedores.for_descricao as fornecedor'
            )
            .join('tb_produtos', 'tb_itens.tb_produtos_pro_codigo', 'tb_produtos.pro_codigo')
            .leftJoin('tb_fornecedores', 'tb_produtos.tb_fornecedores_for_codigo', 'tb_fornecedores.for_codigo')
            .where('tb_vendas_ven_codigo', req.params.id);

        venda.itens = itens;
        res.json(venda);
    } catch (error) {
        console.error('Erro ao buscar venda:', error);
        res.status(500).json({ error: error.message });
    }
});

// Criar nova venda
router.post('/', async (req, res) => {
    const trx = await db.transaction();
    
    try {
        if (!req.body.itens || !Array.isArray(req.body.itens) || req.body.itens.length === 0) {
            throw new Error('Venda deve conter pelo menos um item');
        }

        // Criar a venda e obter o ID
        const [vendaInserida] = await trx('tb_vendas')
            .insert({
                ven_data: new Date(),
                ven_valor_total: Number(req.body.valor_total) || 0
            })
            .returning(['ven_codigo']);

        const vendaId = vendaInserida.ven_codigo;

        // Processar cada item do carrinho
        for (const item of req.body.itens) {
            // Validar dados do item
            if (!item.produto_id || !item.quantidade || item.quantidade <= 0) {
                throw new Error('Dados do item inválidos');
            }

            // Verificar estoque
            const produto = await trx('tb_produtos')
                .where('pro_codigo', item.produto_id)
                .first();

            if (!produto) {
                throw new Error(`Produto ${item.produto_id} não encontrado`);
            }

            if (produto.pro_quantidade < item.quantidade) {
                throw new Error(`Estoque insuficiente para o produto ${produto.pro_descricao}`);
            }

            // Inserir item da venda
            await trx('tb_itens').insert({
                ite_quantidade: Number(item.quantidade),
                ite_valor_parcial: Number(item.valor_parcial),
                tb_produtos_pro_codigo: Number(item.produto_id),
                tb_vendas_ven_codigo: vendaId // Usando o ID obtido diretamente
            });

            // Atualizar estoque
            await trx('tb_produtos')
                .where('pro_codigo', item.produto_id)
                .decrement('pro_quantidade', Number(item.quantidade));
        }

        await trx.commit();

        // Buscar venda completa
        const vendaCompleta = await db('tb_vendas')
            .select(
                'tb_vendas.*',
                db.raw('COUNT(tb_itens.ite_codigo) as total_itens'),
                db.raw('SUM(tb_itens.ite_quantidade) as total_produtos')
            )
            .leftJoin('tb_itens', 'tb_vendas.ven_codigo', 'tb_itens.tb_vendas_ven_codigo')
            .where('tb_vendas.ven_codigo', vendaId)
            .groupBy('tb_vendas.ven_codigo')
            .first();

        res.status(201).json({
            message: 'Venda realizada com sucesso',
            venda: vendaCompleta
        });

    } catch (error) {
        await trx.rollback();
        console.error('Erro na venda:', error);
        res.status(400).json({ error: error.message });
    }
});

// Cancelar venda
router.delete('/:id', async (req, res) => {
    const trx = await db.transaction();
    
    try {
        // Verificar se a venda existe
        const venda = await trx('tb_vendas')
            .where('ven_codigo', req.params.id)
            .first();

        if (!venda) {
            throw new Error('Venda não encontrada');
        }

        // 1. Buscar itens da venda
        const itens = await trx('tb_itens')
            .where('tb_vendas_ven_codigo', req.params.id);

        // 2. Devolver itens ao estoque
        for (const item of itens) {
            await trx('tb_produtos')
                .where('pro_codigo', item.tb_produtos_pro_codigo)
                .increment('pro_quantidade', item.ite_quantidade);
        }

        // 3. Remover itens da venda
        await trx('tb_itens')
            .where('tb_vendas_ven_codigo', req.params.id)
            .del();

        // 4. Remover venda
        await trx('tb_vendas')
            .where('ven_codigo', req.params.id)
            .del();

        await trx.commit();
        res.json({ message: 'Venda cancelada com sucesso' });

    } catch (error) {
        await trx.rollback();
        console.error('Erro ao cancelar venda:', error);
        res.status(400).json({ error: error.message });
    }
});

// Verificar consistência da venda
router.get('/:id/verificar', async (req, res) => {
    const trx = await db.transaction();
    
    try {
        const venda = await trx('tb_vendas')
            .where('ven_codigo', req.params.id)
            .first();

        if (!venda) {
            throw new Error('Venda não encontrada');
        }

        const itens = await trx('tb_itens')
            .where('tb_vendas_ven_codigo', req.params.id);

        const valorCalculado = itens.reduce((total, item) => 
            total + Number(item.ite_valor_parcial), 0
        );

        const consistente = Math.abs(valorCalculado - venda.ven_valor_total) < 0.01;

        await trx.commit();
        res.json({ 
            consistente,
            valor_registrado: venda.ven_valor_total,
            valor_calculado: valorCalculado,
            diferenca: Math.abs(valorCalculado - venda.ven_valor_total)
        });

    } catch (error) {
        await trx.rollback();
        console.error('Erro ao verificar consistência:', error);
        res.status(400).json({ error: error.message });
    }
});

// Relatório de vendas por período
router.get('/relatorio/:inicio/:fim', async (req, res) => {
    try {
        const { inicio, fim } = req.params;
        
        // Buscar vendas com totais agregados
        const vendas = await db('tb_vendas')
            .select(
                'tb_vendas.*',
                db.raw('COALESCE(COUNT(tb_itens.ite_codigo), 0) as total_itens'),
                db.raw('COALESCE(SUM(tb_itens.ite_quantidade), 0) as total_produtos')
            )
            .leftJoin('tb_itens', 'tb_vendas.ven_codigo', 'tb_itens.tb_vendas_ven_codigo')
            .whereBetween('ven_data', [inicio, fim])
            .groupBy('tb_vendas.ven_codigo')
            .orderBy('ven_data', 'desc');

        // Calcular resumo
        const resumo = {
            total_vendas: vendas.length,
            valor_total: vendas.reduce((total, venda) => total + Number(venda.ven_valor_total || 0), 0),
            total_produtos: vendas.reduce((total, venda) => total + Number(venda.total_produtos || 0), 0),
            media_por_venda: vendas.length 
                ? (vendas.reduce((total, venda) => total + Number(venda.ven_valor_total || 0), 0) / vendas.length)
                : 0
        };

        res.json({
            periodo: { inicio, fim },
            resumo,
            vendas
        });

    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;