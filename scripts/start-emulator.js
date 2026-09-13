// scripts/start-emulator.js
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const emulatorDataDir = path.join(rootDir, '.firebase', 'emulator-data');
const seedDataDir = path.join(rootDir, 'seed-data');

console.log('🔍 [Firebase Emulator] Kiểm tra môi trường...');

// 1. Kiểm tra nếu .firebase/emulator-data bị trống thì khôi phục từ seed-data
const isEmulatorDataEmpty = !fs.existsSync(emulatorDataDir) || fs.readdirSync(emulatorDataDir).length === 0;
if (isEmulatorDataEmpty) {
  console.log('⚠️ [Firebase Emulator] Thư mục .firebase/emulator-data đang trống. Tự động khôi phục từ seed-data...');
  fs.mkdirSync(emulatorDataDir, { recursive: true });
  fs.cpSync(seedDataDir, emulatorDataDir, { recursive: true });
  console.log('✅ [Firebase Emulator] Đã khôi phục dữ liệu từ seed-data thành công!');
}

// 2. Kiểm tra và giải phóng port 8080, 9099 nếu bị tiến trình cũ giữ (Windows)
if (process.platform === 'win32') {
  try {
    const netstatOutput = execSync('netstat -ano | findstr :8080', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = netstatOutput.trim().split('\n');
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== process.pid.toString()) {
          console.log(`🧹 [Firebase Emulator] Phát hiện tiến trình Java/Node treo chiếm port 8080 (PID: ${pid}). Đang giải phóng...`);
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            console.log(`✅ [Firebase Emulator] Đã tắt tiến trình ${pid}.`);
          } catch (e) {}
        }
      }
    }
  } catch (err) {
    // Không có tiến trình chiếm port, an toàn tiếp tục
  }
}

// 3. Khởi chạy Firebase Emulator an toàn
console.log('🚀 [Firebase Emulator] Đang khởi động Firebase Emulator với dữ liệu đầy đủ...');
const child = spawn('npx', ['firebase', 'emulators:start', '--import=.firebase/emulator-data', '--export-on-exit=.firebase/emulator-data'], {
  cwd: rootDir,
  shell: true,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  // Đồng bộ sang seed-data sau khi thoát an toàn nếu thư mục có dữ liệu
  if (code === 0 && fs.existsSync(emulatorDataDir) && fs.readdirSync(emulatorDataDir).length > 0) {
    fs.cpSync(emulatorDataDir, seedDataDir, { recursive: true });
    console.log('💾 [Firebase Emulator] Đã sao lưu dữ liệu an toàn vào seed-data.');
  }
  process.exit(code || 0);
});
