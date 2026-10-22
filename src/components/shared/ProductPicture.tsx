import type { Product } from '@/data/products';
import { Picture } from './Picture';

/** Foto de produto (AVIF/WebP responsivos de /images/products). */
export function ProductPicture({
  product,
  sizes,
  className,
  imgClassName,
  loading,
}: {
  product: Product;
  sizes: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
}) {
  const { image } = product;
  return (
    <Picture
      base={`/images/products/${image.name}`}
      widths={image.widths}
      width={image.width}
      height={image.height}
      alt={image.alt}
      sizes={sizes}
      className={className}
      imgClassName={imgClassName}
      loading={loading}
    />
  );
}

export function productById(products: readonly Product[], id: string): Product {
  const product = products.find((item) => item.id === id);
  if (!product) throw new Error(`Produto desconhecido: ${id}`);
  return product;
}
