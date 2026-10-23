import { expect, type Page } from '@playwright/test';

/** Número esperado nos links (o mesmo do `.env`); sobrescreva com E2E_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER = process.env.E2E_WHATSAPP_NUMBER ?? '5512992241150';
export const DEFAULT_MESSAGE = 'Olá! Conheci a Linha Office da Coloridamente pelo site e gostaria de solicitar um orçamento.';
export const productMessage = (name: string) =>
  `Olá! Conheci a Linha Office da Coloridamente pelo site e gostaria de solicitar um orçamento de: ${name}.`;

export const PAGES = [
  { path: '/', name: 'institucional', h1: 'Linha Office' },
  { path: '/cinematografico/', name: 'cinematografico', h1: 'Quando a sua marca ganha forma.' },
] as const;

export const PRODUCTS = [
  'Agenda 2027',
  'Kit de acessórios para escritório',
  'Caderno com capa personalizada',
  'Caderno pautado personalizado',
];

export const OCCASIONS = ['Boas-vindas à equipe', 'Presentes para clientes', 'Eventos e feiras', 'Dia a dia do escritório'];

/** Toda mensagem de WhatsApp começa assim (padrão, por produto ou por ocasião). */
export const MESSAGE_PREFIX = 'Olá! Conheci a Linha Office da Coloridamente pelo site e gostaria de solicitar um orçamento';

/** Coleta erros de console, exceções e respostas com falha durante o teste. */
export function trackProblems(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console.error: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400 && new URL(r.url()).hostname === 'localhost') problems.push(`${r.status()} ${r.url()}`);
  });
  page.on('requestfailed', (r) => {
    if (new URL(r.url()).hostname === 'localhost') problems.push(`requestfailed ${r.url()}`);
  });
  return problems;
}

/** Rola a página inteira (dispara lazy loading e entradas por scroll). */
export async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = (page.viewportSize()?.height ?? 800) / 2;
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }
  await page.waitForLoadState('networkidle');
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}
