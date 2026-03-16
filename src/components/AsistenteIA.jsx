import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../context/StoreContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''
const WHATSAPP_NUMBER = '573159715768'  // Cambia por tu número

const DOLENCIAS = {
  '🛡️ Inmunidad': {
    'Defensas bajas':           ['Ganoderma Coffee', 'Espirulina', 'Lactiberry'],
    'Resfriados frecuentes':    ['Ganoderma Coffee', 'Espirulina', 'Omega 3-6-9'],
    'Infecciones recurrentes':  ['Ganoderma Coffee', 'Espirulina', 'Lactiberry'],
    'Debilidad inmunológica':   ['Ganoderma Coffee', 'Espirulina', 'Omega 3-6-9', 'Cordyceps'],
  },
  '⚡ Energía': {
    'Cansancio o fatiga':       ['Ganoderma Coffee', 'Cordyceps Sinensis', 'Espirulina'],
    'Falta de energía':         ['Ganoderma Coffee', 'Berry Coffee', 'Cordyceps Sinensis'],
    'Bajo rendimiento físico':  ['Cordyceps Sinensis', 'Blueberry Soy Protein', 'Omega 3-6-9'],
    'Bajo rendimiento mental':  ['Ganoderma Coffee', 'Omega 3-6-9', 'Berry Coffee'],
  },
  '🫁 Digestión': {
    'Estreñimiento':            ['Lactiberry', 'Pro-Shaping Tea'],
    'Digestión lenta':          ['Lactiberry', 'Pro-Shaping Tea', 'Ganoderma Coffee'],
    'Inflamación abdominal':    ['Pro-Shaping Tea', 'Lactiberry', 'Omega 3-6-9'],
    'Gastritis o acidez':       ['Lactiberry', 'Ganoderma Coffee'],
  },
  '❤️ Corazón': {
    'Colesterol alto':          ['Omega 3-6-9', 'Ganoderma Coffee', 'Pro-Shaping Tea'],
    'Triglicéridos elevados':   ['Omega 3-6-9', 'Pro-Shaping Tea'],
    'Mala circulación':         ['Omega 3-6-9', 'Collar de Turmalina', 'Berry Coffee'],
    'Presión arterial alta':    ['Omega 3-6-9', 'Ganoderma Coffee'],
  },
  '⚖️ Peso': {
    'Quiero bajar de peso':     ['Pro-Shaping Tea', 'Blueberry Soy Protein', 'Lactiberry'],
    'Metabolismo lento':        ['Pro-Shaping Tea', 'Ganoderma Coffee', 'Espirulina'],
    'Toxinas acumuladas':       ['Pro-Shaping Tea', 'Espirulina', 'Waterson'],
  },
  '🧠 Estrés': {
    'Estrés o ansiedad':        ['Ganoderma Coffee', 'Cordyceps Sinensis', 'Collar de Turmalina'],
    'Insomnio':                 ['Ganoderma Coffee', 'Collar de Turmalina', 'Omega 3-6-9'],
    'Falta de concentración':   ['Ganoderma Coffee', 'Omega 3-6-9', 'Berry Coffee'],
  },
  '🦴 Articulaciones': {
    'Dolor articular':          ['Omega 3-6-9', 'Collar de Turmalina', 'Blueberry Colafruit'],
    'Rigidez articular':        ['Omega 3-6-9', 'Blueberry Colafruit', 'Collar de Turmalina'],
    'Debilidad muscular':       ['Blueberry Soy Protein', 'Cordyceps Sinensis', 'Espirulina'],
  },
  '✨ Piel': {
    'Piel seca':                ['Olive Soap', 'Blueberry Essence', 'Blueberry Colafruit'],
    'Envejecimiento prematuro': ['Blueberry Essence', 'Blueberry Colafruit', 'Espirulina'],
    'Manchas en la piel':       ['Blueberry Essence', 'Tourmaline Soap', 'Espirulina'],
    'Cuidado de la piel':       ['Olive Soap', 'Tourmaline Soap', 'Blueberry Essence'],
  },
}

const ALL_DOLENCIAS = Object.entries(DOLENCIAS).flatMap(([cat, items]) =>
  Object.entries(items).map(([nombre, productos]) => ({ nombre, productos, cat }))
)

