# ESPECIFICACIÓN TÉCNICA — ANCLA
## Documento para el equipo de desarrollo

Versión: 1.0 · Basado en el repositorio `ancla-app` (commit `79c9cf9`) · Complementa a `DOCUMENTO_MAESTRO.md`

---

## 1. Resumen ejecutivo

ANCLA es una aplicación de finanzas personales basada en los 7 principios del libro *Volver a Empezar*. Este documento traduce el prototipo funcional ya construido (React + Firebase) en una especificación que un equipo de desarrollo puede tomar para llevarlo a producción.

**Estado actual:** prototipo funcional de Nivel 1 y Nivel 2 completo (ver `DOCUMENTO_MAESTRO.md`, sección 7), con autenticación real (Firebase Auth) y persistencia de datos por usuario (Firestore). No apto para producción tal cual — ver sección 16, "Deuda técnica conocida", antes de lanzar.

**Lo que NO es este documento:** no reemplaza al Documento Maestro del Producto (framework, principios, justificación de cada función). Este documento asume que ya se leyó ese y se enfoca en el **cómo construirlo bien**, no en el **por qué existe cada función**.

---

## 2. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | React 18 + Vite | SPA, sin SSR por ahora |
| Estilos | Tailwind CSS (clases core, sin plugin JIT de arbitrary values en el prototipo — revisar antes de escalar) | Paleta de diseño documentada en sección 8 |
| Iconografía | lucide-react | |
| Autenticación | Firebase Authentication (correo/contraseña) | Ver sección 5 antes de agregar más proveedores (Google, Apple) |
| Base de datos | Cloud Firestore | NoSQL, documentos por usuario — ver modelo en sección 4 |
| Hosting sugerido | Firebase Hosting o Vercel | El proyecto es una SPA estática con llamadas a Firebase, ambos funcionan sin backend propio |
| Control de versiones | Git / GitHub (`Reflectaos/ancla-app`) | |

**Decisión pendiente para el equipo:** el prototipo no usa TypeScript. Recomendación: migrar a TypeScript antes de que el codebase crezca más allá de Nivel 2 — los modelos de datos (deudas, metas, usuario) ya están lo bastante definidos como para beneficiarse de tipado estático, y reduce errores de props entre los ~25 componentes ya existentes.

---

## 3. Arquitectura del proyecto

### 3.1 Estado actual del repositorio

El repo contiene **múltiples versiones iterativas** del prototipo, una por cada sesión de trabajo:

```
src/screens/onboarding/          → primera iteración (solo onboarding)
src/screens/panel-radar/         → segunda iteración (panel + radar)
src/screens/app-completa/        → Nivel 1 completo, sin login
src/screens/auth/                → + login mock
src/screens/purpose/             → + módulo de propósito
src/screens/partner/             → + modo compartido
src/screens/nivel2-completo/     → Nivel 2 completo, con mocks
src/screens/firebase-connected/  → VERSIÓN ACTIVA — Firebase real
```

**Acción requerida antes de continuar el desarrollo:** eliminar todas las carpetas excepto `firebase-connected/`, o moverlas a una carpeta `_archive/` fuera de `src/`. Mantenerlas todas activas en `src/` es deuda técnica pura — quedaron como registro histórico de la construcción incremental del prototipo, no como arquitectura intencional. `src/main.jsx` ya apunta solo a `firebase-connected/AnclaAppFirebase.jsx`.

### 3.2 Arquitectura objetivo (recomendada)

El archivo `AnclaAppFirebase.jsx` actual concentra **todos** los componentes de UI en un solo archivo (~900 líneas) por velocidad de iteración durante el prototipado. Antes de escalar el equipo, se recomienda dividir así:

