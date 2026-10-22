import { formatWhatsAppDisplay, hasWhatsAppNumber, whatsappUrl } from '@/config/site';
import { Pill } from '@/components/shared/Pill';

export function QuoteBand() {
  return (
    <section id="orcamento" aria-labelledby="orcamento-titulo" className="on-light bg-sun py-section text-ink">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-end">
        <h2 id="orcamento-titulo" className="text-display-1 lg:col-span-7">
          Vamos criar algo com a sua marca?
        </h2>
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="text-lead">Conte o que você precisa e vamos transformar sua ideia em um produto personalizado.</p>
          <Pill href={whatsappUrl()} whatsapp tone="ink" size="lg" arrow="upright" className="mt-8 w-full sm:w-auto">
            Solicitar proposta
          </Pill>
          {hasWhatsAppNumber && (
            <p className="mt-4 text-[0.875rem]">Atendimento pelo WhatsApp: {formatWhatsAppDisplay()}</p>
          )}
        </div>
      </div>
    </section>
  );
}
