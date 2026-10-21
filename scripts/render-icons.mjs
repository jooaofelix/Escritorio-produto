// Rasteriza o ícone (cacto da logo) em PNG com o Chromium do Playwright.
// Uso: node scripts/render-icons.mjs <icon.svg> <pasta-saida>
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const [svgPath, outDir] = process.argv.slice(2);
const svg = readFileSync(svgPath, 'utf8');
const targets = [
  { file: 'icon-512.png', size: 512, bg: 'transparent', pad: 0.06 },
  { file: 'apple-touch-icon.png', size: 180, bg: '#FAF9F6', pad: 0.12 },
  { file: 'favicon-48.png', size: 48, bg: 'transparent', pad: 0 },
  { file: 'favicon-32.png', size: 32, bg: 'transparent', pad: 0 },
  { file: 'favicon-16.png', size: 16, bg: 'transparent', pad: 0 },
];

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const page = await browser.newPage();
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size });
  const inset = Math.round(t.size * t.pad);
  await page.setContent(
    `<html><body style="margin:0;background:${t.bg}">` +
      `<div style="width:${t.size}px;height:${t.size}px;padding:${inset}px;box-sizing:border-box">` +
      svg.replace('<svg ', '<svg width="100%" height="100%" ') +
      `</div></body></html>`,
  );
  await page.screenshot({ path: join(outDir, t.file), omitBackground: t.bg === 'transparent' });
}
await browser.close();
console.log(`icons: ${targets.length} png`);