const MSG_INIT = {
  role: 'assistant',
  content: `¡Hola! Soy **VERA** 🌿, tu asesora de bienestar natural de HGW Store.\n\nCuéntame cómo te sientes y te recomiendo el producto ideal según tu caso.\n\n¿O prefieres explorar por área de salud?`,
}

function renderContent(text) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    return (
      <p key={i} style={{ margin: '3px 0', lineHeight: 1.5, fontSize: 13 }}
        dangerouslySetInnerHTML={{ __html: bold }} />
    )
  })
}

function abrirWhatsApp(mensaje) {
  const texto = encodeURIComponent(mensaje)
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`, '_blank')
}

function detectarVenta(respuesta) {
  const match = respuesta.match(/\[VENTA_DETECTADA:([^:]+):([^:]+):([^\]]+)\]/)
  if (!match) return null
  return { cliente: match[1], productos: match[2], total: match[3] }
}

function limpiarRespuesta(texto) {
  return texto.replace(/\[VENTA_DETECTADA:[^\]]+\]/g, '').trim()
}

function DolenciaChip({ dolencia, productos, colores, onClick }) {
  const [hovered, setHovered] = useState(false)
  const chipRef = useRef(null)
  const [tooltipPos, setTooltipPos] = useState('bottom')

  const handleMouseEnter = () => {
    if (chipRef.current) {
      const rect = chipRef.current.getBoundingClientRect()
      setTooltipPos(window.innerHeight - rect.bottom < 140 ? 'top' : 'bottom')
    }
    setHovered(true)
  }

  return (
    <div ref={chipRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => onClick(dolencia, productos)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(true)}
        onTouchEnd={() => setTimeout(() => setHovered(false), 1800)}
        style={{
          padding: '5px 12px', borderRadius: 20,
          border: `1.5px solid ${colores.primario}50`,
          background: hovered ? colores.primario : '#f0fdf4',
          color: hovered ? 'white' : colores.acento,
          fontSize: 12, cursor: 'pointer',
          transition: 'all .18s ease', fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {dolencia}
      </button>

      {hovered && (
        <div style={{
          position: 'absolute',
          [tooltipPos === 'bottom' ? 'top' : 'bottom']: 'calc(100% + 8px)',
          left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: 'white',
          borderRadius: 10, padding: '10px 14px',
          minWidth: 210, maxWidth: 270,
          zIndex: 9999,
          boxShadow: '0 8px 24px rgba(0,0,0,.4)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 7, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: .6 }}>
            ✨ Productos recomendados
          </div>
          {productos.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%',
                background: colores.primario, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.3 }}>{p}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 10, color: '#64748b',
            borderTop: '1px solid #334155', paddingTop: 6 }}>
            Click para consultar con VERA →
          </div>
        </div>
      )}
    </div>
  )
}

export default function AsistenteIA() {
  const { storeConfig } = useStore()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([MSG_INIT])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('chat')
  const endRef = useRef(null)
  const { colores } = storeConfig

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (texto) => {
    const text = (texto || input).trim()
    if (!text || loading) return
    setInput('')
    const userMsg = { role: 'user', content: text }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/asistente/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historial: newHistory }),
      })
      const data = await res.json()
      const respuesta = data.respuesta
      const venta = detectarVenta(respuesta)
      const respuestaLimpia = limpiarRespuesta(respuesta)
      setMessages(prev => [...prev, { role: 'assistant', content: respuestaLimpia }])

      if (venta) {
        const msgWA = `Hola HGW Store! 🌿 Me interesa comprar:\n\n• ${venta.productos}\n\nTotal: ${venta.total}\n\n¿Me pueden ayudar con el pedido?`
        setTimeout(() => {
          abrirWhatsApp(msgWA)
        }, 800)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '😔 Hubo un error de conexión. ¿Puedes intentarlo de nuevo?'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleChipClick = (dolencia, prods) => {
    setView('chat')
    const userMsg = { role: 'user', content: `Tengo ${dolencia.toLowerCase()}` }
    const respuesta = `Para **${dolencia}**, estas son las opciones naturales disponibles:\n\n${prods.map(p => `• ${p}`).join('\n')}\n\n¿Te gustaría saber más sobre alguno de estos productos? 🌿`
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: respuesta }])
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 80, right: 16,
          background: `linear-gradient(135deg, ${colores.primario}, ${colores.secundario})`,
          color: 'white', border: 'none', borderRadius: 16,
          padding: '10px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,.3)',
          fontSize: 14, fontWeight: 700, zIndex: 800,
          animation: open ? 'none' : 'pulse 3s infinite',
        }}
      >
        🤖 {open ? 'Cerrar' : 'VERA IA'}
        {!open && (
          <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: 10, padding: '2px 6px', fontSize: 10 }}>
            Consejo gratis
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 0, right: 0, left: 0,
          maxWidth: 400, marginLeft: 'auto',
          background: 'white', borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 32px rgba(0,0,0,.2)',
          zIndex: 850, display: 'flex', flexDirection: 'column',
          height: '76dvh', maxHeight: 620,
        }}>

          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${colores.primario}, ${colores.secundario})`,
            color: 'white', padding: '14px 16px',
            borderRadius: '20px 20px 0 0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Asistente VERA</div>
                <div style={{ fontSize: 10, opacity: .8 }}>● En línea — HGW Store</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setView(v => v === 'guia' ? 'chat' : 'guia')}
                style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: 'white',
                  borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>
                {view === 'guia' ? '💬 Chat' : '📋 Guía'}
              </button>
              <button onClick={() => setOpen(false)} style={{
                background: 'rgba(255,255,255,.2)', color: 'white', border: 'none',
                borderRadius: '50%', width: 30, height: 30, fontSize: 16,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
          </div>

          {/* GUIA — chips con hover tooltip */}
          {view === 'guia' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 20px' }}>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14, lineHeight: 1.6,
                background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                🖱️ <strong>Pasa el cursor</strong> sobre cada síntoma para ver los productos recomendados. Haz click para consultar con VERA.
              </p>
              {Object.entries(DOLENCIAS).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#374151', marginBottom: 8 }}>
                    {cat}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(items).map(([dolencia, prods]) => (
                      <DolenciaChip key={dolencia} dolencia={dolencia} productos={prods}
                        colores={colores} onClick={handleChipClick} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 4px',
                display: 'flex', flexDirection: 'column', gap: 10 }}>

                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${colores.primario}, ${colores.secundario})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, marginRight: 6, marginTop: 2,
                      }}>🤖</div>
                    )}
                    <div style={{
                      maxWidth: '80%', padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.role === 'user'
                        ? `linear-gradient(135deg, ${colores.primario}, ${colores.secundario})`
                        : '#f1f5f9',
                      color: msg.role === 'user' ? 'white' : '#1a1a1a',
                    }}>
                      {renderContent(msg.content)}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', gap: 6, padding: '10px 14px',
                    background: '#f1f5f9', borderRadius: '18px 18px 18px 4px', width: 'fit-content' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%', background: colores.primario,
                        animation: 'pulse 1.2s ease infinite', animationDelay: `${i*.2}s`,
                      }} />
                    ))}
                  </div>
                )}

                {/* Chips rápidos solo en el mensaje inicial */}
                {messages.length === 1 && !loading && (
                  <div style={{ marginTop: 4 }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>
                      Toca un síntoma o escribe tu consulta:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {ALL_DOLENCIAS.slice(0, 8).map(({ nombre, productos }) => (
                        <DolenciaChip key={nombre} dolencia={nombre} productos={productos}
                          colores={colores} onClick={handleChipClick} />
                      ))}
                      <button onClick={() => setView('guia')} style={{
                        padding: '5px 12px', borderRadius: 20,
                        border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280',
                        fontSize: 12, cursor: 'pointer', fontWeight: 500,
                      }}>
                        📋 Ver todos los síntomas
                      </button>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '10px 14px 14px', borderTop: '1px solid #f1f5f9',
                display: 'flex', gap: 8, flexShrink: 0 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="¿Cómo te sientes hoy?"
                  style={{
                    flex: 1, padding: '10px 14px',
                    border: '1.5px solid #e5e7eb', borderRadius: 24,
                    fontSize: 13, outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = colores.primario}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  style={{
                    background: input.trim() && !loading ? colores.primario : '#e5e7eb',
                    color: input.trim() && !loading ? 'white' : '#9ca3af',
                    border: 'none', borderRadius: 24, padding: '10px 18px',
                    cursor: input.trim() && !loading ? 'pointer' : 'default',
                    fontSize: 13, fontWeight: 700, transition: 'all .2s',
                  }}
                >
                  Enviar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
