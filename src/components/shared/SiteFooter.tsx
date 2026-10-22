import { formatWhatsAppDisplay, hasWhatsAppNumber, site, whatsappUrl } from '@/config/site';
import { Arrow } from './Arrow';
import { OpensWhatsApp, whatsappLinkProps } from './whatsapp';

type Tone = 'forest' | 'night';
const backgrounds: Record<Tone, string> = { forest: 'bg-forest-deep', night: 'bg-night-box' };

interface FooterProps {
  readonly tone: Tone;
  readonly nav: readonly { label: string; href: string }[];
  /** Página atual, para o link para a outra proposta. */
  readonly current: keyof typeof site.pages;
}

export function SiteFooter({ tone, nav, current }: FooterProps) {
  const other = current === 'institucional' ? site.pages.cinematografico : site.pages.institucional;
  const otherLabel = current === 'institucional' ? 'Conheça a experiência em movimento' : 'Conheça a página institucional';
  return (
    <footer className={`${backgrounds[tone]} pt-16 pb-10 text-paper`}>
      <div className="container-page">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <a href={site.pages.institucional.href} className="inline-block">
              <img src="/brand/logo-coloridamente.svg" alt="Coloridamente" width={180} height={73} className="h-auto w-[180px]" />
            </a>
            <p className="mt-6 max-w-[34ch] text-body text-paper/75">
              Produtos personalizados com a identidade da sua empresa.
            </p>
          </div>
          <nav aria-label="Rodapé" className="md:col-span-3">
            <h2 className="text-label text-paper/60">Navegação</h2>
            <ul role="list" className="mt-4 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-body text-paper/85 hover:text-paper hover:underline underline-offset-4">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={other.href} className="text-body text-paper/85 hover:text-paper hover:underline underline-offset-4">
                  {otherLabel} <Arrow className="inline align-[-0.05em]" />
                </a>
              </li>
            </ul>
          </nav>
          <div className="md:col-span-4">
            <h2 className="text-label text-paper/60">Contato</h2>
            <a
              href={whatsappUrl()}
              {...whatsappLinkProps}
              className="mt-4 inline-flex items-center gap-2 text-body font-bold text-paper hover:underline underline-offset-4"
            >
              Fale com a gente pelo WhatsApp
              <Arrow direction="upright" />
              <OpensWhatsApp />
            </a>
            {hasWhatsAppNumber && <p className="mt-2 text-body text-paper/75">{formatWhatsAppDisplay()}</p>}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-paper/12 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.875rem] text-paper/65">
            © {new Date().getFullYear()} Coloridamente. Produtos corporativos personalizados.
          </p>
          <div className="color-bar h-1 w-24" aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}
