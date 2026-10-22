import { productMessage, whatsappUrl } from '@/config/site';
import { getCategory } from '@/data/categories';
import { products } from '@/data/products';
import { Arrow } from '@/components/shared/Arrow';
import { ProductPicture } from '@/components/shared/ProductPicture';
import { OpensWhatsApp, whatsappLinkProps } from '@/components/shared/whatsapp';

/** Galeria orientada a dados: os 2 primeiros produtos em destaque, os demais em 3 colunas. */
export function Products() {
  return (
    <section id="produtos" aria-labelledby="produtos-titulo" className="on-light border-t border-line py-section">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-label text-soft">Produtos</p>
            <h2 id="produtos-titulo" className="mt-4 text-display-2">
              Escolha o ponto de partida.
            </h2>
          </div>
          <p className="text-lead text-soft lg:col-span-4 lg:col-start-9">
            Exemplos de produtos personalizados com a identidade visual de uma empresa.
          </p>
        </div>
        <ul role="list" className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-6">
          {products.map((product, i) => {
            const wide = i < 2;
            return (
              <li key={product.id} className={`group relative ${wide ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
                <div className="overflow-hidden rounded-sm bg-white">
                  <ProductPicture
                    product={product}
                    sizes={wide ? '(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw' : '(min-width: 1024px) 26vw, (min-width: 640px) 50vw, 100vw'}
                    imgClassName="aspect-[4/3] h-auto w-full object-contain transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-5 text-label text-soft">{getCategory(product.category).name}</p>
                <h3 className="mt-2 text-display-3">{product.name}</h3>
                <p className="mt-2 max-w-[46ch] text-body text-soft">{product.description}</p>
                <a
                  href={whatsappUrl(productMessage(product.name))}
                  {...whatsappLinkProps}
                  className="mt-4 inline-flex items-center gap-2 font-bold underline decoration-ink/30 underline-offset-[6px] transition-colors hover:decoration-ink after:absolute after:inset-0"
                >
                  Solicitar orçamento
                  <Arrow direction="upright" />
                  <span className="sr-only">{` de ${product.name}`}</span>
                  <OpensWhatsApp />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
