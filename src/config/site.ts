/**
 * Configuração central do site. O número do WhatsApp vem de VITE_WHATSAPP_NUMBER
 * (ver .env.example) — nunca escreva o número direto nos componentes.
 */
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

export const site = {
  name: 'Coloridamente',
  whatsapp: {
    number: whatsappNumber,
    defaultMessage: 'Olá! Conheci a Coloridamente pelo site e gostaria de solicitar um orçamento.',
  },
  nav: [
    { label: 'O que criamos', href: '#o-que-criamos' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Produtos', href: '#produtos' },
    { label: 'Orçamento', href: '#orcamento' },
  ],
} as const;

export const hasWhatsAppNumber = whatsappNumber.length >= 10;

/** Link do WhatsApp com mensagem pré-preenchida. Sem número configurado, abre o WhatsApp para o visitante escolher o contato. */
export function whatsappUrl(message: string = site.whatsapp.defaultMessage): string {
  const text = encodeURIComponent(message);
  return hasWhatsAppNumber ? `https://wa.me/${whatsappNumber}?text=${text}` : `https://wa.me/?text=${text}`;
}

/** Mensagem para pedir orçamento de um item específico da galeria. */
export function productMessage(productName: string): string {
  return `Olá! Conheci a Coloridamente pelo site e gostaria de solicitar um orçamento de: ${productName}.`;
}
