# ESPECIFICACIÓN TÉCNICA — ANCLA
## Manual técnico para el equipo de desarrollo

Versión: 2.3 · Basado en `src/screens/firebase-connected/AnclaAppFirebase.jsx` (~1450 líneas) · Complementa a `DOCUMENTO_MAESTRO.md`

---

## 1. Resumen ejecutivo

ANCLA es una aplicación de finanzas personales basada en los 7 principios del libro *Volver a Empezar*, de Carlos Sandoval. Este documento traduce el prototipo funcional ya construido (React + Firebase) en una especificación que un equipo de desarrollo puede tomar para llevarlo a producción.

**Estado actual:** prototipo funcional de Nivel 1 y Nivel 2 completo (ver `DOCUMENTO_MAESTRO.md`, sección 7), con autenticación real (Firebase Auth) y persistencia de datos por usuario (Firestore), corriendo en vivo en GitHub Codespaces. Desde la v1.0 de este documento se agregaron: captura de ingreso con cálculo real de disponible semanal, edición/eliminación de metas y de deudas, registro de deudas en cualquier momento (no solo en onboarding), fechas visibles en Diario y Propósito, pantalla "Acerca de", y un menú "Más" en la navegación. Se **retiró por completo** el módulo de Conversaciones Pendientes (ver sección 17, Changelog).

No apto para producción tal cual — ver sección 15, "Deuda técnica conocida", antes de lanzar.

**Lo que NO es este documento:** no reemplaza al Documento Maestro del Producto (framework, principios, justificación de cada función). Este documento asume que ya se leyó ese y se enfoca en el **cómo está construido y qué falta**, no en el **por qué existe cada función**.

---

## 2. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | React 18 + Vite | SPA, sin SSR por ahora |
| Estilos | Tailwind CSS (clases core, sin arbitrary values) | Paleta de diseño documentada en sección 8 |
| Iconografía | lucide-react | |
| Autenticación | Firebase Authentication (correo/contraseña) | Ver sección 5 antes de agregar más proveedores (Google, Apple) |
| Base de datos | Cloud Firestore | NoSQL, documentos por usuario — ver modelo en sección 4 |
| Hosting sugerido | Firebase Hosting o Vercel | SPA estática con llamadas a Firebase, ambos funcionan sin backend propio |
| Control de versiones | Git / GitHub (`Reflectaos/ancla-app`) | |

**Decisión pendiente para el equipo:** el prototipo no usa TypeScript. Recomendación: migrar antes de que el codebase crezca más — el modelo de datos (deudas, metas, usuario) ya está lo bastante definido como para beneficiarse de tipado estático.

---

## 3. Arquitectura del proyecto

### 3.1 Estado actual del repositorio

```
src/screens/firebase-connected/AnclaAppFirebase.jsx   ← ÚNICA versión activa (main.jsx apunta aquí)
_archive/                                             ← prototipos anteriores, solo referencia histórica
firestore.rules
```

Las carpetas de iteraciones previas (`onboarding/`, `panel-radar/`, `app-completa/`, `auth/`, `purpose/`, `partner/`, `nivel2-completo/`) ya fueron movidas a `_archive/` — este punto de la deuda técnica de v1.0 quedó resuelto.

### 3.2 Arquitectura objetivo (recomendada, sigue pendiente)

`AnclaAppFirebase.jsx` sigue concentrando **todos** los componentes de UI en un solo archivo (~1330 líneas, creció desde las ~900 de v1.0 con cada función nueva). Cada turno de trabajo lo vuelve más urgente. División recomendada, sin cambios respecto a v1.0:

