// Scrape full catalog from Mercos B2B API (meuspedidos) using auth_token cookie
const fs = require('fs');
const TOKEN = fs.readFileSync('/home/z/pgtool/auth_token.txt', 'utf8').trim();
const BASE = 'https://aladdingoiania.meuspedidos.com.br';
const HEADERS = {
  Accept: 'application/json',
  Cookie: `auth_token=${TOKEN}`,
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153 Safari/537.36',
};

async function getJSON(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 429) { await new Promise(r => setTimeout(r, 3000)); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 1500));
    }
  }
}

async function main() {
  const out = '/home/z/my-project/scripts/scraped';
  fs.mkdirSync(out, { recursive: true });

  // 1. Categories tree
  const categorias = await getJSON(`${BASE}/api_b2b/v1/categorias`);
  fs.writeFileSync(`${out}/categorias.json`, JSON.stringify(categorias, null, 1));
  const topCats = categorias.map(c => `${c.categoria_id} ${c.nome} (subs: ${(c.subcategorias || []).length})`);
  console.log('TOP-LEVEL CATEGORIES:', topCats.length);
  console.log(topCats.join('\n'));

  // 2. Products — paginate (API caps at 48/page)
  let page = 1, all = [];
  while (page <= 200) {
    const batch = await getJSON(`${BASE}/api_b2b/v1/produtos?comprados_recentemente=false&ordenar_por=1&limite=48&pagina=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all = all.concat(batch);
    console.log(`page ${page}: +${batch.length} (total ${all.length})`);
    page++;
    await new Promise(r => setTimeout(r, 350));
  }
  fs.writeFileSync(`${out}/produtos_raw.json`, JSON.stringify(all));
  console.log('TOTAL PRODUCTS:', all.length);

  // 3. Destaques & promocoes for featured flags
  try {
    const destaques = await getJSON(`${BASE}/api_b2b/v1/destaques`);
    fs.writeFileSync(`${out}/destaques.json`, JSON.stringify(destaques));
    console.log('DESTAQUES:', Array.isArray(destaques) ? destaques.length : Object.keys(destaques).length);
  } catch (e) { console.log('destaques fail', e.message); }
  try {
    const promos = await getJSON(`${BASE}/api_b2b/v1/promocoes`);
    fs.writeFileSync(`${out}/promocoes.json`, JSON.stringify(promos));
    console.log('PROMOCOES:', Array.isArray(promos) ? promos.length : Object.keys(promos).length);
  } catch (e) { console.log('promos fail', e.message); }
}

main().catch(e => { console.error('SCRAPER FAIL:', e); process.exit(1); });
