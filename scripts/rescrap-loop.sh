#!/bin/bash
cd /home/z/my-project
for i in $(seq 1 30); do
  stdbuf -oL node scripts/rescrap-images.js >> scripts/rescrap.log 2>&1
  if [ -f scripts/scraped/imagens_completas.json ] && [ -f scripts/scraped/black_erva_raw.json ]; then
    echo "LOOP: done at iter $i" >> scripts/rescrap.log
    break
  fi
  echo "LOOP: restart $i" >> scripts/rescrap.log
  sleep 2
done
echo "LOOP: end" >> scripts/rescrap.log
