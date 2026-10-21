import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Metadados que dependem da URL pública (canonical, og:url, og:image absoluta,
 * sitemap) e trava de segurança do CTA: na Cloudflare Pages (CF_PAGES=1) o build
 * falha se o número do WhatsApp não estiver configurado, para nunca publicar
 * um CTA sem destino.
 */
function siteMeta(env: Record<string, string>): Plugin {
  const siteUrl = (env.VITE_SITE_URL ?? '').replace(/\/+$/, '');
  const whatsapp = (env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');
  return {
    name: 'coloridamente-site-meta',
    apply: 'build',
    buildStart() {
      if (whatsapp.length < 10) {
        const msg = 'VITE_WHATSAPP_NUMBER não configurado: os CTAs abrirão o WhatsApp sem destinatário.';
        if (process.env.CF_PAGES) this.error(`${msg} Defina a variável no projeto da Cloudflare Pages.`);
        this.warn(msg);
      }
    },
    transformIndexHtml(html) {
      if (!siteUrl) return html;
      const tags: HtmlTagDescriptor[] = [
        { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: `${siteUrl}/` }, injectTo: 'head' },
      ];
      // og:image e twitter:image precisam de URL absoluta para a maioria dos scrapers;
      // no JSON-LD, `logo` também deve ser absoluto e `url` identifica o site da Organization.
      const absolute = html
        .replaceAll('content="/og-image.jpg"', `content="${siteUrl}/og-image.jpg"`)
        .replace(/"logo": "\//, `"url": "${siteUrl}/",\n        "logo": "${siteUrl}/`);
      return { html: absolute, tags };
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`,
      });
      if (!siteUrl) return;
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod></url>\n` +
          '</urlset>\n',
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), tailwindcss(), siteMeta(env)],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: false,
      assetsInlineLimit: 2048,
    },
  };
});
