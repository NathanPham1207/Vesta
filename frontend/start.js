/**
 * Auto-detect local WiFi IP and start Expo with the correct LAN address.
 */
const { networkInterfaces } = require('os');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

const ip = getLocalIP();

if (!ip) {
  console.warn('[start] Could not detect local IP — falling back to localhost.');
} else {
  console.log(`[start] Detected local IP: ${ip}`);
}

// Set directly on process.env so child process inherits it
process.env.REACT_NATIVE_PACKAGER_HOSTNAME = ip ?? 'localhost';

// Update .env file as well
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('REACT_NATIVE_PACKAGER_HOSTNAME=')) {
    envContent = envContent.replace(
      /^REACT_NATIVE_PACKAGER_HOSTNAME=.*/m,
      `REACT_NATIVE_PACKAGER_HOSTNAME=${ip}`,
    );
  } else {
    envContent = `REACT_NATIVE_PACKAGER_HOSTNAME=${ip}\n` + envContent;
  }
  fs.writeFileSync(envPath, envContent);
}

console.log(`[start] Starting Expo with REACT_NATIVE_PACKAGER_HOSTNAME=${ip ?? 'localhost'}`);
console.log(`[start] QR code should show: exp://${ip ?? 'localhost'}:8081`);

// Explicitly build the child environment so Windows shell:true inherits it reliably
const childEnv = {
  ...process.env,
  REACT_NATIVE_PACKAGER_HOSTNAME: ip ?? 'localhost',
};

const proc = spawn('npx', ['expo', 'start', '--lan'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
  env: childEnv,
});

proc.on('exit', (code) => process.exit(code ?? 0));
