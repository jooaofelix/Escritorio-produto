import type { PatchColor } from '@/data/categories';
import { cx } from './cx';

/** Mapa literal: o Tailwind precisa enxergar as classes completas. */
const patchColors: Record<PatchColor, string> = {
  coral: 'bg-coral',
  olive: 'bg-olive',
  sun: 'bg-sun',
  mint: 'bg-mint',
};

interface PatchProps {
  readonly color: PatchColor;
  readonly className?: string;
}

/** Quadrado de 12px que identifica a categoria. Decorativo: o nome da categoria sempre vem ao lado. */
export function Patch({ color, className }: PatchProps) {
  return (
    <span
      aria-hidden="true"
      className={cx('block h-3 w-3 shrink-0 rounded-[1px] ring-1 ring-ink/15 ring-inset', patchColors[color], className)}
    />
  );
}
