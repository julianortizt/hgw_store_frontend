import React from 'react'
import { useStore } from '../context/StoreContext.jsx'

export default function ProductModal({ producto, onClose }) {
  const { addToCart } = useStore()
  if (!producto) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 10,
            background: 'rgba(0,0,0,.4)', color: 'white', border: 'none' }}>✕</button>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Image */}
          {producto.imagen_url && (
            <div style={{ maxHeight: 340, overflow: 'hidden', background: '#f8fafc', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src={producto.imagen_url} alt={producto.nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover',
                  borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />
            </div>
          )}
          <div style={{ padding: '20px 24px 24px' }}>
            {producto.categoria && (
              <span className="badge badge-green" style={{ marginBottom: 10 }}>
                {producto.categoria}
              </span>
            )}
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#1a1a1a' }}>
              {producto.nombre}
            </h2>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-primary)', marginBottom: 16 }}>
              ${producto.precio.toLocaleString()} COP
            </div>
            {producto.descripcion && (
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: .5 }}>Descripción</h4>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
                  {producto.descripcion}
                </p>
              </div>
            )}
            {producto.beneficios && (
              <div style={{ marginBottom: 16,
                background: 'var(--color-primary-light)',
                borderLeft: '4px solid var(--color-primary)',
                padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)',
                  marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>
                  Beneficios
                </h4>
                <p style={{ color: '#1a1a1a', fontSize: 14, lineHeight: 1.6 }}>
                  {producto.beneficios}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
              <span>Stock disponible: {producto.stock} unidades</span>
              {producto.stock <= 5 && producto.stock > 0 && (
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                  ⚠️ ¡Últimas unidades!
                </span>
              )}
            </div>
            <button
              onClick={() => { addToCart(producto); onClose() }}
              disabled={producto.stock === 0}
              className="btn btn-primary btn-block btn-lg"
            >
              {producto.stock === 0 ? '😔 Sin stock' : '🛒 Agregar al Carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