```
src/
  components/ui/       → GhostButton, PrimaryButton, PaperCard, ProgressArc, TextField, SharingToggle...
  components/layout/   → BottomNav, MoreMenu, LoadingScreen
  features/
    onboarding/         → Welcome, WaitScreen, InventoryIntro, DebtCapture, PausedScreen, RealityReveal
    debts/              → TruthPanel, IncomeForm, DebtRadar, DebtRow, AddDebtForm, CelebrationModal
    purpose/            → PurposeScreen, GoalCard, AddGoalForm, EditGoalForm
    health/             → HealthScoreScreen, ScoreRing, FactorBar
    partner/            → PartnerScreen y subcomponentes
    diary/              → DiaryScreen
    review/             → WeeklyReview
    about/              → AboutScreen
    account/            → AccountScreen
  context/AuthContext.jsx    (ya existe)
  hooks/useUserCollection.js, useUserDoc.js  (ya existen)
  theme/palette.js       → extraer `palette`, `serif`, `sans`, `mono` (hoy duplicados en el archivo único)
  App.jsx
  main.jsx
```

Reorganización puramente mecánica (mover código, no reescribirlo) — sigue siendo de las primeras tareas recomendadas para cualquier equipo que tome el proyecto.

---

## 4. Modelo de datos (Firestore)

### 4.1 Colección `users/{uid}`

Documento raíz por usuario.

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre para mostrar |
| `email` | string | Correo (duplicado de Firebase Auth por conveniencia de queries) |
| `createdAt` | timestamp | Servidor (`serverTimestamp()`) |
| `streak` | number | Racha de honestidad. Default `1`. Se incrementa en cada revisión semanal completada |
| `reviewCompletedThisWeek` | boolean | **Limitación conocida:** no hay reseteo semanal automático — ver sección 15 |
| `partner` | map | Ver 4.4 |
| `dailyReminderEnabled` | boolean | **Nuevo.** Preferencia del toggle "Recordatorio diario" en Cuenta. **Solo guarda la preferencia — no dispara ninguna notificación todavía** (falta FCM + Cloud Function, ver sección 9) |
| `income` | number | **Nuevo.** Ingreso capturado por el usuario en Panel de Verdad |
| `incomeFrequency` | string | **Nuevo.** Uno de `semanal` \| `quincenal` \| `mensual`. Define el divisor usado para calcular el disponible semanal (`INCOME_FREQUENCIES` en el código: semanal=1, quincenal=2, mensual=4.345) |
| `weeklySpent` | number | **Nuevo.** Acumulado de abonos a deudas hechos durante la semana en curso |
| `weeklySpentWeekKey` | string | **Nuevo.** Fecha (`YYYY-MM-DD`) del lunes de la semana a la que corresponde `weeklySpent`, calculada por `getWeekKey()`. Si no coincide con la semana actual al leer, el disponible se calcula ignorando ese acumulado (ver 4.2 nota sobre reseteo perezoso) |
| `plan` | string | **Nuevo.** `"free"` (default — campo ausente se trata como free) \| `"plus"`. Primer campo de monetización del proyecto — hoy solo gatea la pestaña Pareja (ver sección 9 de este documento y `DOCUMENTO_MAESTRO.md`, sección 14, "Modelo de monetización") |

### 4.2 Subcolección `users/{uid}/debts/{debtId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre del acreedor ("Tarjeta Azul", "Mi hermano") |
| `original` | number | Monto original de la deuda |
| `remaining` | number | Saldo restante — se actualiza con cada abono |
| `payments` | array de `{ amount: number, date: string }` | **Nuevo.** Historial de abonos hechos a esta deuda. `date` es un ISO string generado en el cliente (`new Date().toISOString()`), no `serverTimestamp()` — los arrays de Firestore no soportan ese sentinel value dentro de sus elementos. Se muestra en el Radar de Deudas debajo de la barra de progreso, junto con el porcentaje pagado |
| `createdAt` | timestamp | |

**Cambio importante respecto a v1.0:** los campos `person` (booleano) y `talked` existían únicamente para el módulo de Conversaciones Pendientes, que fue retirado en esta versión (ver Changelog). Ya no se escriben en documentos nuevos. **Documentos creados antes de este cambio pueden conservar esos campos como datos huérfanos** — no se hizo una migración de limpieza retroactiva sobre Firestore; si se requiere, es un script de una sola vez (`FieldValue.delete()` sobre `person`/`talked` en cada documento existente).

