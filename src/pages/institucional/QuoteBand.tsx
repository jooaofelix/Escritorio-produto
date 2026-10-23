import { formatWhatsAppDisplay, hasWhatsAppNumber, whatsappUrl } from '@/config/site';
import { Pill } from '@/components/shared/Pill';

/** Ação: fechamento do funil. */
export function QuoteBand() {
  return (
    <section id="orcamento" aria-labelledby="orcamento-titulo" className="bg-blush-soft py-section text-ink">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <div className="color-bar h-1 w-24" aria-hidden="true" />
          <h2 id="orcamento-titulo" className="mt-8 text-display-1">
            Vamos montar a Linha Office da sua empresa?
          </h2>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="text-lead">Conte quais itens você quer e para quantas pessoas. A gente responde com o orçamento pelo WhatsApp.</p>
          <Pill href={whatsappUrl()} whatsapp tone="ink" size="lg" arrow="upright" className="mt-8 w-full sm:w-auto">
            Solicitar orçamento
          </Pill>
          {hasWhatsAppNumber && (
            <p className="mt-4 text-[0.875rem]">Atendimento direto pelo WhatsApp: {formatWhatsAppDisplay()}</p>
          )}
        </div>
      </div>
    </section>
  );
}
