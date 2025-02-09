// src/services/backup.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class BackupService {
    constructor() {
        this.backupDir = path.join(__dirname, '../../../backups');
        // Criar diretório de backup se não existir
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async realizarBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupDir, `backup-${timestamp}.sql`);
        
        return new Promise((resolve, reject) => {
            const command = `pg_dump -U postgres -d techvendas > "${backupPath}"`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro no backup: ${error}`);
                    reject(error);
                    return;
                }
                resolve({
                    message: 'Backup realizado com sucesso',
                    path: backupPath
                });
            });
        });
    }

    async listarBackups() {
        const files = await fs.promises.readdir(this.backupDir);
        return files.filter(file => file.endsWith('.sql'));
    }

    async restaurarBackup(filename) {
        const backupPath = path.join(this.backupDir, filename);
        
        return new Promise((resolve, reject) => {
            const command = `psql -U postgres -d techvendas < "${backupPath}"`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro na restauração: ${error}`);
                    reject(error);
                    return;
                }
                resolve({
                    message: 'Backup restaurado com sucesso'
                });
            });
        });
    }
}

module.exports = new BackupService();