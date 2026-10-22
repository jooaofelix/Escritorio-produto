// Renderiza composition/index.html quadro a quadro (Chromium headless + ffmpeg).
//
//   node scripts/render.mjs                    vídeo mudo em out/.video.mp4 + audio/sfx.json
//   node scripts/render.mjs --stills 1,8.5,30  quadros PNG em out/stills/ para revisão
//   opções: --fps 30  --workers 4
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const FPS = Number(opt('fps', 30));
const WORKERS = Number(opt('workers', 4));
const STILLS = opt('stills', null);
const URL_PAGE = pathToFileURL(path.join(ROOT, 'composition', 'index.html')).href;

function loadPlaywright() {
  const bases = [ROOT, path.join(ROOT, '..', '..')];
  try { bases.push(execSync('npm root -g').toString().trim()); } catch { /* sem npm global */ }
  for (const base of bases) {
    try { return createRequire(path.join(base, 'noop.js'))('playwright'); } catch { /* tenta o próximo */ }
  }
  throw new Error('Playwright não encontrado: rode "npm install" na raiz do repositório.');
}
const { chromium } = loadPlaywright();

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (err) => { console.error('erro na página:', err.message); process.exitCode = 1; });
  await page.goto(URL_PAGE);
  await page.evaluate(() => window.__ready);
  const cdp = await page.context().newCDPSession(page);
  const shot = async (t, format = 'jpeg') => {
    await page.evaluate((x) => window.__seek(x), t);
    const { data } = await cdp.send('Page.captureScreenshot', format === 'png' ? { format } : { format, quality: 94 });
    return Buffer.from(data, 'base64');
  };
  return { page, shot };
}

function encoder(file) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg saiu com ${c}`)))));
  const write = (buf) => new Promise((res) => { if (ff.stdin.write(buf)) res(); else ff.stdin.once('drain', res); });
  return { write, end: () => { ff.stdin.end(); return done; } };
}

const browser = await chromium.launch({ args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb'] });
try {
  const probe = await openPage(browser);
  const duration = await probe.page.evaluate(() => window.__duration);
  const sfx = await probe.page.evaluate(() => window.__sfx);

  if (STILLS) {
    const dir = path.join(ROOT, 'out', 'stills');
    fs.mkdirSync(dir, { recursive: true });
    for (const s of STILLS.split(',').map(Number)) {
      const png = await probe.shot(s, 'png');
      const name = path.join(dir, `t${s.toFixed(2).padStart(7, '0')}.png`);
      fs.writeFileSync(name, png);
      console.log(name);
    }
  } else {
    fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'audio', 'sfx.json'), JSON.stringify({ duracao: duration, cues: sfx }, null, 2));
    await probe.page.close();

    const total = Math.ceil(duration * FPS);
    const tmp = path.join(ROOT, 'out', '.partes');
    fs.mkdirSync(tmp, { recursive: true });
    const per = Math.ceil(total / WORKERS);
    const started = Date.now();
    let feitos = 0;
    const parts = await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
      const a = w * per, b = Math.min(total, a + per);
      const file = path.join(tmp, `parte${w}.mp4`);
      if (a >= b) return null;
      const { shot } = await openPage(browser);
      const enc = encoder(file);
      for (let f = a; f < b; f++) {
        await enc.write(await shot(f / FPS));
        if (++feitos % 150 === 0) {
          const s = (Date.now() - started) / 1000;
          console.log(`${feitos}/${total} quadros · ${s.toFixed(0)}s · faltam ~${((total - feitos) * s / feitos).toFixed(0)}s`);
        }
      }
      await enc.end();
      return file;
    }));
    const list = path.join(tmp, 'lista.txt');
    fs.writeFileSync(list, parts.filter(Boolean).map((p) => `file '${p}'`).join('\n'));
    execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i "${list}" -c copy "${path.join(ROOT, 'out', '.video.mp4')}"`);
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`vídeo: ${total} quadros em ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
} finally {
  await browser.close();
}
