// src/generatePassword.js
const bcrypt = require('bcryptjs');
const knex = require('knex');
const knexConfig = require('./config/database');
const db = knex(knexConfig.development);

async function gerarHash() {
    try {
        const senha = '12345';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(senha, salt);
        
        console.log('Gerando hash para senha padrão...');
        console.log('Senha:', senha);
        console.log('Hash:', hash);
        
        // Atualizar senhas no banco
        console.log('\nAtualizando senhas no banco de dados...');
        await db('tb_usuarios').update({ usu_senha: hash });
        
        // Verificar se foi atualizado
        const usuarios = await db('tb_usuarios').select('usu_email', 'usu_senha');
        console.log('\nUsuários atualizados:');
        console.log(usuarios);
        
        console.log('\nTodas as senhas foram atualizadas para: "12345"');
        
        // Fechar conexão com o banco
        await db.destroy();
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
}

// Executar a função
gerarHash().then(() => {
    console.log('Processo finalizado com sucesso!');
    process.exit(0);
});