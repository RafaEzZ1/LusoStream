// src/app/icon.js
import { ImageResponse } from 'next/og'
 
// Configuração da imagem (tamanho e tipo)
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
          background: '#DC2626', // Fundo Vermelho (cor da marca)
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',        // Seta Branca
          borderRadius: '8px',   // Cantos arredondados
          fontWeight: 900,
        }}
      >
        ▶
      </div>
    ),
    { ...size }
  )
}