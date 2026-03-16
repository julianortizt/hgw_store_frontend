# 🌿 HGW Store v3

E-commerce de bienestar natural con:
- **React + Vite** (frontend ultrarrápido)
- **FastAPI + PostgreSQL** (backend robusto)
- **Selector de plantillas** tipo Shopify (5 temas)
- **Color picker** completo con paleta y selector del sistema
- **Asistente IA VERA** (Groq LLaMA-3)
- **Mobile-first** responsive
- **Multi-tienda** por slug

---

## 🚀 Inicio Rápido

### 1. Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar (opcional)
cp .env.example .env.local

# Iniciar desarrollo
npm run dev
# → http://localhost:3000

# Build producción
npm run build
```

---

## 🎨 Plantillas Disponibles

| Plantilla | Estilo | Ideal para |
|-----------|--------|-----------|
| 🌿 Clásico Verde | Elegante, orgánico | Bienestar y salud |
| 🌑 Dark Premium | Sofisticado, oscuro | Marcas premium |
| ◻️ Minimal | Limpio, editorial | Lujo minimalista |
| ⚡ Bold & Fresh | Energético, llamativo | Deportes y energía |
| 🌸 Soft & Natural | Suave, orgánico | Belleza y cuidado |

### Cómo cambiar plantilla:
1. Login como admin o vendedor
2. Click en **🎨 Personalizar** (header o footer)
3. Selecciona plantilla
4. Ajusta colores con el color picker
5. Los cambios se aplican en **tiempo real**

---

## 🌐 Multi-tienda

Cada tienda tiene su propio slug:
```
http://localhost:3000/?tienda=hgw       # Tienda HGW
http://localhost:3000/?tienda=minegocio  # Tu tienda
```

### Crear nueva tienda (via API):
```bash
POST /api/cliente/crear
{
  "nombre": "Mi Tienda",
  "slug": "mitienda",
  "color_primario": "#10b981"
}
```

---

## 🤖 Asistente IA VERA

- Chat flotante mobile-friendly
- 36 dolencias mapeadas a productos
- Guía de síntomas interactiva
- Conexión a Groq (LLaMA-3.3-70B)
- Requiere `GROQ_API_KEY` en `.env`

---

## 📱 Mobile-First

- Header responsive con menú hamburguesa
- Grid de productos adaptable (1→2→3→4 cols)
- Modales optimizados para pantallas pequeñas
- Chat IA como bottom sheet
- Botones touch-friendly (mín. 44px)
- Support para `safe-area-inset` (notch)

---

## 🔧 Estructura

```
hgwstore_v3/
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # App principal
│   │   ├── context/
│   │   │   └── StoreContext.jsx # Estado global
│   │   ├── themes/
│   │   │   └── index.js         # 5 plantillas
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── HeroSlider.jsx
│   │       ├── ProductCard.jsx
│   │       ├── ProductModal.jsx
│   │       ├── CartModal.jsx
│   │       ├── CheckoutModal.jsx
│   │       ├── ConfirmacionModal.jsx
│   │       ├── AuthModal.jsx
│   │       ├── AsistenteIA.jsx  # VERA
│   │       ├── ColorPicker.jsx  # Completo
│   │       ├── TemplateSelector.jsx  # Shopify-style
│   │       ├── PanelAdmin.jsx
│   │       ├── PanelVendedor.jsx
│   │       └── Footer.jsx
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── main.py                  # FastAPI API
    ├── generador_factura.py     # PDF invoices
    ├── requirements.txt
    └── .env.example
```

---

## 🚢 Despliegue

### Railway (recomendado)
```bash
# Backend: conectar repo → Railway detecta Procfile
# Frontend: Vercel / Netlify
# Variables de entorno en Railway Dashboard
```

### Variables de entorno producción:
```
VITE_API_URL=https://tu-backend.railway.app
CORS_ORIGIN=https://tu-frontend.vercel.app
```

---

## 🔑 Usuarios por defecto

```bash
# Crear primer admin:
POST /api/admin/crear-admin
{
  "nombre": "Admin",
  "email": "admin@hgw.com",
  "password": "tu_password",
  "tipo": "admin"
}
```

---

## 📜 Changelog v3

- ✅ Migrado de Create React App → **Vite** (10× más rápido)
- ✅ **5 plantillas** tipo Shopify con selector visual
- ✅ **Color picker** con paleta extendida + selector del sistema
- ✅ **Mobile-first** CSS con variables y breakpoints
- ✅ **Menú hamburguesa** mobile
- ✅ **Bottom sheet** para chat IA en móvil
- ✅ Estado global con **Context API** (sin Redux)
- ✅ **Toast notifications** (sin librerías extra)
- ✅ Checkout en 2 pasos con validación
- ✅ **Grid responsive** automático
- ✅ AbortController para cancelar fetches obsoletos
- ✅ Persistencia de plantilla en localStorage
- ✅ Live preview de colores en panel admin
