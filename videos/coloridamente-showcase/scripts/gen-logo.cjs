// Converte o SVG oficial do logo em src/logoPaths.ts (um item por forma), para animar cada peça.
const fs = require('fs');
const svg = fs.readFileSync('public/brand/logo-coloridamente.svg', 'utf8');
const vb = svg.match(/viewBox="([^"]+)"/)[1];
const paths = [...svg.matchAll(/<path([^>]*)\/>/g)]
  .map((m) => {
    const d = (m[1].match(/ d="([^"]+)"/) || [])[1];
    const fill = (m[1].match(/fill="([^"]+)"/) || [])[1];
    return d && { d, fill, x: parseFloat(d.replace(/^[mM]\s*/, '').split(/[ ,]/)[0]) };
  })
  .filter(Boolean);
// ordem de montagem (esquerda → direita); a ordem de desenho do SVG é preservada
const xs = paths.map((q) => q.x).sort((a, b) => a - b);
const rank = paths.map((q) => xs.indexOf(q.x) / paths.length);
fs.writeFileSync('src/logoPaths.ts',
  '// Gerado de public/brand/logo-coloridamente.svg (scripts/gen-logo.cjs). `o` = ordem de montagem (0–1, da esquerda para a direita).\n' +
  `export const LOGO_VIEWBOX = "${vb}";\n` +
  `export const LOGO_PATHS: {d: string; fill: string; o: number}[] = ${JSON.stringify(paths.map(({ d, fill }, i) => ({ d, fill, o: +rank[i].toFixed(3) })))};\n`);
console.log(`${paths.length} formas`);
