import React from 'react'
import { useStore } from '../context/StoreContext.jsx'

export default function CartModal({ onClose, onCheckout }) {
  const { carrito, removeFromCart, updateQty, cartTotal } = useStore()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: 17 }}>🛒 Carrito de Compras</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          {carrito.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>Tu carrito está vacío</p>
              <p style={{ fontSize: 13 }}>¡Agrega productos para comenzar!</p>
            </div>
          ) : (
            <>
              <div style={{ maxHeight: '55dvh', overflowY: 'auto' }}>
                {carrito.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', gap: 12, padding: '14px 20px',
                    borderBottom: '1px solid #f1f5f9', alignItems: 'center',
                  }}>
                    {item.imagen_url && (
                      <img src={item.imagen_url} alt={item.nombre}
                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.nombre}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary)' }}>
                        ${item.precio.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => updateQty(item.id, item.cantidad - 1)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb',
                          background: '#f9fafb', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
                        −
                      </button>
                      <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
                        {item.cantidad}
                      </span>
                      <button onClick={() => updateQty(item.id, item.cantidad + 1)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e5e7eb',
                          background: '#f9fafb', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
                        +
                      </button>
                      <button onClick={() => removeFromCart(item.id)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: 'none',
                          background: '#fee2e2', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}>
                        🗑
                      </button>
                    </div>
                    <div style={{ minWidth: 70, textAlign: 'right', fontWeight: 700,
                      color: 'var(--color-primary)', fontSize: 14, flexShrink: 0 }}>
                      ${(item.precio * item.cantidad).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 20px', borderTop: '2px solid var(--color-primary)20' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 14 }}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>Total:</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)' }}>
                    ${Math.round(cartTotal).toLocaleString()}
                  </span>
                </div>
                <button onClick={onCheckout} className="btn btn-primary btn-block btn-lg">
                  💳 Proceder al Pago
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
