import { formatWhatsAppDisplay, hasWhatsAppNumber, whatsappUrl } from '@/config/site';
import { products } from '@/data/products';
import { Pill } from '@/components/shared/Pill';
import { ProductPicture, productById } from '@/components/shared/ProductPicture';

const TITLE = ['Uma marca forte', 'também se vê', 'nos detalhes.'];
const TAGS = ['Papelaria', 'Corporativo', 'Acessórios para escritório'];

const delay = (s: number) => ({ animationDelay: `${s}s` });

/** Hero da proposta 04 — promessa, prova visual e CTA de orçamento acima da dobra. */
export function Hero() {
  const agenda = productById(products, 'agenda-2027');
  return (
    <section aria-labelledby="hero-titulo" className="bg-paper text-ink">
      <div className="container-page grid gap-12 pt-10 pb-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-16 lg:pb-28">
        <div className="lg:col-span-6">
          <p
            className="enter-wipe inline-flex rounded-full bg-card px-4 py-2 text-label max-sm:text-[0.6875rem] max-sm:tracking-[0.08em]"
            style={delay(0.3)}
          >
            Produtos personalizados para empresas
          </p>
          <h1 id="hero-titulo" className="mt-7 text-display-1">
            {TITLE.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <span className="enter-rise block" style={delay(0.4 + i * 0.1)}>
                  {line}
                </span>
                {i < TITLE.length - 1 && ' '}
              </span>
            ))}
          </h1>
          <p className="enter-fade mt-6 measure text-lead text-soft" style={delay(0.8)}>
            Agendas, cadernos, brindes e acessórios para escritório com a identidade visual da sua empresa. Conte o que
            você precisa e receba o seu orçamento pelo WhatsApp.
          </p>
          <div className="enter-fade mt-10 flex flex-wrap items-center gap-3" style={delay(0.95)}>
            <Pill href={whatsappUrl()} whatsapp size="lg" arrow="upright">
              Solicitar orçamento
            </Pill>
            <Pill href="#produtos" tone="outline" size="lg" arrow="down">
              Ver produtos
            </Pill>
          </div>
          {hasWhatsAppNumber && (
            <p className="enter-fade mt-5 text-[0.875rem] text-soft" style={delay(1.05)}>
              Atendimento direto pelo WhatsApp: <span className="font-bold text-ink">{formatWhatsAppDisplay()}</span>
            </p>
          )}
        </div>

        <figure className="lg:col-span-6 lg:col-start-7 xl:col-span-5 xl:col-start-8">
          <div className="enter-settle rounded-md bg-card p-[3%]" style={delay(0.5)}>
            <div className="overflow-hidden rounded-xs bg-white">
              <ProductPicture
                product={agenda}
                sizes="(min-width: 1280px) 480px, (min-width: 1024px) 46vw, 100vw"
                loading="eager"
                className="block"
                imgClassName="aspect-[301/246] h-auto w-full object-cover"
              />
            </div>
          </div>
          <div className="enter-draw color-bar mt-5 h-1" style={delay(0.9)} aria-hidden="true" />
          <figcaption className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-label text-soft">
            {TAGS.map((tag, i) => (
              <span key={tag} className="enter-fade inline-flex gap-x-3" style={delay(1.0 + i * 0.06)}>
                {i > 0 && (
                  <span aria-hidden="true" className="text-ink/30">
                    /
                  </span>
                )}
                <span>{tag}</span>
              </span>
            ))}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
