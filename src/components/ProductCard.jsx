import React from 'react'
import { useStore } from '../context/StoreContext.jsx'

export default function ProductCard({ producto, onOpen }) {
  const { addToCart, storeConfig } = useStore()
  const { templateId } = storeConfig

  const agotado = producto.stock === 0

  const cardStyle = {
    classic: { borderRadius: 'var(--radius-lg)' },
    dark: { background: '#1e293b', color: '#f1f5f9', borderRadius: 'var(--radius-lg)' },
    minimal: { borderRadius: 4, boxShadow: 'none', border: '1px solid #e5e7eb' },
    bold: { borderRadius: 0, boxShadow: '4px 4px 0 var(--color-primary)' },
    soft: { borderRadius: 24 },
  }[templateId] || {}

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', ...cardStyle }}
      onClick={() => onOpen(producto)}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform .4s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{
            height: '100%',
            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48,
          }}>🌿</div>
        )}
        {agotado && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ background: '#ef4444', color: 'white',
              padding: '6px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
              Sin Stock
            </span>
          </div>
        )}
        {!agotado && producto.stock <= 5 && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: '#f59e0b', color: 'white',
            padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700
          }}>
            ¡Últimas {producto.stock}!
          </div>
        )}
        {producto.por_encargo && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: '#f59e0b', color: 'white',
            fontSize: 10, fontWeight: 700, padding: '3px 8px',
            borderRadius: 20, letterSpacing: .5,
            boxShadow: '0 2px 6px rgba(0,0,0,.2)',
          }}>
            📦 POR ENCARGO
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        {producto.categoria && (
          <span className="badge badge-green" style={{ marginBottom: 8 }}>
            {producto.categoria}
          </span>
        )}
        <h3 style={{
          fontSize: 14, fontWeight: 700, marginBottom: 6, lineHeight: 1.3,
          color: templateId === 'dark' ? '#f1f5f9' : '#1a1a1a',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p style={{
            fontSize: 12, color: templateId === 'dark' ? '#94a3b8' : '#6b7280',
            marginBottom: 10, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {producto.descripcion}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>
            ${producto.precio.toLocaleString()}
          </span>
          <button
            onClick={e => { e.stopPropagation(); if (!agotado) addToCart(producto) }}
            disabled={agotado}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 8, padding: '8px 14px', fontSize: 12 }}
          >
            {agotado ? '—' : '+ Carrito'}
          </button>
        </div>
      </div>
    </div>
  )
}