```
src/
  components/
    ui/              → GhostButton, PrimaryButton, PaperCard, ProgressArc, TextField...
    layout/          → BottomNav, LoadingScreen
  features/
    onboarding/       → Welcome, WaitScreen, InventoryIntro, DebtCapture, PausedScreen, RealityReveal
    debts/            → TruthPanel, DebtRadar, DebtRow, CelebrationModal
    conversations/    → ConversationsScreen, ConversationCard
    purpose/          → PurposeScreen, GoalCard, AddGoalForm
    health/           → HealthScoreScreen, ScoreRing, FactorBar
    partner/          → PartnerScreen, InvitePartner, PendingInvite, ConnectedPartner, SharingToggle
    diary/            → DiaryScreen
    review/           → WeeklyReview
    account/          → AccountScreen
  context/
    AuthContext.jsx    (ya existe)
  hooks/
    useUserCollection.js  (ya existe)
    useUserDoc.js          (ya existe)
  firebase.js           (ya existe)
  theme/
    palette.js         → extraer el objeto `palette`, `serif`, `sans`, `mono` de cada componente
  App.jsx
  main.jsx
```

Esta reorganización es puramente mecánica (mover código, no reescribirlo) y debería ser de las primeras tareas del equipo — reduce el archivo actual de ~900 líneas a ~15 archivos manejables.

---

## 4. Modelo de datos (Firestore)

### 4.1 Colección `users/{uid}`

Documento raíz por usuario. Se crea en el signup (`AuthContext.jsx`).

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre para mostrar |
| `email` | string | Correo (duplicado de Firebase Auth por conveniencia de queries) |
| `createdAt` | timestamp | Servidor (`serverTimestamp()`) |
| `streak` | number | Racha de honestidad. Default `1`. Se incrementa en cada revisión semanal completada |
| `reviewCompletedThisWeek` | boolean | **Limitación conocida:** no hay lógica de "reseteo semanal" todavía — ver sección 16 |
| `partner` | map | Ver 4.4 |

### 4.2 Subcolección `users/{uid}/debts/{debtId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre del acreedor ("Tarjeta Azul", "Mi hermano") |
| `original` | number | Monto original de la deuda |
| `remaining` | number | Saldo restante — se actualiza con cada abono |
| `person` | boolean | `true` si es deuda con una persona (habilita el módulo de Conversaciones); `false` si es institucional |
| `talked` | boolean | Si ya se tuvo la conversación pendiente (solo relevante si `person: true`) |
| `createdAt` | timestamp | |

**Nota de diseño:** el orden de "bola de nieve" (menor a mayor `remaining`) se calcula en el cliente (`[...debts].sort(...)`), no se almacena. Si se agrega paginación en el futuro, este cálculo debe moverse a una Cloud Function o reconsiderarse.

### 4.3 Subcolección `users/{uid}/goals/{goalId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `person` | string | A quién está dedicada la meta ("Mis hijos") |
| `why` | string | Motivo opcional |
| `target` | number | Monto objetivo |
| `saved` | number | Monto acumulado |
| `createdAt` | timestamp | |

### 4.4 Campo `partner` (dentro de `users/{uid}`)

```json
{
  "status": "none | pending | connected",
  "name": "string",
  "email": "string",
  "sharing": {
    "debts": false,
    "purpose": false,
    "panel": false,
    "diary": false
  }
}
```

**Limitación conocida importante:** este modelo asume una relación **unidireccional** — el usuario A invita y controla qué comparte, pero no hay un documento correspondiente en la cuenta de B, ni notificación real, ni un flujo de aceptación de verdad. "Simular aceptación" es literalmente eso: un botón que cambia el estado local sin que la otra persona haya hecho nada. **Esto debe rediseñarse antes de producción** — ver sección 16, punto 1.

### 4.5 Subcolección `users/{uid}/diaryEntries/{entryId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `mood` | string | Una de: `verguenza`, `miedo`, `alivio`, `orgullo` |
| `text` | string | Texto libre opcional |
| `createdAt` | timestamp | |

---

## 5. Autenticación y seguridad

