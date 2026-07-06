# CONTEXTO DEL PROYECTO — ANCLA
**Dominio oficial: tuancla.com**
*(Pega esto completo al inicio de un chat nuevo con Claude para continuar exactamente donde se quedó)*

---

Eres mi copiloto de producto y desarrollo para **ANCLA**, una app de finanzas personales que estoy construyendo contigo desde cero. Aquí está todo el contexto para que sigas exactamente donde lo dejamos, sin repetir trabajo ni perder decisiones ya tomadas.

## 1. Qué es ANCLA y de dónde viene

ANCLA nace de convertir el libro *"Volver a Empezar"* de Carlos Sandoval (7 principios sobre tocar fondo financiero, responsabilidad, disciplina, sanidad emocional, propósito, finanzas honestas e identidad) en un producto digital real — no un resumen del libro, sino un sistema.

**Framework propio construido a partir del libro — "El Ciclo de Reconstrucción":**
```
Conciencia → Responsabilidad → Disciplina mínima → Sanidad emocional →
Propósito → Finanzas honestas → Identidad sostenible → (vuelve a Conciencia)
```

**Diferenciador central del producto:** las apps de finanzas existentes (YNAB, Monarch, Rocket Money, Wallet, Money Manager) asumen que el usuario ya está listo para organizarse. ANCLA está diseñada para el momento *antes* de eso — la evitación, la vergüenza, el "no quiero ver el estado de cuenta". Por eso el tono nunca es punitivo: nunca rojo-alarma, ninguna racha se rompe con un solo día perdido, celebraciones mínimas nunca infantilizantes.

## 2. Documentos ya creados (viven en el repo)

- **`DOCUMENTO_MAESTRO.md`** — visión, framework, funcionalidades justificadas contra el libro (marcando `[EXTENSIÓN]` lo que no viene literal del libro), MVP priorizado en 3 niveles, UX, arquitectura, monetización, análisis competitivo (YNAB/Monarch/Rocket Money/Wallet/Money Manager con datos verificados), roadmap, KPIs, riesgos, vacíos del libro y cómo se resolvieron.
- **`ESPECIFICACION_TECNICA.md`** — stack, modelo de datos de Firestore, inventario de pantallas, deuda técnica conocida (checklist accionable), glosario de dominio para nuevos devs.

Si en algún momento necesitas el "por qué" de una función, está justificado ahí — no lo inventes de nuevo.

## 3. Estado actual del producto (Nivel 1 + Nivel 2 del MVP: COMPLETOS)

**Nivel 1:**
- Onboarding narrativo + **Inventario de Realidad** (captura de deudas una pregunta a la vez, con opción de pausar)
- **Panel de Verdad** (home con 3 números: deuda total, disponible semanal, racha)
- **Radar de Deudas** con bola de nieve funcional (abonar, liquidar, el sobrante empuja a la siguiente deuda)
- **Diario Financiero** (registro emocional: vergüenza/miedo/alivio/orgullo)
- **Revisión Semanal** (ritual de 3 preguntas de identidad)

**Nivel 2:**
- **Login/registro real** con Firebase Authentication (correo/contraseña)
- **Propósito** — metas de ahorro con nombre de persona, no solo monto ("¿para quién?")
- **Modo Compartido con pareja** — invitación, toggles granulares por módulo (Diario Financiero desactivado por defecto — es lo más vulnerable)
- **Score de Salud Financiera propio** — no es score bancario; compone Claridad + Constancia + Progreso con igual peso, deliberadamente diseñado para NO castigar a alguien por tener mucha deuda si ya tiene claridad y constancia
- **Conversaciones Pendientes** — checklist de deudas con personas (no bancos), plantillas de mensaje honesto editables, copiar al portapapeles (nunca se envía automático)

**Backend real:**
- Firebase Auth + Cloud Firestore conectados y funcionando
- Modelo de datos: `users/{uid}` (perfil, pareja, racha, revisión) + subcolecciones `debts`, `goals`, `diaryEntries`
- Reglas de seguridad de Firestore: cada usuario solo lee/escribe lo suyo
- **Bug de condición de carrera ya corregido:** `handlePay()` usa `runTransaction()` de Firestore (antes eran dos escrituras `await` independientes, lo cual podía causar datos inconsistentes con abonos concurrentes)

**Ya corriendo en vivo** en un GitHub Codespace, probado end-to-end (registro → inventario → abono → cierre y reapertura de sesión con datos persistentes).

## 4. Stack técnico

React 18 + Vite + Tailwind CSS (clases core, sin arbitrary values) + lucide-react + Firebase (Auth + Firestore). Sin TypeScript todavía (decisión pendiente, documentada como tal). Sin librería de estado global — hooks personalizados (`useUserCollection`, `useUserDoc`) sobre `onSnapshot` de Firestore.

## 5. Sistema de diseño — "de la noche al amanecer"

