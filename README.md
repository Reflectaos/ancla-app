# ANCLA — Finanzas con Propósito

**Dominio oficial: [tuancla.com](https://tuancla.com)**

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

## Firebase (login y datos reales)

La versión activa (`src/main.jsx` → `screens/firebase-connected/AnclaAppFirebase.jsx`) usa
Firebase de verdad, no un mock. Antes de correrla, en la [Consola de Firebase](https://console.firebase.google.com)
del proyecto `ancla-app-d4c10`:

1. **Authentication** → pestaña *Sign-in method* → habilita **Correo electrónico/contraseña**.
2. **Firestore Database** → si no existe, créala (modo de producción está bien, las reglas
   de seguridad ya están en `firestore.rules`).
3. Sube esas reglas: en la consola, pestaña *Reglas* de Firestore → pega el contenido de
   `firestore.rules` de este repo → **Publicar**. (O con Firebase CLI: `firebase deploy --only firestore:rules`.)

La configuración del proyecto (`firebaseConfig`) ya está en `src/firebase.js` — es información
pública, no una clave secreta, así que no hace falta ocultarla ni ponerla en variables de entorno
para este prototipo.

### Modelo de datos en Firestore
- `users/{uid}` — nombre, correo, pareja (Modo Compartido), racha, revisión semanal.
- `users/{uid}/debts/{debtId}` — deudas del Radar.
- `users/{uid}/goals/{goalId}` — metas del módulo de Propósito.
- `users/{uid}/diaryEntries/{entryId}` — entradas del Diario Financiero.

Cada usuario solo puede leer y escribir sus propios documentos (ver `firestore.rules`).

## Stack

- React 18 + Vite
- Tailwind CSS
- lucide-react (iconografía)
- Firebase (Authentication + Firestore)

## Estado del proyecto

Prototipo de Nivel 1 (MVP) del Documento Maestro: Inventario de Realidad, Panel de Verdad,
Radar de Deudas con bola de nieve, Diario Financiero y Revisión Semanal. Ver el roadmap
completo en `DOCUMENTO_MAESTRO.md`, sección 17.
