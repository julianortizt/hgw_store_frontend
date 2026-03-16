import React, { useState } from 'react'
import { useStore } from '../context/StoreContext.jsx'

const API = import.meta.env.VITE_API_URL || ''

export default function CheckoutModal({ onClose, onSuccess }) {
  const { carrito, cartTotal, clearCart, user, showToast } = useStore()
  const [step, setStep] = useState('datos') // 'datos' | 'pago'
  const [loading, setLoading] = useState(false)
  const [cliente, setCliente] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    cedula: '',
    ciudad: '',
    direccion: '',
  })

  const setField = (k, v) => setCliente(c => ({ ...c, [k]: v }))

  const validarDatos = () => {
    if (!cliente.nombre.trim()) return 'Ingresa tu nombre completo'
    if (!cliente.email.includes('@')) return 'Email inválido'
    if (cliente.telefono.length < 7) return 'Teléfono inválido'
    if (!cliente.direccion || cliente.direccion.length < 8) return 'Dirección incompleta'
    return null
  }

  const procesarPago = async (metodo) => {
    const err = validarDatos()
    if (err) return showToast(err, 'error')
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/checkout/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente,
          productos: carrito.map(i => ({
            id: i.id, nombre: i.nombre, cantidad: i.cantidad, precio: i.precio,
          })),
          total: Math.round(cartTotal),
          metodo_pago: metodo,
          vendedor_id: user?.tipo === 'vendedor' ? user.id : null,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.detail || 'Error procesando pedido')

      if (metodo === 'Wompi') {
        if (typeof window.WidgetCheckout === 'undefined') {
          showToast('Wompi no está disponible. Recarga la página.', 'error')
          setLoading(false)
          return
        }
        const wk = new window.WidgetCheckout({
          currency: 'COP',
          amountInCents: Math.round(cartTotal) * 100,
          reference: data.reference,
          publicKey: data.public_key,
          redirectUrl: window.location.origin,
        })
        wk.open(result => {
          const tx = result.transaction
          if (tx.status === 'APPROVED') {
            clearCart()
            onSuccess({ ...data, metodo_pago: metodo, total: cartTotal, cliente })
          } else if (tx.status === 'DECLINED') {
            showToast('Pago rechazado. Intenta con otro método.', 'error')
          } else {
            showToast('Pago pendiente. Revisa tu email.', 'error')
          }
        })
        setLoading(false)
        return
      }

      clearCart()
      onSuccess({ ...data, metodo_pago: metodo, total: cartTotal, cliente })
    } catch (e) {
      showToast(e.message || 'Error procesando pago', 'error')
    } finally {
      setLoading(false)
    }
  }

  const FIELD_CONFIG = [
    { key: 'nombre', label: 'Nombre completo *', type: 'text', placeholder: 'Juan Pérez', cols: 2 },
    { key: 'email', label: 'Email *', type: 'email', placeholder: 'juan@email.com', cols: 1 },
    { key: 'telefono', label: 'Teléfono *', type: 'tel', placeholder: '3001234567', cols: 1 },
    { key: 'cedula', label: 'Cédula', type: 'text', placeholder: '1234567890', cols: 1 },
    { key: 'ciudad', label: 'Ciudad *', type: 'text', placeholder: 'Medellín', cols: 1 },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: 17 }}>
            {step === 'datos' ? '📋 Datos de Envío' : '💳 Método de Pago'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', background: '#f1f5f9' }}>
          {['datos', 'pago'].map((s, i) => (
            <div key={s} style={{
              flex: 1, padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 600,
              background: step === s ? 'var(--color-primary)' : 'transparent',
              color: step === s ? 'white' : '#94a3b8',
              cursor: s === 'pago' && step === 'datos' ? 'default' : 'pointer',
              transition: 'var(--transition)',
            }}>
              {i + 1}. {s === 'datos' ? 'Tus datos' : 'Pago'}
            </div>
          ))}
        </div>

        <div className="modal-body">
          {step === 'datos' ? (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
              }}>
                {FIELD_CONFIG.map(({ key, label, type, placeholder, cols }) => (
                  <div key={key} style={{ gridColumn: cols === 2 ? '1 / -1' : 'auto' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                      color: '#374151', marginBottom: 4 }}>{label}</label>
                    <input
                      type={type} placeholder={placeholder}
                      value={cliente[key]}
                      onChange={e => setField(key, e.target.value)}
                      className="input"
                    />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600,
                    color: '#374151', marginBottom: 4 }}>Dirección de envío *</label>
                  <textarea
                    placeholder="Calle 123 #45-67, Apto 801"
                    value={cliente.direccion}
                    onChange={e => setField('direccion', e.target.value)}
                    className="input"
                    style={{ minHeight: 72, resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Resumen */}
              <div style={{ marginTop: 16, padding: 14, background: '#f8fafc',
                borderRadius: 10, fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#374151' }}>
                  Resumen del pedido
                </div>
                {carrito.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between',
                    marginBottom: 4, color: '#475569' }}>
                    <span>{i.nombre} ×{i.cantidad}</span>
                    <span>${(i.precio * i.cantidad).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid var(--color-primary)', paddingTop: 8,
                  marginTop: 8, display: 'flex', justifyContent: 'space-between',
                  fontWeight: 800, fontSize: 16, color: 'var(--color-primary)' }}>
                  <span>TOTAL</span>
                  <span>${Math.round(cartTotal).toLocaleString()} COP</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const err = validarDatos()
                  if (err) { showToast(err, 'error'); return }
                  setStep('pago')
                }}
                className="btn btn-primary btn-block btn-lg"
                style={{ marginTop: 16 }}
              >
                Continuar al Pago →
              </button>
            </>
          ) : (
            <>
              <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>
                Selecciona tu método de pago preferido:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: '💳 Tarjeta / PSE con Wompi', metodo: 'Wompi',
                    bg: 'var(--color-primary)', desc: 'Pago seguro online' },
                  { label: '📱 Nequi', metodo: 'Nequi',
                    bg: '#FF006B', desc: 'Escaneando QR o número' },
                  { label: '💵 Efectivo / Transferencia', metodo: 'Efectivo/Transferencia',
                    bg: '#10b981', desc: 'Pago en efectivo o consignación' },
                ].map(({ label, metodo, bg, desc }) => (
                  <button
                    key={metodo}
                    onClick={() => procesarPago(metodo)}
                    disabled={loading}
                    style={{
                      background: bg, color: 'white', border: 'none',
                      padding: '16px 20px', borderRadius: 12,
                      cursor: loading ? 'wait' : 'pointer', textAlign: 'left',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'opacity .2s', opacity: loading ? .7 : 1,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{label}</div>
                      <div style={{ fontSize: 12, opacity: .85 }}>{desc}</div>
                    </div>
                    <span style={{ fontSize: 20 }}>→</span>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep('datos')}
                style={{ marginTop: 14, background: 'none', border: 'none',
                  color: '#6b7280', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                ← Volver a mis datos
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
