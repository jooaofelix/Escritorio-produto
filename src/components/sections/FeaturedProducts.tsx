import { whatsappUrl } from '@/config/site';
import { products } from '@/data/products';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { TextLink } from '@/components/ui/TextLink';
import { ProductCard } from './ProductCard';

export function FeaturedProducts() {
  return (
    <section id="produtos" aria-labelledby="produtos-titulo" className="py-section">
      <div className="container-page">
        <SectionIntro
          id="produtos-titulo"
          title="Produtos em destaque"
          lead="Exemplos de produtos personalizados com a identidade visual de uma empresa."
        />
        <ul
          role="list"
          className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-6 lg:gap-x-8 lg:gap-y-20"
        >
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} wide={index % 5 < 2} />
          ))}
        </ul>
        <p className="mt-16 text-body">
          <TextLink href={whatsappUrl()} whatsapp>
            Procura outro produto? Conte a sua ideia pelo WhatsApp.
          </TextLink>
        </p>
      </div>
    </section>
  );
}
