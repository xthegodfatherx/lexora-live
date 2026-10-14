const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const publicPort = String(process.env.PORT || 8083);

function start(name, cwd, env) {
  const child = spawn(process.execPath, ['server.js'], {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
  child.on('exit', (code) => {
    console.error(`${name} s'est arrêté (${code})`);
    process.exit(code || 1);
  });
}

start('arbitrage', path.join(root, 'backend', 'service-arbitrage'), { PORT: '8087' });
start('der', path.join(root, 'backend', 'service-der'), {
  PORT: '8086',
  GATEWAY_URL: `http://127.0.0.1:${publicPort}`,
});
start('gateway', path.join(root, 'backend', 'local-gateway'), {
  PORT: publicPort,
  WEB_ROOT: path.join(root, 'frontend', 'build'),
});
