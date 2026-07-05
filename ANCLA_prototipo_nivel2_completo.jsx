import React, { useState, createContext, useContext } from "react";
import {
  Moon,
  Sun,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Pause,
  Coffee,
  Check,
  Flame,
  PiggyBank,
  Calendar,
  Sparkles,
  Home,
  BookOpen,
  Compass,
  User,
  LogOut,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Heart,
  Plus,
  Users,
  Clock,
  ShieldCheck,
  Activity,
  MessageCircle,
  Copy,
  CheckCircle2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// ANCLA — Score de Salud Financiera + Conversaciones Pendientes
// (cierre del Nivel 2 del roadmap)
//
// Score de Salud Financiera [EXTENSIÓN del Documento Maestro, sección 10.3]:
// NO es un score de crédito bancario. Es un índice propio de 3 factores con
// igual peso — Claridad, Constancia, Progreso — deliberadamente diseñado
// para NO castigar a alguien solo por tener mucha deuda.
//
// Conversaciones Pendientes [respaldo: Principio 6]: checklist privado de
// personas a quienes se les debe dinero, con plantillas de mensaje honesto.
// Nunca se envía nada automáticamente — solo ayuda a prepararlo.
// ---------------------------------------------------------------------------

const palette = {
  ink: "#14171F",
  inkSoft: "#1E2330",
  inkLine: "#2A2F3D",
  paper: "#F5F1E7",
  paperCard: "#FFFFFF",
  paperDim: "#E4DCC8",
  paperLine: "#D8CFB8",
  pine: "#2F6F63",
  pineDeep: "#234F46",
  pineSoft: "#E4EEEC",
  dawn: "#C9973F",
  dawnSoft: "#E6C889",
  ash: "#8A8F9C",
  ashPaper: "#6B6F5F",
  inkText: "#EDEBE4",
  paperText: "#22261F",
  errorText: "#B0524A",
};

const serif = { fontFamily: '"Source Serif 4", Georgia, serif' };
const sans = { fontFamily: '"Inter", system-ui, sans-serif' };
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };

const initialDebts = [
  { id: 1, name: "Préstamo de mi hermano", original: 3200, remaining: 900, person: true, talked: false },
  { id: 2, name: "Tarjeta Azul", original: 15400, remaining: 11800, person: false, talked: false },
  { id: 3, name: "Tarjeta Platino", original: 28500, remaining: 24200, person: false, talked: false },
  { id: 4, name: "Préstamo personal banco", original: 62000, remaining: 58000, person: false, talked: false },
];

const moods = [
  { key: "verguenza", label: "Vergüenza", color: "#9E6B6B" },
  { key: "miedo", label: "Miedo", color: "#7C7FA6" },
  { key: "alivio", label: "Alivio", color: "#5E9C8B" },
  { key: "orgullo", label: "Orgullo tranquilo", color: "#C9973F" },
];

const goalColors = ["#2F6F63", "#C9973F", "#7C7FA6", "#9E6B6B", "#5E9C8B"];
const seedGoals = [{ id: 1, person: "Mis hijos", why: "Que me vean levantarme, no solo caer.", target: 20000, saved: 6500 }];
const initialSharing = { debts: false, purpose: false, panel: false, diary: false };

// =============================================================================
// AUTENTICACIÓN (mock)
// =============================================================================
const AuthContext = createContext(null);
function useAuth() { return useContext(AuthContext); }
const seedUsers = [{ email: "demo@ancla.app", password: "ancla123", name: "Carlos" }];

function AuthProvider({ children }) {
  const [users, setUsers] = useState(seedUsers);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const login = (email, password) => {
    setAuthError("");
    const found = users.find((u) => u.email === email.trim().toLowerCase());
    if (!found) return setAuthError("No encontramos una cuenta con ese correo."), false;
    if (found.password !== password) return setAuthError("La contraseña no coincide."), false;
    setCurrentUser({ email: found.email, name: found.name });
    return true;
  };
  const signup = (name, email, password) => {
    setAuthError("");
    const cleanEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === cleanEmail)) return setAuthError("Ya existe una cuenta con ese correo."), false;
    if (password.length < 6) return setAuthError("La contraseña necesita al menos 6 caracteres."), false;
    const newUser = { email: cleanEmail, password, name: name.trim() || "Tú" };
    setUsers([...users, newUser]);
    setCurrentUser({ email: newUser.email, name: newUser.name });
    return true;
  };
  const logout = () => setCurrentUser(null);
  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Piezas reutilizables ----------------------------------------------------
function GhostButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} className="px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80 flex items-center gap-2 justify-center"
      style={{ ...sans, border: `1px solid ${palette.paperLine}`, color: palette.paperText, background: "transparent", ...style }}>
      {children}
    </button>
  );
}
function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled} className="px-5 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
      style={{ ...sans, background: disabled ? palette.ash : palette.pine, color: "#FFFFFF", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer", ...style }}>
      {children}
    </button>
  );
}
function ProgressArc({ pct }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: palette.paperDim }}>
      <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${palette.pine}, ${palette.dawn})` }} />
    </div>
  );
}
function PaperCard({ children }) {
  return (
    <div className="rounded-2xl p-6 relative" style={{ background: palette.paper, border: `1px solid ${palette.paperLine}`, boxShadow: "0 20px 40px -20px rgba(20,23,31,0.35)" }}>
      <div className="absolute -top-1 left-4 right-4 h-2 opacity-60" style={{ background: `repeating-linear-gradient(110deg, ${palette.paper} 0 6px, transparent 6px 9px)` }} />
      {children}
    </div>
  );
}
function TextField({ icon: Icon, type = "text", value, onChange, placeholder, onKeyDown, dark }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4" style={{ background: dark ? palette.inkSoft : "#FFFFFF", border: `1px solid ${dark ? palette.inkLine : palette.paperLine}` }}>
      <Icon size={16} color={palette.ash} />
      <input value={value} onChange={onChange} onKeyDown={onKeyDown} type={isPassword && show ? "text" : type} placeholder={placeholder}
        className="flex-1 outline-none bg-transparent text-sm" style={{ ...sans, color: dark ? palette.inkText : palette.paperText }} />
      {isPassword && <button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={16} color={palette.ash} /> : <Eye size={16} color={palette.ash} />}</button>}
    </div>
  );
}
function SharedBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4" style={{ background: palette.pineSoft }}>
      <Users size={11} color={palette.pineDeep} />
      <span className="text-[10px]" style={{ ...sans, color: palette.pineDeep }}>Compartido</span>
    </div>
  );
}

// =============================================================================
// AUTENTICACIÓN — pantallas
// =============================================================================
function LoginScreen({ onGoSignup }) {
  const { login, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = () => { if (!email || !password) return setAuthError("Completa correo y contraseña."); login(email, password); };
  return (
    <div className="min-h-full flex flex-col justify-center p-8" style={{ background: palette.ink }}>
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 mb-8">
          <Moon size={16} color={palette.ash} />
          <span className="text-xs tracking-widest uppercase" style={{ ...sans, color: palette.ash }}>Ancla</span>
        </div>
        <p className="text-xs tracking-widest uppercase mb-3" style={{ ...sans, color: palette.dawnSoft }}>Bienvenido de vuelta</p>
        <h1 className="text-2xl mb-8" style={{ ...serif, color: palette.inkText }}>Tu información es solo tuya.</h1>
        <TextField icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" dark />
        <TextField icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" dark onKeyDown={(e) => e.key === "Enter" && submit()} />
        {authError && <p className="text-xs mb-4" style={{ ...sans, color: "#E39289" }}>{authError}</p>}
        <PrimaryButton onClick={submit} style={{ width: "100%", marginBottom: 16 }}>Iniciar sesión <ArrowRight size={16} /></PrimaryButton>
        <p className="text-xs text-center mb-2" style={{ ...sans, color: palette.ash }}>Cuenta de prueba: demo@ancla.app / ancla123</p>
        <div className="flex items-center justify-center gap-1 mt-4">
          <span className="text-sm" style={{ ...sans, color: palette.ash }}>¿Aún no tienes cuenta?</span>
          <button onClick={onGoSignup} className="text-sm underline" style={{ ...sans, color: palette.dawnSoft }}>Crear una</button>
        </div>
      </div>
    </div>
  );
}
function SignupScreen({ onGoLogin }) {
  const { signup, authError, setAuthError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = () => { if (!name || !email || !password) return setAuthError("Completa todos los campos."); signup(name, email, password); };
  return (
    <div className="min-h-full flex flex-col justify-center p-8" style={{ background: palette.ink }}>
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 mb-8">
          <Moon size={16} color={palette.ash} />
          <span className="text-xs tracking-widest uppercase" style={{ ...sans, color: palette.ash }}>Ancla</span>
        </div>
        <p className="text-xs tracking-widest uppercase mb-3" style={{ ...sans, color: palette.dawnSoft }}>Crear cuenta</p>
        <h1 className="text-2xl mb-2" style={{ ...serif, color: palette.inkText }}>Esto es solo tuyo.</h1>
        <p className="text-sm leading-relaxed mb-8" style={{ ...sans, color: palette.ash }}>Nadie más ve lo que registres aquí.</p>
        <TextField icon={User} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" dark />
        <TextField icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" dark />
        <TextField icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña (mínimo 6 caracteres)" dark onKeyDown={(e) => e.key === "Enter" && submit()} />
        {authError && <p className="text-xs mb-4" style={{ ...sans, color: "#E39289" }}>{authError}</p>}
        <PrimaryButton onClick={submit} style={{ width: "100%", marginBottom: 16 }}>Crear mi cuenta <ArrowRight size={16} /></PrimaryButton>
        <div className="flex items-center justify-center gap-1 mt-4">
          <span className="text-sm" style={{ ...sans, color: palette.ash }}>¿Ya tienes cuenta?</span>
          <button onClick={onGoLogin} className="text-sm underline" style={{ ...sans, color: palette.dawnSoft }}>Inicia sesión</button>
        </div>
      </div>
    </div>
  );
}
function AuthGate({ children }) {
  const { currentUser } = useAuth();
  const [mode, setMode] = useState("login");
  if (currentUser) return children;
  return (
    <div className="w-full mx-auto rounded-3xl overflow-hidden" style={{ maxWidth: 420, minHeight: 720, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)" }}>
      {mode === "login" ? <LoginScreen onGoSignup={() => setMode("signup")} /> : <SignupScreen onGoLogin={() => setMode("login")} />}
    </div>
  );
}

// =============================================================================
// ONBOARDING
// =============================================================================
function WaitScreen({ onBack }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: palette.ink }}>
      <Coffee size={28} color={palette.dawnSoft} className="mb-6" />
      <h2 className="text-xl mb-3 max-w-xs" style={{ ...serif, color: palette.inkText }}>Está bien. No hay prisa.</h2>
      <GhostButton onClick={onBack} style={{ color: palette.inkText, borderColor: palette.ash }}>Volver</GhostButton>
    </div>
  );
}
function InventoryIntro({ onStart, name }) {
  return (
    <div className="min-h-full flex flex-col justify-center p-6" style={{ background: palette.ink }}>
      <div className="max-w-md mx-auto w-full">
        <PaperCard>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ ...sans, color: palette.pine }}>Inventario de Realidad</p>
          <h2 className="text-2xl mb-4" style={{ ...serif, color: palette.paperText }}>{name}, esto es lo que es verdad hoy.</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ ...sans, color: "#4B4F42" }}>Escribamos, una cosa a la vez, cada deuda con su nombre y su monto exacto.</p>
          <PrimaryButton onClick={onStart} style={{ width: "100%" }}>Empezar <ArrowRight size={16} /></PrimaryButton>
        </PaperCard>
      </div>
    </div>
  );
}
function Welcome({ onReady, onWait, name }) {
  return (
    <div className="min-h-full flex flex-col justify-between p-8" style={{ background: palette.ink }}>
      <div className="flex items-center gap-2 pt-2">
        <Moon size={16} color={palette.ash} />
        <span className="text-xs tracking-widest uppercase" style={{ ...sans, color: palette.ash }}>Ancla</span>
      </div>
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto text-center">
        <p className="text-xs tracking-widest uppercase mb-6" style={{ ...sans, color: palette.dawnSoft }}>Antes de empezar</p>
        <h1 className="text-3xl leading-snug mb-6" style={{ ...serif, color: palette.inkText }}>Hola, {name}.</h1>
        <p className="text-base leading-relaxed mb-2" style={{ ...sans, color: "#C7CAD4" }}>No vamos a pedirte que arregles nada todavía.</p>
        <p className="text-sm leading-relaxed" style={{ ...sans, color: palette.ash }}>Esto toma diez minutos.</p>
      </div>
      <div className="max-w-md mx-auto w-full flex flex-col gap-3 pb-4">
        <PrimaryButton onClick={onReady}>Estoy listo para mirar <ArrowRight size={16} /></PrimaryButton>
        <GhostButton onClick={onWait} style={{ color: palette.inkText, borderColor: palette.ash }}>Necesito un momento</GhostButton>
      </div>
    </div>
  );
}
function DebtCapture({ debts, setDebts, onDone, onPauseForToday }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState("who");
  const total = debts.reduce((s, d) => s + d.remaining, 0);
  const addDebt = () => {
    if (!name || !amount) return;
    const val = parseFloat(amount) || 0;
    setDebts([...debts, { id: Date.now(), name, original: val, remaining: val, person: true, talked: false }]);
    setName(""); setAmount(""); setStage("who");
  };
  const removeDebt = (id) => setDebts(debts.filter((d) => d.id !== id));
  return (
    <div className="min-h-full flex flex-col p-6" style={{ background: palette.ink }}>
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="mb-6">
          <ProgressArc pct={Math.min(85, 20 + debts.length * 12)} />
          <p className="text-xs mt-2" style={{ ...sans, color: palette.ash }}>{debts.length === 0 ? "Empecemos por lo primero que te venga a la mente." : `${debts.length} registrados.`}</p>
        </div>
        <PaperCard>
          {stage === "who" && (
            <>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ ...sans, color: palette.pine }}>Pregunta {debts.length + 1}</p>
              <h3 className="text-xl mb-5" style={{ ...serif, color: palette.paperText }}>¿A quién le debes?</h3>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tarjeta BBVA, mi hermano..."
                className="w-full px-4 py-3 rounded-lg text-sm mb-5 outline-none" style={{ ...sans, background: "#FFFFFF", border: `1px solid ${palette.paperLine}`, color: palette.paperText }}
                onKeyDown={(e) => e.key === "Enter" && name && setStage("amount")} />
              <PrimaryButton onClick={() => name && setStage("amount")} disabled={!name} style={{ width: "100%" }}>Siguiente <ArrowRight size={16} /></PrimaryButton>
            </>
          )}
          {stage === "amount" && (
            <>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ ...sans, color: palette.pine }}>{name}</p>
              <h3 className="text-xl mb-2" style={{ ...serif, color: palette.paperText }}>¿Cuánto exactamente?</h3>
              <div className="flex items-center gap-2 mb-5">
                <span style={{ ...mono, color: palette.paperText }} className="text-lg">$</span>
                <input autoFocus type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg text-lg outline-none" style={{ ...mono, background: "#FFFFFF", border: `1px solid ${palette.paperLine}`, color: palette.paperText }}
                  onKeyDown={(e) => e.key === "Enter" && amount && addDebt()} />
              </div>
              <div className="flex gap-3">
                <GhostButton onClick={() => setStage("who")} style={{ color: palette.paperText, borderColor: palette.paperLine }}><ArrowLeft size={14} /> Atrás</GhostButton>
                <PrimaryButton onClick={addDebt} disabled={!amount} style={{ flex: 1 }}>Guardar <Check size={16} /></PrimaryButton>
              </div>
            </>
          )}
        </PaperCard>
        {debts.length > 0 && (
          <div className="mt-4 space-y-2">
            {debts.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg" style={{ background: palette.inkSoft, border: `1px solid ${palette.inkLine}` }}>
                <span className="text-sm" style={{ ...sans, color: palette.inkText }}>{d.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ ...mono, color: palette.dawnSoft }}>${d.remaining.toLocaleString()}</span>
                  <button onClick={() => removeDebt(d.id)}><Trash2 size={14} color={palette.ash} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <GhostButton onClick={onPauseForToday} style={{ flex: 1, color: palette.inkText, borderColor: palette.ash }}><Pause size={14} /> Ya terminé por hoy</GhostButton>
          {debts.length > 0 && <PrimaryButton onClick={onDone} style={{ flex: 1 }}>Terminar <ArrowRight size={16} /></PrimaryButton>}
        </div>
      </div>
    </div>
  );
}
function PausedScreen({ debts, onResume }) {
  const total = debts.reduce((s, d) => s + d.remaining, 0);
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: palette.ink }}>
      <Moon size={26} color={palette.dawnSoft} className="mb-6" />
      <h2 className="text-xl mb-3 max-w-xs" style={{ ...serif, color: palette.inkText }}>Guardado. Nada se pierde.</h2>
      <p className="text-sm max-w-xs leading-relaxed mb-2" style={{ ...sans, color: palette.ash }}>Llevas {debts.length} registros por ${total.toLocaleString()}.</p>
      <PrimaryButton onClick={onResume}>Continuar ahora <ArrowRight size={16} /></PrimaryButton>
    </div>
  );
}
function RealityReveal({ debts, onContinue }) {
  const total = debts.reduce((s, d) => s + d.remaining, 0);
  return (
    <div className="min-h-full flex flex-col justify-center p-6" style={{ background: palette.ink }}>
      <div className="max-w-md mx-auto w-full text-center">
        <p className="text-xs tracking-widest uppercase mb-6" style={{ ...sans, color: palette.dawnSoft }}>Esto es lo que hay</p>
        <div className="rounded-2xl px-8 py-10 mb-6" style={{ background: palette.inkSoft, border: `1px solid ${palette.inkLine}` }}>
          <p className="text-xs mb-3" style={{ ...sans, color: palette.ash }}>Total de tu inventario</p>
          <p className="text-4xl mb-1" style={{ ...mono, color: palette.inkText }}>${total.toLocaleString()}</p>
          <p className="text-xs" style={{ ...sans, color: palette.ash }}>{debts.length} deudas registradas</p>
        </div>
        <p className="text-base leading-relaxed mb-8" style={{ ...serif, color: palette.inkText }}>"Y estoy dispuesto a mirarlo de frente."</p>
        <PrimaryButton onClick={onContinue} style={{ width: "100%" }}>Entrar a Ancla <ArrowRight size={16} /></PrimaryButton>
      </div>
    </div>
  );
}

// =============================================================================
// PANEL / RADAR / DIARIO / REVISIÓN / CUENTA / PROPÓSITO / PAREJA
// =============================================================================
function TruthPanel({ debts, streak, onGoRadar, name, shared }) {
  const total = debts.reduce((s, d) => s + d.remaining, 0);
  const weeklyAvailable = 1450;
  const smallest = debts.filter((d) => d.remaining > 0).sort((a, b) => a.remaining - b.remaining)[0];
  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Panel de Verdad</p>
      <h2 className="text-2xl mb-2" style={{ ...serif, color: palette.paperText }}>Hoy, {name}, esto es lo que importa.</h2>
      {shared && <SharedBadge />}
      <div className="grid grid-cols-1 gap-3 mb-5">
        <div className="rounded-xl p-5" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
          <p className="text-xs mb-1" style={{ ...sans, color: palette.ashPaper }}>Esto debes hoy</p>
          <p className="text-2xl" style={{ ...mono, color: palette.paperText }}>${total.toLocaleString()}</p>
        </div>
        <div className="rounded-xl p-5" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
          <p className="text-xs mb-1" style={{ ...sans, color: palette.ashPaper }}>Disponible esta semana</p>
          <p className="text-2xl" style={{ ...mono, color: palette.paperText }}>${weeklyAvailable.toLocaleString()}</p>
        </div>
        <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: palette.pine }}>
          <div>
            <p className="text-xs mb-1" style={{ ...sans, color: "#DCEAE6" }}>Racha de honestidad</p>
            <p className="text-2xl" style={{ ...mono, color: "#FFFFFF" }}>Día {streak}</p>
          </div>
          <Flame size={30} color={palette.dawn} />
        </div>
      </div>
      <button onClick={onGoRadar} className="w-full rounded-xl p-5 mb-2 text-left flex items-center justify-between transition-all duration-200 hover:opacity-90" style={{ background: palette.ink }}>
        <div>
          <p className="text-xs mb-1" style={{ ...sans, color: palette.ash }}>Tu primera batalla</p>
          <p className="text-lg" style={{ ...serif, color: palette.inkText }}>{smallest ? smallest.name : "Ya liquidaste todo"}</p>
          {smallest && <p className="text-sm mt-1" style={{ ...mono, color: palette.dawnSoft }}>${smallest.remaining.toLocaleString()} restantes</p>}
        </div>
        <PiggyBank size={22} color={palette.dawnSoft} />
      </button>
    </div>
  );
}
function CelebrationModal({ debtName, onClose }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 z-50" style={{ background: "rgba(20,23,31,0.7)" }}>
      <div className="rounded-2xl p-8 max-w-xs w-full text-center" style={{ background: palette.paper, border: `1px solid ${palette.paperLine}` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: palette.pineSoft }}>
          <Check size={26} color={palette.pine} />
        </div>
        <p className="text-xs tracking-widest uppercase mb-2" style={{ ...sans, color: palette.pine }}>Liquidada</p>
        <h3 className="text-lg mb-3" style={{ ...serif, color: palette.paperText }}>{debtName}</h3>
        <PrimaryButton onClick={onClose} style={{ width: "100%" }}>Seguir <ArrowRight size={16} /></PrimaryButton>
      </div>
    </div>
  );
}
function DebtRow({ debt, isTarget, onPay }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const pct = Math.max(0, Math.min(100, ((debt.original - debt.remaining) / debt.original) * 100));
  const liquidated = debt.remaining <= 0;
  return (
    <div className="rounded-xl p-4 mb-3" style={{ background: palette.paperCard, border: `1px solid ${isTarget ? palette.pine : palette.paperLine}`, borderWidth: isTarget ? 2 : 1 }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          {isTarget && !liquidated && <p className="text-xs mb-1 flex items-center gap-1" style={{ ...sans, color: palette.pine }}><Sparkles size={12} /> Foco actual</p>}
          <p className="text-sm" style={{ ...sans, color: palette.paperText }}>{debt.name}</p>
        </div>
        {liquidated ? (
          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ background: palette.pineSoft, color: palette.pineDeep, ...sans }}><Check size={12} /> Liquidada</span>
        ) : (
          <span className="text-sm" style={{ ...mono, color: palette.paperText }}>${debt.remaining.toLocaleString()}</span>
        )}
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: palette.paperDim }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: liquidated ? palette.pine : `linear-gradient(90deg, ${palette.pineDeep}, ${palette.pine})` }} />
      </div>
      {!liquidated && (
        !open ? (
          <button onClick={() => setOpen(true)} className="text-xs px-3 py-2 rounded-lg" style={{ ...sans, color: palette.pine, border: `1px solid ${palette.pine}` }}>Abonar</button>
        ) : (
          <div className="flex items-center gap-2">
            <span style={{ ...mono, color: palette.paperText }} className="text-sm">$</span>
            <input autoFocus type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ ...mono, background: palette.paper, border: `1px solid ${palette.paperLine}`, color: palette.paperText }} />
            <button onClick={() => { const val = parseFloat(amount) || 0; if (val > 0) onPay(debt.id, val); setAmount(""); setOpen(false); }}
              className="text-xs px-3 py-2.5 rounded-lg" style={{ ...sans, background: palette.pine, color: "#fff" }}>Guardar</button>
          </div>
        )
      )}
    </div>
  );
}
function DebtRadar({ debts, onPay, shared }) {
  const active = [...debts].filter((d) => d.remaining > 0).sort((a, b) => a.remaining - b.remaining);
  const done = debts.filter((d) => d.remaining <= 0);
  const targetId = active[0]?.id;
  const totalRemaining = debts.reduce((s, d) => s + d.remaining, 0);
  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1" style={{ ...sans, color: palette.pine }}>Radar de Deudas</p>
      <h2 className="text-2xl mb-2" style={{ ...serif, color: palette.paperText }}>De la más pequeña a la más grande.</h2>
      {shared && <SharedBadge />}
      <div className="rounded-xl p-4 mb-5 flex items-center justify-between" style={{ background: palette.ink }}>
        <span className="text-xs" style={{ ...sans, color: palette.ash }}>Total restante</span>
        <span className="text-lg" style={{ ...mono, color: palette.inkText }}>${totalRemaining.toLocaleString()}</span>
      </div>
      {active.map((d) => <DebtRow key={d.id} debt={d} isTarget={d.id === targetId} onPay={onPay} />)}
      {done.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-widest mt-6 mb-3" style={{ ...sans, color: palette.ashPaper }}>Ya liquidadas</p>
          {done.map((d) => <DebtRow key={d.id} debt={d} isTarget={false} onPay={onPay} />)}
        </>
      )}
    </div>
  );
}
function DiaryScreen({ entries, onAddEntry }) {
  const [mood, setMood] = useState(null);
  const [text, setText] = useState("");
  const save = () => { if (!mood) return; onAddEntry({ id: Date.now(), mood, text, date: "Hoy" }); setMood(null); setText(""); };
  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Diario Financiero</p>
      <h2 className="text-2xl mb-5" style={{ ...serif, color: palette.paperText }}>¿Cómo te sentiste con el dinero esta semana?</h2>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {moods.map((m) => (
          <button key={m.key} onClick={() => setMood(m.key)} className="rounded-xl p-4 text-sm transition-all duration-200"
            style={{ ...sans, background: mood === m.key ? m.color : palette.paperCard, color: mood === m.key ? "#FFFFFF" : palette.paperText, border: `1px solid ${mood === m.key ? m.color : palette.paperLine}` }}>
            {m.label}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Si quieres, cuenta un poco más (opcional)..." rows={3}
        className="w-full px-4 py-3 rounded-lg text-sm mb-4 outline-none resize-none" style={{ ...sans, background: palette.paperCard, border: `1px solid ${palette.paperLine}`, color: palette.paperText }} />
      <PrimaryButton onClick={save} disabled={!mood} style={{ width: "100%" }}>Guardar entrada <Check size={16} /></PrimaryButton>
      {entries.length > 0 && (
        <div className="mt-8">
          {entries.map((e) => {
            const m = moods.find((mm) => mm.key === e.mood);
            return (
              <div key={e.id} className="rounded-xl p-4 mb-2" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
                <span className="text-xs px-2 py-1 rounded-full" style={{ ...sans, background: m.color, color: "#fff" }}>{m.label}</span>
                {e.text && <p className="text-sm mt-2" style={{ ...sans, color: palette.paperText }}>{e.text}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function WeeklyReview({ onComplete, completed }) {
  const questions = ["¿Fui honesto esta semana, incluso cuando era incómodo?", "¿Estuve presente con las personas que más me importan?", "¿Tomé decisiones desde la calma o desde el miedo?"];
  const [answers, setAnswers] = useState([null, null, null]);
  const setAnswer = (i, val) => { const c = [...answers]; c[i] = val; setAnswers(c); };
  const allAnswered = answers.every((a) => a !== null);
  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Revisión semanal</p>
      <h2 className="text-2xl mb-6" style={{ ...serif, color: palette.paperText }}>El ritual de los tres minutos.</h2>
      {completed ? (
        <div className="rounded-xl p-6 text-center" style={{ background: palette.pineSoft }}>
          <Check size={24} color={palette.pine} className="mx-auto mb-3" />
          <p style={{ ...serif, color: palette.pineDeep }}>Ya hiciste tu revisión esta semana.</p>
        </div>
      ) : (
        <>
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl p-5 mb-3" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
              <p className="text-sm mb-3" style={{ ...serif, color: palette.paperText }}>{q}</p>
              <div className="flex gap-2">
                {["Sí", "A veces", "No"].map((opt) => (
                  <button key={opt} onClick={() => setAnswer(i, opt)} className="flex-1 py-2 rounded-lg text-xs transition-all duration-200"
                    style={{ ...sans, background: answers[i] === opt ? palette.pine : "transparent", color: answers[i] === opt ? "#fff" : palette.paperText, border: `1px solid ${answers[i] === opt ? palette.pine : palette.paperLine}` }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <PrimaryButton onClick={onComplete} disabled={!allAnswered} style={{ width: "100%", marginTop: 8 }}>Terminar revisión <ArrowRight size={16} /></PrimaryButton>
        </>
      )}
    </div>
  );
}
function AccountScreen() {
  const { currentUser, logout } = useAuth();
  const initial = currentUser?.name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Cuenta</p>
      <h2 className="text-2xl mb-6" style={{ ...serif, color: palette.paperText }}>Tu espacio, tus datos.</h2>
      <div className="rounded-xl p-5 mb-4 flex items-center gap-4" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: palette.pine }}>
          <span style={{ ...serif, color: "#fff" }} className="text-lg">{initial}</span>
        </div>
        <div>
          <p className="text-sm" style={{ ...sans, color: palette.paperText }}>{currentUser?.name}</p>
          <p className="text-xs" style={{ ...sans, color: palette.ashPaper }}>{currentUser?.email}</p>
        </div>
      </div>
      <GhostButton onClick={logout} style={{ width: "100%", color: palette.errorText, borderColor: palette.errorText }}><LogOut size={14} /> Cerrar sesión</GhostButton>
    </div>
  );
}
function AddGoalForm({ onAdd, onCancel }) {
  const [person, setPerson] = useState("");
  const [why, setWhy] = useState("");
  const [target, setTarget] = useState("");
  const submit = () => { if (!person || !target) return; onAdd({ id: Date.now(), person, why, target: parseFloat(target) || 0, saved: 0 }); };
  return (
    <PaperCard>
      <h3 className="text-lg mb-4" style={{ ...serif, color: palette.paperText }}>¿Para quién es esta meta?</h3>
      <input autoFocus value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Ej: Mis hijos..."
        className="w-full px-4 py-3 rounded-lg text-sm mb-4 outline-none" style={{ ...sans, background: "#FFFFFF", border: `1px solid ${palette.paperLine}`, color: palette.paperText }} />
      <div className="flex items-center gap-2 mb-5">
        <span style={{ ...mono, color: palette.paperText }} className="text-lg">$</span>
        <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Monto meta"
          className="w-full px-4 py-3 rounded-lg text-lg outline-none" style={{ ...mono, background: "#FFFFFF", border: `1px solid ${palette.paperLine}`, color: palette.paperText }} />
      </div>
      <div className="flex gap-3">
        <GhostButton onClick={onCancel} style={{ color: palette.paperText, borderColor: palette.paperLine }}>Cancelar</GhostButton>
        <PrimaryButton onClick={submit} disabled={!person || !target} style={{ flex: 1 }}>Crear meta <Check size={16} /></PrimaryButton>
      </div>
    </PaperCard>
  );
}
function GoalCard({ goal, index, onContribute }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const pct = Math.min(100, (goal.saved / goal.target) * 100);
  const color = goalColors[index % goalColors.length];
  const complete = goal.saved >= goal.target;
  return (
    <div className="rounded-xl p-5 mb-3" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: color }}><Heart size={16} color="#fff" /></div>
        <div className="flex-1">
          <p className="text-base" style={{ ...serif, color: palette.paperText }}>{goal.person}</p>
          {goal.why && <p className="text-xs mt-0.5" style={{ ...sans, color: palette.ashPaper }}>{goal.why}</p>}
        </div>
        {complete && <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ background: palette.pineSoft, color: palette.pineDeep, ...sans }}><Check size={11} /> Lograda</span>}
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: palette.paperDim }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs" style={{ ...mono, color: palette.ashPaper }}>${goal.saved.toLocaleString()} de ${goal.target.toLocaleString()}</span>
        <span className="text-xs" style={{ ...sans, color: palette.ashPaper }}>{pct.toFixed(0)}%</span>
      </div>
      {!complete && (
        !open ? (
          <button onClick={() => setOpen(true)} className="text-xs px-3 py-2 rounded-lg" style={{ ...sans, color: palette.pine, border: `1px solid ${palette.pine}` }}>Aportar</button>
        ) : (
          <div className="flex items-center gap-2">
            <span style={{ ...mono, color: palette.paperText }} className="text-sm">$</span>
            <input autoFocus type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ ...mono, background: palette.paper, border: `1px solid ${palette.paperLine}`, color: palette.paperText }} />
            <button onClick={() => { const val = parseFloat(amount) || 0; if (val > 0) onContribute(goal.id, val); setAmount(""); setOpen(false); }}
              className="text-xs px-3 py-2.5 rounded-lg" style={{ ...sans, background: palette.pine, color: "#fff" }}>Guardar</button>
          </div>
        )
      )}
    </div>
  );
}
function PurposeScreen({ goals, onAddGoal, onContribute, shared }) {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Propósito</p>
      <h2 className="text-2xl mb-2" style={{ ...serif, color: palette.paperText }}>¿Para quién estás haciendo esto?</h2>
      {shared && <SharedBadge />}
      {goals.map((g, i) => <GoalCard key={g.id} goal={g} index={i} onContribute={onContribute} />)}
      {showForm ? (
        <AddGoalForm onAdd={(g) => { onAddGoal(g); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full rounded-xl p-4 flex items-center justify-center gap-2 text-sm transition-all duration-200"
          style={{ ...sans, border: `1px dashed ${palette.paperLine}`, color: palette.pine }}>
          <Plus size={16} /> Agregar una meta con nombre
        </button>
      )}
    </div>
  );
}
function InvitePartner({ onSend }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <PaperCard>
      <h3 className="text-xl mb-2" style={{ ...serif, color: palette.paperText }}>Invita a tu pareja.</h3>
      <p className="text-sm leading-relaxed mb-5" style={{ ...sans, color: "#4B4F42" }}>Tú decides qué compartir y cuándo.</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Su nombre"
        className="w-full px-4 py-3 rounded-lg text-sm mb-3 outline-none" style={{ ...sans, background: "#FFFFFF", border: `1px solid ${palette.paperLine}`, color: palette.paperText }} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Su correo"
        className="w-full px-4 py-3 rounded-lg text-sm mb-5 outline-none" style={{ ...sans, background: "#FFFFFF", border: `1px solid ${palette.paperLine}`, color: palette.paperText }} />
      <PrimaryButton onClick={() => name && email && onSend(name, email)} disabled={!name || !email} style={{ width: "100%" }}>Enviar invitación <ArrowRight size={16} /></PrimaryButton>
    </PaperCard>
  );
}
function PendingInvite({ name, onCancel, onSimulateAccept }) {
  return (
    <PaperCard>
      <h3 className="text-xl mb-2" style={{ ...serif, color: palette.paperText }}>Esperando a {name}.</h3>
      <div className="flex gap-3 mt-4">
        <GhostButton onClick={onCancel} style={{ flex: 1, color: palette.paperText, borderColor: palette.paperLine }}>Cancelar</GhostButton>
        <PrimaryButton onClick={onSimulateAccept} style={{ flex: 1 }}>Simular aceptación</PrimaryButton>
      </div>
    </PaperCard>
  );
}
function SharingToggle({ label, description, checked, onChange }) {
  return (
    <button onClick={onChange} className="w-full rounded-xl p-4 mb-3 text-left flex items-start justify-between gap-3 transition-all duration-200"
      style={{ background: palette.paperCard, border: `1px solid ${checked ? palette.pine : palette.paperLine}`, borderWidth: checked ? 2 : 1 }}>
      <div>
        <p className="text-sm mb-1" style={{ ...sans, color: palette.paperText }}>{label}</p>
        <p className="text-xs leading-relaxed" style={{ ...sans, color: palette.ashPaper }}>{description}</p>
      </div>
      <div className="w-10 h-6 rounded-full flex-shrink-0 relative transition-all duration-200" style={{ background: checked ? palette.pine : palette.paperDim }}>
        <div className="w-4 h-4 rounded-full absolute top-1 transition-all duration-200" style={{ background: "#fff", left: checked ? 20 : 4 }} />
      </div>
    </button>
  );
}
function ConnectedPartner({ partner, sharing, onToggle, onDisconnect }) {
  return (
    <>
      <div className="rounded-xl p-5 mb-5 flex items-center gap-4" style={{ background: palette.pineSoft }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: palette.pine }}>
          <span style={{ ...serif, color: "#fff" }} className="text-base">{partner.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm" style={{ ...sans, color: palette.pineDeep }}>{partner.name}</p>
          <p className="text-xs flex items-center gap-1" style={{ ...sans, color: palette.pineDeep }}><ShieldCheck size={11} /> Conectado</p>
        </div>
      </div>
      <SharingToggle label="Radar de Deudas" description="Ve el total y el progreso." checked={sharing.debts} onChange={() => onToggle("debts")} />
      <SharingToggle label="Propósito" description="Ve las metas con nombre." checked={sharing.purpose} onChange={() => onToggle("purpose")} />
      <SharingToggle label="Panel de Verdad" description="Ve tus números principales." checked={sharing.panel} onChange={() => onToggle("panel")} />
      <SharingToggle label="Diario Financiero" description="Lo más vulnerable — piénsalo bien." checked={sharing.diary} onChange={() => onToggle("diary")} />
      <GhostButton onClick={onDisconnect} style={{ width: "100%", marginTop: 8, color: palette.errorText, borderColor: palette.errorText }}>Dejar de compartir</GhostButton>
    </>
  );
}
function PartnerScreen({ partnerState, setPartnerState }) {
  const { status, name, email, sharing } = partnerState;
  const sendInvite = (n, e) => setPartnerState({ status: "pending", name: n, email: e, sharing: initialSharing });
  const cancelInvite = () => setPartnerState({ status: "none", name: "", email: "", sharing: initialSharing });
  const simulateAccept = () => setPartnerState((p) => ({ ...p, status: "connected" }));
  const toggleShare = (key) => setPartnerState((p) => ({ ...p, sharing: { ...p.sharing, [key]: !p.sharing[key] } }));
  const disconnect = () => setPartnerState({ status: "none", name: "", email: "", sharing: initialSharing });
  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Modo Compartido</p>
      <h2 className="text-2xl mb-5" style={{ ...serif, color: palette.paperText }}>{status === "connected" ? "Enfrentando esto juntos." : "Nadie tiene que cargar esto solo."}</h2>
      {status === "none" && <InvitePartner onSend={sendInvite} />}
      {status === "pending" && <PendingInvite name={name} onCancel={cancelInvite} onSimulateAccept={simulateAccept} />}
      {status === "connected" && <ConnectedPartner partner={{ name, email }} sharing={sharing} onToggle={toggleShare} onDisconnect={disconnect} />}
    </div>
  );
}

// =============================================================================
// NUEVO: SCORE DE SALUD FINANCIERA
// =============================================================================
function ScoreRing({ score, size = 160 }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={palette.paperDim} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={palette.pine}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
      />
      <text x="50%" y="46%" textAnchor="middle" style={{ ...mono, fontSize: 34, fill: palette.paperText }}>{Math.round(score)}</text>
      <text x="50%" y="60%" textAnchor="middle" style={{ ...sans, fontSize: 11, fill: palette.ashPaper }}>de 100</text>
    </svg>
  );
}
function FactorBar({ label, value, description }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm" style={{ ...sans, color: palette.paperText }}>{label}</span>
        <span className="text-sm" style={{ ...mono, color: palette.pine }}>{Math.round(value)}</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden mb-1.5" style={{ background: palette.paperDim }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: palette.pine }} />
      </div>
      <p className="text-xs leading-relaxed" style={{ ...sans, color: palette.ashPaper }}>{description}</p>
    </div>
  );
}
function HealthScoreScreen({ debts, streak }) {
  const totalOriginal = debts.reduce((s, d) => s + d.original, 0) || 1;
  const totalRemaining = debts.reduce((s, d) => s + d.remaining, 0);
  const claridad = debts.length > 0 ? 90 : 30;
  const constancia = Math.min(100, streak * 6);
  const progreso = Math.round(((totalOriginal - totalRemaining) / totalOriginal) * 100);
  const score = Math.round((claridad + constancia + progreso) / 3);
  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Salud Financiera</p>
      <h2 className="text-2xl mb-5" style={{ ...serif, color: palette.paperText }}>Tu score, no el del banco.</h2>
      <div className="rounded-2xl p-6 mb-5 flex flex-col items-center" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
        <ScoreRing score={score} />
        <p className="text-xs text-center mt-3 leading-relaxed" style={{ ...sans, color: palette.ashPaper }}>
          Este número no mide cuánto debes. Mide qué tan claro, constante y en progreso estás.
        </p>
      </div>
      <div className="rounded-xl p-5 mb-3" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
        <FactorBar label="Claridad" value={claridad} description="¿Qué tan actualizado está tu Inventario de Realidad? Ya lo hiciste — eso ya cuenta." />
        <FactorBar label="Constancia" value={constancia} description="Tu racha de revisiones semanales, no de 'cero gastos'." />
        <FactorBar label="Progreso" value={progreso} description="Cuánto de tu deuda original ya liquidaste." />
      </div>
      <div className="rounded-xl p-4" style={{ background: palette.pineSoft }}>
        <p className="text-xs leading-relaxed" style={{ ...sans, color: palette.pineDeep }}>
          A propósito, este score puede ser decente incluso si tu deuda total es grande —
          la claridad y la constancia cuentan tanto como el progreso. No es un score de crédito.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// NUEVO: CONVERSACIONES PENDIENTES
// =============================================================================
function buildTemplate(debt) {
  return `Hola. Quería hablarte de lo que te debo — los $${debt.remaining.toLocaleString()} de ${debt.name.toLowerCase()}. No he podido pagarte como prometí, y quiero ser honesto contigo en vez de seguir evitándolo. Todavía no puedo cubrir todo de una vez, pero sí puedo proponerte un plan para ir abonando poco a poco. ¿Podemos hablarlo?`;
}
function ConversationCard({ debt, onToggleTalked }) {
  const [showTemplate, setShowTemplate] = useState(false);
  const [text, setText] = useState(buildTemplate(debt));
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setCopied(false);
    }
  };
  return (
    <div className="rounded-xl p-5 mb-3" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm" style={{ ...sans, color: palette.paperText }}>{debt.name}</p>
          <p className="text-xs mt-0.5" style={{ ...mono, color: palette.ashPaper }}>${debt.remaining.toLocaleString()} pendientes</p>
        </div>
        {debt.talked ? (
          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ background: palette.pineSoft, color: palette.pineDeep, ...sans }}>
            <CheckCircle2 size={11} /> Ya hablado
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: palette.paperDim, color: palette.ashPaper, ...sans }}>Pendiente</span>
        )}
      </div>
      {!showTemplate ? (
        <div className="flex gap-2">
          <GhostButton onClick={() => setShowTemplate(true)} style={{ flex: 1, color: palette.pine, borderColor: palette.pine }}>
            <MessageCircle size={14} /> Ver plantilla
          </GhostButton>
          <GhostButton onClick={() => onToggleTalked(debt.id)} style={{ flex: 1, color: debt.talked ? palette.ashPaper : palette.pineDeep, borderColor: palette.paperLine }}>
            {debt.talked ? "Marcar pendiente" : "Ya hablé con él/ella"}
          </GhostButton>
        </div>
      ) : (
        <>
          <p className="text-xs mb-2" style={{ ...sans, color: palette.ashPaper }}>
            Edítalo como quieras — esto no se envía solo, solo te ayuda a empezar.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-lg text-sm mb-3 outline-none resize-none"
            style={{ ...sans, background: palette.paper, border: `1px solid ${palette.paperLine}`, color: palette.paperText }}
          />
          <div className="flex gap-2">
            <GhostButton onClick={() => setShowTemplate(false)} style={{ color: palette.paperText, borderColor: palette.paperLine }}>Cerrar</GhostButton>
            <PrimaryButton onClick={copy} style={{ flex: 1 }}>
              <Copy size={14} /> {copied ? "¡Copiado!" : "Copiar mensaje"}
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}
function ConversationsScreen({ debts, onToggleTalked }) {
  const personDebts = debts.filter((d) => d.person && d.remaining > 0);
  const pending = personDebts.filter((d) => !d.talked);
  const talked = personDebts.filter((d) => d.talked);
  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Conversaciones Pendientes</p>
      <h2 className="text-2xl mb-2" style={{ ...serif, color: palette.paperText }}>Las que no querías tener.</h2>
      <p className="text-sm leading-relaxed mb-5" style={{ ...sans, color: palette.ashPaper }}>
        Solo para deudas con personas, no con bancos.
      </p>
      {personDebts.length === 0 && (
        <div className="rounded-xl p-6 text-center" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
          <p className="text-sm" style={{ ...sans, color: palette.ashPaper }}>No tienes deudas con personas registradas todavía.</p>
        </div>
      )}
      {pending.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ ...sans, color: palette.ashPaper }}>Pendientes</p>
          {pending.map((d) => <ConversationCard key={d.id} debt={d} onToggleTalked={onToggleTalked} />)}
        </>
      )}
      {talked.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-widest mt-6 mb-3" style={{ ...sans, color: palette.ashPaper }}>Ya habladas</p>
          {talked.map((d) => <ConversationCard key={d.id} debt={d} onToggleTalked={onToggleTalked} />)}
        </>
      )}
    </div>
  );
}

// =============================================================================
// NAVEGACIÓN INFERIOR
// =============================================================================
function BottomNav({ tab, setTab }) {
  const items = [
    { key: "home", label: "Inicio", icon: Home },
    { key: "radar", label: "Deudas", icon: Compass },
    { key: "conversations", label: "Conversa", icon: MessageCircle },
    { key: "purpose", label: "Propósito", icon: Heart },
    { key: "health", label: "Salud", icon: Activity },
    { key: "partner", label: "Pareja", icon: Users },
    { key: "diary", label: "Diario", icon: BookOpen },
    { key: "review", label: "Revisión", icon: Calendar },
    { key: "account", label: "Cuenta", icon: User },
  ];
  return (
    <div className="flex items-center gap-1 py-3 px-2 overflow-x-auto" style={{ background: palette.paperCard, borderTop: `1px solid ${palette.paperLine}` }}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.key;
        return (
          <button key={it.key} onClick={() => setTab(it.key)} className="flex flex-col items-center gap-1 px-2 py-1 flex-shrink-0">
            <Icon size={15} color={active ? palette.pine : palette.ash} />
            <span className="text-[7.5px] whitespace-nowrap" style={{ ...sans, color: active ? palette.pine : palette.ash }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// APP PRINCIPAL
// =============================================================================
function MainApp() {
  const { currentUser } = useAuth();
  const [onboardPhase, setOnboardPhase] = useState("welcome");
  const [tab, setTab] = useState("home");
  const [debts, setDebts] = useState([]);
  const [celebrate, setCelebrate] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [reviewDone, setReviewDone] = useState(false);
  const [goals, setGoals] = useState(seedGoals);
  const [partnerState, setPartnerState] = useState({ status: "none", name: "", email: "", sharing: initialSharing });
  const streak = 12;

  const handlePay = (id, amount) => {
    setDebts((prev) => {
      const sorted = [...prev].sort((a, b) => a.remaining - b.remaining);
      const idx = sorted.findIndex((d) => d.id === id);
      let overflow = 0;
      const updated = sorted.map((d, i) => {
        if (i === idx) {
          const newRemaining = d.remaining - amount;
          if (newRemaining < 0) overflow = Math.abs(newRemaining);
          return { ...d, remaining: Math.max(0, newRemaining) };
        }
        return d;
      });
      if (overflow > 0) {
        const nextIdx = updated.findIndex((d, i) => i > idx && d.remaining > 0);
        if (nextIdx !== -1) updated[nextIdx] = { ...updated[nextIdx], remaining: Math.max(0, updated[nextIdx].remaining - overflow) };
      }
      const justLiquidated = sorted[idx].remaining > 0 && updated[idx].remaining <= 0;
      if (justLiquidated) setCelebrate(updated[idx].name);
      return updated;
    });
  };
  const handleContribute = (id, amount) => setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g)));
  const handleToggleTalked = (id) => setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, talked: !d.talked } : d)));

  const firstName = currentUser?.name?.split(" ")[0] || "tú";
  const isConnected = partnerState.status === "connected";

  if (onboardPhase !== "done") {
    return (
      <div className="w-full mx-auto rounded-3xl overflow-hidden" style={{ maxWidth: 420, minHeight: 720, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)" }}>
        {onboardPhase === "welcome" && <Welcome name={firstName} onReady={() => setOnboardPhase("intro")} onWait={() => setOnboardPhase("wait")} />}
        {onboardPhase === "wait" && <WaitScreen onBack={() => setOnboardPhase("welcome")} />}
        {onboardPhase === "intro" && <InventoryIntro name={firstName} onStart={() => setOnboardPhase("capture")} />}
        {onboardPhase === "capture" && <DebtCapture debts={debts} setDebts={setDebts} onDone={() => setOnboardPhase("reveal")} onPauseForToday={() => setOnboardPhase("paused")} />}
        {onboardPhase === "paused" && <PausedScreen debts={debts} onResume={() => setOnboardPhase("capture")} />}
        {onboardPhase === "reveal" && (
          <RealityReveal debts={debts.length ? debts : initialDebts} onContinue={() => { setDebts(debts.length ? debts : initialDebts); setOnboardPhase("done"); }} />
        )}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto rounded-3xl overflow-hidden flex flex-col relative" style={{ maxWidth: 420, minHeight: 720, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)", background: palette.paper }}>
      <div className="flex-1 overflow-y-auto">
        {tab === "home" && <TruthPanel debts={debts} streak={streak} onGoRadar={() => setTab("radar")} name={firstName} shared={isConnected && partnerState.sharing.panel} />}
        {tab === "radar" && <DebtRadar debts={debts} onPay={handlePay} shared={isConnected && partnerState.sharing.debts} />}
        {tab === "conversations" && <ConversationsScreen debts={debts} onToggleTalked={handleToggleTalked} />}
        {tab === "purpose" && <PurposeScreen goals={goals} onAddGoal={(g) => setGoals([...goals, g])} onContribute={handleContribute} shared={isConnected && partnerState.sharing.purpose} />}
        {tab === "health" && <HealthScoreScreen debts={debts} streak={streak} />}
        {tab === "partner" && <PartnerScreen partnerState={partnerState} setPartnerState={setPartnerState} />}
        {tab === "diary" && <DiaryScreen entries={diaryEntries} onAddEntry={(e) => setDiaryEntries([e, ...diaryEntries])} />}
        {tab === "review" && <WeeklyReview completed={reviewDone} onComplete={() => setReviewDone(true)} />}
        {tab === "account" && <AccountScreen />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
      {celebrate && <CelebrationModal debtName={celebrate} onClose={() => setCelebrate(null)} />}
    </div>
  );
}

export default function AnclaAppCompleto() {
  return (
    <AuthProvider>
      <AuthGate>
        <MainApp />
      </AuthGate>
    </AuthProvider>
  );
}
