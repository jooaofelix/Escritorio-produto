import { formatWhatsAppDisplay, hasWhatsAppNumber, site, whatsappUrl } from '@/config/site';
import { Arrow } from './Arrow';
import { Pill } from './Pill';

interface FooterProps {
  readonly nav: readonly { label: string; href: string }[];
  /** Página atual, para o link para a outra proposta. */
  readonly current: keyof typeof site.pages;
}

export function SiteFooter({ nav, current }: FooterProps) {
  const other = current === 'institucional' ? site.pages.cinematografico : site.pages.institucional;
  const otherLabel = current === 'institucional' ? 'Conheça a experiência em movimento' : 'Conheça a página institucional';
  return (
    <footer className="on-dark bg-graphite-deep pt-16 pb-28 text-paper md:pb-10">
      <div className="container-page">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <a href={site.pages.institucional.href} className="inline-block rounded-sm bg-paper px-4 py-3">
              <img src="/brand/logo-coloridamente.svg" alt="Coloridamente" width={868} height={352} className="h-12 w-auto" />
            </a>
            <p className="mt-6 max-w-[34ch] text-body text-on-dark">
              Linha Office: agenda, cadernos e acessórios para escritório com a identidade da sua empresa.
            </p>
          </div>
          <nav aria-label="Rodapé" className="md:col-span-3">
            <h2 className="text-label text-on-dark/80">Navegação</h2>
            <ul role="list" className="mt-4 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-body text-on-dark underline-offset-4 hover:text-paper hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={other.href} className="text-body text-on-dark underline-offset-4 hover:text-paper hover:underline">
                  {otherLabel} <Arrow className="inline align-[-0.05em]" />
                </a>
              </li>
            </ul>
          </nav>
          <div className="md:col-span-4">
            <h2 className="text-label text-on-dark/80">Orçamento</h2>
            <p className="mt-4 text-body text-on-dark">Atendimento direto pelo WhatsApp.</p>
            {hasWhatsAppNumber && <p className="mt-1 text-body font-bold">{formatWhatsAppDisplay()}</p>}
            <Pill href={whatsappUrl()} whatsapp arrow="upright" className="mt-6">
              Solicitar orçamento
            </Pill>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-paper/12 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.875rem] text-on-dark/80">
            © {new Date().getFullYear()} Coloridamente. Produtos corporativos personalizados.
          </p>
          <div className="color-bar h-1 w-24" aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}
