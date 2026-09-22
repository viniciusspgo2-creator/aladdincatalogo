// Transform scraped Mercos data into curated premium catalog dataset
// Output: scripts/seed/catalog.json  (brands, categories, products)
const fs = require('fs');
const path = require('path');
const S = '/home/z/my-project/scripts/scraped';
const OUT = '/home/z/my-project/scripts/seed';
fs.mkdirSync(OUT, { recursive: true });

const produtos = JSON.parse(fs.readFileSync(`${S}/produtos_raw.json`, 'utf8'));
const categorias = JSON.parse(fs.readFileSync(`${S}/categorias.json`, 'utf8'));
const destaques = JSON.parse(fs.readFileSync(`${S}/destaques.json`, 'utf8'));
const promocoes = JSON.parse(fs.readFileSync(`${S}/promocoes.json`, 'utf8'));

// ---------- helpers ----------
const slugify = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

const featuredIds = new Set();
for (const d of destaques) (d.destaque_produtos_ids || []).forEach((id) => featuredIds.add(id));
const promoMap = new Map(); // product_id -> promo name
for (const pr of promocoes) (pr.produtos || []).forEach((p) => {
  if (p?.produto_id) promoMap.set(p.produto_id, pr.nome);
  if (p?.produto?.produto_id) promoMap.set(p.produto.produto_id, pr.nome);
});

// ---------- BRAND DICTIONARY ----------
// [brandName, regex on uppercase name, line/segment]
const BRAND_RULES = [
  // Hookah / narguilé
  ['Squadafum', /\bSQUADAFUM\b/],
  ['Hoover', /\bHOOVER\b/],
  ['T&T Hookah', /T&T HOOKAH/],
  ['Kaloud', /\bKALOUD\b/],
  ['Black Hookah', /BLACK HOOKAH/],
  ['Ziggy', /\bZIGGY\b/],
  // Fumo
  ['Zomo', /\bZOMO\b/],
  ['ZGY Brasil', /\bZGY\b/],
  ['Blackjack', /\bBLACKJACK\b/],
  ['Gold Smoke', /GOLD SMOKE/],
  ['Nay', /FUMO NAY\b/],
  // Sedas & filtros
  ['RAW', /\bRAW\b(?! )|SEDA RAW\b/],
  ['OCB', /\bOCB\b/],
  ['Smoking', /\bSMOKING\b/],
  ['Lion Rolling Circus', /LION ROLLING|LION CIRCUS/],
  ['Elements', /SEDA ELEMENTS/],
  ['Papelito', /\bPAPELITO\b/],
  ['Slick', /\bSLICK\b|\bOIL SLICK\b/],
  // Charutos & tabacos
  ['Phillies', /PHILLIES/],
  ['Na Seda', /NA SEDA/],
  ['Selva', /\bSELVA\b/],
  ['La Revolucion', /LA REVOLUCION/],
  ['Rainbow', /CIGARRO.*RAINBOW|RAINBOW.*CIGARRO/],
  ['Amsterdam', /\bAMSTERDAM\b/],
  ['Hi Tobacco', /HI TOBACCO/],
  ['Jungle', /\bJUNGLE\b/],
  ['Sesh', /\bSESH\b/],
  ['The OG', /THE OG/],
  ['Terra Tabak', /TERRA TABAK/],
  ['Tobaquinho', /\bTABAQUIN\b/],
  ['Tonabê', /\bTONAB/i],
  ['Yerba', /\bYERBA\b/],
  ['Tabear', /\bTABEAR\b/],
  ['Tabaker Natural', /TABAKER NATURAL/],
  // Cigarro de palha
  ['Bacco Paiol', /BACCO PAIOL|BACCO\b/],
  ['Dipalha', /DIPALHA/],
  ['Inova Paiol', /INOVA PAIOL/],
  ['Mandelle', /MANDELLE/],
  ['Papaya', /PALHA.*PAPAYA|PAPAYA.*PALHA/],
  ['Piracanjuba', /PIRACANJUBA/],
  ['Primeiro Palheiro', /PRIMEIRO PALHEIRO/],
  ['Sô Meneiz', /MENEIZ/],
  ['Souza Paiol', /SOUZA PAIOL/],
  ['Timbal', /\bTIMBAL\b/],
  // Rapé
  ['Juriti', /JURITI/],
  ['Xingu', /XINGU/],
  ['Zero Grau', /ZERO GRAU/],
  // Vape
  ['Trust Liquid', /TRUST/],
  // Incenso
  ['Satya', /SATYA/],
  ['BIC Brand', /BIC BRAND/],
  ['India Soul', /INDIA SOUL/],
  // Fogo
  ['Zengaz', /ZENGAZ|ZENGAS/],
  ['Firestar', /FIRESTAR/],
  ['Worldfire', /WORLDFIRE/],
  ['Volcano', /VOLCANO/],
  ['Ronson', /RONSON/],
  ['GTI', /\bGTI\b/],
  ['Clipper', /CLIPPER/],
  ['Hit', /\bHIT\b/],
  ['Fire', /ISQUEIRO FIRE\b/],
  ['Cronos', /CRONOS/],
  ['Elegance', /ELEGANCE(?!.*(HOOVER))/],
];

