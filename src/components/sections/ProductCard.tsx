import { whatsappUrl, productMessage } from '@/config/site';
import { getCategory } from '@/data/categories';
import type { Product } from '@/data/products';
import { Patch } from '@/components/ui/Patch';
import { Picture } from '@/components/ui/Picture';
import { TextLink } from '@/components/ui/TextLink';
import { cx } from '@/components/ui/cx';

interface ProductCardProps {
  readonly product: Product;
  /** Itens largos ocupam 3 de 6 colunas no lg; os demais, 2. */
  readonly wide: boolean;
}

const sizes = {
  wide: '(min-width:1024px) 46vw, (min-width:640px) 50vw, 100vw',
  regular: '(min-width:1024px) 31vw, (min-width:640px) 50vw, 100vw',
} as const;

/**
 * Foto de catálogo dissolvida no papel, sem caixa: com multiply o branco vira paper.
 * brightness/contrast +3% levam o fundo quase branco das fotos (244–249) a 255; sem isso o
 * retângulo da foto aparece sobre o papel. Efeito nos produtos é imperceptível.
 */
export function ProductCard({ product, wide }: ProductCardProps) {
  const { name, description, image } = product;
  const category = getCategory(product.category);
  return (
    <li className={cx('group', wide ? 'lg:col-span-3' : 'lg:col-span-2')}>
      <div className="isolate aspect-[4/3] overflow-hidden bg-paper">
        <Picture
          base={`/images/products/${image.name}`}
          widths={image.widths}
          sizes={wide ? sizes.wide : sizes.regular}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="block h-full w-full"
          imgClassName="block h-full w-full object-contain mix-blend-multiply brightness-103 contrast-103 transition-transform duration-600 ease-out-soft motion-safe:group-hover:scale-[1.02] motion-safe:group-focus-within:scale-[1.02]"
        />
      </div>
      <h3 className="mt-4 text-display-md">{name}</h3>
      <p className="mt-2 max-w-[46ch] text-body text-ink-soft">{description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-small text-ink-soft">
          <Patch color={category.color} />
          {category.name}
        </p>
        <TextLink href={whatsappUrl(productMessage(name))} whatsapp>
          Solicitar orçamento<span className="sr-only">{` de ${name}`}</span>
        </TextLink>
      </div>
    </li>
  );
}