### 5.1 Firebase Authentication
- Método habilitado: correo/contraseña únicamente.
- `mapFirebaseError()` en `AuthContext.jsx` traduce códigos de error de Firebase a mensajes en español — mantenerlo actualizado si se agregan más flujos.
- **✅ Resuelto:** verificación de correo (`sendEmailVerification`, enviado automáticamente al registrarse) y recuperación de contraseña (`sendPasswordResetEmail`, con pantalla propia "¿Olvidaste tu contraseña?" desde el login). La verificación es deliberadamente **no bloqueante**: se recuerda una vez por sesión (`VerifyEmailScreen`) y queda como banner posponible en Cuenta, para no introducir fricción a alguien que está en crisis financiera — coherente con el principio de "Modo Sin Juicio" del Documento Maestro.
- **Pendiente:** agregar más proveedores de acceso (Google, Apple) si el negocio lo requiere.

### 5.2 Reglas de Firestore (`firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{subcollection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Estas reglas son **restrictivas por diseño**: nadie puede leer los datos de otro usuario, ni siquiera el propio módulo de Modo Compartido con pareja (que hoy es enteramente client-side y no comparte datos reales entre cuentas — ver 4.4 y 16.1).

**Antes de producción:** agregar reglas de validación de esquema (tipos de campo, rangos) usando `request.resource.data` — actualmente las reglas solo verifican dueño, no forma de los datos. Un cliente malicioso podría escribir campos arbitrarios.

### 5.3 Datos sensibles
- El Diario Financiero es el dato más sensible de la app (contenido emocional). Evaluar cifrado adicional a nivel de campo si se requiere cumplimiento normativo (ver también Documento Maestro, sección 13, arquitectura de seguridad).
- `firebaseConfig` en `src/firebase.js` es información pública (no secreta) — no requiere variables de entorno por seguridad, pero sí es buena práctica moverla a `.env` para facilitar múltiples entornos (dev/staging/prod con distintos proyectos de Firebase).

---

## 6. Inventario de pantallas y componentes

| Pantalla | Componente | Datos que consume | Escribe en |
|---|---|---|---|
| Bienvenida | `Welcome` | — | — |
| Espera | `WaitScreen` | — | — |
| Intro inventario | `InventoryIntro` | — | — |
| Captura de deudas | `DebtCapture` | estado local temporal | `debts` (al terminar, en batch) |
| Pausa | `PausedScreen` | estado local temporal | — |
| Revelación | `RealityReveal` | estado local temporal | — |
| Panel de Verdad | `TruthPanel` | `debts`, `streak` | — |
| Radar de Deudas | `DebtRadar` + `DebtRow` | `debts` | `debts` (abonos) |
| Conversaciones | `ConversationsScreen` + `ConversationCard` | `debts` (filtro `person`) | `debts.talked` |
| Propósito | `PurposeScreen` + `GoalCard` + `AddGoalForm` | `goals` | `goals` |
| Salud Financiera | `HealthScoreScreen` + `ScoreRing` + `FactorBar` | `debts`, `streak` (cálculo derivado, no persistido) | — |
| Pareja | `PartnerScreen` + subcomponentes | `users/{uid}.partner` | `users/{uid}.partner` |
| Diario | `DiaryScreen` | `diaryEntries` | `diaryEntries` |
| Revisión semanal | `WeeklyReview` | `users/{uid}.reviewCompletedThisWeek` | `users/{uid}.streak`, `.reviewCompletedThisWeek` |
| Cuenta | `AccountScreen` | `currentUser` (Firebase Auth) | — (logout) |

---

## 7. Gestión de estado

Patrón usado: **hooks personalizados sobre Firestore + `onSnapshot`**, sin librería de estado global (Redux, Zustand, etc.). Para el tamaño actual de la app esto es apropiado y recomendable mantenerlo así — introducir una librería de estado global antes de necesitarla sería complejidad prematura.

