import { productMessage, site, whatsappUrl } from '@/config/site';
import { products } from '@/data/products';
import { Pill } from './Pill';
import { ProductPicture } from './ProductPicture';

type Tone = 'light' | 'dark';

const styles: Record<Tone, { box: string; text: string; label: string }> = {
  // Contraste com a seção: grafite sobre a página clara, papel sobre a página escura.
  light: { box: 'on-dark bg-graphite text-paper', text: 'text-on-dark', label: 'text-coral' },
  dark: { box: 'bg-paper text-ink', text: 'text-soft', label: 'text-soft' },
};

/** Oferta da linha completa: todos os itens no mesmo pedido (âncora do funil). */
export function LineOffer({ tone, className = '' }: { tone: Tone; className?: string }) {
  const s = styles[tone];
  return (
    <aside aria-labelledby="linha-completa-titulo" className={`rounded-md p-6 sm:p-10 lg:p-12 ${s.box} ${className}`}>
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <p className={`text-label ${s.label}`}>{site.line} completa</p>
          <h3 id="linha-completa-titulo" className="mt-4 text-display-2">
            Todos os itens no mesmo pedido.
          </h3>
          <p className={`mt-4 max-w-[46ch] text-lead ${s.text}`}>
            Agenda, cadernos e acessórios para escritório com a mesma identidade visual, para a sua marca aparecer
            inteira na mesa de cada pessoa.
          </p>
          <Pill
            href={whatsappUrl(productMessage(`${site.line} completa`))}
            whatsapp
            size="lg"
            arrow="upright"
            className="mt-8 w-full sm:w-auto"
          >
            Quero a {site.line} completa
          </Pill>
        </div>
        <ul role="list" className="grid grid-cols-2 gap-3 lg:col-span-6">
          {products.map((product) => (
            <li key={product.id} className="overflow-hidden rounded-sm bg-white">
              <ProductPicture
                product={product}
                sizes="(min-width: 1024px) 18vw, 45vw"
                imgClassName="aspect-[4/3] h-auto w-full object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
