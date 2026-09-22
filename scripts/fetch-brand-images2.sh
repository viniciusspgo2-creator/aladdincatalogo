#!/bin/bash
OUT=/home/z/my-project/scripts/scraped/brand-images
mkdir -p "$OUT"
fetch() {
  slug="$1"; query="$2"
  if [ -s "$OUT/$slug.json" ]; then echo "skip $slug"; return; fi
  echo "== $slug"
  timeout 100 z-ai image-search -q "$query" --count 3 --gl us --no-rank 2>/dev/null > "$OUT/$slug.json"
  sleep 1
}
fetch raw "RAW rolling papers black and gold brand banner"
fetch ocb "OCB rolling papers premium brand banner"
fetch zomo "Zomo hookah tobacco brand gold dark"
fetch squadafum "Squadafum hookah brand premium dark"
fetch elements "Elements rolling papers brand cone"
fetch smoking "Smoking papers gold brand banner"
fetch lion-rolling-circus "Lion Rolling Circus brand artwork"
fetch satya "Satya incense sticks premium box"
fetch zengaz "Zengaz jet flame lighter black"
fetch kaloud "Kaloud hookah heat management device"
fetch trust-liquid "vape liquid bottles dark premium"
fetch black-hookah "Black Hookah brand narguile"
fetch zgy-brasil "coconut charcoal hookah cubes premium"
fetch papelito "rolling papers pack brand"
fetch black-erva "erva mate chimarrão cuia bomba"
echo "ALL DONE"
