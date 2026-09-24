/**
 * PropCare - zero-account live tunnel.
 *
 * Starts the PropCare server locally and exposes it through a Cloudflare
 * Quick Tunnel (trycloudflare.com). No account, no API key, no paid service:
 * the cloudflared binary is downloaded automatically on first use.
 *
 * Usage:
 *   npm run tunnel
 *
 * Caveats:
 *   - The public URL only works while this process is running on your machine.
 *   - The URL is random and changes every time you restart.
 */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');

const REPO_ROOT = path.join(__dirname, '..');
const TOOL_DIR = path.join(REPO_ROOT, '.tooling');
const PORT = process.env.PORT || 8124;
const LOCAL_URL = `http://127.0.0.1:${PORT}`;

const RELEASE_BASE =
  'https://github.com/cloudflare/cloudflared/releases/latest/download';

const URL_PATTERN = /(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/i;

function platformAsset() {
  const arch = os.arch();
  const osName = os.platform();
  const builds = {
    win32: { x64: 'cloudflared-windows-amd64.exe', arm64: 'cloudflared-windows-arm64.exe' },
    linux: { x64: 'cloudflared-linux-amd64', arm64: 'cloudflared-linux-arm64' },
    darwin: { x64: 'cloudflared-darwin-amd64', arm64: 'cloudflared-darwin-arm64' },
  };
  const asset = builds[osName] && builds[osName][arch];
  if (!asset) {
    throw new Error(
      `No cloudflared build is available for ${osName}/${arch}. ` +
        'Install cloudflared yourself and make sure it is on your PATH.'
    );
  }
  return asset;
}

async function downloadCloudflared(binPath, asset) {
  const url = `${RELEASE_BASE}/${asset}`;
  process.stdout.write(`[tunnel] downloading cloudflared...\n`);
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Download failed: ${res.status} ${res.statusText} for ${url}`);
  }
  fs.mkdirSync(TOOL_DIR, { recursive: true });
  const tmp = `${binPath}.part`;
  const file = fs.createWriteStream(tmp);
  await new Promise((resolve, reject) => {
    Readable.fromWeb(res.body).pipe(file);
    file.on('close', resolve);
    file.on('error', reject);
  });
  fs.renameSync(tmp, binPath);
  if (process.platform !== 'win32') {
    fs.chmodSync(binPath, 0o755);
  }
  process.stdout.write(`[tunnel] cloudflared ready\n`);
}

function run(command, args, env = {}) {
  return spawn(command, args, {
    env: { ...process.env, ...env },
    cwd: REPO_ROOT,
  });
}

async function waitForServer(server) {
  process.stdout.write(`[tunnel] waiting for the PropCare server on ${LOCAL_URL}...\n`);
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`PropCare server exited early with code ${server.exitCode}.`);
    }
    try {
      const res = await fetch(`${LOCAL_URL}/api/health`);
      if (res.ok) return;
    } catch (e) {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Timed out waiting for the PropCare server to start.');
}

function openTunnel(bin, onUrl) {
  process.stdout.write('[tunnel] opening a free Cloudflare quick tunnel...\n');
  const tunnel = run(bin, ['tunnel', '--no-autoupdate', '--url', LOCAL_URL]);

  const scan = (chunk) => {
    const match = String(chunk).match(URL_PATTERN);
    if (match && !onUrl.called) {
      onUrl.called = true;
      onUrl(match[1]);
    }
  };

  let buf = '';
  [tunnel.stdout, tunnel.stderr].forEach((stream) => {
    if (!stream) return;
    stream.on('data', (chunk) => {
      buf += String(chunk);
      while (buf.length > 65536) buf = buf.slice(buf.length - 65536);
      scan(buf);
    });
  });

  tunnel.on('exit', (code) => {
    if (!onUrl.called) {
      process.stderr.write(`[tunnel] cloudflared exited unexpectedly (code ${code}).\n`);
      process.exit(1);
    }
  });

  return tunnel;
}

async function main() {
  process.stdout.write('[tunnel] PropCare zero-account tunnel\n');

  const bin = findAllInPath();
  let cloudflared;
  if (bin) {
    process.stdout.write(`[tunnel] using cloudflared from PATH\n`);
    cloudflared = bin;
  } else {
    const asset = platformAsset();
    const binPath = path.join(TOOL_DIR, `cloudflared-${asset}`);
    if (!fs.existsSync(binPath)) {
      await downloadCloudflared(binPath, asset);
    }
    cloudflared = binPath;
  }

  const env = {};
  if (!process.env.JWT_SECRET) {
    env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    process.stdout.write('[tunnel] generated a temporary JWT_SECRET\n');
  }
  env.PORT = String(PORT);

  const server = run(
    process.execPath,
    ['--experimental-sqlite', 'server.js'],
    env
  );
  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);

  await waitForServer(server);

  let tunnel;
  const cleanup = () => {
    try { tunnel && tunnel.kill('SIGTERM'); } catch (e) { /* noop */ }
    try { server.kill('SIGTERM'); } catch (e) { /* noop */ }
    setTimeout(() => process.exit(0), 300).unref();
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  tunnel = openTunnel(cloudflared, (url) => {
    process.stdout.write('\n');
    process.stdout.write('===== PropCare is live =====\n');
    process.stdout.write(`App     ${url}\n`);
    process.stdout.write(`Health  ${url}/api/health\n`);
    process.stdout.write('-----------------------------\n');
    process.stdout.write('Keep this process running. Press Ctrl+C to stop.\n\n');
  });
}

function findAllInPath() {
  const name = process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared';
  const dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  return dirs.map((d) => path.join(d, name)).find((candidate) => fs.existsSync(candidate)) || null;
}

main().catch((err) => {
  process.stderr.write(`[tunnel] ${err.message}\n`);
  process.exit(1);
});