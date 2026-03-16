import React, { useState } from 'react'

const PALETTE = [
  // Greens
  '#10b981','#059669','#047857','#065f46','#34d399',
  // Blues
  '#3b82f6','#2563eb','#1d4ed8','#0ea5e9','#06b6d4',
  // Purples
  '#8b5cf6','#7c3aed','#6d28d9','#a78bfa','#c084fc',
  // Pinks
  '#ec4899','#db2777','#be185d','#f472b6','#fb7185',
  // Oranges
  '#f97316','#ea580c','#c2410c','#fb923c','#fbbf24',
  // Reds
  '#ef4444','#dc2626','#b91c1c',
  // Grays / Darks
  '#475569','#334155','#1e293b','#0f172a',
  // White
  '#ffffff',
]

export default function ColorPicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false)

  const isValid = /^#[0-9A-Fa-f]{6}$/.test(value)

  return (
    <div style={{ marginBottom: 16, position: 'relative' }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600,
          fontSize: 13, color: '#374151' }}>
          {label}
        </label>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Color swatch button */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: 48, height: 48,
            background: isValid ? value : '#10b981',
            border: '2px solid #e5e7eb', borderRadius: 8,
            cursor: 'pointer', flexShrink: 0, position: 'relative',
            transition: 'transform .2s, box-shadow .2s',
            boxShadow: open ? '0 0 0 3px rgba(16,185,129,.4)' : 'none',
          }}
          title="Abrir paleta"
        />

        {/* Hex input */}
        <input
          value={value}
          onChange={e => {
            const v = e.target.value
            if (/^#?[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v.startsWith('#') ? v : '#' + v)
          }}
          maxLength={7}
          className="input"
          style={{ width: 110, fontFamily: 'monospace', fontSize: 14, padding: '10px 12px' }}
          placeholder="#10b981"
        />

        {/* Native system color picker */}
        <label style={{ position: 'relative', cursor: 'pointer' }} title="Selector del sistema">
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            border: '2px dashed #d1d5db',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, background: '#f9fafb',
            transition: 'var(--transition)',
          }}>
            🎨
          </div>
          <input
            type="color"
            value={isValid ? value : '#10b981'}
            onChange={e => onChange(e.target.value)}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              opacity: 0, cursor: 'pointer',
            }}
          />
        </label>

        {/* Toggle palette */}
        <button
          onClick={() => setOpen(o => !o)}
          className="btn"
          style={{ padding: '8px 14px', background: '#f1f5f9',
            color: '#475569', fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
        >
          {open ? 'Cerrar' : 'Paleta'}
        </button>
      </div>

      {/* Palette dropdown */}
      {open && (
        <div style={{
          marginTop: 10, padding: 14,
          background: 'white', border: '1px solid #e5e7eb',
          borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          position: 'absolute', zIndex: 200, left: 0,
          minWidth: 260,
        }}>
          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 10, fontWeight: 600 }}>
            PALETA DE COLORES
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PALETTE.map(c => (
              <button
                key={c}
                onClick={() => { onChange(c); setOpen(false) }}
                style={{
                  width: 32, height: 32,
                  background: c,
                  border: value === c ? '3px solid #1f2937' : '1.5px solid #e5e7eb',
                  borderRadius: 6, cursor: 'pointer',
                  transition: 'transform .15s',
                  outline: value === c ? '2px solid rgba(16,185,129,.5)' : 'none',
                  outlineOffset: 2,
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
