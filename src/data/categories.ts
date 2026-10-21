/**
 * Categorias da seção "O que criamos". A cor é o patch de identidade da categoria
 * (preenchimento, nunca texto) e é reaproveitada no rodapé dos cards de produto.
 */
import framesManifest from './frames-manifest.json';

export type CategoryId = 'agendas-e-cadernos' | 'papelaria-corporativa' | 'brindes-personalizados' | 'impressao-3d';
export type PatchColor = 'coral' | 'olive' | 'sun' | 'mint';

export interface Still {
  /** Caminho sem o sufixo `-{largura}.{formato}`. */
  readonly base: string;
  readonly widths: readonly number[];
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

export interface Category {
  readonly id: CategoryId;
  readonly name: string;
  readonly description: string;
  readonly color: PatchColor;
  readonly still: Still;
}

/** Stills do filme do hero: 16:9, gerados em 768 e 1280px de largura. */
function still(frame: number, alt: string): Still {
  const { path, widths } = framesManifest.stills;
  return { base: `${path}${String(frame).padStart(4, '0')}`, widths, width: 1280, height: 720, alt };
}

export const categories: readonly Category[] = [
  {
    id: 'agendas-e-cadernos',
    name: 'Agendas e cadernos',
    description: 'Capa e páginas com a sua marca, em agendas diárias e cadernos pautados ou lisos.',
    color: 'coral',
    still: still(100, 'Agenda de espiral aberta com páginas de horários e a marca AEA, com uma folha sendo virada.'),
  },
  {
    id: 'papelaria-corporativa',
    name: 'Papelaria corporativa',
    description:
      'Itens de papelaria com a identidade visual da empresa, para o uso da equipe e para entregar a clientes e parceiros.',
    color: 'olive',
    still: still(52, 'Caderno de espiral fechado com capa branca e ondas em tons de azul.'),
  },
  {
    id: 'brindes-personalizados',
    name: 'Brindes personalizados',
    description:
      'Combinações de papelaria e objetos de mesa com a sua marca, para presentear clientes, parceiros e equipes.',
    color: 'sun',
    still: still(
      240,
      'Agenda aberta com a marca AEA ao lado de porta-canetas, suporte de celular, organizador e bandeja pretos.',
    ),
  },
  {
    id: 'impressao-3d',
    name: 'Impressão 3D',
    description: 'Objetos de mesa impressos em 3D, como porta-canetas, suporte de celular e bandejas.',
    color: 'mint',
    still: still(
      160,
      'Porta-canetas canelado com duas canetas, suporte de celular e bandeja pretos ao lado de um caderno aberto.',
    ),
  },
];

const byId = new Map(categories.map((category) => [category.id, category]));

export function getCategory(id: CategoryId): Category {
  const category = byId.get(id);
  if (!category) throw new Error(`Categoria desconhecida: ${id}`);
  return category;
}
