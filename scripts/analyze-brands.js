// Extract brand candidates from subcategory names + product name prefixes
const fs = require('fs');
const out = '/home/z/my-project/scripts/scraped';
const produtos = JSON.parse(fs.readFileSync(`${out}/produtos_raw.json`, 'utf8'));
const categorias = JSON.parse(fs.readFileSync(`${out}/categorias.json`, 'utf8'));

const KEEP_TOPS = new Set(['NARGUILÉ', 'HEAD-SHOP', 'FUMO', 'CHARUTOS E TABACOS', 'CIGARRO DE PALHA', 'BLACK ERVA', 'RAPÉ', 'ESSÊNCIA', 'INCENSO', 'ISQUEIROS', 'MAÇARICO', 'GÁS / FLUÍDO', 'GARRAFA TÉRMICA']);

const catMap = {};
for (const c of categorias) {
  catMap[c.categoria_id] = { top: c.nome, sub: null };
  for (const s of c.subcategorias || []) {
    catMap[s.categoria_id] = { top: c.nome, sub: s.nome };
    for (const ss of s.subcategorias || []) catMap[ss.categoria_id] = { top: c.nome, sub: s.nome, subsub: ss.nome };
  }
}

console.log('=== SUBCATEGORIES OF KEPT TOPS ===');
for (const c of categorias) {
  if (!KEEP_TOPS.has(c.nome)) continue;
  console.log(`\n[${c.nome}]`);
  console.log('  ' + (c.subcategorias || []).map(s => s.nome).join(' | '));
}

// Token frequency of first 2 words of kept products
const kept = produtos.filter(p => { const cm = catMap[p.categoria_id]; return cm && (KEEP_TOPS.has(cm.top)); });
console.log(`\nKEPT: ${kept.length}`);
const freq = {};
for (const p of kept) {
  const words = p.nome.replace(/[(),.\/-]/g, ' ').split(/\s+/).filter(Boolean);
  const k1 = words[0]; const k2 = words.slice(0, 2).join(' ');
  freq[k1] = (freq[k1] || 0) + 1;
}
console.log('\n=== FIRST-WORD FREQUENCY (>=5) ===');
Object.entries(freq).filter(([, v]) => v >= 5).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`${v}\t${k}`));
