import React, { useState, useEffect } from 'react'
import ColorPicker from './ColorPicker.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { TEMPLATES } from '../themes/index.js'
import TemplateSelector from './TemplateSelector.jsx'

const API = import.meta.env.VITE_API_URL || ''
const CATS = ['Suplementos','Bebidas','Proteínas','Belleza','Higiene','Accesorios','Infusiones','Otros']

export default function PanelAdmin({ onClose }) {
  const { authHeader, showToast, storeConfig, setTemplate, updateColors } = useStore()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [productos, setProductos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre:'',descripcion:'',beneficios:'',categoria:'Suplementos',imagen_url:'',precio:'',stock:'',cliente_id:1 })
  const [editId, setEditId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [subiendoBanner, setSubiendoBanner] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [slides, setSlides] = useState([])
  const [nuevoSlide, setNuevoSlide] = useState({ categoria:'', imagen_url:'', orden:0, titulo:'', subtitulo:'' })

  const headers = { 'Content-Type':'application/json', ...authHeader() }
  const authHeaderMultipart = () => authHeader()

  useEffect(() => { loadTab() }, [tab])

  const loadTab = async () => {
    setLoading(true)
    try {
      if (tab === 'stats') {
        const r = await fetch(`${API}/api/admin/estadisticas`, { headers })
        const d = await r.json()
        setStats(d.estadisticas)
      }
      if (tab === 'productos') {
        const r = await fetch(`${API}/api/productos?limit=200`, { headers })
        const d = await r.json()
        setProductos(d.productos || [])
      }
      if (tab === 'usuarios') {
        const r = await fetch(`${API}/api/admin/usuarios`, { headers })
        const d = await r.json()
        setUsuarios(d.usuarios || [])
      }
      if (tab === 'banner') {
        const r = await fetch(`${API}/api/banner`, { headers })
        const d = await r.json()
        setSlides(d.slides || [])
      }
    } catch { showToast('Error cargando datos', 'error') }
    finally { setLoading(false) }
  }

  const subirImagen = async (archivo, onUrl) => {
    if (!archivo) return
    setSubiendo(true)
    try {
      const fd = new FormData()
      fd.append('file', archivo)
      const r = await fetch(`${API}/api/upload/imagen`, {
        method: 'POST',
        headers: authHeader(),
        body: fd,
      })
      const d = await r.json()
      if (d.success) { onUrl(d.url); showToast('✅ Imagen subida') }
      else showToast('Error subiendo imagen', 'error')
    } catch { showToast('Error subiendo imagen', 'error') }
    finally { setSubiendo(false) }
  }

  const guardarProducto = async () => {
    if (!form.nombre || !form.precio) return showToast('Nombre y precio requeridos', 'error')
    const url = editId ? `${API}/api/productos/${editId}` : `${API}/api/productos`
    const method = editId ? 'PUT' : 'POST'
    try {
      const r = await fetch(url, { method, headers,
        body: JSON.stringify({ ...form, precio: parseFloat(form.precio), stock: parseInt(form.stock)||0 }) })
      const d = await r.json()
      if (d.success || d.id) {
        showToast(editId ? '✅ Producto actualizado' : '✅ Producto creado')
        setForm({ nombre:'',descripcion:'',beneficios:'',categoria:'Suplementos',imagen_url:'',precio:'',stock:'',cliente_id:1 })
        setEditId(null)
        loadTab()
      }
    } catch { showToast('Error guardando producto', 'error') }
  }

  const eliminarProducto = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await fetch(`${API}/api/productos/${id}`, { method:'DELETE', headers })
    showToast('Producto eliminado')
    loadTab()
  }

  const editarProducto = (p) => {
    setForm({ nombre:p.nombre, descripcion:p.descripcion||'', beneficios:p.beneficios||'',
      categoria:p.categoria||'Suplementos', imagen_url:p.imagen_url||'', precio:p.precio, stock:p.stock, cliente_id:p.cliente_id||1 })
    setEditId(p.id)
    setTab('productos')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()))

  const TABS = [
    { id:'stats', label:'📊 Estadísticas' },
    { id:'productos', label:'📦 Productos' },
    { id:'usuarios', label:'👥 Usuarios' },
    { id:'banner', label:'🖼️ Banner' },
    { id:'diseno', label:'🎨 Diseño' },
  ]

  return (
    <div style={{ position:'fixed', inset:0, background:'#f8fafc', zIndex:2000,
      display:'flex', flexDirection:'column', overflowY:'auto' }}>
      {/* Header */}
      <div style={{ background:'var(--color-primary)', color:'white',
        padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center',
        position:'sticky', top:0, zIndex:10, flexShrink:0 }}>
        <div style={{ fontWeight:800, fontSize:16 }}>⚙️ Panel Admin — HGW Store</div>
        <button onClick={onClose} className="btn btn-ghost btn-sm">✕ Cerrar</button>
      </div>

      {/* Tabs */}
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

      <div style={{ flex:1, padding:'20px', maxWidth:1100, width:'100%', margin:'0 auto' }}>
        {loading && <div style={{ textAlign:'center', padding:40, color:'#6b7280' }}>⏳ Cargando...</div>}

        {/* STATS */}
        {!loading && tab==='stats' && stats && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14, marginBottom:28 }}>
              {[
                { label:'Total Ventas', val:`$${stats.total_ventas?.toLocaleString()} COP`, emoji:'💰' },
                { label:'Pedidos', val:stats.total_pedidos, emoji:'📦' },
                { label:'Usuarios', val:stats.total_usuarios, emoji:'👥' },
                { label:'Clientes', val:stats.total_clientes, emoji:'👤' },
                { label:'Vendedores', val:stats.total_vendedores, emoji:'💼' },
              ].map(({ label, val, emoji }) => (
                <div key={label} className="card" style={{ padding:18, textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:6 }}>{emoji}</div>
                  <div style={{ fontWeight:800, fontSize:22, color:'var(--color-primary)' }}>{val}</div>
                  <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
            {stats.ultimos_pedidos?.length > 0 && (
              <div className="card" style={{ borderRadius:12, overflow:'hidden' }}>
                <div style={{ background:'var(--color-primary)', color:'white',
                  padding:'12px 20px', fontWeight:700, fontSize:14 }}>
                  📋 Últimos Pedidos
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ background:'#f8fafc' }}>
                        {['Factura','Cliente','Total','Método','Fecha'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left',
                            borderBottom:'1px solid #e5e7eb', fontWeight:600, color:'#374151' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.ultimos_pedidos.map(p => (
                        <tr key={p.numero_factura} style={{ borderBottom:'1px solid #f1f5f9' }}>
                          <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:12 }}>{p.numero_factura}</td>
                          <td style={{ padding:'10px 14px' }}>{p.cliente_nombre}</td>
                          <td style={{ padding:'10px 14px', fontWeight:700, color:'var(--color-primary)' }}>
                            ${parseFloat(p.total).toLocaleString()}
                          </td>
                          <td style={{ padding:'10px 14px' }}>{p.metodo_pago}</td>
                          <td style={{ padding:'10px 14px', color:'#6b7280', fontSize:12 }}>
                            {new Date(p.fecha_creacion).toLocaleDateString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTOS */}
        {!loading && tab==='productos' && (
          <div>
            {/* Form */}
            <div className="card" style={{ borderRadius:12, padding:20, marginBottom:20 }}>
              <h3 style={{ marginBottom:16, color:'var(--color-primary)', fontSize:15 }}>
                {editId ? `✏️ Editando: ${form.nombre}` : '➕ Nuevo Producto'}
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
                {[
                  { k:'nombre', label:'Nombre', placeholder:'Nombre del producto' },
                  { k:'precio', label:'Precio (COP)', placeholder:'25000', type:'number' },
                  { k:'stock', label:'Stock', placeholder:'10', type:'number' },
                ].map(({ k, label, placeholder, type }) => (
                  <div key={k}>
                    <label style={{ fontSize:12, fontWeight:600, color:'#374151',
                      display:'block', marginBottom:4 }}>{label}</label>
                    <input
                      type={type||'text'} value={form[k]} placeholder={placeholder}
                      onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      className="input" style={{ fontSize:13 }}
                    />
                  </div>
                ))}
                {/* Imagen — URL o subir desde PC */}
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize:12, fontWeight:600, color:'#374151',
                    display:'block', marginBottom:4 }}>Imagen del Producto</label>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <input
                      type='text' value={form.imagen_url} placeholder='https://... (pega URL)'
                      onChange={e => setForm(f => ({ ...f, imagen_url: e.target.value }))}
                      className="input" style={{ fontSize:13, flex:1, minWidth:180 }}
                    />
                    <label style={{
                      background: subiendo ? '#e5e7eb' : 'var(--color-primary)',
                      color: subiendo ? '#9ca3af' : 'white',
                      padding:'8px 14px', borderRadius:8, fontSize:12,
                      fontWeight:600, cursor: subiendo ? 'wait' : 'pointer',
                      whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6,
                    }}>
                      {subiendo ? '⏳ Subiendo...' : '📁 Subir desde PC'}
                      <input type="file" accept="image/*" style={{ display:'none' }}
                        onChange={e => subirImagen(e.target.files[0], url => setForm(f => ({ ...f, imagen_url: url })))}
                        disabled={subiendo} />
                    </label>
                  </div>
                  {form.imagen_url && (
                    <img src={form.imagen_url} alt="preview"
                      style={{ marginTop:8, height:80, borderRadius:8, objectFit:'cover',
                        border:'1px solid #e5e7eb' }}
                      onError={e => e.target.style.display='none'} />
                  )}
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:'#374151',
                    display:'block', marginBottom:4 }}>Categoría</label>
                  <select value={form.categoria}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                    className="input" style={{ fontSize:13 }}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop:10 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151',
                  display:'block', marginBottom:4 }}>Descripción</label>
                <textarea value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  className="input" style={{ minHeight:60, resize:'vertical', fontSize:13 }}
                  placeholder="Descripción del producto..." />
              </div>
              <div style={{ marginTop:10 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151',
                  display:'block', marginBottom:4 }}>Beneficios</label>
                <textarea value={form.beneficios}
                  onChange={e => setForm(f => ({ ...f, beneficios: e.target.value }))}
                  className="input" style={{ minHeight:60, resize:'vertical', fontSize:13 }}
                  placeholder="Beneficios del producto..." />
              </div>
              <div style={{ display:'flex', gap:10, marginTop:14 }}>
                <button onClick={guardarProducto} className="btn btn-primary">
                  {editId ? '💾 Actualizar' : '➕ Crear Producto'}
                </button>
                {editId && (
                  <button onClick={() => { setEditId(null); setForm({ nombre:'',descripcion:'',beneficios:'',categoria:'Suplementos',imagen_url:'',precio:'',stock:'',cliente_id:1 }) }}
                    className="btn" style={{ background:'#f1f5f9', color:'#374151' }}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar producto..." className="input" style={{ maxWidth:280 }} />
              <span style={{ fontSize:13, color:'#6b7280', alignSelf:'center' }}>
                {productosFiltrados.length} productos
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
              {productosFiltrados.map(p => (
                <div key={p.id} className="card" style={{ padding:14, borderRadius:10 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    {p.imagen_url && (
                      <img src={p.imagen_url} alt={p.nombre}
                        style={{ width:56, height:56, objectFit:'cover', borderRadius:8, flexShrink:0 }} />
                    )}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:13, marginBottom:2,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {p.nombre}
                      </div>
                      <div style={{ fontSize:12, color:'#6b7280', marginBottom:4 }}>
                        {p.categoria} · Stock: {p.stock}
                      </div>
                      <div style={{ fontWeight:800, color:'var(--color-primary)', fontSize:15 }}>
                        ${p.precio.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, marginTop:10 }}>
                    <button onClick={() => editarProducto(p)} className="btn btn-sm"
                      style={{ background:'#e0f2fe', color:'#0284c7' }}>✏️ Editar</button>
                    <button onClick={() => eliminarProducto(p.id)} className="btn btn-sm btn-danger">
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USUARIOS */}
        {!loading && tab==='usuarios' && (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['ID','Nombre','Email','Teléfono','Tipo'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left',
                      borderBottom:'1px solid #e5e7eb', fontWeight:600, color:'#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'10px 14px', color:'#6b7280' }}>#{u.id}</td>
                    <td style={{ padding:'10px 14px', fontWeight:600 }}>{u.nombre}</td>
                    <td style={{ padding:'10px 14px', color:'#6b7280' }}>{u.email}</td>
                    <td style={{ padding:'10px 14px', color:'#6b7280' }}>{u.telefono}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span className={`badge ${u.tipo==='admin' ? 'badge-orange' : u.tipo==='vendedor' ? 'badge-green' : 'badge-red'}`}>
                        {u.tipo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* BANNER */}
        {!loading && tab==='banner' && (
          <div>
            <div className="card" style={{ padding:20, borderRadius:12, marginBottom:20 }}>
              <h3 style={{ marginBottom:16, fontSize:15, color:'var(--color-primary)' }}>➕ Agregar Slide</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Categoría (etiqueta)</label>
                  <input value={nuevoSlide.categoria} placeholder="Ej: Bebidas"
                    onChange={e => setNuevoSlide(s => ({...s, categoria:e.target.value}))}
                    className="input" style={{ fontSize:13 }} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Título del Banner</label>
                  <input value={nuevoSlide.titulo} placeholder="Ej: GANODERMA COFFEE"
                    onChange={e => setNuevoSlide(s => ({...s, titulo:e.target.value}))}
                    className="input" style={{ fontSize:13 }} />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Subtítulo / Descripción</label>
                  <input value={nuevoSlide.subtitulo} placeholder="Ej: Combina café con ganoderma para tu bienestar"
                    onChange={e => setNuevoSlide(s => ({...s, subtitulo:e.target.value}))}
                    className="input" style={{ fontSize:13 }} />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Imagen del Banner</label>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <input value={nuevoSlide.imagen_url} placeholder="https://... (pega URL)"
                      onChange={e => setNuevoSlide(s => ({...s, imagen_url:e.target.value}))}
                      className="input" style={{ fontSize:13, flex:1, minWidth:180 }} />
                    <label style={{
                      background: subiendoBanner ? '#e5e7eb' : 'var(--color-primary)',
                      color: subiendoBanner ? '#9ca3af' : 'white',
                      padding:'8px 14px', borderRadius:8, fontSize:12,
                      fontWeight:600, cursor: subiendoBanner ? 'wait' : 'pointer',
                      whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6,
                    }}>
                      {subiendoBanner ? '⏳ Subiendo...' : '📁 Subir desde PC'}
                      <input type="file" accept="image/*" style={{ display:'none' }}
                        onChange={async e => {
                          const archivo = e.target.files[0]
                          if (!archivo) return
                          setSubiendoBanner(true)
                          try {
                            const fd = new FormData()
                            fd.append('file', archivo)
                            const r = await fetch(`${API}/api/upload/imagen`, {
                              method:'POST', headers: authHeader(), body: fd,
                            })
                            const d = await r.json()
                            if (d.success) { setNuevoSlide(s => ({...s, imagen_url: d.url})); showToast('✅ Imagen subida') }
                            else showToast('Error subiendo imagen', 'error')
                          } catch { showToast('Error subiendo imagen', 'error') }
                          finally { setSubiendoBanner(false) }
                        }}
                        disabled={subiendoBanner} />
                    </label>
                  </div>
                  <p style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>
                    Recomendado: 1440×500 px, JPG o WebP, menos de 500 KB
                  </p>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Orden</label>
                  <input type="number" value={nuevoSlide.orden}
                    onChange={e => setNuevoSlide(s => ({...s, orden:parseInt(e.target.value)||0}))}
                    className="input" style={{ fontSize:13 }} />
                </div>
              </div>
              {nuevoSlide.imagen_url && (
                <div style={{ marginTop:12 }}>
                  <img src={nuevoSlide.imagen_url} alt="preview"
                    style={{ height:80, borderRadius:8, objectFit:'cover', border:'1px solid #e5e7eb' }}
                    onError={e => e.target.style.display='none'} />
                </div>
              )}
              <button onClick={async () => {
                if (!nuevoSlide.categoria || !nuevoSlide.imagen_url) return showToast('Completa categoría e imagen', 'error')
                const r = await fetch(`${API}/api/banner`, { method:'POST', headers, body:JSON.stringify(nuevoSlide) })
                const d = await r.json()
                if (d.success) { showToast('✅ Slide agregado'); setNuevoSlide({ categoria:'', imagen_url:'', orden:0 }); loadTab() }
              }} className="btn btn-primary" style={{ marginTop:14 }}>
                ➕ Agregar Slide
              </button>
            </div>

            {/* Lista de slides */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
              {slides.length === 0 && (
                <div style={{ padding:40, textAlign:'center', color:'#9ca3af', gridColumn:'1/-1' }}>
                  No hay slides. Agrega el primero arriba.
                </div>
              )}
              {slides.map(slide => (
                <div key={slide.id} className="card" style={{ borderRadius:10, overflow:'hidden' }}>
                  <img src={slide.imagen_url} alt={slide.categoria}
                    style={{ width:'100%', height:120, objectFit:'cover' }}
                    onError={e => { e.target.style.background='#f1f5f9'; e.target.style.height='60px' }} />
                  <div style={{ padding:12 }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{slide.categoria}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:10 }}>Orden: {slide.orden}</div>
                    <button onClick={async () => {
                      await fetch(`${API}/api/banner/${slide.id}`, { method:'DELETE', headers })
                      showToast('Slide eliminado'); loadTab()
                    }} className="btn btn-sm btn-danger" style={{ width:'100%' }}>
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISEÑO */}
        {!loading && tab==='diseno' && (
          <div>
            <div className="card" style={{ padding:24, borderRadius:12, marginBottom:20 }}>
              <h3 style={{ marginBottom:20, color:'var(--color-primary)', fontSize:15 }}>
                🎨 Personalización de la Tienda
              </h3>
              <button onClick={() => setShowTemplates(true)}
                className="btn btn-primary" style={{ marginBottom:20 }}>
                🖼️ Selector de Plantillas
              </button>

              <h4 style={{ marginBottom:14, fontSize:14, color:'#374151' }}>Colores Actuales</h4>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
                <ColorPicker label="Color Principal" value={storeConfig.colores.primario}
                  onChange={v => updateColors({ ...storeConfig.colores, primario: v })} />
                <ColorPicker label="Color Secundario" value={storeConfig.colores.secundario}
                  onChange={v => updateColors({ ...storeConfig.colores, secundario: v })} />
                <ColorPicker label="Color Acento" value={storeConfig.colores.acento}
                  onChange={v => updateColors({ ...storeConfig.colores, acento: v })} />
              </div>

              {/* Live preview */}
              <div style={{ marginTop:20, padding:16, borderRadius:10,
                background: `linear-gradient(135deg, ${storeConfig.colores.primario}, ${storeConfig.colores.secundario})`,
                color:'white', textAlign:'center' }}>
                <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>Vista Previa</div>
                <div style={{ fontSize:12, opacity:.85 }}>
                  Así se verá el header de tu tienda
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTemplates && <TemplateSelector onClose={() => setShowTemplates(false)} />}
    </div>
  )
}
