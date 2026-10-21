/** Todo link de WhatsApp abre em nova aba e anuncia isso para leitores de tela. */
export const whatsappLinkProps = { target: '_blank', rel: 'noopener noreferrer' } as const;

export function OpensWhatsApp() {
  return <span className="sr-only">{' (abre o WhatsApp)'}</span>;
}
