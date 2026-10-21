import { whatsappUrl, productMessage } from '@/config/site';
import type { Category } from '@/data/categories';
import { Patch } from '@/components/ui/Patch';
import { Picture } from '@/components/ui/Picture';
import { TextLink } from '@/components/ui/TextLink';
import { cx } from '@/components/ui/cx';

interface CategoryCardProps {
  readonly category: Category;
  /** Classes de posição no grid (vêm da seção). */
  readonly className?: string;
}

/** Figura sem caixa: still do filme em 4:3, patch + nome, descrição e link (o card todo é clicável). */
export function CategoryCard({ category, className }: CategoryCardProps) {
  const { name, description, color, still } = category;
  return (
    <article className={cx('group relative', className)}>
      <div className="aspect-[4/3] overflow-hidden rounded-xs bg-studio">
        <Picture
          base={still.base}
          widths={still.widths}
          sizes="(min-width:1024px) 76vw, 134vw"
          alt={still.alt}
          width={still.width}
          height={still.height}
          className="block h-full w-full"
          imgClassName="block h-full w-full object-cover object-[44%_50%] transition-transform duration-600 ease-out-soft motion-safe:group-hover:scale-[1.03] motion-safe:group-focus-within:scale-[1.03]"
        />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Patch
          color={color}
          className="transition-[width] duration-400 ease-out-soft group-focus-within:w-10 group-hover:w-10"
        />
        <h3 className="text-display-md">{name}</h3>
      </div>
      <p className="mt-2 max-w-[44ch] text-body text-ink-soft">{description}</p>
      <p className="mt-4">
        <TextLink
          href={whatsappUrl(productMessage(name))}
          whatsapp
          className="after:absolute after:inset-0 after:content-['']"
        >
          Solicitar orçamento<span className="sr-only">{` de ${name}`}</span>
        </TextLink>
      </p>
    </article>
  );
}
