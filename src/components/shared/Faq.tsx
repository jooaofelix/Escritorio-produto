import { whatsappUrl } from '@/config/site';
import { faq } from '@/data/funnel';
import { Pill } from './Pill';

type Tone = 'light' | 'dark';

const styles: Record<Tone, { section: string; label: string; text: string; line: string; button: 'outline' | 'outline-dark' }> = {
  light: { section: 'bg-paper text-ink', label: 'text-soft', text: 'text-soft', line: 'border-line', button: 'outline' },
  dark: { section: 'on-dark bg-night text-paper', label: 'text-on-dark/80', text: 'text-on-dark', line: 'border-paper/15', button: 'outline-dark' },
};

/** Dúvidas frequentes (acordeão nativo) para tirar objeções antes do contato. */
export function Faq({ tone }: { tone: Tone }) {
  const s = styles[tone];
  return (
    <section id="duvidas" aria-labelledby="duvidas-titulo" className={`${s.section} py-section`}>
      <div className="container-page grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className={`text-label ${s.label}`}>Dúvidas</p>
          <h2 id="duvidas-titulo" className="mt-4 text-display-2">
            Antes de pedir o seu orçamento.
          </h2>
          <Pill href={whatsappUrl()} whatsapp tone={s.button} arrow="upright" className="mt-8">
            Tirar dúvidas no WhatsApp
          </Pill>
        </div>
        <ul role="list" className={`border-t lg:col-span-7 lg:col-start-6 ${s.line}`}>
          {faq.map((item) => (
            <li key={item.question} className={`border-b ${s.line}`}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-display-3 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="relative size-4 shrink-0 before:absolute before:inset-x-0 before:top-1/2 before:h-0.5 before:-translate-y-1/2 before:bg-current after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-current after:transition-transform after:duration-200 group-open:after:scale-y-0"
                  />
                </summary>
                <p className={`max-w-[60ch] pb-7 text-body ${s.text}`}>{item.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
