import { formatWhatsAppDisplay, hasWhatsAppNumber, whatsappUrl } from '@/config/site';
import { Pill } from '@/components/shared/Pill';

export function Quote() {
  return (
    <section id="orcamento" aria-labelledby="orcamento-titulo" className="on-dark bg-night pb-section text-paper">
      <div className="container-page">
        <div className="grid gap-10 border-t border-paper/12 pt-16 lg:grid-cols-12 lg:items-end lg:pt-24">
          <div className="lg:col-span-7">
            <div className="color-bar h-1 w-24" aria-hidden="true" />
            <h2 id="orcamento-titulo" className="mt-8 text-display-1">
              Vamos montar a Linha Office da sua empresa?
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-lead text-on-dark">
              Conte quais itens você quer e para quantas pessoas. A gente responde com o orçamento pelo WhatsApp.
            </p>
            <Pill href={whatsappUrl()} whatsapp size="lg" arrow="upright" className="mt-8 w-full sm:w-auto">
              Solicitar orçamento
            </Pill>
            {hasWhatsAppNumber && (
              <p className="mt-4 text-[0.875rem] text-on-dark">Atendimento direto pelo WhatsApp: {formatWhatsAppDisplay()}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