**Deudas que se pueden agregar fuera del onboarding:** desde el Radar de Deudas, el botón "Agregar una deuda" (`AddDebtForm`) permite registrar una deuda en cualquier momento — no solo durante el Inventario de Realidad inicial. Copy explícito: "No pasa nada si esta no estaba en tu inventario original", pensado para la deuda que por vergüenza o miedo no se registró al principio.

**Deudas liquidadas pueden borrarse:** cada `DebtRow` de una deuda con `remaining <= 0` muestra un ícono de eliminar con confirmación inline (`confirmDelete` local). Borra el documento por completo del historial — no es un archivado, es `deleteDoc` real vía `debtsHook.remove()`.

**Nota de diseño sin cambios:** el orden de "bola de nieve" (menor a mayor `remaining`) se calcula en el cliente, no se almacena. **Nuevo:** cuando un abono liquida una deuda y el sobrante empuja a la siguiente, `handlePay()` registra el abono real aplicado en el historial (`payments`) de **ambas** deudas afectadas — no el monto total que tecleó el usuario, sino lo que de verdad se le aplicó a cada una. Todo dentro de la misma transacción atómica.

### 4.3 Subcolección `users/{uid}/goals/{goalId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `person` | string | A quién está dedicada la meta ("Mis hijos"). **Nota:** este `person` es un campo de texto libre, sin relación con el campo booleano `person` que existía en `debts` — coincidencia de nombre entre dos colecciones distintas |
| `why` | string | Motivo opcional |
| `target` | number | Monto objetivo |
| `saved` | number | Monto acumulado |
| `targetDate` | string \| null | **Nuevo.** Fecha objetivo en formato `YYYY-MM-DD`, opcional. Se muestra en `GoalCard` mientras la meta no esté lograda |
| `createdAt` | timestamp | |

**Nuevo — edición y eliminación:** cada meta tiene íconos de editar (abre `EditGoalForm`, precargado con los valores actuales) y eliminar (`Trash2`, con confirmación inline igual que las deudas liquidadas). Conectado a `goalsHook.update()` y `goalsHook.remove()` respectivamente.

### 4.4 Campo `partner` (dentro de `users/{uid}`)

Sin cambios respecto a v1.0:

```json
{
  "status": "none | pending | connected",
  "name": "string",
  "email": "string",
  "sharing": { "debts": false, "purpose": false, "panel": false, "diary": false }
}
```

**Limitación conocida sin resolver:** modelo unidireccional y simulado — ver sección 15, punto pendiente más antiguo del proyecto.

### 4.5 Subcolección `users/{uid}/diaryEntries/{entryId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `mood` | string | Una de: `verguenza`, `miedo`, `alivio`, `orgullo` |
| `text` | string | Texto libre opcional |
| `createdAt` | timestamp | **Ahora visible en UI** — cada entrada guardada muestra su fecha (`toLocaleDateString("es-MX", ...)`). Si el timestamp del servidor aún no confirma (escritura optimista pendiente), se muestra "Justo ahora" en vez de fallar |

---

## 5. Autenticación y seguridad

Sin cambios respecto a v1.0. Resumen:

- Firebase Authentication, correo/contraseña únicamente. Falta verificación de correo y "olvidé mi contraseña".
- `firestore.rules` verifica dueño (`request.auth.uid == userId`) en `users/{uid}` y todas sus subcolecciones, pero **no valida forma ni tipo de los datos** — un cliente malicioso podría escribir campos arbitrarios, incluyendo los nuevos `income`, `weeklySpent`, etc.
- El Diario Financiero sigue siendo el dato más sensible de la app.

---

## 6. Inventario de pantallas y componentes