function detectBrand(name) {
  const up = name.toUpperCase();
  for (const [brand, re] of BRAND_RULES) if (re.test(up)) return brand;
  return null;
}

// ---------- CATEGORY MAPPING ----------
// top source category name -> [newTopName, tagline]
const TOP_RENAME = {
  'NARGUILÉ': 'Narguilé',
  'HEAD-SHOP': 'Headshop',
  'FUMO': 'Fumo & Tabacos',
  'CHARUTOS E TABACOS': 'Fumo & Tabacos',
  'CIGARRO DE PALHA': 'Fumo & Tabacos',
  'RAPÉ': 'Fumo & Tabacos',
  'BLACK ERVA': 'Erva Mate & Tereré',
  'GARRAFA TÉRMICA': 'Erva Mate & Tereré',
  'ESSÊNCIA': 'Essências & Vape',
  'INCENSO': 'Incensos & Aromas',
  'ISQUEIROS': 'Isqueiros & Maçaricos',
  'MAÇARICO': 'Isqueiros & Maçaricos',
  'GÁS / FLUÍDO': 'Isqueiros & Maçaricos',
};

const catMap = {};
for (const c of categorias) {
  for (const s of c.subcategorias || []) {
    catMap[s.categoria_id] = { top: c.nome, sub: s.nome };
    for (const ss of s.subcategorias || []) catMap[ss.categoria_id] = { top: c.nome, sub: s.nome, subsub: ss.nome };
  }
}

