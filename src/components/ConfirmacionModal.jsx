import React from 'react'

const API = import.meta.env.VITE_API_URL || ''

export default function ConfirmacionModal({ data, onClose }) {
  if (!data) return null
  const { numero_factura, total, metodo_pago } = data

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '36px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: 8, fontSize: 22 }}>
            ¡Pedido Confirmado!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
            Tu pedido ha sido procesado exitosamente
          </p>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20,
            textAlign: 'left', marginBottom: 20, fontSize: 14 }}>
            <Row label="Factura" value={numero_factura} />
            <Row label="Total" value={`$${Math.round(total).toLocaleString()} COP`} bold />
            <Row label="Método" value={metodo_pago} />
          </div>

          {/* Nequi instructions */}
          {metodo_pago === 'Nequi' && (
            <div style={{ background: '#FF006B', color: 'white', borderRadius: 12,
              padding: 16, marginBottom: 20, textAlign: 'left', fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>📱 Instrucciones Nequi:</div>
              <p style={{ marginBottom: 6 }}>Escanea el QR o envía al número <strong>3159715768</strong></p>
              <p style={{ marginBottom: 6 }}>Valor: <strong>${Math.round(total).toLocaleString()}</strong></p>
              <p>Referencia: <strong>{numero_factura}</strong></p>
              <p style={{ fontSize: 11, marginTop: 8, opacity: .85 }}>
                Envía el comprobante por WhatsApp para confirmar tu pedido.
              </p>
            </div>
          )}

          {/* Transferencia instructions */}
          {metodo_pago === 'Efectivo/Transferencia' && (
            <div style={{ background: '#10b981', color: 'white', borderRadius: 12,
              padding: 16, marginBottom: 20, textAlign: 'left', fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>💵 Datos de Transferencia:</div>
              <p>Banco: <strong>Bancolombia</strong></p>
              <p>Cuenta Ahorros: <strong>123-456789-01</strong></p>
              <p>Titular: <strong>HGW Store SAS</strong></p>
              <p>Valor: <strong>${Math.round(total).toLocaleString()}</strong></p>
              <p style={{ fontSize: 11, marginTop: 8, opacity: .85 }}>
                Envía comprobante a: pagos@hgwstore.com
              </p>
            </div>
          )}

          <button
            onClick={() => window.open(`${API}/api/factura/${numero_factura}`, '_blank')}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginBottom: 10 }}
          >
            📄 Descargar Factura PDF
          </button>
          <button onClick={onClose} className="btn btn-outline btn-block">
            Continuar Comprando
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between',
      marginBottom: 8, fontSize: 14 }}>
      <span style={{ color: '#6b7280' }}>{label}:</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: bold ? 'var(--color-primary)' : '#1a1a1a' }}>
        {value}
      </span>
    </div>
  )
}
