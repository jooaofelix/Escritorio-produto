import { formatWhatsAppDisplay, hasWhatsAppNumber, whatsappUrl } from '@/config/site';
import { Pill } from '@/components/shared/Pill';

export function Quote() {
  return (
    <section id="orcamento" aria-labelledby="orcamento-titulo" className="bg-night pb-section text-paper">
      <div className="container-page">
        <div className="grid gap-10 border-t border-paper/12 pt-16 lg:grid-cols-12 lg:items-end lg:pt-24">
          <div className="lg:col-span-7">
            <div className="color-bar h-1 w-24" aria-hidden="true" />
            <h2 id="orcamento-titulo" className="mt-8 text-display-1">
              Vamos criar algo com a sua marca?
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-lead text-haze">
              Conte o que você precisa e vamos transformar sua ideia em um produto personalizado.
            </p>
            <Pill href={whatsappUrl()} whatsapp tone="sun" size="lg" arrow="upright" className="mt-8 w-full sm:w-auto">
              Solicitar proposta
            </Pill>
            {hasWhatsAppNumber && (
              <p className="mt-4 text-[0.875rem] text-haze">Atendimento pelo WhatsApp: {formatWhatsAppDisplay()}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