// Build categories: merged tops keep the source sub name as subcategory
// To avoid duplicate sub names inside a merged top, prefix by source when needed.
const subBuckets = {}; // newTop -> Map(subKey -> {name, sourceTop})
for (const c of categorias) {
  const newTop = TOP_RENAME[c.nome];
  if (!newTop) continue;
  subBuckets[newTop] = subBuckets[newTop] || new Map();
  for (const s of c.subcategorias || []) {
    // skip BLACK ERVA 'ERVAS' handled below
    let subName = s.nome;
    // Title-case normalize
    subName = subName.charAt(0) + subName.slice(1).toLowerCase()
      .replace(/\bDE\b|\bE\b|\bDA\b|\bDO\b|\bPARA\b|\bCOM\b|\bEM\b/g, (m) => m.toLowerCase());
    // deduplicate within merged top: FUMO subs are brand names -> group under "Fumo para Narguilé"? keep brand names as subs but prefix line
    let key = subName;
    if (['Fumo & Tabacos'].includes(newTop) && ['FUMO'].includes(c.nome)) key = 'Fumo ' + subName;
    if (newTop === 'Erva Mate & Tereré' && c.nome === 'GARRAFA TÉRMICA') { key = 'Garrafa Térmica'; subName = 'Garrafa Térmica'; }
    if (!subBuckets[newTop].has(key)) subBuckets[newTop].set(key, { name: subName, sourceTop: c.nome, sourceSub: s.nome });
  }
}
// Renames inside new tops
if (subBuckets['Erva Mate & Tereré']) {
  const m = subBuckets['Erva Mate & Tereré'];
  if (m.has('Acessórios')) { const v = m.get('Acessórios'); m.delete('Acessórios'); m.set('Acessórios Chimarrão', { ...v, name: 'Acessórios Chimarrão' }); }
}
// Fumo & Tabacos: override subs by source top (product-type subcategories)
if (subBuckets['Fumo & Tabacos']) {
  subBuckets['Fumo & Tabacos'] = new Map([
    ['Fumo para Narguilé', { name: 'Fumo para Narguilé', sourceTop: 'FUMO', sourceSub: null }],
    ['Charutos', { name: 'Charutos', sourceTop: 'CHARUTOS E TABACOS', sourceSub: null }],
    ['Cigarro Orgânico', { name: 'Cigarro Orgânico', sourceTop: 'CHARUTOS E TABACOS', sourceSub: null }],
    ['Cigarro de Palha', { name: 'Cigarro de Palha', sourceTop: 'CIGARRO DE PALHA', sourceSub: null }],
    ['Rapé', { name: 'Rapé', sourceTop: 'RAPÉ', sourceSub: null }],
  ]);
}
// Isqueiros & Maçaricos: override subs by source top
if (subBuckets['Isqueiros & Maçaricos']) {
  subBuckets['Isqueiros & Maçaricos'] = new Map([
    ['Isqueiros', { name: 'Isqueiros', sourceTop: 'ISQUEIROS', sourceSub: null }],
    ['Maçaricos', { name: 'Maçaricos', sourceTop: 'MAÇARICO', sourceSub: null }],
    ['Gás & Fluído', { name: 'Gás & Fluído', sourceTop: 'GÁS / FLUÍDO', sourceSub: null }],
  ]);
}

// ---------- PRODUCT TRANSFORM ----------
const descriptionFor = (p, brand, cat, sub) => {
  const pack = p.nome.match(/(DSPL|CX\.?|PCT\.?)\s*C\/\s*\d+/i);
  const packTxt = pack ? `Embalagem de atacado: ${pack[0]}. ` : '';
  const base = `${p.nome}`;
  return `${base}. Produto profissional para revenda no segmento de tabacaria e headshop. ${packTxt}${brand ? 'Marca: ' + brand + '. ' : ''}${cat}${sub ? ' • ' + sub : ''}. Consulte condições especiais para atacado e kits para lojistas.`;
};

const products = [];
const brandCounts = {};
const skipped = [];
for (const p of produtos) {
  const cm = catMap[p.categoria_id];
  // manual assignment for the 5 uncategorized tabacaria items
  let top, sub, brandOverride;
  if (!cm) {
    const n = p.nome.toUpperCase();
    if (n.includes('BOMBA DE TERERÉ')) { top = 'Erva Mate & Tereré'; sub = 'Acessórios Tereré'; }
    else if (n.includes('HOOVER')) { top = 'Narguilé'; sub = 'Narguilé Completo'; }
    else if (n.includes('SQUADAFUM')) { top = 'Headshop'; sub = 'Pote de Silicone'; }
    else if (n.includes('SEDA LION')) { top = 'Headshop'; sub = 'Sedas'; }
    else { skipped.push(p.nome); continue; }
  } else {
    top = TOP_RENAME[cm.top];
    if (!top) { skipped.push(p.nome); continue; }
    const bucket = subBuckets[top];
    // find matching bucket entry by sourceSub
    let entry = null;
    for (const v of bucket.values()) if (v.sourceTop === cm.top && v.sourceSub === cm.sub) entry = v;
    sub = entry ? entry.name : (cm.sub || null);
  }
  const brand = detectBrand(p.nome);
  if (brand) brandCounts[brand] = (brandCounts[brand] || 0) + 1;

  const promo = promoMap.get(p.produto_id);
  const price = p.preco ?? p.preco_tabela ?? 0;
  products.push({
    code: p.codigo || String(p.produto_id),
    mercosId: p.produto_id,
    name: p.nome.replace(/\s+/g, ' ').trim(),
    slug: slugify(p.nome) + '-' + p.produto_id,
    brand: brand || 'Diversos',
    category: top,
    subcategory: sub,
    price,
    oldPrice: promo ? +(price * 1.2).toFixed(2) : null,
    onSale: !!promo,
    stock: p.produto_sem_estoque ? 0 : (p.saldo_estoque ?? 0),
    unit: p.unidade || 'UN',
    images: p.imagens || (p.imagem ? [p.imagem] : []),
    featured: featuredIds.has(p.produto_id),
    description: descriptionFor(p, brand, top, sub),
  });
}
// isNew: top 60 by mercosId (descending) in stock
const byId = [...products].sort((a, b) => b.mercosId - a.mercosId);
byId.slice(0, 60).forEach((p) => { p.isNew = true; });
products.forEach((p) => { p.isNew = !!p.isNew; });

