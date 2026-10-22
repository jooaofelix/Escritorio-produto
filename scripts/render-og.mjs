// Gera as imagens de compartilhamento (1200x630) a partir do hero de cada página.
// Uso: npm run build && node scripts/render-og.mjs   (sobe o vite preview na porta 4191)
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4191;
const PAGES = [
  { path: '/', out: 'public/og-image.jpg' },
  { path: '/cinematografico/', out: 'public/og-cinematografico.jpg' },
];

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
try {
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const { path, out } of PAGES) {
    await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200); // entradas do hero concluídas
    await page.screenshot({ path: out, type: 'jpeg', quality: 86 });
    console.log(`og: ${out}`);
  }
  await browser.close();
} finally {
  server.kill();
}
