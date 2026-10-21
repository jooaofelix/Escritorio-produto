import { pageGrid } from './cx';

interface SectionIntroProps {
  /** id do `h2` (alvo do `aria-labelledby` da seção). */
  readonly id: string;
  readonly title: string;
  readonly lead: string;
}

/** `h2` + texto de apoio nas colunas 1–6. */
export function SectionIntro({ id, title, lead }: SectionIntroProps) {
  return (
    <div className={pageGrid}>
      <div className="col-span-4 md:col-span-6">
        <h2 id={id} className="text-display-lg">
          {title}
        </h2>
        <p className="measure mt-5 text-lead text-ink-soft">{lead}</p>
      </div>
    </div>
  );
}