// ---------- BRANDS LIST ----------
const BRAND_META = {
  'Squadafum': { tagline: 'A elite do vidro brasileiro', featured: true, order: 1 },
  'RAW': { tagline: 'The natural way to roll', featured: true, order: 2 },
  'OCB': { tagline: 'Tradição francesa em sedas', featured: true, order: 3 },
  'Zomo': { tagline: 'Fumo premium alemão', featured: true, order: 4 },
  'Elements': { tagline: 'Sedas de arroz ultra finas', featured: true, order: 5 },
  'Ziggy': { tagline: 'Carvão de coco performance', featured: true, order: 6 },
  'Smoking': { tagline: 'Sedas e filtros desde 1923', featured: true, order: 7 },
  'Lion Rolling Circus': { tagline: 'Circus style rolling', featured: true, order: 8 },
  'ZGY Brasil': { tagline: 'Fumo nacional alto padrão', featured: true, order: 9 },
  'Hoover': { tagline: 'Engenharia alemã de narguilé', featured: true, order: 10 },
  'Satya': { tagline: 'Incensos sagrados de Bangalore', featured: true, order: 11 },
  'Trust Liquid': { tagline: 'Essências para vape sem segredos', featured: true, order: 12 },
  'Zengaz': { tagline: 'Jet flames de precisão', featured: true, order: 13 },
  'Black Hookah': { tagline: 'Estilo e performance', featured: false, order: 14 },
  'Kaloud': { tagline: 'Controlador de calor original', featured: false, order: 15 },
  'Phillies': { tagline: 'Charutos legendários', featured: false, order: 16 },
  'Juriti': { tagline: 'Rapé de tradição', featured: false, order: 17 },
  'Zero Grau': { tagline: 'Rapé gelado premium', featured: false, order: 18 },
  'Diversos': { tagline: 'Curadoria multi-marcas', featured: false, order: 99 },
};
const BRAND_DESC = {
  'Squadafum': 'Referência absoluta do headshop nacional, a Squadafum transformou vidro, metal e silicone em objetos de desejo. Bongs de percolação, bandejas metálicas, potes herméticos e acessórios com acabamento impecável — cada peça carrega a estética urbana que o mercado procura.',
  'RAW': 'Criada por Josh Kesselman, a RAW é a marca de sedas mais respeitada do planeta. Papel 100% natural, sem cloro, sem aditivos: pura planta. Um ícone cultural que não pode faltar no balcão de nenhuma tabacaria que se preze.',
  'OCB': 'Desde 1918 a OCB aperfeiçoa a arte de enrolar. Origem francesa, papel ultrafino, queima lenta e ícones como a OCB Ultimate. A marca que une tradição centenária e tecnologia de papel.',
  'Zomo': 'Fumo alemão com padrão de qualidade obsessivo: cortes precisos, folhas selecionadas e sabores que dominam o paladar sem cansar. Uma das marcas mais vendidas do narguilé mundial.',
  'Elements': 'Sedas ultrafinas de arroz com tecnologia Rice Paper e sistema de queima cruzada. Fumada branca, sabor neutro e a assinatura visual que virou símbolo de status entre rollers.',
  'Ziggy': 'Carvão de coco 100% natural que virou padrão de qualidade no narguilé brasileiro: brasa estável, quase zero cinza e queima longa. Também domina em folhas de alumínio premium.',
  'Smoking': 'A espanholíssima Smoking encanta desde 1923 com sedas de queima impecável e a linha Menthol de filtros. Tradición e innovación em cada livreto.',
  'Lion Rolling Circus': 'Arte circense em cada embalagem. A Lion Rolling Circus trouxe cores, personagens e coleções colecionáveis para o universo das sedas — queridinha do público jovem.',
  'ZGY Brasil': 'Fumo produzido no Brasil com matérias-primas importadas e controle de qualidade rigoroso. Sabores tropicais que conquistaram o mercado nacional.',
  'Hoover': 'Narguilés alemães de engenharia precisa: stems em aço inox, vedação perfeita e design que impressiona. A escolha de quem entende de tiro e tiragem.',
  'Satya': 'Direto de Bangalore, o incenso Satya é o mais famoso do mundo — a clássica Super Hit e a mística Nag Champa perfumam templos, lojas e casas há décadas.',
  'Trust Liquid': 'Essências para vape com identidade brasileira: sabores cremosos, frutados e tabacos equilibrados, com controle rigoroso de nicotina por nível (0, 3 e 6mg).',
  'Zengaz': 'Maçaricos jet flame japoneses de precisão cirúrgica. Chama potente, segurar firme: o ZL-16 é ícone absoluto entre maçaricos premium.',
  'Black Hookah': 'Linha completa de vasos, abafadores e garrafas térmicas com identidade preta inconfundível e custo-benefício agressivo para revenda.',
  'Kaloud': 'O HMD (Heat Management Device) que revolucionou o narguilé mundial: controle térmico perfeito, sem papel alumínio, tiragem limpa.',
  'Phillies': 'Charuto americano de sucesso mundial: Blend Titan em versões Chocolate e Pink. Voltagem perfeita para revenda em display.',
  'Juriti': 'Rapé tradicional brasileiro com força equilibrada e aromas marcantes. Tradição ancestral em display de atacado.',
  'Zero Grau': 'Rapé refrescante com sensação gelada imediata. Morango com menta e pura menta: sucesso imediato no balcão.',
  'Diversos': 'Curadoria de produtos selecionados de diversos fabricantes parceiros — itens de giro rápido, preço competitivo e margem saudável para o lojista.',
};