- `useAuth()` — sesión del usuario (`context/AuthContext.jsx`).
- `useUserCollection(nombre)` — CRUD + listener en tiempo real para cualquier subcolección (`debts`, `goals`, `diaryEntries`). Reutilizable para futuras subcolecciones sin escribir código nuevo.
- `useUserDoc()` — lectura/escritura del documento raíz del usuario (racha, pareja, revisión).

**Recomendación:** si se agrega una subcolección nueva (ej. "conversaciones" como colección independiente en vez de un flag dentro de `debts`), usar `useUserCollection` tal cual — ya está diseñado para eso.

---

## 8. Sistema de diseño (para desarrollo)

Paleta completa (actualmente duplicada en cada archivo de pantalla — debe centralizarse en `src/theme/palette.js` como parte de la refactorización de la sección 3.2):

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

Tipografía: `"Source Serif 4"` (headlines narrativos), `"Inter"` (UI), `"IBM Plex Mono"` (cifras monetarias). **Pendiente:** estas fuentes no están cargadas vía `@font-face` ni Google Fonts en el proyecto actual — el navegador cae a la fuente del sistema. Agregar la carga real de fuentes es una tarea pendiente de UI antes de producción.

Reglas de tono que el equipo de diseño/frontend debe preservar (documentadas con más detalle en el Documento Maestro, sección 12):
- Nunca rojo-alarma para deuda; el color de "atención" reservado es ámbar, y solo para logros.
- Ninguna racha se rompe con un solo día perdido.
- Ninguna celebración debe sentirse "gamificada" de más — animaciones mínimas.

---

## 9. Funcionalidades pendientes de backend real

Esto es lo que hoy es **UI funcional con datos mockeados o incompletos**, no listo para producción:

1. **Modo Compartido con pareja** — no hay invitación real (correo enviado, aceptación desde la cuenta del otro usuario, sincronización de datos entre dos cuentas). Requiere: Cloud Function que envíe el correo de invitación, una colección `invitations` separada, y lógica de lectura cruzada con reglas de Firestore ajustadas (hoy las reglas son estrictamente "un usuario, sus datos").
2. **Reseteo semanal de la revisión** — `reviewCompletedThisWeek` nunca vuelve a `false` automáticamente. Requiere una Cloud Function programada (Cloud Scheduler + Cloud Functions) que resetee el campo cada lunes, o recalcular en el cliente comparando `updatedAt` contra la fecha actual.
3. **Notificaciones** — todo el sistema de "recordatorio semanal" descrito en el Documento Maestro (sección 11) no está implementado. Requiere Firebase Cloud Messaging + Cloud Functions.
4. **Envío real de plantillas de conversación** — hoy solo copian al portapapeles (intencional, ver Documento Maestro, sección 24 — "nunca automatiza el envío"). Si se agrega envío por WhatsApp/SMS, debe seguir siendo una acción explícita del usuario, nunca automática.
5. **Cálculo de Score de Salud Financiera** — actualmente se recalcula en cada render del lado del cliente con una fórmula simple. Antes de escalar, considerar mover el cálculo a una Cloud Function que corra periódicamente y guarde el resultado, para poder mostrar tendencia histórica (no solo el número actual).

---

## 10. Testing recomendado

El prototipo no tiene tests. Antes de agregar funcionalidad nueva, priorizar:

1. **Tests unitarios** de la lógica de bola de nieve en `handlePay()` (`AnclaAppFirebase.jsx`) — es la lógica de negocio más delicada del proyecto. **✅ Resuelto (ver changelog):** `handlePay` ahora usa `runTransaction()` — la deuda actual y la siguiente se leen y escriben de forma atómica, eliminando la condición de carrera que existía cuando ambas escrituras eran `await` independientes. Aun así, agregar tests que confirmen el comportamiento bajo abonos concurrentes (con el Firebase Emulator Suite) sigue siendo recomendable.
2. **Tests de reglas de Firestore** con el Firebase Emulator Suite (`firebase emulators:exec`) para validar que un usuario no pueda leer/escribir datos de otro.
3. **Tests de componentes** (React Testing Library) para los flujos críticos: registro, primer inventario, primer abono.

