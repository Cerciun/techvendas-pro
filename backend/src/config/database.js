module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: 'localhost',
            user: 'postgres',
            password: '12345', // Altere para sua senha do PostgreSQL
            database: 'techvendas',
            charset: 'utf8'
        },
        migrations: {
            directory: '../database/migrations'
        },
        seeds: {
            directory: '../database/seeds'
        }
    }
};