import { categories } from '@/data/categories';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { pageGrid, cx } from '@/components/ui/cx';
import { CategoryCard } from './CategoryCard';

/**
 * Grid assimétrico (lg): largo 1–7 + estreito 9–12 deslocado; estreito 1–5 + largo 7–12 deslocado.
 * md: 2 colunas, a da direita deslocada. Índice = posição; um 5º card repete o ritmo do 1º.
 */
const layout = [
  'col-span-4 lg:col-span-7',
  'col-span-4 md:mt-16 lg:col-span-4 lg:col-start-9 lg:mt-28',
  'col-span-4 lg:col-span-5 lg:col-start-1',
  'col-span-4 md:mt-16 lg:col-span-6 lg:col-start-7 lg:mt-28',
] as const;

export function WhatWeMake() {
  return (
    <section id="o-que-criamos" aria-labelledby="o-que-criamos-titulo" className="py-section">
      <div className="container-page">
        <SectionIntro
          id="o-que-criamos-titulo"
          title="O que criamos"
          lead="Produtos corporativos personalizados com a identidade da sua empresa, do papel aos objetos de mesa."
        />
        <div className={cx(pageGrid, 'mt-12 gap-y-14 lg:mt-16 lg:gap-y-20')}>
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} className={layout[index % layout.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}