---

## 11. CI/CD y despliegue

Recomendación mínima viable:
- GitHub Actions: lint + build en cada PR.
- Despliegue automático a Firebase Hosting (o Vercel) en merge a `main`, apuntando a un proyecto de Firebase de **staging** separado del de producción (`ancla-app-d4c10` actual podría quedar como producción, crear uno nuevo para staging).
- Antes del primer despliegue público: mover `firebaseConfig` a variables de entorno por ambiente (`.env.staging`, `.env.production`) aunque no sea secreta, para poder apuntar a proyectos distintos sin tocar código.

---

## 12. Rendimiento y escalabilidad

- `onSnapshot` en las tres colecciones (`debts`, `goals`, `diaryEntries`) mantiene listeners activos todo el tiempo que el componente esté montado — correcto para el tamaño actual de datos por usuario (decenas de documentos, no miles). Si algún usuario acumula cientos de entradas de diario, considerar paginación (`limit()` + `startAfter()`).
- No hay memoización (`useMemo`, `React.memo`) en los componentes de lista (`DebtRow`, `GoalCard`, `ConversationCard`) — no es un problema al tamaño actual, pero revisar si el Radar de Deudas llega a tener decenas de ítems simultáneos.

---

## 13. Accesibilidad

Pendiente de auditoría completa. Puntos ya identificados a revisar:
- Los toggles de Modo Compartido (`SharingToggle`) son `<div>` con manejo de click, no inputs `type="checkbox"` reales — un lector de pantalla no anuncia correctamente su estado. Recomendación: usar `<input type="checkbox" role="switch">` con estilos custom, o agregar `aria-checked` y `role="switch"` al elemento actual.
- Contraste de texto: la paleta fue diseñada para cumplir AA en la mayoría de combinaciones, pero no se ha auditado con herramientas automatizadas (axe, Lighthouse).

---

## 14. Roadmap técnico (Nivel 3, ver Documento Maestro sección 17)

Por orden de dependencia técnica, no de prioridad de negocio:
1. Verificación de correo + recuperación de contraseña (requisito base de cualquier auth en producción).
2. ~~Migrar `handlePay` a transacciones de Firestore~~ — **resuelto**, ver changelog.
3. Reseteo semanal automático de revisión (Cloud Function programada).
4. Rediseño del Modo Compartido como relación bidireccional real entre dos cuentas.
5. Integración bancaria opcional (Plaid o equivalente regional) — **mantener entrada manual como alternativa permanente**, no reemplazo (decisión de producto explícita en el Documento Maestro).
6. Coach conversacional con IA para la revisión semanal.

## 17. Changelog

- **v1.1** — `handlePay()` migrado de dos escrituras `await` independientes a una única `runTransaction()` de Firestore. Elimina la condición de carrera descrita en v1.0 cuando dos abonos ocurrían casi simultáneamente (ej. dos pestañas abiertas): antes, el efecto de bola de nieve podía calcularse sobre un saldo ya desactualizado; ahora Firestore garantiza que la lectura y escritura de la deuda actual y la siguiente ocurran como una sola operación atómica, con reintento automático si algo cambió entre medio.

---

## 15. Deuda técnica conocida (resumen ejecutable)

Lista corta para convertir directamente en tickets:

