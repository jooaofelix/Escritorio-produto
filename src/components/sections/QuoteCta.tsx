import { whatsappUrl } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { pageGrid } from '@/components/ui/cx';

/** Único bloco escuro: `surface-ink` troca o anel de foco para sun. */
export function QuoteCta() {
  return (
    <section id="orcamento" aria-labelledby="orcamento-titulo" className="surface-ink py-section">
      <div className="container-page">
        <div className={`${pageGrid} gap-y-8`}>
          <h2 id="orcamento-titulo" className="col-span-4 text-display-lg md:col-span-7 lg:col-span-7">
            Vamos criar algo com a sua marca?
          </h2>
          <div className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8 lg:self-end">
            <p className="measure text-lead text-paper-soft">
              Conte o que você precisa e vamos transformar sua ideia em um produto personalizado.
            </p>
            <Button href={whatsappUrl()} whatsapp arrow className="mt-8 w-full sm:w-auto">
              Solicitar meu orçamento
            </Button>
            <p className="mt-4 text-small text-paper-soft">O atendimento é feito pelo WhatsApp.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
