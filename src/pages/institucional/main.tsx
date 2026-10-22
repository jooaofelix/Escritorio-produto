import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { SiteHeader } from '@/components/shared/SiteHeader';
import { SkipLink } from '@/components/shared/SkipLink';
import { ProcessSteps } from '@/components/shared/ProcessSteps';
import { About } from './About';
import { Hero } from './Hero';
import { Products } from './Products';
import { QuoteBand } from './QuoteBand';
import '@/styles/index.css';

const NAV = [
  { label: 'Produtos', href: '#produtos' },
  { label: 'Sobre', href: '#sobre' },
];
const FOOTER_NAV = [...NAV, { label: 'Como funciona', href: '#como-funciona' }, { label: 'Orçamento', href: '#orcamento' }];

/** Proposta 04 — Institucional premium (página inicial). */
function Page() {
  return (
    <>
      <SkipLink />
      <SiteHeader tone="forest" nav={NAV} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Products />
        <ProcessSteps tone="forest" />
        <QuoteBand />
      </main>
      <SiteFooter tone="forest" nav={FOOTER_NAV} current="institucional" />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
