import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProcessSteps } from '@/components/shared/ProcessSteps';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { SiteHeader } from '@/components/shared/SiteHeader';
import { SkipLink } from '@/components/shared/SkipLink';
import { ProductReel } from './ProductReel';
import { Quote } from './Quote';
import { ScrollStory } from './ScrollStory';
import '@/styles/index.css';

const NAV = [
  { label: 'Produtos', href: '#produtos' },
  { label: 'Sobre', href: '/#sobre' },
];
const FOOTER_NAV = [...NAV, { label: 'Como funciona', href: '#como-funciona' }, { label: 'Orçamento', href: '#orcamento' }];

/** Proposta 05 — Scroll cinematográfico. */
function Page() {
  return (
    <>
      <SkipLink />
      <SiteHeader tone="night" nav={NAV} divider={false} />
      <main id="conteudo" tabIndex={-1} className="bg-night outline-none">
        <ScrollStory />
        <ProductReel />
        <ProcessSteps tone="night" />
        <Quote />
      </main>
      <SiteFooter tone="night" nav={FOOTER_NAV} current="cinematografico" />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
