import { productMessage, whatsappUrl } from '@/config/site';
import { getCategory } from '@/data/categories';
import { products } from '@/data/products';
import { Pill } from '@/components/shared/Pill';
import { LineOffer } from '@/components/shared/LineOffer';
import { ProductPicture } from '@/components/shared/ProductPicture';

/** Desejo: os itens da Linha Office, cada um com o próprio CTA, e a oferta da linha completa. */
export function Products() {
  return (
    <section id="produtos" aria-labelledby="produtos-titulo" className="border-t border-line bg-paper py-section">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-label text-soft">Linha Office</p>
            <h2 id="produtos-titulo" className="mt-4 text-display-2">
              Monte a sua Linha Office.
            </h2>
          </div>
          <p className="text-lead text-soft lg:col-span-4 lg:col-start-9">
            Cada item recebe a identidade visual da sua empresa. Peça a linha completa ou só os itens de que precisa.
          </p>
        </div>
        <ul role="list" className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:mt-20">
          {products.map((product) => (
            <li key={product.id} className="group flex flex-col">
              <div className="rounded-md bg-card p-[3%]">
                <div className="overflow-hidden rounded-xs bg-white">
                  <ProductPicture
                    product={product}
                    sizes="(min-width: 1312px) 600px, (min-width: 640px) 46vw, 100vw"
                    imgClassName="aspect-[4/3] h-auto w-full object-contain transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
                  />
                </div>
              </div>
              <p className="mt-6 text-label text-soft">{getCategory(product.category).name}</p>
              <h3 className="mt-2 text-display-3">{product.name}</h3>
              <p className="mt-2 max-w-[48ch] flex-1 text-body text-soft">{product.description}</p>
              <Pill
                href={whatsappUrl(productMessage(product.name))}
                whatsapp
                tone="ink"
                arrow="upright"
                className="mt-6 self-start"
              >
                Quero orçamento deste
                <span className="sr-only">{`: ${product.name}`}</span>
              </Pill>
            </li>
          ))}
        </ul>
        <LineOffer tone="light" className="mt-16 lg:mt-24" />
      </div>
    </section>
  );
}