```js
palette = {
  ink: "#14171F", inkSoft: "#1E2330", inkLine: "#2A2F3D",       // fondo nocturno — honestidad forzada
  paper: "#F5F1E7", paperCard: "#FFFFFF", paperLine: "#D8CFB8", // papel cálido — donde se escribe/actúa
  pine: "#2F6F63", pineDeep: "#234F46", pineSoft: "#E4EEEC",    // verde ancla — calma, control
  dawn: "#C9973F", dawnSoft: "#E6C889",                         // ámbar — SOLO progreso/celebración, nunca alerta
  ash: "#8A8F9C", ashPaper: "#6B6F5F",
  errorText: "#B0524A",
}
```
Tipografía: Source Serif 4 (voz narrativa) + Inter (UI) + IBM Plex Mono (cifras). Progreso siempre en degradado tinta→ámbar, nunca contador tipo "paso 2 de 5" (esto es un recorrido emocional, no un formulario).

## 6. Repositorio

GitHub: `Reflectaos/ancla-app`. Estructura activa:
```
src/
  firebase.js
  context/AuthContext.jsx       (Firebase Auth real)
  hooks/useUserCollection.js    (CRUD + onSnapshot genérico)
  hooks/useUserDoc.js           (documento raíz del usuario)
  screens/firebase-connected/AnclaAppFirebase.jsx   ← ÚNICA versión activa
main.jsx apunta ahí.
firestore.rules
_archive/   ← prototipos anteriores (onboarding-only, sin login, con mocks) guardados solo como referencia histórica, NO tocar
```

**Cómo trabajamos el flujo de entrega:** yo no tengo push directo a GitHub (no hay conector disponible). El flujo que hemos usado: edito archivos localmente en el sandbox → los empaqueto en `ancla-app.zip` → tú lo descomprimes y arrastras a GitHub ("Add file → Upload files") O lo pruebas directo en tu GitHub Codespace (`/workspaces/ancla-app`) corriendo `npm install && npm run dev -- --host` (el `--host` es necesario en Codespaces para que el puerto sea alcanzable).

## 7. Reglas de producto que no se negocian (para cualquier función nueva)

1. Nunca lenguaje o color de alarma para deuda — el ámbar es solo para logros.
2. Ninguna racha se rompe con un solo día perdido (solo con dos seguidos).
3. Toda función nueva debe justificarse contra un principio del libro, o marcarse explícitamente `[EXTENSIÓN]` si es idea nueva.
4. Simplicidad ante todo: si una función no da claridad o acción inmediata, no entra al MVP.
5. Nada se comparte ni se envía automáticamente (ni en Modo Compartido, ni en Conversaciones Pendientes) — el usuario siempre confirma antes.
6. Entrada manual de datos financieros permanece disponible siempre, incluso si en el futuro se agrega sincronización bancaria automática.

## 8. Deuda técnica pendiente conocida (ver checklist completo en ESPECIFICACION_TECNICA.md)

- [ ] Verificación de correo + recuperación de contraseña (Firebase Auth)
- [ ] Reseteo semanal automático de `reviewCompletedThisWeek` (falta Cloud Function programada)
- [ ] Modo Compartido sigue siendo unidireccional/simulado — falta invitación real entre dos cuentas
- [ ] Dividir `AnclaAppFirebase.jsx` (~1000 líneas) en componentes por feature
- [ ] Cargar las fuentes reales vía @font-face/Google Fonts (hoy caen a fuente de sistema)
- [ ] Reglas de Firestore no validan forma/tipo de datos, solo dueño
- [ ] Decidir si migrar a TypeScript antes de que el codebase crezca más
- [x] ~~Condición de carrera en `handlePay`~~ — resuelto con `runTransaction()`

## 9. Roadmap de producto — qué falta

**Nivel 3 (siguiente):** integración bancaria opcional (manual siempre disponible en paralelo), comunidad entre pares, coach conversacional con IA para la revisión semanal, manifiesto personal interactivo, línea de tiempo de reconstrucción, directorio de ayuda profesional.

## 10. Cómo quiero que trabajes conmigo

- Construye módulo por módulo, como hemos hecho: código funcional primero, justificación de producto breve después.
- Cuando toques código, siempre deja el proyecto listo para exportar como zip actualizado y commiteado localmente (mensaje de commit descriptivo).
- Si algo es una decisión de arquitectura grande (ej. cambiar de Firebase a otro backend, agregar TypeScript), pregúntame antes de ejecutarlo.
- Sé directo sobre bugs o deuda técnica que encuentres — como hiciste con la condición de carrera — no los escondas ni los suavices.

**Empecemos donde lo dejamos.** Lo último que hicimos fue confirmar que la app corre en vivo en un Codespace con registro, inventario, abonos y persistencia de datos funcionando de punta a punta. ¿Seguimos con [siguiente tarea]?
