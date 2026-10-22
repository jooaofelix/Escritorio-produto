import { useLayoutEffect, useRef } from 'react';
import { productMessage, whatsappUrl } from '@/config/site';
import { getCategory } from '@/data/categories';
import { products } from '@/data/products';
import { gsap } from '@/lib/gsap';
import { Arrow } from '@/components/shared/Arrow';
import { ProductPicture } from '@/components/shared/ProductPicture';
import { OpensWhatsApp, whatsappLinkProps } from '@/components/shared/whatsapp';

/** Produtos em sequência: cada um entra com a câmera "se aproximando" do cartão. */
export function ProductReel() {
  const list = useRef<HTMLOListElement>(null);

  useLayoutEffect(() => {
    if (!list.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reel]').forEach((row) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: 'top 82%', toggleActions: 'play none none none' },
        });
        tl.from(row.querySelector('[data-reel-card]'), { y: 48, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
          .from(row.querySelector('[data-reel-card] img'), { scale: 1.15, duration: 1.2, ease: 'power2.out' }, 0)
          .from(row.querySelectorAll('[data-reel-text] > *'), { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }, 0.15);
      });
    }, list);
    return () => ctx.revert();
  }, []);

  return (
    <section id="produtos" aria-labelledby="produtos-titulo" className="bg-night py-section text-paper">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-label text-mint-ink">Produtos</p>
            <h2 id="produtos-titulo" className="mt-4 text-display-2">
              Cada produto, um detalhe da sua marca.
            </h2>
          </div>
          <p className="text-lead text-haze lg:col-span-4 lg:col-start-9">
            Exemplos de produtos personalizados com a identidade visual de uma empresa.
          </p>
        </div>

        <ol ref={list} role="list" className="mt-16 space-y-20 lg:mt-24 lg:space-y-32">
          {products.map((product, i) => {
            const flip = i % 2 === 1;
            return (
              <li key={product.id} data-reel className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
                <div
                  data-reel-card
                  className={`rounded-md bg-card p-[2.6%] lg:col-span-7 ${flip ? 'lg:col-start-6 lg:row-start-1' : ''}`}
                >
                  <div className="overflow-hidden rounded-xs bg-white">
                    <ProductPicture
                      product={product}
                      sizes="(min-width: 1024px) 54vw, 100vw"
                      imgClassName="aspect-[354/252] h-auto w-full object-contain"
                    />
                  </div>
                </div>
                <div
                  data-reel-text
                  className={`lg:col-span-4 ${flip ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-9'}`}
                >
                  <p className="text-label text-mint-ink" aria-hidden="true">
                    {`${String(i + 1).padStart(2, '0')} / ${String(products.length).padStart(2, '0')}`}
                  </p>
                  <h3 className="mt-4 text-display-2">{product.name}</h3>
                  <p className="mt-2 text-label text-haze/80">{getCategory(product.category).name}</p>
                  <p className="mt-4 max-w-[40ch] text-body text-haze">{product.description}</p>
                  <a
                    href={whatsappUrl(productMessage(product.name))}
                    {...whatsappLinkProps}
                    className="mt-6 inline-flex items-center gap-2 font-bold text-sun underline decoration-sun/40 underline-offset-[6px] transition-colors hover:decoration-sun"
                  >
                    Solicitar orçamento
                    <Arrow direction="upright" />
                    <span className="sr-only">{` de ${product.name}`}</span>
                    <OpensWhatsApp />
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
