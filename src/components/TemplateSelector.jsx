import React from 'react'
import { TEMPLATES } from '../themes/index.js'
import { useStore } from '../context/StoreContext.jsx'
import ColorPicker from './ColorPicker.jsx'

export default function TemplateSelector({ onClose }) {
  const { storeConfig, setTemplate, updateColors } = useStore()
  const { templateId, colores } = storeConfig

  const applyTemplate = (tpl) => {
    setTemplate(tpl.id)
    updateColors({
      primario:   tpl.defaults.colorPrimary,
      secundario: tpl.defaults.colorSecondary,
      acento:     tpl.defaults.colorAccent,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: 18 }}>🎨 Personalizar Tienda</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">

          {/* Template grid */}
          <h3 style={{ marginBottom: 12, fontSize: 14, color: '#374151', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: .5 }}>
            Plantillas
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 12, marginBottom: 28,
          }}>
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl)}
                style={{
                  border: templateId === tpl.id
                    ? '3px solid var(--color-primary)'
                    : '2px solid #e5e7eb',
                  borderRadius: 12, padding: 0,
                  background: 'white', cursor: 'pointer',
                  overflow: 'hidden',
                  boxShadow: templateId === tpl.id
                    ? '0 0 0 3px rgba(16,185,129,.2)'
                    : 'none',
                  transition: 'all .2s',
                  transform: templateId === tpl.id ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                {/* Preview swatch */}
                <div style={{
                  height: 60, background: tpl.preview,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                }}>
                  {tpl.emoji}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{tpl.name}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.3 }}>
                    {tpl.description}
                  </div>
                </div>
                {templateId === tpl.id && (
                  <div style={{
                    background: 'var(--color-primary)', color: 'white',
                    fontSize: 10, fontWeight: 700, textAlign: 'center',
                    padding: '4px 0', letterSpacing: .5,
                  }}>
                    ✓ ACTIVA
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Custom colors */}
          <h3 style={{ marginBottom: 12, fontSize: 14, color: '#374151', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: .5 }}>
            Colores personalizados
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}>
            <ColorPicker
              label="🎨 Color Principal"
              value={colores.primario}
              onChange={v => updateColors({ ...colores, primario: v })}
            />
            <ColorPicker
              label="🎨 Color Secundario"
              value={colores.secundario}
              onChange={v => updateColors({ ...colores, secundario: v })}
            />
            <ColorPicker
              label="🎨 Color Acento"
              value={colores.acento}
              onChange={v => updateColors({ ...colores, acento: v })}
            />
          </div>

          <div style={{ marginTop: 20, padding: 14, background: '#f0fdf4',
            borderRadius: 10, border: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: 12, color: '#166534', margin: 0 }}>
              💡 Los cambios se aplican en tiempo real. Si estás logueado como admin o vendedor, los colores también se guardan en la base de datos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
