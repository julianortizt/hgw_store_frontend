import React, { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext.jsx'

const API = import.meta.env.VITE_API_URL || ''

export default function PanelVendedor({ onClose }) {
  const { authHeader, user, showToast, productos: prodDisp } = useStore()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(false)
  const [pedidoForm, setPedidoForm] = useState({
    cliente: { nombre:'', cedula:'', telefono:'', direccion:'', ciudad:'' },
    productos: [],
    metodo_pago: 'Efectivo',
  })
  const [productosBD, setProductosBD] = useState([])
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidadProd, setCantidadProd] = useState(1)

  const headers = { 'Content-Type':'application/json', ...authHeader() }

  useEffect(() => { loadTab() }, [tab])

  useEffect(() => {
    fetch(`${API}/api/productos?limit=200`)
      .then(r => r.json())
      .then(d => setProductosBD(d.productos || []))
      .catch(() => {})
  }, [])

  const loadTab = async () => {
    setLoading(true)
    try {
      if (tab === 'stats') {
        const r = await fetch(`${API}/api/admin/estadisticas`, { headers })
        const d = await r.json()
        setStats(d.estadisticas)
      }
      if (tab === 'ventas') {
        const r = await fetch(`${API}/api/vendedor/mis-ventas`, { headers })
        const d = await r.json()
        setVentas(d.ventas || [])
      }
    } catch { showToast('Error cargando datos', 'error') }
    finally { setLoading(false) }
  }

  const agregarProducto = () => {
    const prod = productosBD.find(p => p.id === parseInt(productoSeleccionado))
    if (!prod) return showToast('Selecciona un producto', 'error')
    const existe = pedidoForm.productos.find(p => p.id === prod.id)
    if (existe) {
      setPedidoForm(f => ({
        ...f,
        productos: f.productos.map(p => p.id === prod.id
          ? { ...p, cantidad: p.cantidad + cantidadProd }
          : p)
      }))
    } else {
      setPedidoForm(f => ({
        ...f,
        productos: [...f.productos, { id:prod.id, nombre:prod.nombre, precio:prod.precio, cantidad:cantidadProd }]
      }))
    }
    setProductoSeleccionado('')
    setCantidadProd(1)
  }

  const totalPedido = pedidoForm.productos.reduce((t, p) => t + p.precio * p.cantidad, 0)

  const realizarPedido = async () => {
    if (!pedidoForm.cliente.nombre) return showToast('Ingresa el nombre del cliente', 'error')
    if (!pedidoForm.productos.length) return showToast('Agrega al menos un producto', 'error')
    try {
      const r = await fetch(`${API}/api/vendedor/pedido`, {
        method: 'POST', headers,
        body: JSON.stringify({ ...pedidoForm, total: totalPedido }),
      })
      const d = await r.json()
      if (d.success) {
        showToast(`✅ Pedido ${d.numero_factura} creado`)
        setPedidoForm({ cliente:{nombre:'',cedula:'',telefono:'',direccion:'',ciudad:''}, productos:[], metodo_pago:'Efectivo' })
        setTab('ventas')
      }
    } catch { showToast('Error creando pedido', 'error') }
  }

  const TABS = [
    { id:'stats', label:'📊 Mis Ventas' },
    { id:'pedido', label:'🛒 Nuevo Pedido' },
    { id:'ventas', label:'📋 Historial' },
  ]

  return (
    <div style={{ position:'fixed', inset:0, background:'#f8fafc', zIndex:2000,
      display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <div style={{ background:'var(--color-primary)', color:'white',
        padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center',
        position:'sticky', top:0, zIndex:10, flexShrink:0 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:16 }}>💼 Mi Panel — {user?.nombre?.split(' ')[0]}</div>
          <div style={{ fontSize:11, opacity:.8 }}>Vendedor HGW Store</div>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm">✕ Cerrar</button>
      </div>

      <div style={{ background:'white', borderBottom:'2px solid #e5e7eb',
        display:'flex', overflowX:'auto', padding:'0 12px', flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'12px 16px', border:'none', background:'transparent',
            cursor:'pointer', fontWeight:600, fontSize:13, whiteSpace:'nowrap',
            borderBottom: tab===t.id ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: tab===t.id ? 'var(--color-primary)' : '#6b7280',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, padding:20, maxWidth:900, width:'100%', margin:'0 auto' }}>
        {loading && <div style={{ textAlign:'center', padding:40, color:'#6b7280' }}>⏳ Cargando...</div>}

        {/* STATS */}
        {!loading && tab==='stats' && stats && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
            {[
              { label:'Total Ventas', val:`$${stats.total_ventas?.toLocaleString()}`, emoji:'💰' },
              { label:'Pedidos Totales', val:stats.total_pedidos, emoji:'📦' },
            ].map(({ label, val, emoji }) => (
              <div key={label} className="card" style={{ padding:20, textAlign:'center', borderRadius:12 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>{emoji}</div>
                <div style={{ fontWeight:800, fontSize:24, color:'var(--color-primary)' }}>{val}</div>
                <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* NUEVO PEDIDO */}
        {!loading && tab==='pedido' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Datos cliente */}
            <div className="card" style={{ padding:20, borderRadius:12, gridColumn:'1/-1' }}>
              <h3 style={{ marginBottom:16, fontSize:15, color:'var(--color-primary)' }}>👤 Datos del Cliente</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
                {[
                  { k:'nombre', label:'Nombre *', ph:'Juan Pérez' },
                  { k:'cedula', label:'Cédula', ph:'1234567890' },
                  { k:'telefono', label:'Teléfono *', ph:'3001234567' },
                  { k:'ciudad', label:'Ciudad', ph:'Medellín' },
                ].map(({ k, label, ph }) => (
                  <div key={k}>
                    <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>{label}</label>
                    <input value={pedidoForm.cliente[k]} placeholder={ph}
                      onChange={e => setPedidoForm(f => ({ ...f, cliente:{ ...f.cliente, [k]:e.target.value }}))}
                      className="input" style={{ fontSize:13 }} />
                  </div>
                ))}
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Dirección</label>
                  <input value={pedidoForm.cliente.direccion} placeholder="Calle 123 #45-67"
                    onChange={e => setPedidoForm(f => ({ ...f, cliente:{ ...f.cliente, direccion:e.target.value }}))}
                    className="input" style={{ fontSize:13 }} />
                </div>
              </div>
            </div>

            {/* Agregar productos */}
            <div className="card" style={{ padding:20, borderRadius:12 }}>
              <h3 style={{ marginBottom:14, fontSize:15, color:'var(--color-primary)' }}>📦 Agregar Productos</h3>
              <select value={productoSeleccionado}
                onChange={e => setProductoSeleccionado(e.target.value)}
                className="input" style={{ marginBottom:10, fontSize:13 }}>
                <option value="">Seleccionar producto...</option>
                {productosBD.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — ${p.precio?.toLocaleString()}
                  </option>
                ))}
              </select>
              <div style={{ display:'flex', gap:8 }}>
                <input type="number" min="1" value={cantidadProd}
                  onChange={e => setCantidadProd(parseInt(e.target.value)||1)}
                  className="input" style={{ width:80, fontSize:13 }} />
                <button onClick={agregarProducto} className="btn btn-primary" style={{ flex:1 }}>
                  ➕ Agregar
                </button>
              </div>
            </div>

            {/* Resumen pedido */}
            <div className="card" style={{ padding:20, borderRadius:12 }}>
              <h3 style={{ marginBottom:14, fontSize:15, color:'var(--color-primary)' }}>🧾 Resumen</h3>
              {pedidoForm.productos.length === 0 ? (
                <p style={{ color:'#9ca3af', fontSize:13 }}>Sin productos aún</p>
              ) : (
                pedidoForm.productos.map(p => (
                  <div key={p.id} style={{ display:'flex', justifyContent:'space-between',
                    marginBottom:8, fontSize:13 }}>
                    <span>{p.nombre} ×{p.cantidad}</span>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontWeight:700, color:'var(--color-primary)' }}>
                        ${(p.precio*p.cantidad).toLocaleString()}
                      </span>
                      <button onClick={() => setPedidoForm(f => ({
                        ...f, productos:f.productos.filter(x => x.id !== p.id)
                      }))} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:16 }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div style={{ borderTop:'2px solid var(--color-primary)', paddingTop:10, marginTop:10,
                display:'flex', justifyContent:'space-between', fontWeight:800, color:'var(--color-primary)', fontSize:16 }}>
                <span>Total</span>
                <span>${totalPedido.toLocaleString()}</span>
              </div>
              <div style={{ marginTop:12 }}>
                <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Método de pago</label>
                <select value={pedidoForm.metodo_pago}
                  onChange={e => setPedidoForm(f => ({ ...f, metodo_pago:e.target.value }))}
                  className="input" style={{ fontSize:13 }}>
                  {['Efectivo','Nequi','Transferencia','Wompi'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <button onClick={realizarPedido} className="btn btn-primary btn-block" style={{ marginTop:14 }}>
                ✅ Confirmar Pedido
              </button>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {!loading && tab==='ventas' && (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['Factura','Cliente','Total','Método','Estado','Fecha'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left',
                      borderBottom:'1px solid #e5e7eb', fontWeight:600, color:'#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventas.map(v => (
                  <tr key={v.numero_factura} style={{ borderBottom:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:11 }}>{v.numero_factura}</td>
                    <td style={{ padding:'10px 14px', fontWeight:600 }}>{v.cliente_nombre}</td>
                    <td style={{ padding:'10px 14px', fontWeight:700, color:'var(--color-primary)' }}>
                      ${parseFloat(v.total).toLocaleString()}
                    </td>
                    <td style={{ padding:'10px 14px' }}>{v.metodo_pago}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span className={`badge ${v.estado==='pagado' ? 'badge-green' : v.estado==='cancelado' ? 'badge-red' : 'badge-orange'}`}>
                        {v.estado}
                      </span>
                    </td>
                    <td style={{ padding:'10px 14px', color:'#6b7280', fontSize:11 }}>
                      {new Date(v.fecha_creacion).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))}
                {ventas.length === 0 && (
                  <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#9ca3af' }}>
                    Sin ventas registradas aún
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
