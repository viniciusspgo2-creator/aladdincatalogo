// Re-scrape ALL product images (detail endpoint) + BLACK ERVA category products
const fs = require('fs');
const TOKEN = fs.readFileSync('/home/z/pgtool/auth_token.txt', 'utf8').trim();
const BASE = 'https://aladdingoiania.meuspedidos.com.br';
const OUT = '/home/z/my-project/scripts/scraped';
const HEADERS = { Accept: 'application/json', Cookie: 'auth_token=' + TOKEN };

async function getJSON(url) {
  for (let a = 0; a < 5; a++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
      if (res.status === 429) { await new Promise(r => setTimeout(r, 4000)); continue }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (a === 4) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  // ---- 1. all images per product (catalog.json mercosIds = kept products)
  const catalog = JSON.parse(fs.readFileSync('/home/z/my-project/scripts/seed/catalog.json', 'utf8'));
  const map = {}; // mercosId -> [urls]
  const ids = catalog.products.map(p => p.mercosId).filter(Boolean);
  console.log('fetching details for', ids.length, 'products');
  let done = 0;
  // resume support
  const partialPath = OUT + '/imagens_completas_partial.json';
  let mapStart = {};
  try { mapStart = JSON.parse(fs.readFileSync(partialPath, 'utf8')) } catch {}
  Object.assign(map, mapStart);
  const pending = ids.filter(id => !(id in map));
  console.log('pending', pending.length);

  const WORKERS = 6;
  let cursor = 0;
  async function worker(wid) {
    while (true) {
      const i = cursor++;
      if (i >= pending.length) break;
      const id = pending[i];
      try {
        const j = await getJSON(`${BASE}/api_b2b/v1/produtos/${id}`);
        map[id] = (j.imagens || []);
      } catch (e) { map[id] = null; console.log('ERR', id, e.message) }
      done++;
      if (done % 40 === 0) {
        console.log('progress', done, '/', pending.length);
        fs.writeFileSync(partialPath, JSON.stringify(map));
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }
  await Promise.all(Array.from({ length: WORKERS }, (_, w) => worker(w)));
  fs.writeFileSync(OUT + '/imagens_completas.json', JSON.stringify(map));
  const multi = Object.values(map).filter(v => v && v.length > 1).length;
  console.log('DONE images. multi-image products:', multi);

  // ---- 2. BLACK ERVA category (4532730) products, all pages
  let page = 1, all = [];
  while (page <= 40) {
    const batch = await getJSON(`${BASE}/api_b2b/v1/produtos?categoria=4532730&representada=454961&comprados_recentemente=false&ordenar_por=1&limite=48&pagina=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all = all.concat(batch);
    console.log('black-erva page', page, '+', batch.length);
    page++;
    await new Promise(r => setTimeout(r, 400));
  }
  fs.writeFileSync(OUT + '/black_erva_raw.json', JSON.stringify(all));
  console.log('BLACK ERVA total:', all.length);
}

main().catch(e => { console.error('FAIL', e); process.exit(1) });
