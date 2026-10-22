// Render determinístico da abertura e do encerramento, quadro a quadro.
// Uso (na raiz do projeto): node video/motion/render.mjs intro|outro|all
//
// Cada cena expõe window.renderAt(t) (estado = função pura de t) e window.sceneReady
// (fontes + imagens decodificadas). Aqui só chamamos renderAt(i / fps) e fotografamos.
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = '/home/user/Escritorio-produto';
const { chromium } = createRequire(path.join(ROOT, 'package.json'))('@playwright/test');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(HERE, '..', 'build');
const SCENES = {
  intro: { page: 'intro.html', frames: 66 },
  outro: { page: 'outro.html', frames: 105 },
};
const FPS = 30;
const W = 1080, H = 1920;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

// Servidor estático mínimo na raiz do projeto (evita restrições de file:// para fontes/SVG).
function serve(root) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel === '/favicon.ico') { res.writeHead(204).end(); return; }
    const file = path.normalize(path.join(root, rel));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404).end(); return; }
      res.writeHead(200, {
        'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store',
      });
      res.end(buf);
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function renderScene(browser, base, name) {
  const scene = SCENES[name];
  const outDir = path.join(BUILD, name);
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(outDir)) if (/^\d{4}\.png$/.test(f)) fs.unlinkSync(path.join(outDir, f));

  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', (r) => errors.push('request failed: ' + r.url()));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });

  const rel = path.relative(ROOT, path.join(HERE, scene.page)).split(path.sep).join('/');
  await page.goto(`${base}/${rel}`, { waitUntil: 'load' });
  await page.evaluate(() => window.sceneReady);
  if (errors.length) throw new Error(`${name}: ${errors.join(' | ')}`);

  const t0 = Date.now();
  for (let i = 0; i < scene.frames; i++) {
    const t = i / FPS;
    await page.evaluate((tt) => window.renderAt(tt), t);
    const file = path.join(outDir, String(i + 1).padStart(4, '0') + '.png');
    await page.screenshot({ path: file, type: 'png', fullPage: false, animations: 'disabled', caret: 'hide' });
  }
  await page.close();
  if (errors.length) throw new Error(`${name}: ${errors.join(' | ')}`);

  // PNG opaco (RGB, sem canal alfa) — não altera valores de pixel.
  execFileSync('mogrify', ['-alpha', 'off', '-define', 'png:color-type=2', path.join(outDir, '*.png')]);
  console.log(`${name}: ${scene.frames} quadros → ${path.relative(ROOT, outDir)}/ (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}

const arg = process.argv[2] || 'all';
const names = arg === 'all' ? Object.keys(SCENES) : [arg];
for (const n of names) if (!SCENES[n]) { console.error(`cena desconhecida: ${n} (use intro|outro|all)`); process.exit(2); }

const server = await serve(ROOT);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars'],
});
try {
  for (const n of names) await renderScene(browser, base, n);
} finally {
  await browser.close();
  server.close();
}
