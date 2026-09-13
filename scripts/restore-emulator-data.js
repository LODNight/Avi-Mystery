// scripts/restore-emulator-data.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const emulatorDataDir = path.join(rootDir, '.firebase', 'emulator-data');
const seedDataDir = path.join(rootDir, 'seed-data');

console.log('🔄 [Restore] Đang khôi phục dữ liệu từ seed-data sang .firebase/emulator-data...');
fs.mkdirSync(emulatorDataDir, { recursive: true });
fs.cpSync(seedDataDir, emulatorDataDir, { recursive: true });
console.log('✅ [Restore] Khôi phục thành công 100%! Toàn bộ tài khoản và tiến trình đã sẵn sàng.');
