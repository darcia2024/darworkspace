import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceFile = process.env.DARU_DB_FILE || path.join(rootDir, 'server', 'data', 'daru_os.json');

function runBackup() {
  if (!fs.existsSync(sourceFile)) {
    console.error(`Database file not found: ${sourceFile}`);
    process.exit(1);
  }

  const backupDir = process.env.DARU_BACKUP_DIR || path.join(os.homedir(), 'daru_os_backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const destination = path.join(backupDir, `daru_os_${timestamp}.json`);

  const raw = fs.readFileSync(sourceFile, 'utf8');
  // Validate JSON integrity before saving
  JSON.parse(raw);

  fs.writeFileSync(destination, raw, 'utf8');
  const stats = fs.statSync(destination);

  console.log(`[OK] Backup completed successfully.`);
  console.log(`     Destination: ${destination}`);
  console.log(`     Size: ${stats.size} bytes`);
}

runBackup();