| Pantalla | Componente(s) | Datos que consume | Escribe en |
|---|---|---|---|
| Bienvenida / Login | `LoginScreen` | — | Firebase Auth |
| — incluye ahora la descripción del acróstico ANCLA y tagline, antes del formulario | | | |
| Registro | `SignupScreen` | — | Firebase Auth, `users/{uid}` |
| Espera / Intro / Captura / Pausa / Revelación | `WaitScreen`, `InventoryIntro`, `DebtCapture`, `PausedScreen`, `RealityReveal` | estado local temporal | `debts` (batch, al terminar) |
| Panel de Verdad | `TruthPanel` + `IncomeForm` | `debts`, `streak`, `users/{uid}.income/incomeFrequency/weeklySpent/weeklySpentWeekKey` | `users/{uid}` (captura/edición de ingreso) |
| Radar de Deudas | `DebtRadar` + `DebtRow` + `AddDebtForm` | `debts` | `debts` (abonos, altas, bajas) |
| Propósito | `PurposeScreen` + `GoalCard` + `AddGoalForm` + `EditGoalForm` | `goals` | `goals` (alta, abono, edición, borrado) |
| Diario | `DiaryScreen` | `diaryEntries` | `diaryEntries` |
| Revisión semanal | `WeeklyReview` | `users/{uid}.reviewCompletedThisWeek` | `users/{uid}.streak`, `.reviewCompletedThisWeek` |
| Salud Financiera | `HealthScoreScreen` + `ScoreRing` + `FactorBar` | `debts`, `streak` (cálculo derivado, no persistido) | — |
| Pareja | `PartnerScreen` + subcomponentes | `users/{uid}.partner` | `users/{uid}.partner` |
| Acerca de | `AboutScreen` | — (contenido estático) | — |
| Cuenta | `AccountScreen` | `currentUser`, `users/{uid}.dailyReminderEnabled` | `users/{uid}.dailyReminderEnabled` (logout) |

**Retirada de esta versión:** `ConversationsScreen` + `ConversationCard` + `buildTemplate()`. Ver Changelog, sección 17.

**Navegación:** `BottomNav` ya no lista las 10 pantallas de forma plana. Muestra 6 accesos directos (Inicio, Deudas, Propósito, Diario, Revisión, Cuenta) + un botón "Más" que abre `MoreMenu`, una hoja inferior con Salud financiera, Pareja y Acerca de. `MORE_KEYS` (constante a nivel de módulo) define qué tabs cuentan como "dentro de Más" para resaltar ese botón como activo.

---

## 7. Gestión de estado

Sin cambios de patrón respecto a v1.0: hooks personalizados sobre Firestore + `onSnapshot`, sin librería de estado global. Sigue siendo apropiado para el tamaño actual.

- `useAuth()` — sesión del usuario.
- `useUserCollection(nombre)` — CRUD + listener en tiempo real (`debts`, `goals`, `diaryEntries`).
- `useUserDoc()` — lectura/escritura del documento raíz (racha, pareja, revisión, ingreso, recordatorio, gasto semanal). Usa `setDoc(..., { merge: true })`, por lo que agregar campos nuevos (como se hizo esta versión) nunca requirió tocar el hook.

---

## 8. Sistema de diseño

Sin cambios de paleta ni tipografía respecto a v1.0 (sigue pendiente centralizarla en `src/theme/` y cargar las fuentes reales vía `@font-face`/Google Fonts — el navegador cae a fuente de sistema).

```js
const palette = {
  ink: "#14171F", inkSoft: "#1E2330", inkLine: "#2A2F3D",
  paper: "#F5F1E7", paperCard: "#FFFFFF", paperDim: "#E4DCC8", paperLine: "#D8CFB8",
  pine: "#2F6F63", pineDeep: "#234F46", pineSoft: "#E4EEEC",
  dawn: "#C9973F", dawnSoft: "#E6C889",
  ash: "#8A8F9C", ashPaper: "#6B6F5F",
  inkText: "#EDEBE4", paperText: "#22261F", errorText: "#B0524A",
};
```

---

## 9. Funcionalidades pendientes de backend real

Actualizado respecto a v1.0:

