// src/app/icon.js
import { ImageResponse } from 'next/og'
 
// Configuração da imagem
export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
 
// Desenha o ícone com código!
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: '#DC2626', // Vermelho (red-600)
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '8px', // Cantos arredondados
          fontWeight: 900,
        }}
      >
        ▶
      </div>
    ),
    { ...size }
  )
}