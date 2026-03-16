import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { TEMPLATES } from '../themes/index.js'

const StoreContext = createContext(null)

export const useStore = () => useContext(StoreContext)

const API = import.meta.env.VITE_API_URL || ''

// Apply CSS variables and template class to :root
const applyTheme = (colors, templateId) => {
  const root = document.documentElement
  root.style.setProperty('--color-primary',       colors.primario)
  root.style.setProperty('--color-secondary',      colors.secundario)
  root.style.setProperty('--color-accent',         colors.acento)
  root.style.setProperty('--color-primary-light',  colors.primario + '22')

  // Remove all template classes, add current
  TEMPLATES.forEach(t => document.body.classList.remove(t.cssClass))
  const tpl = TEMPLATES.find(t => t.id === templateId)
  if (tpl) document.body.classList.add(tpl.cssClass)
}

export function StoreProvider({ children }) {
  // Auth
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('hgw_user')) } catch { return null }
  })
  const getToken = () => localStorage.getItem('hgw_token')
  const authHeader = () => {
    const t = getToken()
    return t ? { Authorization: `Bearer ${t}` } : {}
  }

  // Store config (colors, template, logo)
  const [storeConfig, setStoreConfig] = useState({
    nombre: 'HGW Store',
    logo_url: null,
    colores: { primario: '#10b981', secundario: '#059669', acento: '#047857' },
    templateId: localStorage.getItem('hgw_template') || 'classic',
    cliente: null,
  })

  // Carrito
  const [carrito, setCarrito] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hgw_carrito')) || [] } catch { return [] }
  })

  // UI
  const [toast, setToast] = useState(null)

  // Persist carrito
  useEffect(() => {
    localStorage.setItem('hgw_carrito', JSON.stringify(carrito))
  }, [carrito])

  // Apply theme on config changes
  useEffect(() => {
    applyTheme(storeConfig.colores, storeConfig.templateId)
    localStorage.setItem('hgw_template', storeConfig.templateId)
  }, [storeConfig.colores, storeConfig.templateId])

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Load store config by slug
  const loadStoreConfig = useCallback(async (slug = 'hgw') => {
    try {
      const res = await fetch(`${API}/api/cliente/${slug}`)
      if (!res.ok) return
      const data = await res.json()
      const saved_template = localStorage.getItem('hgw_template') || 'classic'
      setStoreConfig(prev => ({
        ...prev,
        nombre: data.nombre,
        logo_url: data.logo_url,
        colores: data.colores,
        templateId: saved_template,
        cliente: data,
      }))
    } catch (e) {
      // Keep defaults
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get('tienda') || 'hgw'
    loadStoreConfig(slug)
  }, [loadStoreConfig])

  // Cart helpers
  const addToCart = useCallback((producto) => {
    setCarrito(prev => {
      const existing = prev.find(i => i.id === producto.id)
      if (existing) return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { ...producto, cantidad: 1 }]
    })
    showToast(`✅ ${producto.nombre} agregado`)
  }, [showToast])

  const removeFromCart = useCallback((id) => {
    setCarrito(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) return removeFromCart(id)
    setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad: qty } : i))
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCarrito([])
    localStorage.removeItem('hgw_carrito')
  }, [])

  const cartTotal = carrito.reduce((t, i) => t + i.precio * i.cantidad, 0)
  const cartCount = carrito.reduce((t, i) => t + i.cantidad, 0)

  // Auth helpers
  const login = useCallback((userData, token) => {
    localStorage.setItem('hgw_user', JSON.stringify(userData))
    localStorage.setItem('hgw_token', token)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('hgw_user')
    localStorage.removeItem('hgw_token')
    localStorage.removeItem('hgw_carrito')
    setUser(null)
    setCarrito([])
  }, [])

  // Update store colors
  const updateColors = useCallback(async (colors) => {
    if (!storeConfig.cliente?.id) {
      // Just apply locally
      setStoreConfig(prev => ({ ...prev, colores: colors }))
      showToast('🎨 Colores aplicados')
      return
    }
    try {
      const res = await fetch(`${API}/api/cliente/${storeConfig.cliente.id}/colores`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          color_primario:   colors.primario,
          color_secundario: colors.secundario,
          color_acento:     colors.acento,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setStoreConfig(prev => ({ ...prev, colores: data.colores }))
        showToast('🎨 Colores guardados')
      }
    } catch {
      showToast('Error actualizando colores', 'error')
    }
  }, [storeConfig.cliente, authHeader])

  const setTemplate = useCallback((templateId) => {
    setStoreConfig(prev => ({ ...prev, templateId }))
    showToast('✨ Plantilla aplicada')
  }, [showToast])

  const value = {
    API,
    user, login, logout, authHeader,
    storeConfig, setStoreConfig, updateColors, setTemplate,
    carrito, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount,
    toast, showToast,
    loadStoreConfig,
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}
