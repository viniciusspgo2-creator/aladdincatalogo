#!/bin/bash
# Busca imagens premium para heroes das marcas (uma chamada por marca)
OUT=/home/z/my-project/scripts/scraped/brand-images
mkdir -p "$OUT"

declare -A QUERIES=(
  [raw]="RAW rolling papers black and gold brand banner"
  [ocb]="OCB rolling papers premium brand banner"
  [zomo]="Zomo hookah tobacco brand gold dark"
  [squadafum]="Squadafum hookah brand premium dark"
  [elements]="Elements rolling papers brand"
  [smoking]="Smoking papers gold brand banner"
  [lion-rolling-circus]="Lion Rolling Circus brand artwork"
  [satya]="Satya incense sticks premium"
  [zengaz]="Zengaz jet lighter premium black"
  [kaloud]="Kaloud hookah heat management"
  [trust-liquid]="vape liquid bottles dark premium"
  [black-hookah]="Black Hookah brand narguile"
  [zgy-brasil]="coconut charcoal hookah cubes gold"
  [papelito]="rolling papers pack brand retro"
)

for slug in "${!QUERIES[@]}"; do
  if [ -s "$OUT/$slug.json" ]; then echo "skip $slug"; continue; fi
  echo "== searching: $slug — ${QUERIES[$slug]}"
  timeout 110 z-ai image-search -q "${QUERIES[$slug]}" --count 3 --gl us --no-rank -o "$OUT/$slug.json" 2>&1 | tail -1
  sleep 1
done
echo "ALL DONE"
