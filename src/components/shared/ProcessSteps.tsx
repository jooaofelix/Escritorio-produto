import { whatsappUrl } from '@/config/site';
import { steps } from '@/data/steps';
import { Pill } from './Pill';

type Tone = 'graphite' | 'night';

const styles: Record<Tone, { section: string; number: string }> = {
  graphite: { section: 'bg-graphite', number: 'text-coral' },
  night: { section: 'bg-night-box', number: 'text-mint-ink' },
};

/** "Como funciona": 4 etapas em sequência e o convite para começar. */
export function ProcessSteps({ tone }: { tone: Tone }) {
  const s = styles[tone];
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className={`on-dark ${s.section} py-section text-paper`}>
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-label text-on-dark/80">Como funciona</p>
            <h2 id="como-funciona-titulo" className="mt-4 text-display-2">
              Do primeiro contato ao produto pronto.
            </h2>
          </div>
          <p className="text-lead text-on-dark lg:col-span-4 lg:col-start-9">
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
              <p className="mt-3 max-w-[32ch] text-body text-on-dark">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 flex flex-col items-start gap-4 border-t border-paper/15 pt-10 sm:flex-row sm:items-center sm:justify-between lg:mt-20">
          <p className="text-display-3">Comece pelo primeiro passo: conte a sua ideia.</p>
          <Pill href={whatsappUrl()} whatsapp size="lg" arrow="upright">
            Solicitar orçamento
          </Pill>
        </div>
      </div>
    </section>
  );
}
