/**
 * Configuração central do site. O número do WhatsApp vem de VITE_WHATSAPP_NUMBER
 * (ver .env.example) — nunca escreva o número direto nos componentes.
 */
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

export const site = {
  name: 'Coloridamente',
  /** Produto vendido pelo site. */
  line: 'Linha Office',
  whatsapp: {
    number: whatsappNumber,
    defaultMessage: 'Olá! Conheci a Linha Office da Coloridamente pelo site e gostaria de solicitar um orçamento.',
  },
  /** As duas páginas do site (propostas 04 e 05). */
  pages: {
    institucional: { label: 'Institucional', href: '/' },
    cinematografico: { label: 'Experiência', href: '/cinematografico/' },
  },
} as const;

export const hasWhatsAppNumber = whatsappNumber.length >= 10;

/** Número para exibição: 5512992241150 → (12) 99224-1150. */
export function formatWhatsAppDisplay(number: string = whatsappNumber): string {
  const local = number.startsWith('55') && number.length >= 12 ? number.slice(2) : number;
  const match = /^(\d{2})(\d{4,5})(\d{4})$/.exec(local);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : number;
}

/** Link do WhatsApp com mensagem pré-preenchida. Sem número configurado, abre o WhatsApp para o visitante escolher o contato. */
export function whatsappUrl(message: string = site.whatsapp.defaultMessage): string {
  const text = encodeURIComponent(message);
  return hasWhatsAppNumber ? `https://wa.me/${whatsappNumber}?text=${text}` : `https://wa.me/?text=${text}`;
}

/** Mensagem para pedir orçamento de um item específico da galeria. */
export function productMessage(productName: string): string {
  return `Olá! Conheci a Linha Office da Coloridamente pelo site e gostaria de solicitar um orçamento de: ${productName}.`;
}

/** Mensagem para pedir orçamento a partir de uma ocasião (ex.: "boas-vindas à equipe"). */
export function occasionMessage(occasion: string): string {
  return `Olá! Conheci a Linha Office da Coloridamente pelo site e gostaria de solicitar um orçamento para: ${occasion}.`;
}