1. **Modo Compartido con pareja** — sigue simulado y unidireccional. Sin cambios desde v1.0.
2. **Reseteo semanal de la revisión** (`reviewCompletedThisWeek`) — sigue sin resolver. Requiere Cloud Function programada.
3. **Recordatorio diario** — **nuevo pendiente.** El toggle en Cuenta (`dailyReminderEnabled`) hoy solo guarda una preferencia en Firestore. No dispara ninguna notificación real. Para que funcione de verdad hace falta: Firebase Cloud Messaging, permiso de notificaciones del navegador/dispositivo, y una Cloud Function programada (Cloud Scheduler) que revise qué usuarios tienen el flag activo y les envíe el push a la hora elegida (hoy tampoco se captura una hora específica, solo on/off).
4. **"Disponible esta semana"** — **ya no es un mock.** Se calcula en el cliente a partir de `income`/`incomeFrequency` menos `weeklySpent` de la semana en curso. El reseteo semanal de `weeklySpent` es **perezoso** (se calcula al leer, comparando `weeklySpentWeekKey` contra la semana actual con `getWeekKey()`), no requiere Cloud Function — pero **si el usuario nunca vuelve a abonar en una semana nueva, `weeklySpent` en Firestore queda con el valor viejo indefinidamente** (solo se corrige la próxima vez que se escribe, no hay corrección proactiva). Esto es intencional para evitar escrituras innecesarias, pero vale la pena documentarlo si alguien construye un reporte histórico directo desde Firestore sin pasar por la lógica del cliente.
5. **Score de Salud Financiera** — sin cambios desde v1.0, se recalcula en cada render del cliente.
6. ~~**Envío real de plantillas de conversación**~~ — ya no aplica, el módulo completo de Conversaciones fue retirado.
7. **Paywall de Pareja (`plan: "plus"`)** — **nuevo, y es un placeholder deliberado.** El botón "Ver planes de Ancla Plus" en `PartnerPaywall` hoy simplemente escribe `plan: "plus"` en Firestore — no hay ningún cobro real conectado. Falta: integrar una pasarela real (Stripe, RevenueCat, o billing nativo de App Store/Google Play si se empaqueta como app móvil), una pantalla de selección de plan/precio, manejo de renovación y cancelación, y — muy importante — mover la validación de "¿tiene Plus?" a algo que no pueda falsificar el propio cliente (hoy cualquiera con acceso a la consola de Firestore podría escribirse `plan: "plus"` a sí mismo; las reglas de Firestore no lo impiden porque no validan forma de los datos, ver sección 5).

---

## 10. Testing recomendado

Sin cambios de fondo respecto a v1.0. Ampliado:

1. **Tests unitarios de `handlePay()`** — sigue siendo la lógica de negocio más delicada, y ahora hace más en una sola transacción: bola de nieve **y** actualización de `weeklySpent`/`weeklySpentWeekKey` del usuario, todo atómico vía `runTransaction()`. Un test debe cubrir el caso de cambio de semana entre abonos (que `weeklySpent` se reinicie en vez de acumular sobre una semana vieja).
2. **Tests de reglas de Firestore** con el Firebase Emulator Suite — sin cambios.
3. **Tests de componentes** — agregar cobertura de los flujos nuevos: capturar ingreso por primera vez, editar una meta, eliminar una deuda liquidada, eliminar una meta.

---

## 11. CI/CD y despliegue

Sin cambios respecto a v1.0.

---

## 12. Rendimiento y escalabilidad

Sin cambios de fondo. Con la salida de `ConversationCard` de la base de código, la lista de componentes sin memoización (`DebtRow`, `GoalCard`) es ligeramente más corta, pero la recomendación de v1.0 (revisar `useMemo`/`React.memo` si el Radar o Propósito llegan a tener decenas de ítems) sigue vigente.

---

## 13. Accesibilidad

Sin cambios respecto a v1.0 — pendiente de auditoría completa. Los toggles siguen siendo `<div>` con manejo de click en vez de inputs reales (`SharingToggle`, el toggle de recordatorio diario en Cuenta).

---

## 13.5 Guía de despliegue a producción (web / PWA)

Decisión de producto para este lanzamiento: **solo web, como PWA instalable**, y **solo Nivel 1 gratis** — Ancla Plus (Pareja) queda visible como "Disponible próximamente" sin cobro real todavía. Estos pasos asumen esa decisión.

