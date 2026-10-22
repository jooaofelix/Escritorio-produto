import { whatsappUrl } from '@/config/site';
import { products } from '@/data/products';
import { Pill } from '@/components/shared/Pill';
import { ProductPicture, productById } from '@/components/shared/ProductPicture';

const TITLE = ['Uma marca forte', 'também se vê', 'nos detalhes.'];
const TAGS = ['Papelaria', 'Corporativo', 'Impressão 3D'];

const delay = (s: number) => ({ animationDelay: `${s}s` });

/** Hero da proposta 04 — Institucional premium. Entrada orquestrada uma única vez no carregamento. */
export function Hero() {
  const agenda = productById(products, 'agenda-2027');
  return (
    <section aria-labelledby="hero-titulo" className="bg-forest text-paper">
      <div className="container-page grid gap-12 pt-12 pb-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-20 lg:pb-28">
        <div className="lg:col-span-6">
          <p className="enter-wipe inline-flex rounded-full bg-paper/10 px-4 py-2 text-label max-sm:text-[0.6875rem] max-sm:tracking-[0.08em]" style={delay(0.3)}>
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
          <p className="enter-fade mt-6 measure text-lead text-mist" style={delay(0.8)}>
            Soluções de papelaria e impressão 3D desenvolvidas para dar vida à identidade da sua empresa.
          </p>
          <div className="enter-pop mt-10 origin-left" style={delay(0.95)}>
            <Pill href={whatsappUrl()} whatsapp tone="sun" size="lg" arrow="upright">
              Solicitar proposta
            </Pill>
          </div>
        </div>

        <figure className="lg:col-span-6 lg:col-start-7 xl:col-span-5 xl:col-start-8">
          <div className="enter-settle overflow-hidden rounded-sm bg-paper" style={delay(0.5)}>
            <ProductPicture
              product={agenda}
              sizes="(min-width: 1280px) 480px, (min-width: 1024px) 46vw, 100vw"
              loading="eager"
              className="block"
              imgClassName="aspect-[301/246] h-auto w-full object-cover"
            />
          </div>
          <div className="enter-draw mt-4 h-px bg-paper/25" style={delay(0.9)} />
          <figcaption className="mt-3 flex flex-wrap gap-x-3 text-label">
            {TAGS.map((tag, i) => (
              <span key={tag} className="enter-fade inline-flex gap-x-3" style={delay(1.0 + i * 0.06)}>
                {i > 0 && (
                  <span aria-hidden="true" className="text-paper/60">
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
