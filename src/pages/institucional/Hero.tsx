import { formatWhatsAppDisplay, hasWhatsAppNumber, site, whatsappUrl } from '@/config/site';
import { products } from '@/data/products';
import { Pill } from '@/components/shared/Pill';
import { ProductPicture, productById } from '@/components/shared/ProductPicture';

/** Vitrine do banner: os itens da linha lado a lado (fotos com fundo branco, como o banner). */
const LINEUP = [
  { id: 'agenda-2027', label: 'Agenda' },
  { id: 'caderno-espiral-capa', label: 'Caderno' },
  { id: 'caderno-aberto-pautado', label: 'Páginas com ou sem pauta' },
  { id: 'kit-acessorios-escritorio', label: 'Acessórios para escritório' },
];

const delay = (s: number) => ({ animationDelay: `${s}s` });

/** Banner de abertura: o nome da Linha Office em destaque, os produtos e o CTA acima da dobra. */
export function Hero() {
  const [first, second] = site.line.split(' ');
  return (
    <section aria-labelledby="hero-titulo" className="bg-paper text-ink">
      {/* Banner mais largo que o conteúdo das seções e com a altura da primeira tela no desktop. */}
      <div className="mx-auto w-full max-w-[120rem] px-gutter pt-3 pb-16 lg:pt-4 lg:pb-24">
        <div className="relative flex flex-col overflow-hidden rounded-md border border-line bg-white px-5 pt-9 pb-7 sm:px-10 lg:min-h-[calc(100svh-var(--spacing-header)-1.25rem)] lg:px-16 lg:pt-12 lg:pb-10">
          <div className="enter-draw color-bar absolute inset-x-0 top-0 h-1.5" style={delay(0.2)} aria-hidden="true" />

          <p className="enter-fade text-label text-soft" style={delay(0.25)}>
            Coloridamente apresenta
          </p>
          <h1
            id="hero-titulo"
            className="mt-3 text-[clamp(3.75rem,1.2rem+10.6vw,14rem)] leading-[0.92] font-black tracking-[-0.035em]"
          >
            <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
              <span className="enter-rise inline-block" style={delay(0.35)}>
                {first}
              </span>
            </span>{' '}
            <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
              <span className="enter-rise inline-block" style={delay(0.45)}>
                {second}
              </span>
            </span>
          </h1>

          <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-12 lg:items-end">
            <p className="enter-fade text-lead text-soft lg:col-span-6" style={delay(0.7)}>
              <strong className="font-black text-ink">Uma marca forte também se vê nos detalhes.</strong> Agenda,
              cadernos e acessórios para escritório com a identidade visual da sua empresa.
            </p>
            <div
              className="enter-fade flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-6 lg:justify-end"
              style={delay(0.85)}
            >
              <Pill href={whatsappUrl()} whatsapp size="lg" arrow="upright">
                Quero a {site.line}
              </Pill>
              <Pill href="#produtos" tone="outline" size="lg" arrow="down">
                Ver a linha
              </Pill>
            </div>
          </div>

          <ul role="list" className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 lg:mt-auto lg:grid-cols-4 lg:gap-x-10 lg:pt-12">
            {LINEUP.map((item, i) => {
              const product = productById(products, item.id);
              return (
                <li key={item.id} className="enter-settle" style={delay(0.55 + i * 0.1)}>
                  <ProductPicture
                    product={product}
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    loading="eager"
                    className="block"
                    imgClassName="aspect-[4/3] h-auto w-full object-contain brightness-[1.04] contrast-[1.04]"
                  />
                  <p className="mt-3 border-t border-line pt-3 text-label text-soft">{item.label}</p>
                </li>
              );
            })}
          </ul>

          {hasWhatsAppNumber && (
            <p className="enter-fade mt-8 text-[0.875rem] text-soft" style={delay(1.1)}>
              Atendimento direto pelo WhatsApp: <span className="font-bold text-ink">{formatWhatsAppDisplay()}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
