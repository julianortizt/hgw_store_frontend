import React, { useState } from 'react'
import { useStore } from '../context/StoreContext.jsx'

const API = import.meta.env.VITE_API_URL || ''

export default function AuthModal({ onClose }) {
  const { login, showToast } = useStore()
  const [tab, setTab] = useState('login') // 'login' | 'registro'
  const [tipo, setTipo] = useState('cliente')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', cedula: '', password: ''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogin = async () => {
    if (!form.email || !form.password) return showToast('Completa todos los campos', 'error')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (data.success) {
        login(data.usuario, data.token)
        showToast(`¡Bienvenido ${data.usuario.nombre.split(' ')[0]}! 👋`)
        onClose()
      } else {
        showToast(data.error || 'Credenciales incorrectas', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistro = async () => {
    if (!form.nombre || !form.email || !form.password)
      return showToast('Completa los campos obligatorios', 'error')
    if (form.password.length < 6)
      return showToast('La contraseña debe tener al menos 6 caracteres', 'error')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tipo }),
      })
      const data = await res.json()
      if (data.success) {
        login(data.usuario, data.token)
        showToast(`¡Registro exitoso! Bienvenido 🎉`)
        onClose()
      } else {
        showToast(data.error || 'Error al registrar', 'error')
      }
    } catch {
      showToast('Error de conexión', 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputProps = (key, type = 'text', placeholder = '') => ({
    type, placeholder, value: form[key],
    onChange: e => set(key, e.target.value),
    className: 'input',
    style: { marginBottom: 12 },
    onKeyDown: e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleRegistro()),
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'var(--color-primary)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        }}>
          {[['login', '🔐 Iniciar Sesión'], ['registro', '👤 Registrarse']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '16px 10px', border: 'none', cursor: 'pointer',
              background: tab === id ? 'white' : 'transparent',
              color: tab === id ? 'var(--color-primary)' : 'rgba(255,255,255,.8)',
              fontWeight: 700, fontSize: 13,
              borderRadius: id === 'login'
                ? 'var(--radius-lg) 0 0 0'
                : '0 var(--radius-lg) 0 0',
              transition: 'var(--transition)',
            }}>
              {label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tab === 'login' ? (
            <>
              <h3 style={{ marginBottom: 20, color: '#374151' }}>Accede a tu cuenta</h3>
              <input {...inputProps('email', 'email', 'tu@email.com')} />
              <input {...inputProps('password', 'password', 'Contraseña')} />
              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn btn-primary btn-block btn-lg"
                style={{ marginBottom: 12 }}
              >
                {loading ? '⏳ Verificando...' : 'Iniciar Sesión'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                ¿No tienes cuenta?{' '}
                <button onClick={() => setTab('registro')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)',
                    fontWeight: 700, cursor: 'pointer' }}>
                  Regístrate aquí
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Tipo selector */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[
                  ['cliente', '👤 Cliente', 'Compra productos'],
                  ['vendedor', '💼 Vendedor', 'Vende y gestiona'],
                ].map(([id, label, sub]) => (
                  <button key={id} onClick={() => setTipo(id)} style={{
                    flex: 1, padding: '10px 8px', border: '2px solid',
                    borderColor: tipo === id ? 'var(--color-primary)' : '#e5e7eb',
                    borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    background: tipo === id ? 'var(--color-primary-light)' : 'white',
                    transition: 'var(--transition)',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: tipo === id ? 'var(--color-accent)' : '#374151' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{sub}</div>
                  </button>
                ))}
              </div>

              <input {...inputProps('nombre', 'text', 'Nombre completo *')} />
              <input {...inputProps('email', 'email', 'Email *')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <input type="tel" placeholder="Teléfono" value={form.telefono}
                  onChange={e => set('telefono', e.target.value)} className="input" />
                <input type="text" placeholder="Cédula" value={form.cedula}
                  onChange={e => set('cedula', e.target.value)} className="input" />
              </div>
              <input {...inputProps('password', 'password', 'Contraseña (mín. 6 caracteres) *')} />

              <button
                onClick={handleRegistro}
                disabled={loading}
                className="btn btn-block btn-lg"
                style={{
                  marginBottom: 12,
                  background: tipo === 'vendedor' ? '#f59e0b' : 'var(--color-primary)',
                  color: 'white',
                }}
              >
                {loading ? '⏳ Registrando...' : `Crear cuenta ${tipo === 'vendedor' ? 'Vendedor' : 'Cliente'}`}
              </button>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                ¿Ya tienes cuenta?{' '}
                <button onClick={() => setTab('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)',
                    fontWeight: 700, cursor: 'pointer' }}>
                  Inicia sesión
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
