import { formatWhatsAppDisplay, hasWhatsAppNumber, site, whatsappUrl } from '@/config/site';
import { TextLink } from '@/components/ui/TextLink';
import { pageGrid } from '@/components/ui/cx';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-paper pt-16 pb-10">
      <div className="container-page">
        <div className={`${pageGrid} gap-y-10`}>
          <div className="col-span-4 md:col-span-3 lg:col-span-4">
            <img
              src="/brand/logo-coloridamente.svg"
              alt="Coloridamente"
              width={138}
              height={56}
              loading="lazy"
              decoding="async"
              className="block h-14 w-auto"
            />
          </div>

          <nav aria-label="Rodapé" className="col-span-4 md:col-span-2 lg:col-span-4">
            <ul role="list" className="-my-3 lg:-my-2">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <TextLink href={item.href} underline="hover" className="inline-flex min-h-11 items-center text-small lg:min-h-9">
                    {item.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-4 text-small md:col-span-3 lg:col-span-4">
            <TextLink href={whatsappUrl()} whatsapp>
              Fale com a gente pelo WhatsApp
            </TextLink>
            {hasWhatsAppNumber && <p className="mt-2 text-ink-soft">{formatWhatsAppDisplay()}</p>}
          </div>
        </div>

        <p className="mt-12 border-t border-line pt-6 text-small text-ink-soft">
          © {year} Coloridamente. Produtos corporativos personalizados.
        </p>
      </div>
    </footer>
  );
}
