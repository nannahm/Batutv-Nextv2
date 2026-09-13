import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
let port = '3000';
let hostname = '0.0.0.0';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-p' || arg === '--port') {
    if (args[i + 1] && /^\d+$/.test(args[i + 1])) {
      port = args[i + 1];
      i++;
    }
  } else if (/^--port=(\d+)$/.test(arg)) {
    port = arg.split('=')[1];
  } else if (/^\d+$/.test(arg)) {
    // Positional number passed by npm (e.g. from npm run dev --port 3000)
    port = arg;
  } else if (arg === '-H' || arg === '--hostname') {
    if (args[i + 1]) {
      hostname = args[i + 1];
      i++;
    }
  } else if (/^--hostname=(.+)$/.test(arg)) {
    hostname = arg.split('=')[1];
  }
}

const child = spawn(
  'npx',
  ['next', 'dev', '-H', hostname, '-p', port, '--webpack'],
  { stdio: 'inherit', env: { ...process.env, PORT: port, HOSTNAME: hostname } }
);

function cleanup(signal) {
  if (child && !child.killed) {
    try {
      child.kill(signal);
    } catch {
      // Ignore cleanup error
    }
  }
}

process.on('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));
process.on('exit', () => cleanup('SIGTERM'));

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
