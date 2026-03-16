import React, { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext.jsx'

const API = import.meta.env.VITE_API_URL || ''

export default function HeroSlider({ productos }) {
  const { storeConfig } = useStore()
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const [imgRatios, setImgRatios] = useState({})

  useEffect(() => {
    fetch(`${API}/api/banner`)
      .then(r => r.json())
      .then(d => { if (d.slides?.length) setSlides(d.slides) })
      .catch(() => {})
  }, [])

  const items = slides.length > 0
    ? slides
    : productos.slice(0, 5).map(p => ({
        id: p.id,
        imagen_url: p.imagen_url,
        categoria: p.categoria || '',
        titulo: p.nombre,
        subtitulo: p.descripcion,
        producto: p,
      }))

  useEffect(() => {
    if (items.length === 0) return
    const t = setInterval(() => setCurrent(c => (c + 1) % items.length), 5000)
    return () => clearInterval(t)
  }, [items.length])

  const handleImgLoad = (e, id) => {
    const { naturalWidth, naturalHeight } = e.target
    setImgRatios(prev => ({ ...prev, [id]: naturalWidth / naturalHeight }))
  }

  if (items.length === 0) return null

  return (
    <div style={{
      position: 'relative', width: '100%',
      height: 'clamp(220px, 45vw, 480px)',
      overflow: 'hidden',
      background: `linear-gradient(135deg, ${storeConfig.colores.primario}, ${storeConfig.colores.secundario})`,
    }}>
      {items.map((item, i) => {
        const ratio = imgRatios[item.id] || 1
        const isVertical = ratio < 0.9
        return (
          <div key={item.id} style={{
            position: 'absolute', inset: 0,
            opacity: current === i ? 1 : 0,
            transition: 'opacity 1s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {item.imagen_url ? (
              <>
                {/* Fondo difuminado para imágenes verticales */}
                <img src={item.imagen_url} alt=""
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    filter: 'blur(18px) brightness(0.55) saturate(1.3)',
                    transform: 'scale(1.12)',
                  }} aria-hidden="true" />

                {/* Imagen principal */}
                <img
                  src={item.imagen_url}
                  alt={item.titulo || item.categoria}
                  onLoad={e => handleImgLoad(e, item.id)}
                  style={{
                    position: 'relative', zIndex: 1,
                    width: isVertical ? 'auto' : '100%',
                    height: '100%',
                    maxWidth: isVertical ? '55%' : '100%',
                    objectFit: 'contain',
                    objectPosition: 'center center',
                  }}
                />
              </>
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', color: 'white', textAlign: 'center', padding: 24,
              }}>
                {item.titulo && (
                  <div style={{ fontSize: 'clamp(18px,5vw,40px)', fontWeight: 900, marginBottom: 8 }}>
                    {item.titulo}
                  </div>
                )}
                {item.subtitulo && (
                  <div style={{ fontSize: 'clamp(13px,2vw,18px)', opacity: .9, maxWidth: 600 }}>
                    {item.subtitulo}
                  </div>
                )}
                {item.producto?.precio && (
                  <div style={{ fontSize: 'clamp(16px,3vw,28px)', fontWeight: 800, marginTop: 12 }}>
                    ${item.producto.precio.toLocaleString()} COP
                  </div>
                )}
              </div>
            )}

            {/* Overlay gradiente con texto */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
              background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.3) 50%, transparent 100%)',
              padding: 'clamp(20px,4vw,50px) clamp(16px,5vw,60px) clamp(16px,3vw,32px)',
            }}>
              {/* Categoría badge */}
              {item.categoria && (
                <div style={{
                  display: 'inline-block',
                  background: storeConfig.colores.primario,
                  color: 'white', fontSize: 'clamp(10px,1.5vw,13px)',
                  fontWeight: 700, padding: '3px 12px',
                  borderRadius: 20, marginBottom: 8,
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  {item.categoria}
                </div>
              )}

              {/* Título */}
              {item.titulo && (
                <div style={{
                  color: 'white', fontWeight: 900,
                  fontSize: 'clamp(16px,4vw,36px)',
                  textShadow: '0 2px 12px rgba(0,0,0,.7)',
                  lineHeight: 1.2, marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  {item.titulo}
                </div>
              )}

              {/* Subtítulo */}
              {item.subtitulo && (
                <div style={{
                  color: 'rgba(255,255,255,.88)',
                  fontSize: 'clamp(12px,1.8vw,16px)',
                  textShadow: '0 1px 6px rgba(0,0,0,.6)',
                  maxWidth: 600, lineHeight: 1.5,
                }}>
                  {item.subtitulo}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Dots */}
      {items.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6, zIndex: 3,
        }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: current === i ? 24 : 8, height: 8,
              borderRadius: 4, border: 'none',
              background: current === i ? 'white' : 'rgba(255,255,255,.5)',
              cursor: 'pointer', transition: 'all .3s', padding: 0,
            }} />
          ))}
        </div>
      )}

      {/* Arrows */}
      <button className="hide-mobile" onClick={() => setCurrent(c => (c - 1 + items.length) % items.length)}
        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 3,
          background: 'rgba(0,0,0,.4)', color: 'white', border: 'none',
          borderRadius: '50%', width: 40, height: 40, fontSize: 20, cursor: 'pointer' }}>
        ‹
      </button>
      <button className="hide-mobile" onClick={() => setCurrent(c => (c + 1) % items.length)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 3,
          background: 'rgba(0,0,0,.4)', color: 'white', border: 'none',
          borderRadius: '50%', width: 40, height: 40, fontSize: 20, cursor: 'pointer' }}>
        ›
      </button>
    </div>
  )
}
