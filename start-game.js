const { spawn } = require('child_process');
const { exec } = require('child_process');

const environment = { ...process.env };
if (!environment.PORT) {
  environment.PORT = '0';
}

const server = spawn(process.execPath, ['server.js'], {
  cwd: __dirname,
  env: environment,
  stdio: ['ignore', 'pipe', 'inherit'],
});

let opened = false;
let output = '';

function openBrowser(url) {
  if (process.platform === 'win32') {
    exec(`start "" "${url}"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

server.stdout.on('data', (data) => {
  process.stdout.write(data);
  output += data.toString();
  const match = output.match(/http:\/\/localhost:(\d+)\//);
  if (match && !opened) {
    opened = true;
    openBrowser(`http://localhost:${match[1]}/`);
  }
  if (output.length > 2000) {
    output = output.slice(-1000);
  }
});

server.on('exit', (code) => {
  process.exit(code || 0);
});

process.on('SIGINT', () => server.kill('SIGINT'));
process.on('SIGTERM', () => server.kill('SIGTERM'));