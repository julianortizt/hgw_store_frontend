import React, { useState, useEffect, useCallback, useRef } from 'react'
import { StoreProvider, useStore } from './context/StoreContext.jsx'
import Header from './components/Header.jsx'
import HeroSlider from './components/HeroSlider.jsx'
import ProductCard from './components/ProductCard.jsx'
import ProductModal from './components/ProductModal.jsx'
import CartModal from './components/CartModal.jsx'
import AuthModal from './components/AuthModal.jsx'
import CheckoutModal from './components/CheckoutModal.jsx'
import ConfirmacionModal from './components/ConfirmacionModal.jsx'
import AsistenteIA from './components/AsistenteIA.jsx'
import PanelAdmin from './components/PanelAdmin.jsx'
import PanelVendedor from './components/PanelVendedor.jsx'
import TemplateSelector from './components/TemplateSelector.jsx'
import Footer from './components/Footer.jsx'

const API = import.meta.env.VITE_API_URL || ''

function Store() {
  const { user, toast, storeConfig, showToast } = useStore()

  // Products & filters
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [catActiva, setCatActiva] = useState('Todas')
  const [loadingProds, setLoadingProds] = useState(false)
  const abortRef = useRef(null)

  // Modals
  const [productoModal, setProductoModal] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [confirmData, setConfirmData] = useState(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showVendedor, setShowVendedor] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  // Load categories
  useEffect(() => {
    fetch(`${API}/api/categorias`)
      .then(r => r.json())
      .then(d => setCategorias(['Todas', ...(d.categorias || [])]))
      .catch(() => {})
  }, [])

  // Load products
  const loadProductos = useCallback(async (cat = 'Todas', signal) => {
    setLoadingProds(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (storeConfig.cliente?.id) params.set('cliente_id', storeConfig.cliente.id)
      if (cat !== 'Todas') params.set('categoria', cat)

      const res = await fetch(`${API}/api/productos?${params}`, { signal })
      if (!res.ok) return
      const data = await res.json()
      setProductos(Array.isArray(data) ? data : data.productos || [])
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e)
    } finally {
      setLoadingProds(false)
    }
  }, [storeConfig.cliente])

  // Reload when cliente loaded
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    loadProductos(catActiva, abortRef.current.signal)
    return () => abortRef.current?.abort()
  }, [storeConfig.cliente, catActiva])

  const handleCat = (cat) => {
    setCatActiva(cat)
  }

  const handleCheckout = () => {
    if (!user) {
      setShowCart(false)
      setShowAuth(true)
      return
    }
    setShowCart(false)
    setShowCheckout(true)
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onOpenCart={() => setShowCart(true)}
        onOpenLogin={() => setShowAuth(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenVendedor={() => setShowVendedor(true)}
      />

      {/* Hero */}
      <HeroSlider productos={productos} />

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto',
        padding: '24px 16px' }}>

        {/* Category filters */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: '#374151',
            textTransform: 'uppercase', letterSpacing: .5 }}>
            Categorías
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categorias.map(cat => (
              <button key={cat} onClick={() => handleCat(cat)}
                className={`tag-filter${catActiva === cat ? ' active' : ''}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>
            Catálogo {catActiva !== 'Todas' && `— ${catActiva}`}
            <span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280', marginLeft: 10 }}>
              ({productos.length} productos)
            </span>
          </h2>
          {(user?.tipo === 'admin' || user?.tipo === 'vendedor') && (
            <button onClick={() => setShowTemplates(true)}
              className="btn btn-outline btn-sm">
              🎨 Personalizar
            </button>
          )}
        </div>

        {/* Products grid */}
        {loadingProds ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 40, height: 40, border: '4px solid var(--color-primary-light)',
              borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : productos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No hay productos en esta categoría</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: 16,
          }}>
            {productos.map(p => (
              <ProductCard key={p.id} producto={p} onOpen={setProductoModal} />
            ))}
          </div>
        )}
      </main>

      {/* WhatsApp FAB */}
      <a href="https://wa.me/573159715768?text=Hola%20HGW%20Store!%20Quiero%20información"
        target="_blank" rel="noopener noreferrer"
        style={{
          position: 'fixed', bottom: 140, right: 16,
          background: '#25D366', color: 'white',
          borderRadius: 14, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          textDecoration: 'none', fontWeight: 700, fontSize: 13,
          boxShadow: '0 4px 16px rgba(37,211,102,.4)',
          zIndex: 780, transition: 'transform .2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        💬 WhatsApp
      </a>

      {/* AI Assistant */}
      <AsistenteIA productos={productos} />

      <Footer onOpenTemplates={() => setShowTemplates(true)} />

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

      {/* Modals */}
      {productoModal && (
        <ProductModal producto={productoModal} onClose={() => setProductoModal(null)} />
      )}
      {showCart && (
        <CartModal onClose={() => setShowCart(false)} onCheckout={handleCheckout} />
      )}
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={data => { setShowCheckout(false); setConfirmData(data) }}
        />
      )}
      {confirmData && (
        <ConfirmacionModal data={confirmData} onClose={() => setConfirmData(null)} />
      )}
      {showAdmin && user?.tipo === 'admin' && (
        <PanelAdmin onClose={() => setShowAdmin(false)} />
      )}
      {showVendedor && user?.tipo === 'vendedor' && (
        <PanelVendedor onClose={() => setShowVendedor(false)} />
      )}
      {showTemplates && (
        <TemplateSelector onClose={() => setShowTemplates(false)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Store />
    </StoreProvider>
  )
}