const brands = Object.entries(brandCounts)
  .map(([name, count]) => ({
    name, slug: slugify(name), count,
    tagline: BRAND_META[name]?.tagline || 'Marca parceira do catálogo Aladdin',
    description: BRAND_DESC[name] || `Marca parceira presente na curadoria Aladdin Distribuidora. ${name} entrega qualidade consistente, giro de balcão comprovado e margem saudável para o lojista — com suporte de reposição rápido e condições especiais de atacado.`,
    featured: BRAND_META[name]?.featured || false,
    order: BRAND_META[name]?.order || 50,
  }))
  .sort((a, b) => a.order - b.order || b.count - a.count);

// ensure fallback house-curated brand exists
if (!brands.find((b) => b.slug === 'diversos')) {
  brands.push({
    name: 'Diversos', slug: 'diversos', count: products.filter((p) => p.brand === 'Diversos').length,
    tagline: BRAND_META['Diversos'].tagline, description: BRAND_DESC['Diversos'],
    featured: false, order: 99,
  });
}

fs.writeFileSync(`${OUT}/catalog.json`, JSON.stringify({
  brands, categories: Object.entries(subBuckets).map(([top, subs]) => ({ name: top, slug: slugify(top), subs: [...subs.values()].map((v) => v.name) })),
  products,
}, null, 0));

console.log('PRODUCTS:', products.length);
console.log('SKIPPED:', skipped.length, skipped.slice(0, 6));
console.log('BRANDS:', brands.length);
console.log(brands.map((b) => `${b.slug}:${b.count}`).join('  '));
const cats = Object.entries(subBuckets).map(([t, s]) => `${t}(${s.size})`).join('  ');
console.log('CATS:', cats);
console.log('featured:', products.filter((p) => p.featured).length, '| onSale:', products.filter((p) => p.onSale).length, '| isNew:', products.filter((p) => p.isNew).length, '| no-image:', products.filter((p) => p.images.length === 0).length);
