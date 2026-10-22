/** Categorias dos produtos; o nome aparece como etiqueta nos cards. */
export type CategoryId = 'agendas-e-cadernos' | 'papelaria-corporativa' | 'brindes-personalizados' | 'acessorios-para-escritorio';

export interface Category {
  readonly id: CategoryId;
  readonly name: string;
}

export const categories: readonly Category[] = [
  { id: 'agendas-e-cadernos', name: 'Agendas e cadernos' },
  { id: 'papelaria-corporativa', name: 'Papelaria corporativa' },
  { id: 'brindes-personalizados', name: 'Brindes personalizados' },
  { id: 'acessorios-para-escritorio', name: 'Acessórios para escritório' },
];

const byId = new Map(categories.map((category) => [category.id, category]));

export function getCategory(id: CategoryId): Category {
  const category = byId.get(id);
  if (!category) throw new Error(`Categoria desconhecida: ${id}`);
  return category;
}
