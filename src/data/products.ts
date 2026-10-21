/**
 * Galeria "Produtos em destaque". A ordem do array é a ordem de exibição.
 * Novo produto = nova linha aqui + foto com fundo branco liso processada por `npm run assets`
 * (dimensões e larguras vêm de images-manifest.json).
 */
import imagesManifest from './images-manifest.json';
import type { CategoryId } from './categories';

export interface ProductImage {
  /** Nome-base em /images/products/{name}-{largura}.{avif|webp}. */
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly widths: readonly number[];
  readonly alt: string;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: CategoryId;
  readonly image: ProductImage;
}

function productImage(name: string, alt: string): ProductImage {
  const entry = imagesManifest.find((image) => image.name === name);
  if (!entry) throw new Error(`Imagem "${name}" ausente em images-manifest.json (rode npm run assets).`);
  return { name, width: entry.width, height: entry.height, widths: entry.widths, alt };
}

export const products: readonly Product[] = [
  {
    id: 'agenda-2027',
    name: 'Agenda 2027',
    description: 'Agenda diária com horários, minicalendário do mês e quadro de anotações, com a marca na capa.',
    category: 'agendas-e-cadernos',
    image: productImage(
      'agenda-2027',
      'Agenda de espiral aberta nos dias 1 e 2 de janeiro, com horários e quadro de anotações, ao lado da capa "Agenda 2027" com a marca AEA Contabilidade Consultiva.',
    ),
  },
  {
    id: 'kit-mesa-impressao-3d',
    name: 'Kit de mesa em impressão 3D',
    description: 'Suporte de celular, porta-lápis, bandeja oval e porta-clipes em preto, com acabamento canelado.',
    category: 'impressao-3d',
    image: productImage(
      'kit-mesa-impressao-3d',
      'Suporte de celular com um telefone, porta-lápis com dois lápis, bandeja oval com óculos e caneta e porta-clipes, todos pretos e canelados.',
    ),
  },
  {
    id: 'caderno-espiral-capa',
    name: 'Caderno com capa personalizada',
    description: 'Capa branca com a marca e ondas em tons de azul, com encadernação em espiral.',
    category: 'agendas-e-cadernos',
    image: productImage(
      'caderno-espiral-capa',
      'Caderno de espiral branca com capa branca, a marca AEA Contabilidade Consultiva ao centro e ondas em tons de azul na lateral.',
    ),
  },
  {
    id: 'caderno-aberto-pautado',
    name: 'Caderno pautado personalizado',
    description: 'Folhas pautadas com a marca no topo e o grafismo da capa nos cantos.',
    category: 'agendas-e-cadernos',
    image: productImage(
      'caderno-aberto-pautado',
      'Caderno de espiral aberto com folhas pautadas, a marca AEA no alto de cada página e ondas azuis nos cantos inferiores.',
    ),
  },
  {
    id: 'caderno-aberto-liso',
    name: 'Caderno liso personalizado',
    description: 'Folhas sem pauta com a marca no topo e o grafismo da capa nos cantos.',
    category: 'agendas-e-cadernos',
    image: productImage(
      'caderno-aberto-liso',
      'Caderno de espiral aberto com folhas lisas, a marca AEA no alto de cada página e ondas azuis nos cantos inferiores.',
    ),
  },
];
