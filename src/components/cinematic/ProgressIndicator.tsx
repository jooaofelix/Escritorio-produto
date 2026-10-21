import { chapters } from '@/data/chapters';

interface ProgressIndicatorProps {
  /** Recebe o elemento de preenchimento de cada segmento (animado em scaleX pela timeline). */
  readonly fillRef: (index: number, element: HTMLSpanElement | null) => void;
  readonly className?: string;
}

/**
 * 4 segmentos que, juntos, formam uma `color-bar` contínua: cada um mostra a sua fatia
 * (background-size 400%) e enche com o progresso do seu capítulo. Decorativo.
 */
export function ProgressIndicator({ fillRef, className = '' }: ProgressIndicatorProps) {
  const last = Math.max(1, chapters.length - 1);
  return (
    <div aria-hidden="true" className={`flex gap-1.5 ${className}`}>
      {chapters.map((chapter, i) => (
        <span key={chapter.id} className="relative h-[3px] w-8 overflow-hidden bg-ink/20 md:w-10">
          <span
            ref={(element) => fillRef(i, element)}
            className="color-bar absolute inset-0 origin-left"
            style={{
              backgroundSize: '400% 100%',
              backgroundPosition: `${((i / last) * 100).toFixed(2)}% 0`,
              transform: 'scaleX(0)',
            }}
          />
        </span>
      ))}
    </div>
  );
}
