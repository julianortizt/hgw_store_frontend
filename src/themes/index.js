// themes/index.js — Plantillas de tienda tipo Shopify

export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Clásico Verde',
    emoji: '🌿',
    description: 'Elegante y confiable. Ideal para bienestar y salud.',
    preview: 'linear-gradient(135deg,#10b981,#059669)',
    defaults: {
      colorPrimary:   '#10b981',
      colorSecondary: '#059669',
      colorAccent:    '#047857',
    },
    cssClass: 'template-classic',
    headerStyle: 'gradient',
    cardStyle: 'rounded',
    fontStyle: 'modern',
  },
  {
    id: 'dark',
    name: 'Dark Premium',
    emoji: '🌑',
    description: 'Sofisticado y moderno. Perfecto para marcas premium.',
    preview: 'linear-gradient(135deg,#1e293b,#0f172a)',
    defaults: {
      colorPrimary:   '#6366f1',
      colorSecondary: '#4f46e5',
      colorAccent:    '#4338ca',
    },
    cssClass: 'template-dark',
    headerStyle: 'solid-dark',
    cardStyle: 'dark-card',
    fontStyle: 'modern',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    emoji: '◻️',
    description: 'Limpio y editorial. Deja que los productos hablen.',
    preview: 'linear-gradient(135deg,#f8fafc,#e2e8f0)',
    defaults: {
      colorPrimary:   '#0ea5e9',
      colorSecondary: '#0284c7',
      colorAccent:    '#0369a1',
    },
    cssClass: 'template-minimal',
    headerStyle: 'light',
    cardStyle: 'flat',
    fontStyle: 'serif',
  },
  {
    id: 'bold',
    name: 'Bold & Fresh',
    emoji: '⚡',
    description: 'Energético y llamativo. Ideal para productos deportivos.',
    preview: 'linear-gradient(135deg,#f97316,#ea580c)',
    defaults: {
      colorPrimary:   '#f97316',
      colorSecondary: '#ea580c',
      colorAccent:    '#c2410c',
    },
    cssClass: 'template-bold',
    headerStyle: 'gradient',
    cardStyle: 'sharp',
    fontStyle: 'bold',
  },
  {
    id: 'soft',
    name: 'Soft & Natural',
    emoji: '🌸',
    description: 'Suave y orgánico. Perfecto para belleza y bienestar.',
    preview: 'linear-gradient(135deg,#ec4899,#db2777)',
    defaults: {
      colorPrimary:   '#ec4899',
      colorSecondary: '#db2777',
      colorAccent:    '#be185d',
    },
    cssClass: 'template-soft',
    headerStyle: 'gradient',
    cardStyle: 'soft',
    fontStyle: 'rounded',
  },
];

export const getTemplate = (id) =>
  TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
