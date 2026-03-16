import React, { useState } from 'react'
import { useStore } from '../context/StoreContext.jsx'

export default function Header({ onOpenCart, onOpenLogin, onOpenAdmin, onOpenVendedor }) {
  const { user, logout, storeConfig, cartCount } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const { colores, nombre, logo_url, templateId } = storeConfig
  const isDark = templateId === 'dark'

  const headerBg = isDark
    ? '#1e293b'
    : `linear-gradient(135deg, ${colores.primario} 0%, ${colores.secundario} 100%)`

  return (
    <header style={{
      background: headerBg,
      color: isDark ? '#f1f5f9' : 'white',
      position: 'sticky', top: 0, zIndex: 'var(--z-header)',
      boxShadow: '0 2px 12px rgba(0,0,0,.2)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {/* Logo + Nombre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          {logo_url && (
            <img src={logo_url.startsWith('/') ? logo_url : logo_url}
              alt={nombre} style={{ height: 38, width: 'auto', borderRadius: 6 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 'clamp(13px,3.5vw,20px)', lineHeight: 1.2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              🌿 {nombre}
            </div>
            <div style={{ fontSize: 10, opacity: .8 }}>Health, Growth & Wellness</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hide-mobile" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <DesktopNav user={user} logout={logout} onOpenLogin={onOpenLogin}
            onOpenAdmin={onOpenAdmin} onOpenVendedor={onOpenVendedor}
            colores={colores} />
        </nav>

        {/* Cart button */}
        <button onClick={onOpenCart} className="btn btn-ghost" style={{
          position: 'relative', width: 44, height: 44, padding: 0,
          borderRadius: '50%', fontSize: 20, flexShrink: 0,
          background: 'rgba(255,255,255,.15)',
        }}>
          🛒
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -3, right: -3,
              background: '#ef4444', color: 'white',
              borderRadius: '50%', width: 18, height: 18,
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid white',
            }}>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>

        {/* Mobile hamburger */}
        <button className="show-mobile" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white',
            borderRadius: 8, width: 40, height: 40, fontSize: 18, flexShrink: 0 }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: isDark ? '#0f172a' : 'rgba(0,0,0,.3)',
          backdropFilter: 'blur(8px)',
          padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8,
        }} onClick={() => setMenuOpen(false)}>
          <MobileNav user={user} logout={logout} onOpenLogin={onOpenLogin}
            onOpenAdmin={onOpenAdmin} onOpenVendedor={onOpenVendedor} />
        </div>
      )}
    </header>
  )
}

function DesktopNav({ user, logout, onOpenLogin, onOpenAdmin, onOpenVendedor, colores }) {
  if (!user) return (
    <>
      <button onClick={onOpenLogin} className="btn btn-ghost" style={{ fontSize: 13 }}>
        🔐 Iniciar sesión
      </button>
      <button onClick={onOpenLogin} style={{
        background: 'white', color: colores.primario,
        border: 'none', borderRadius: 8, padding: '7px 14px',
        fontWeight: 700, fontSize: 13, cursor: 'pointer',
      }}>
        👤 Registrarse
      </button>
    </>
  )
  return (
    <>
      <span style={{ fontSize: 12, background: 'rgba(255,255,255,.15)',
        padding: '5px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
        👋 {user.nombre.split(' ')[0]}
      </span>
      {user.tipo === 'admin' && (
        <button onClick={onOpenAdmin} className="btn" style={{
          background: '#f59e0b', color: 'white', fontSize: 12 }}>
          ⚙️ Admin
        </button>
      )}
      {user.tipo === 'vendedor' && (
        <button onClick={onOpenVendedor} className="btn" style={{
          background: '#f59e0b', color: 'white', fontSize: 12 }}>
          💼 Mi Panel
        </button>
      )}
      <button onClick={logout} className="btn btn-ghost" style={{ fontSize: 12 }}>
        Salir
      </button>
    </>
  )
}

function MobileNav({ user, logout, onOpenLogin, onOpenAdmin, onOpenVendedor }) {
  const btnStyle = {
    display: 'block', width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,.12)', color: 'white',
    border: 'none', borderRadius: 8, textAlign: 'left',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  }
  if (!user) return (
    <>
      <button onClick={onOpenLogin} style={btnStyle}>🔐 Iniciar sesión / Registrarse</button>
    </>
  )
  return (
    <>
      <div style={{ ...btnStyle, cursor: 'default', opacity: .7, fontSize: 12 }}>
        👋 {user.nombre}
      </div>
      {user.tipo === 'admin' && (
        <button onClick={onOpenAdmin} style={{ ...btnStyle, background: '#f59e0b' }}>
          ⚙️ Panel Admin
        </button>
      )}
      {user.tipo === 'vendedor' && (
        <button onClick={onOpenVendedor} style={{ ...btnStyle, background: '#f59e0b' }}>
          💼 Mi Panel Vendedor
        </button>
      )}
      <button onClick={logout} style={btnStyle}>🚪 Cerrar sesión</button>
    </>
  )
}
