/** Junta classes condicionais. As classes em si continuam literais (o Tailwind precisa vê-las inteiras). */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Grid da página: 4 colunas (< md, gap 16) / 8 (md, gap 24) / 12 (≥ lg, gap 32). */
export const pageGrid = 'grid grid-cols-4 gap-x-4 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12 lg:gap-x-8';
