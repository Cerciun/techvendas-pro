// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('knex');
const knexConfig = require('../config/database');
const db = knex(knexConfig.development);

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

// Middleware para verificar permissões
const verificarPermissao = (permissaoNecessaria) => async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;

        // Verificar permissões do usuário através dos grupos
        const permissoesGrupo = await db('tb_usuarios_grupos as ug')
            .join('tb_grupos_permissoes as gp', 'ug.gru_codigo', 'gp.gru_codigo')
            .join('tb_permissoes as p', 'gp.per_codigo', 'p.per_codigo')
            .where('ug.usu_codigo', usuarioId)
            .andWhere('p.per_nome', permissaoNecessaria)
            .first();

        // Verificar permissões específicas do usuário
        const permissoesUsuario = await db('tb_usuarios_permissoes as up')
            .join('tb_permissoes as p', 'up.per_codigo', 'p.per_codigo')
            .where('up.usu_codigo', usuarioId)
            .andWhere('p.per_nome', permissaoNecessaria)
            .first();

        if (permissoesGrupo || permissoesUsuario) {
            next();
        } else {
            res.status(403).json({ error: 'Sem permissão para acessar este recurso' });
        }
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
};

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        console.log('Tentativa de login:', email); // Log para debug

        const usuario = await db('tb_usuarios')
            .where('usu_email', email)
            .first();

        if (!usuario) {
            console.log('Usuário não encontrado:', email); // Log para debug
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        if (!usuario.usu_ativo) {
            console.log('Usuário inativo:', email); // Log para debug
            return res.status(401).json({ error: 'Usuário inativo' });
        }

        // Logs para debug da verificação de senha
        console.log('Senha fornecida:', senha);
        console.log('Hash do banco:', usuario.usu_senha);

        const senhaCorreta = await bcrypt.compare(senha, usuario.usu_senha);
        console.log('Resultado da comparação de senha:', senhaCorreta); // Log para debug

        if (!senhaCorreta) {
            console.log('Senha incorreta para usuário:', email); // Log para debug
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        // Buscar grupos e permissões do usuário
        const grupos = await db('tb_usuarios_grupos as ug')
            .join('tb_grupos as g', 'ug.gru_codigo', 'g.gru_codigo')
            .where('ug.usu_codigo', usuario.usu_codigo)
            .select('g.gru_nome');

        console.log('Grupos do usuário:', grupos); // Log para debug

        const permissoes = await db('tb_usuarios_grupos as ug')
            .join('tb_grupos_permissoes as gp', 'ug.gru_codigo', 'gp.gru_codigo')
            .join('tb_permissoes as p', 'gp.per_codigo', 'p.per_codigo')
            .where('ug.usu_codigo', usuario.usu_codigo)
            .union(function() {
                this.select('p.per_nome')
                    .from('tb_usuarios_permissoes as up')
                    .join('tb_permissoes as p', 'up.per_codigo', 'p.per_codigo')
                    .where('up.usu_codigo', usuario.usu_codigo);
            })
            .select('p.per_nome');

        console.log('Permissões do usuário:', permissoes); // Log para debug

        const token = jwt.sign(
            { 
                id: usuario.usu_codigo,
                nome: usuario.usu_nome,
                tipo: usuario.usu_tipo,
                grupos: grupos.map(g => g.gru_nome),
                permissoes: permissoes.map(p => p.per_nome)
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Log de sucesso no login
        console.log('Login realizado com sucesso:', {
            usuario: usuario.usu_codigo,
            nome: usuario.usu_nome,
            tipo: usuario.usu_tipo
        });

        res.json({
            token,
            usuario: {
                id: usuario.usu_codigo,
                nome: usuario.usu_nome,
                email: usuario.usu_email,
                tipo: usuario.usu_tipo,
                grupos: grupos.map(g => g.gru_nome),
                permissoes: permissoes.map(p => p.per_nome)
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro ao realizar login' });
    }
});

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Exportar também o middleware de autenticação
module.exports = {
    router,
    verificarPermissao,
    authMiddleware
};