- [ ] Eliminar carpetas de prototipos antiguos (`onboarding/`, `panel-radar/`, `app-completa/`, `auth/`, `purpose/`, `partner/`, `nivel2-completo/`), dejar solo `firebase-connected/`.
- [ ] Dividir `AnclaAppFirebase.jsx` en componentes por feature (sección 3.2).
- [ ] Centralizar paleta/tipografía en `src/theme/`.
- [ ] Cargar las fuentes reales (Source Serif 4, Inter, IBM Plex Mono) vía `@font-face` o Google Fonts.
- [x] Migrar `handlePay` a `runTransaction()` — resuelto.
- [ ] Implementar reseteo semanal de `reviewCompletedThisWeek`.
- [x] Agregar verificación de correo y recuperación de contraseña — resuelto.
- [ ] Agregar reglas de validación de esquema en `firestore.rules`.
- [ ] Mover `firebaseConfig` a variables de entorno por ambiente.
- [ ] Auditoría de accesibilidad (toggles, contraste).
- [ ] Decidir y ejecutar: ¿TypeScript sí o no, antes de que el codebase crezca más?

---

## 16. Glosario de dominio (para onboarding de nuevos desarrolladores)

Términos del producto que no son autoexplicativos por su nombre técnico:

- **Inventario de Realidad** — el flujo de onboarding donde el usuario registra sus deudas por primera vez.
- **Panel de Verdad** — el home/dashboard principal.
- **Radar de Deudas** — la lista de deudas ordenada con lógica de "bola de nieve" (menor a mayor monto).
- **Bola de nieve** — estrategia de pago: se abona a la deuda más pequeña primero; al liquidarla, ese monto se suma al pago de la siguiente.
- **Hábito ancla** — el único hábito financiero que se le pide al usuario mantener al inicio (revisión semanal), evitando pedir múltiples cambios simultáneos.
- **Modo Sin Juicio** — principio de diseño transversal: ningún elemento visual o de copy debe sentirse punitivo o de alarma.
- **Score de Salud Financiera** — índice propio (no bancario) compuesto por Claridad + Constancia + Progreso.

Para el "por qué" detrás de cada uno de estos términos, ver `DOCUMENTO_MAESTRO.md`.

---

## 11. Actualización — Reglas de Firestore con validación de esquema (resuelto)

**Fecha de esta actualización:** ver historial de commits.

Se reemplazaron las reglas restrictivas-solo-por-dueño por reglas que también validan forma y tipo de dato en cada colección (`firestore.rules`):

- `users/{uid}`: valida claves permitidas (`hasOnly`), tipos de `name`/`email`/`createdAt`, y valida la forma completa del mapa `partner` (incluyendo el enum de `status` y los 4 booleanos de `sharing`).
- `debts/{debtId}`: valida `name` (string, 1–199 chars), `original`/`remaining` (number ≥ 0), `person` (bool), `talked` (bool opcional).
- `goals/{goalId}`: valida `person` (string requerido), `why` (string opcional), `target`/`saved` (number ≥ 0).
- `diaryEntries/{entryId}`: valida `mood` contra el enum real (`verguenza`, `miedo`, `alivio`, `orgullo`) y `text` opcional con límite de tamaño.

Esto cierra el hueco de seguridad descrito en la sección 5.2: un cliente malicioso (o un bug) ya no puede escribir campos arbitrarios en ningún documento — solo puede escribir exactamente la forma que la UI real produce.

**Cómo desplegar:** `firebase deploy --only firestore:rules` desde la raíz del proyecto (requiere Firebase CLI autenticado y `firebase.json` apuntando a este archivo).

**Pendiente de verificar:** correr el Firebase Emulator Suite con casos de prueba (escritura con campo extra, tipo incorrecto, mood fuera del enum) antes de desplegar a producción — no hay tests automatizados de reglas todavía.

---

## 12. Actualización — Lote de mejoras de producto (registro, deudas, propósito, diario, ingresos, navegación)

Cambios en `src/screens/firebase-connected/AnclaAppFirebase.jsx`:

