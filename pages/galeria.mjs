// build_galeria.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// === Configura estas rutas según tu estructura ===
const IMAGES_DIR = '../img/galeria';   // carpeta de imágenes (relativa a este script)
const GALERIA_HTML = 'galeria.html';   // archivo destino a actualizar
const OUTPUT_SNIPPET = 'galeria_items.html'; // opcional: bloque generado

const VALID_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function naturalKey(name) {
  // Orden "natural" considerando números en el nombre
  return name.toLowerCase().split(/(\d+)/).map(v => (/\d+/.test(v) ? Number(v) : v));
}

function buildItems() {
  const dir = path.resolve(__dirname, IMAGES_DIR);
  if (!fs.existsSync(dir)) throw new Error(`No existe la carpeta: ${dir}`);

  const files = fs.readdirSync(dir)
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return VALID_EXTS.has(ext) && fs.lstatSync(path.join(dir, f)).isFile();
    })
    .sort((a,b) => {
      const ak = naturalKey(a);
      const bk = naturalKey(b);
      return ak > bk ? 1 : ak < bk ? -1 : 0;
    });

  if (!files.length) throw new Error(`No se encontraron imágenes en: ${dir}`);

  const items = files.map(f => {
    const rel = path.posix.join(IMAGES_DIR, f).replace(/\\/g, '/');
    const alt = path.parse(f).name.replace(/[-_]/g, ' ');
    return [
      '  <div class="recuadro">',
      `    <a href="#" class="zoomImg" data-img="${rel}">`,
      `      <img src="${rel}" alt="${alt}">`,
      '    </a>',
      '  </div>'
    ].join('\n');
  });

  return items.join('\n') + '\n';
}

function writeSnippet(block) {
  fs.writeFileSync(path.resolve(__dirname, OUTPUT_SNIPPET), block, 'utf-8');
  console.log(`✅ Bloque generado en: ${OUTPUT_SNIPPET}`);
}

function injectIntoGaleria(block) {
  const gfile = path.resolve(__dirname, GALERIA_HTML);
  if (!fs.existsSync(gfile)) {
    console.log(`⚠️ No se encontró ${GALERIA_HTML}, solo se generó el snippet.`);
    return;
  }
  let content = fs.readFileSync(gfile, 'utf-8');
  const begin = '<!-- BEGIN AUTO -->';
  const end = '<!-- END AUTO -->';

  if (content.includes(begin) && content.includes(end) && content.indexOf(begin) < content.indexOf(end)) {
    const re = new RegExp(begin + '[\\s\\S]*?' + end);
    const newBlock = `${begin}\n${block}${end}`;
    content = content.replace(re, newBlock);
  } else {
    // Intentar insertarlo dentro de <section class="galeria">
    const hook = '<section class="galeria"';
    const idx = content.indexOf(hook);
    if (idx !== -1) {
      const gt = content.indexOf('>', idx);
      if (gt !== -1) {
        const auto = `\n  ${begin}\n${block}  ${end}\n`;
        content = content.slice(0, gt + 1) + auto + content.slice(gt + 1);
      }
    } else {
      // O al final antes de </body>
      const auto = `\n<!-- Galería autogenerada -->\n${begin}\n${block}${end}\n`;
      const bodyEnd = content.toLowerCase().lastIndexOf('</body>');
      content = bodyEnd !== -1
        ? content.slice(0, bodyEnd) + auto + content.slice(bodyEnd)
        : content + auto;
    }
  }
  fs.writeFileSync(gfile, content, 'utf-8');
  console.log(`✅ ${GALERIA_HTML} actualizado.`);
}

try {
  const block = buildItems();
  writeSnippet(block);
  injectIntoGaleria(block);
  console.log('🏁 Listo.');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}