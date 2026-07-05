# ANCLA — Finanzas con Propósito

Prototipo de producto basado en los 7 principios del libro *Volver a Empezar* de Carlos Sandoval.

## Contenido

- `DOCUMENTO_MAESTRO.md` — visión, framework, funcionalidades, MVP, arquitectura, monetización y análisis competitivo.
- `src/screens/onboarding/` — prototipo del Onboarding + Inventario de Realidad.
- `src/screens/panel-radar/` — prototipo del Panel de Verdad + Radar de Deudas (bola de nieve).
- `src/screens/app-completa/` — prototipo unificado: onboarding + panel + radar + diario financiero + revisión semanal, con navegación completa. **Este es el que se monta por defecto.**

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Abre la URL que muestre la terminal (normalmente `http://localhost:5173`).

## Stack

- React 18 + Vite
- Tailwind CSS
- lucide-react (iconografía)

## Estado del proyecto

Prototipo de Nivel 1 (MVP) del Documento Maestro: Inventario de Realidad, Panel de Verdad,
Radar de Deudas con bola de nieve, Diario Financiero y Revisión Semanal. Ver el roadmap
completo en `DOCUMENTO_MAESTRO.md`, sección 17.
