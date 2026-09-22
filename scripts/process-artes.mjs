// Process RAR PixVerse images → optimized public/artes + chatbot icon crop
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const SRC = '/home/z/my-project/upload/imagens'
const DST = '/home/z/my-project/public/artes'
fs.mkdirSync(DST, { recursive: true })

const jobs = [
  // [source, output, width, quality]
  ['PixVerse_Image_Effect_prompt_FAÇA UM CRIATIVO (1).png', 'colecao-narguile.jpg', 1400, 78],
  ['PixVerse_Image_Effect_prompt_FAÇA UM CRIATIVO (2).png', 'colecao-headshop.jpg', 1400, 78],
  ['PixVerse_Image_Effect_prompt_FAÇA UM CRIATIVO (8).png', 'colecao-fumos.jpg', 1400, 78],
  ['PixVerse_Image_Effect_prompt_FAÇA UM CRIATIVO (6).png', 'hero-bg.jpg', 1920, 74],
  ['PixVerse_Image_Effect_prompt_FAÇA UM CRIATIVO (3).png', 'acessorios-premium.jpg', 1600, 76],
  ['PixVerse_Image_Effect_prompt_FAÇA UM CRIATIVO (4).png', 'ervas-premium.jpg', 1600, 76],
  ['PixVerse_Image_Effect_prompt_FAÇA UM CRIATIVO (5).png', 'fumo-essencia.jpg', 1600, 76],
  ['PixVerse_Image_Effect_prompt_FAÇA UM CRIATIVO.png', 'flagship.jpg', 1600, 76],
  ['PixVerse_Image_Effect_prompt_FAÇA UM CRIATIVO (9).png', 'lifestyle-dark.jpg', 1600, 76],
]

async function main() {
  for (const [src, out, width, q] of jobs) {
    const input = path.join(SRC, src)
    const meta = await sharp(input).metadata()
    await sharp(input)
      .resize({ width: Math.min(width, meta.width || width), withoutEnlargement: true })
      .jpeg({ quality: q, mozjpeg: true })
      .toFile(path.join(DST, out))
    console.log('OK', out)
  }

  // chatbot icon: crop aladdin genie logo from (9) bottom-right
  const src9 = path.join(SRC, 'PixVerse_Image_Effect_prompt_FAÇA UM CRIATIVO (9).png')
  const m9 = await sharp(src9).metadata()
  console.log('image9 size', m9.width, m9.height)
  // logo approx bottom-right corner
  const region = {
    left: Math.round(m9.width * 0.905),
    top: Math.round(m9.height * 0.86),
    width: Math.round(m9.width * 0.088),
    height: Math.round(m9.height * 0.115),
  }
  await sharp(src9).extract(region).resize(240, 240, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 1 } }).png().toFile('/tmp/icon-crop-raw.png')
  console.log('crop done')
}
main().catch(e => { console.error(e); process.exit(1) })