- **Login**: agregada la descripción de la app (frase ANCLA — Acepta, Nombra, Comprende, Libérate, Avanza).
- **Deudas**: se puede registrar una deuda nueva en cualquier momento desde el Radar (no solo en el onboarding) — pensado para el usuario que al principio evita registrar por vergüenza/miedo y después está listo. Las deudas liquidadas se pueden borrar del historial. Cada abono ahora se guarda en un campo `payments` (array de `{ amount, date }`) dentro del documento de la deuda, y se muestra dentro de la misma tarjeta junto con el % pagado.
- **Propósito**: cada meta tiene ahora `targetDate` opcional (fecha objetivo) y se puede editar o borrar desde su propia tarjeta.
- **Diario Financiero**: cada entrada muestra su fecha (`createdAt`).
- **Ingresos**: nuevo campo `income: { amount, frequency }` en `users/{uid}` (frequency: `semanal | quincenal | mensual`), capturable desde Cuenta. El "Disponible esta semana" del Panel de Verdad ya no es un número fijo (`1450`) — se calcula como ingreso normalizado a semana menos abonos a deuda hechos esta semana (lunes a domingo). Si el usuario no ha capturado ingreso, el panel invita a hacerlo en vez de mostrar un dato falso.
- **Cuenta**: nuevo toggle "Recordatorio diario" (`dailyReminderEnabled`, boolean) — **guarda la preferencia únicamente**; el envío real de la notificación no está implementado (requiere Firebase Cloud Messaging + Cloud Functions, fuera de alcance de este cambio).
- **Navegación**: la barra inferior se redujo a 7 íconos centrados (Inicio, Deudas, Propósito, Diario, Revisión, Cuenta, Más). Salud, Conversaciones, Pareja y la nueva sección "Acerca de" viven dentro del menú "Más".
- **Pareja**: por decisión de producto, el Modo Compartido queda como pantalla de "Próximamente en Ancla Plus" (`PartnerLockedScreen`) en vez de la función completa — el código de `PartnerScreen` original se conserva sin usar, por si se reactiva al lanzar la capa de pago.
- **Acerca de**: nueva sección con perfil de Carlos Sandoval, cita, referencia al libro y footer (Proyecto / Versión / Año + firma).

**Reglas de Firestore actualizadas** (`firestore.rules`) para validar los campos nuevos: `income` y `dailyReminderEnabled` en `users/{uid}`; `payments` en `debts`; `targetDate` en `goals`.

**Pendiente conocido, no resuelto en este lote:** la ruptura de racha tras dos revisiones semanales seguidas sin completar (`streak`) sigue sin implementarse — ver sección 11, nota de la Cloud Function `resetWeeklyReview`.

---

## 13. Actualización — Conversaciones bloqueada, disponible semanal incluye metas, nueva sección de tickets

- **Conversaciones pendientes** se movió a pantalla "Disponible en Ancla Plus" (`ConversationsLockedScreen`), igual que Pareja. El código de `ConversationsScreen`/`ConversationCard`/`buildTemplate` se conserva sin usar por si se reactiva con la capa de pago.
- **"Disponible esta semana"** ahora también resta los aportes a metas de Propósito, no solo los abonos a deuda (decisión de producto confirmada). Cada aporte se guarda en `contributions` (array de `{ amount, date }`) dentro del documento de la meta, igual que `payments` en deudas. `firestore.rules` actualizado para permitir y acotar este campo.
- **Nueva sección "Analiza mi ticket de compra"**: agregada al menú "Más" como pantalla "Disponible en Ancla Plus" (`TicketAnalysisLockedScreen`). Descripción: el usuario podrá subir la foto de un ticket de compra y recibir un análisis de si cada renglón fue una compra básica, requerida, compulsiva o innecesaria.
  **Nota técnica importante, no resuelta todavía:** esta pantalla hoy es solo el teaser/bloqueo — no hay integración real de análisis de imagen. El usuario mencionó GROK (xAI) como el modelo previsto para ese análisis; construir esa integración real (subida de imagen, llamada al proveedor elegido, parseo de la respuesta a básica/requerida/compulsiva/innecesaria) es trabajo aparte, pendiente de decisión técnica (qué proveedor, dónde vive la llamada — probablemente una Cloud Function para no exponer la API key en el cliente).
