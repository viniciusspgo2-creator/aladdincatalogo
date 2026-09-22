import { ImageResponse } from 'next/og'

export const alt = 'Aladdin Distribuidora — A nova geração da tabacaria'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', background: '#050505', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -200, left: -100, width: 700, height: 700, borderRadius: 999, background: 'radial-gradient(circle, rgba(201,162,39,0.22), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: -260, right: -80, width: 800, height: 800, borderRadius: 999, background: 'radial-gradient(circle, rgba(201,162,39,0.12), transparent 60%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 110, height: 110, borderRadius: 18, border: '3px solid #C9A227', color: '#C9A227', fontSize: 64, fontWeight: 700 }}>A</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#ffffff', fontSize: 56, fontWeight: 700, letterSpacing: 10 }}>ALADDIN</div>
            <div style={{ color: '#C9A227', fontSize: 22, letterSpacing: 16 }}>DISTRIBUIDORA</div>
          </div>
        </div>
        <div style={{ marginTop: 60, color: '#ffffff', fontSize: 44, fontWeight: 700, textAlign: 'center', maxWidth: 900, lineHeight: 1.2 }}>
          A nova geração da tabacaria começa aqui
        </div>
        <div style={{ marginTop: 28, color: '#9c9c96', fontSize: 24 }}>Atacado B2B • Tabacaria & Headshop • Goiânia — GO</div>
      </div>
    ),
    size,
  )
}
