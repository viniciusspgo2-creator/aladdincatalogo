// Analyze scraped catalog: distribution, names per category, brand detection
const fs = require('fs');
const out = '/home/z/my-project/scripts/scraped';
const produtos = JSON.parse(fs.readFileSync(`${out}/produtos_raw.json`, 'utf8'));
const categorias = JSON.parse(fs.readFileSync(`${out}/categorias.json`, 'utf8'));

// category id -> path map
const catMap = {};
for (const c of categorias) {
  catMap[c.categoria_id] = { top: c.nome, sub: null, subsub: null };
  for (const s of c.subcategorias || []) {
    catMap[s.categoria_id] = { top: c.nome, sub: s.nome, subsub: null };
    for (const ss of s.subcategorias || []) {
      catMap[ss.categoria_id] = { top: c.nome, sub: s.nome, subsub: ss.nome };
    }
  }
}

const byTop = {};
for (const p of produtos) {
  const cm = catMap[p.categoria_id] || { top: 'SEM-CAT', sub: null };
  byTop[cm.top] = byTop[cm.top] || { count: 0, samples: [] };
  byTop[cm.top].count++;
  if (byTop[cm.top].samples.length < 8) byTop[cm.top].samples.push(p.nome);
}
console.log('=== PRODUCTS PER TOP CATEGORY ===');
for (const [k, v] of Object.entries(byTop).sort((a, b) => b.count - a.count)) {
  console.log(`\n[${k}] ${v.count}`);
  console.log('   ' + v.samples.join(' | ').slice(0, 400));
}

// no-image / no-price stats
const noImg = produtos.filter(p => !p.imagem || p.imagens.length === 0).length;
const semEstoque = produtos.filter(p => p.produto_sem_estoque).length;
console.log(`\nno-image: ${noImg}, sem-estoque: ${semEstoque}, com-videos: ${produtos.filter(p => (p.videos||[]).length).length}`);
console.log('unique representada_ids:', [...new Set(produtos.map(p => p.representada_id))].join(','));
