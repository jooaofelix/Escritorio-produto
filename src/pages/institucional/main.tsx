import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Faq } from '@/components/shared/Faq';
import { ProcessSteps } from '@/components/shared/ProcessSteps';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { SiteHeader } from '@/components/shared/SiteHeader';
import { SkipLink } from '@/components/shared/SkipLink';
import { StickyCta } from '@/components/shared/StickyCta';
import { Hero } from './Hero';
import { Occasions } from './Occasions';
import { Products } from './Products';
import { QuoteBand } from './QuoteBand';
import '@/styles/index.css';

const NAV = [
  { label: 'Produtos', href: '#produtos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Dúvidas', href: '#duvidas' },
];
const FOOTER_NAV = [{ label: 'Ocasiões', href: '#ocasioes' }, ...NAV, { label: 'Orçamento', href: '#orcamento' }];

/** Proposta 04 — Institucional premium (página inicial), organizada como funil de vendas. */
function Page() {
  return (
    <>
      <SkipLink />
      <SiteHeader nav={NAV} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />
        <Occasions />
        <Products />
        <ProcessSteps tone="graphite" />
        <Faq tone="light" />
        <QuoteBand />
      </main>
      <SiteFooter nav={FOOTER_NAV} current="institucional" />
      <StickyCta />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