### Paso 0 — Separar Firebase de desarrollo y de producción
No uses el mismo proyecto de Firebase donde hemos estado probando. En la [consola de Firebase](https://console.firebase.google.com):
1. Crea un proyecto nuevo, p. ej. `ancla-prod`.
2. Activa Authentication (correo/contraseña) y Firestore igual que en el de desarrollo.
3. Copia su `firebaseConfig` a `src/firebase.js` — o, mejor, muévelo a variables de entorno (`import.meta.env.VITE_FIREBASE_*`) para no mezclar credenciales de dev y prod en el mismo archivo versionado.

### Paso 1 — Instalar Firebase CLI y autenticarte (una sola vez, en tu Codespace)
```bash
npm install -g firebase-tools
firebase login
```

### Paso 2 — Conectar el repo a tus dos proyectos
```bash
cd /workspaces/ancla-app
firebase use --add        # elige ancla-dev (o el que uses hoy), alias "dev"
firebase use --add        # elige ancla-prod, alias "prod"
```
Esto genera tu propio `.firebaserc` real (el `.firebaserc.example` de este entregable es solo referencia — no lo copies tal cual, tiene un ID de ejemplo).

### Paso 3 — Publicar las reglas de Firestore ya reforzadas (sección 5)
```bash
firebase deploy --only firestore:rules --project prod
```
**Antes de este paso**, prueba las reglas con el Emulator Suite (`firebase emulators:start`) — no las hemos podido probar en vivo desde este entorno de trabajo. En particular verifica: que un usuario nuevo se pueda registrar, que pueda abonar a una deuda antigua que aún tenga campos `person`/`talked` huérfanos, y que un intento de escribir `plan: "plus"` directamente sea rechazado.

### Paso 4 — Desplegar la Cloud Function del reseteo semanal
Requiere el plan **Blaze** (pago por uso) de Firebase — Cloud Scheduler no está disponible en el plan gratuito Spark.
```bash
cd functions && npm install && cd ..
firebase deploy --only functions --project prod
```

### Paso 5 — Compilar y publicar el sitio
```bash
npm run build
firebase deploy --only hosting --project prod
```
Esto te da una URL en `*.web.app` / `*.firebaseapp.com`. Para un dominio propio: Firebase Hosting → "Agregar dominio personalizado" en la consola, y sigue la verificación DNS que te indique — cada dominio es distinto, no hay un paso genérico universal aquí.

### Qué probar después de publicar
- Instalar la PWA de verdad (Chrome/Edge en escritorio: ícono de instalar en la barra de direcciones; Android: "Agregar a pantalla de inicio"; iOS Safari: compartir → "Agregar a inicio").
- Registro completo → llega el correo de verificación → "Ya lo verifiqué" te deja entrar.
- "¿Olvidaste tu contraseña?" de punta a punta.
- Que la pestaña Pareja muestre "Disponible próximamente" y no tenga forma de activarse.

### Lo que sigue pendiente incluso después de este despliegue
No resuelto en este documento — ver sección 15: verificación de correo *obligando* reenvío tras cierto tiempo, notificaciones push reales, aviso de privacidad y términos de uso (borrador legal, no incluido aquí — no soy abogado y esto sí necesita revisión profesional dado que la app maneja datos financieros y un diario emocional), y monitoreo de errores en producción (Sentry o similar).

## 14. Roadmap técnico (Nivel 3, ver Documento Maestro sección 17)

1. Verificación de correo + recuperación de contraseña.
2. ~~Migrar `handlePay` a transacciones de Firestore~~ — resuelto en v1.1, extendido en esta versión.
3. Reseteo semanal automático de revisión (Cloud Function programada) — sigue pendiente.
4. Notificaciones push reales para el recordatorio diario (FCM + Cloud Scheduler) — nuevo pendiente de esta versión.
5. Rediseño del Modo Compartido como relación bidireccional real entre dos cuentas.
6. Integración bancaria opcional — mantener entrada manual como alternativa permanente.
7. Coach conversacional con IA para la revisión semanal.

---

## 15. Deuda técnica conocida (resumen ejecutable)

- [x] Eliminar carpetas de prototipos antiguos — resuelto, movidas a `_archive/`.
- [ ] Dividir `AnclaAppFirebase.jsx` en componentes por feature — cada vez más urgente (~1330 líneas).
- [ ] Centralizar paleta/tipografía en `src/theme/`.
- [ ] Cargar las fuentes reales vía `@font-face` o Google Fonts.
- [x] Migrar `handlePay` a `runTransaction()` — resuelto en v1.1.
- [x] Implementar reseteo semanal de `reviewCompletedThisWeek` — resuelto en v2.3 (Cloud Function programada, `functions/index.js`), pendiente de que el equipo la despliegue (requiere plan Blaze).
- [x] Agregar verificación de correo y recuperación de contraseña — resuelto en v2.3.
- [x] Agregar reglas de validación de esquema en `firestore.rules` — resuelto en v2.3, pendiente de probarse con el Emulator Suite antes de desplegar a producción (no se pudo probar en vivo desde este entorno).
- [ ] Mover `firebaseConfig` a variables de entorno por ambiente — sigue pendiente, ver sección 13.5, Paso 0.
- [ ] Auditoría de accesibilidad (toggles, contraste).
- [ ] Decidir y ejecutar: ¿TypeScript sí o no?
- [ ] **Nuevo:** monitoreo de errores en producción (Sentry o similar) — no configurado.
- [ ] **Nuevo:** aviso de privacidad y términos de uso — no redactados. Requiere revisión legal real, no solo texto genérico, dado el tipo de datos que maneja la app.
- [ ] Limpiar campos huérfanos `person`/`talked` en documentos de `debts` creados antes del retiro de Conversaciones (script de una sola vez, opcional — y ahora además explícitamente tolerados por `firestore.rules` para no romper nada mientras no se limpien).
- [ ] Construir la infraestructura real detrás del toggle "Recordatorio diario" (FCM + Cloud Scheduler + captura de hora preferida) o considerar ocultarlo mientras tanto.
- [ ] **Nuevo:** cobro real de Ancla Plus (Stripe/RevenueCat) — el paywall de Pareja hoy solo dice "Disponible próximamente", sin ninguna integración de cobro detrás. Cuando se construya, `plan` deberá escribirse exclusivamente desde un backend con Admin SDK (webhook de Stripe → Cloud Function) — las reglas de Firestore de esta versión ya bloquean que el cliente lo modifique directamente, así que ese backend es la única pieza que falta para que el paywall sea real.

---

## 16. Glosario de dominio (para onboarding de nuevos desarrolladores)

- **Inventario de Realidad** — el flujo de onboarding donde el usuario registra sus deudas por primera vez.
- **Panel de Verdad** — el home/dashboard principal. Incluye "Disponible esta semana", calculado desde el ingreso capturado por el usuario.
- **Radar de Deudas** — la lista de deudas ordenada con lógica de "bola de nieve". Ahora permite agregar deudas nuevas en cualquier momento y borrar las ya liquidadas.
- **Bola de nieve** — estrategia de pago: se abona a la deuda más pequeña primero; al liquidarla, el sobrante se suma al pago de la siguiente.
- **Hábito ancla** — el único hábito financiero que se le pide al usuario mantener al inicio (revisión semanal).
- **Modo Sin Juicio** — principio de diseño transversal: ningún elemento visual o de copy debe sentirse punitivo o de alarma.
- **Score de Salud Financiera** — índice propio (no bancario), Claridad + Constancia + Progreso.
- **Semana en curso / `getWeekKey`** — término técnico nuevo: identifica la semana actual por la fecha de su lunes (`YYYY-MM-DD`), usado para saber si "lo abonado esta semana" sigue vigente o hay que reiniciar el conteo.

Para el "por qué" detrás de cada uno de estos términos, ver `DOCUMENTO_MAESTRO.md`.

---

## 17. Changelog

- **v2.3** (esta versión) — primera pasada real de preparación para producción, con decisión de alcance: solo web/PWA, solo Nivel 1 gratis por ahora:
  - Verificación de correo obligatoria tras registrarse (`VerifyEmailScreen`) y recuperación de contraseña (`ForgotPasswordScreen`), ambas sobre Firebase Auth nativo — sin backend adicional.
  - `firestore.rules` reescritas con validación de esquema por colección (tipos de campo, lista blanca de campos permitidos) y protección explícita del campo `plan` para que solo un backend con Admin SDK pueda otorgarlo — el cliente ya no puede dárselo a sí mismo.
  - Paywall de Pareja simplificado: ya no tiene el botón de activación de prueba, ahora dice "Disponible próximamente" — acorde a que Ancla Plus se lanza después.
  - Soporte PWA completo: manifest, ícono de marca, service worker (`vite-plugin-pwa`), instalable en escritorio, Android e iOS. Las llamadas a Firebase Auth/Firestore están explícitamente excluidas de la caché — la app es instalable, no funciona offline por diseño.
  - Separación de chunks de build (`firebase`, `vendor`, app) — bajó el bundle principal de ~680 KB a ~80 KB, el resto se carga en paralelo y se cachea aparte.
  - Cloud Function programada (`functions/index.js`) para el reseteo semanal de `reviewCompletedThisWeek`, pendiente de despliegue por el equipo (plan Blaze).
  - `firebase.json` + plantilla de `.firebaserc.example` para desplegar a Firebase Hosting. Ver guía completa en sección 13.5.
- **v2.2**: primer paywall real del proyecto. La pestaña Pareja ahora está detrás de `plan === "plus"` en `users/{uid}` — si el usuario no tiene Plus, ve `PartnerPaywall` (explicación + botón de "activar" que hoy es un marcador de posición sin cobro real, documentado como tal en el propio código y en sección 9, punto 7). El botón "Pareja" dentro del menú "Más" ahora muestra una etiqueta "Plus". Los íconos de la navegación inferior se centraron (antes alineados a la izquierda).
- **v2.1**: cada `DebtRow` del Radar de Deudas ahora muestra el porcentaje pagado como texto y el historial de abonos (monto + fecha) dentro de la misma tarjeta. Nuevo campo `payments` en `debts`. La lógica de bola de nieve registra el abono real aplicado tanto en la deuda liquidada como en la siguiente que recibe el sobrante, dentro de la misma transacción atómica de `handlePay`.
- **v2.0**:
  - **Retirado por completo el módulo de Conversaciones Pendientes** (`ConversationsScreen`, `ConversationCard`, `buildTemplate()`, y los campos `person`/`talked` en `debts` que solo existían para esto). Documentos de deudas creados antes de este cambio pueden conservar esos campos como datos huérfanos sin efecto en la UI.
  - **Bug real encontrado y corregido antes del retiro** (por si el patrón se repite en otra parte del código): el formulario de "Agregar deuda" introdujo un campo de texto libre llamado `person`, con un significado distinto al `person` booleano que ya usaba el resto del código (`true` = "involucra a una persona, no un banco"). Si se dejaba vacío, la deuda quedaba invisible para el filtro de Conversaciones sin ningún error visible — lección para el equipo: cuidado con reutilizar nombres de campo con semántica distinta entre formularios y el modelo de datos ya establecido.
  - Deudas liquidadas ahora se pueden eliminar del historial (con confirmación).
  - Metas de Propósito ahora son editables y eliminables; se agregó fecha objetivo opcional (`targetDate`).
  - Diario Financiero: cada entrada guardada muestra su fecha real.
  - Nueva captura de ingreso (monto + frecuencia semanal/quincenal/mensual) en Panel de Verdad. "Disponible esta semana" pasó de ser un valor fijo (`1450` hardcodeado) a calcularse de verdad, y ahora también resta lo abonado a deudas durante la semana en curso — todo dentro de la misma transacción atómica de `handlePay`.
  - Nueva pantalla "Acerca de" y nuevo botón "Más" en la navegación inferior, que agrupa Salud financiera, Pareja y Acerca de en una hoja inferior.
  - `LoginScreen` incluye ahora la descripción de marca (acróstico ANCLA + tagline).
- **v1.1** — `handlePay()` migrado de dos escrituras `await` independientes a una única `runTransaction()` de Firestore, eliminando la condición de carrera cuando dos abonos ocurrían casi simultáneamente.
- **v1.0** — Documento inicial, Nivel 1 y Nivel 2 completos con Firebase real.
