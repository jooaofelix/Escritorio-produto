import { steps } from '@/data/steps';

type Tone = 'forest' | 'night';

const styles: Record<Tone, { section: string; label: string; number: string; text: string }> = {
  forest: { section: 'bg-forest', label: 'text-paper/65', number: 'text-sun', text: 'text-mist' },
  night: { section: 'bg-night-box', label: 'text-mint-ink', number: 'text-mint-ink', text: 'text-haze' },
};

/** "Como funciona": 4 etapas em sequência. */
export function ProcessSteps({ tone }: { tone: Tone }) {
  const s = styles[tone];
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className={`${s.section} py-section text-paper`}>
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className={`text-label ${s.label}`}>Como funciona</p>
            <h2 id="como-funciona-titulo" className="mt-4 text-display-2">
              Do primeiro contato ao produto pronto.
            </h2>
          </div>
          <p className={`text-lead lg:col-span-4 lg:col-start-9 ${s.text}`}>
            Um caminho simples para levar a sua marca aos produtos da sua empresa.
          </p>
        </div>
        <ol role="list" className="mt-14 grid gap-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t border-paper/15 pt-6">
              <span className={`block text-[2.5rem] leading-none font-black tabular-nums ${s.number}`} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 text-display-3">
                <span className="sr-only">{`Etapa ${i + 1}: `}</span>
                {step.title}
              </h3>
              <p className={`mt-3 max-w-[32ch] text-body ${s.text}`}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
