import React, { useState } from "react";
import {
  Moon,
  Sun,
  Plus,
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
} from "lucide-react";

// ---------------------------------------------------------------------------
// ANCLA — Prototipo unificado (Nivel 1 completo)
// Paleta "de la noche al amanecer": tinta nocturna para honestidad forzada,
// papel cálido para escribir/actuar, verde ancla para calma/control,
// ámbar reservado SOLO para progreso y celebración.
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
};

const serif = { fontFamily: '"Source Serif 4", Georgia, serif' };
const sans = { fontFamily: '"Inter", system-ui, sans-serif' };
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };

const initialDebts = [
  { id: 1, name: "Préstamo de mi hermano", original: 3200, remaining: 900 },
  { id: 2, name: "Tarjeta Azul", original: 15400, remaining: 11800 },
  { id: 3, name: "Tarjeta Platino", original: 28500, remaining: 24200 },
  { id: 4, name: "Préstamo personal banco", original: 62000, remaining: 58000 },
];

const moods = [
  { key: "verguenza", label: "Vergüenza", color: "#9E6B6B" },
  { key: "miedo", label: "Miedo", color: "#7C7FA6" },
  { key: "alivio", label: "Alivio", color: "#5E9C8B" },
  { key: "orgullo", label: "Orgullo tranquilo", color: "#C9973F" },
];

// --- Botones reutilizables ---------------------------------------------------
function GhostButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80 flex items-center gap-2 justify-center"
      style={{ ...sans, border: `1px solid ${palette.paperLine}`, color: palette.paperText, background: "transparent", ...style }}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
      style={{
        ...sans,
        background: disabled ? palette.ash : palette.pine,
        color: "#FFFFFF",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function ProgressArc({ pct }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: palette.paperDim }}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${palette.pine}, ${palette.dawn})` }}
      />
    </div>
  );
}

function PaperCard({ children }) {
  return (
    <div
      className="rounded-2xl p-6 relative"
      style={{ background: palette.paper, border: `1px solid ${palette.paperLine}`, boxShadow: "0 20px 40px -20px rgba(20,23,31,0.35)" }}
    >
      <div
        className="absolute -top-1 left-4 right-4 h-2 opacity-60"
        style={{ background: `repeating-linear-gradient(110deg, ${palette.paper} 0 6px, transparent 6px 9px)` }}
      />
      {children}
    </div>
  );
}

// =============================================================================
// ONBOARDING
// =============================================================================
function Welcome({ onReady, onWait }) {
  return (
    <div className="min-h-full flex flex-col justify-between p-8" style={{ background: palette.ink }}>
      <div className="flex items-center gap-2 pt-2">
        <Moon size={16} color={palette.ash} />
        <span className="text-xs tracking-widest uppercase" style={{ ...sans, color: palette.ash }}>Ancla</span>
      </div>
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto text-center">
        <p className="text-xs tracking-widest uppercase mb-6" style={{ ...sans, color: palette.dawnSoft }}>Antes de empezar</p>
        <h1 className="text-3xl leading-snug mb-6" style={{ ...serif, color: palette.inkText }}>Hay noches que no se olvidan.</h1>
        <p className="text-base leading-relaxed mb-2" style={{ ...sans, color: "#C7CAD4" }}>
          No vamos a pedirte que arregles nada todavía. Solo que mires tus números de frente, sin suavizarlos.
        </p>
        <p className="text-sm leading-relaxed" style={{ ...sans, color: palette.ash }}>Esto toma diez minutos. Puedes pausar cuando quieras.</p>
      </div>
      <div className="max-w-md mx-auto w-full flex flex-col gap-3 pb-4">
        <PrimaryButton onClick={onReady}>Estoy listo para mirar <ArrowRight size={16} /></PrimaryButton>
        <GhostButton onClick={onWait} style={{ color: palette.inkText, borderColor: palette.ash }}>Necesito un momento</GhostButton>
      </div>
    </div>
  );
}

function WaitScreen({ onBack }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: palette.ink }}>
      <Coffee size={28} color={palette.dawnSoft} className="mb-6" />
      <h2 className="text-xl mb-3 max-w-xs" style={{ ...serif, color: palette.inkText }}>Está bien. No hay prisa.</h2>
      <p className="text-sm max-w-xs leading-relaxed mb-8" style={{ ...sans, color: palette.ash }}>
        Vuelve cuando estés listo. Esto va a seguir aquí, sin juzgarte por el tiempo que tomes.
      </p>
      <GhostButton onClick={onBack} style={{ color: palette.inkText, borderColor: palette.ash }}>Volver</GhostButton>
    </div>
  );
}

function InventoryIntro({ onStart }) {
  return (
    <div className="min-h-full flex flex-col justify-center p-6" style={{ background: palette.ink }}>
      <div className="max-w-md mx-auto w-full">
        <PaperCard>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ ...sans, color: palette.pine }}>Inventario de Realidad</p>
          <h2 className="text-2xl mb-4" style={{ ...serif, color: palette.paperText }}>Lo que es verdad hoy.</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ ...sans, color: "#4B4F42" }}>
            Vamos a escribir, una cosa a la vez, cada deuda con su nombre y su monto exacto. Nadie más ve esto todavía.
          </p>
          <PrimaryButton onClick={onStart} style={{ width: "100%" }}>Empezar <ArrowRight size={16} /></PrimaryButton>
        </PaperCard>
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
    setDebts([...debts, { id: Date.now(), name, original: val, remaining: val }]);
    setName("");
    setAmount("");
    setStage("who");
  };

  const removeDebt = (id) => setDebts(debts.filter((d) => d.id !== id));

  return (
    <div className="min-h-full flex flex-col p-6" style={{ background: palette.ink }}>
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="mb-6">
          <ProgressArc pct={Math.min(85, 20 + debts.length * 12)} />
          <p className="text-xs mt-2" style={{ ...sans, color: palette.ash }}>
            {debts.length === 0 ? "Empecemos por lo primero que te venga a la mente." : `${debts.length} registrados — puedes seguir o pausar.`}
          </p>
        </div>

        <PaperCard>
          {stage === "who" && (
            <>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ ...sans, color: palette.pine }}>Pregunta {debts.length + 1}</p>
              <h3 className="text-xl mb-5" style={{ ...serif, color: palette.paperText }}>¿A quién le debes?</h3>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Tarjeta BBVA, mi hermano..."
                className="w-full px-4 py-3 rounded-lg text-sm mb-5 outline-none"
                style={{ ...sans, background: "#FFFFFF", border: `1px solid ${palette.paperLine}`, color: palette.paperText }}
                onKeyDown={(e) => e.key === "Enter" && name && setStage("amount")}
              />
              <PrimaryButton onClick={() => name && setStage("amount")} disabled={!name} style={{ width: "100%" }}>
                Siguiente <ArrowRight size={16} />
              </PrimaryButton>
            </>
          )}
          {stage === "amount" && (
            <>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ ...sans, color: palette.pine }}>{name}</p>
              <h3 className="text-xl mb-2" style={{ ...serif, color: palette.paperText }}>¿Cuánto exactamente?</h3>
              <p className="text-xs mb-5" style={{ ...sans, color: "#6B6F5F" }}>No redondees hacia abajo.</p>
              <div className="flex items-center gap-2 mb-5">
                <span style={{ ...mono, color: palette.paperText }} className="text-lg">$</span>
                <input
                  autoFocus
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg text-lg outline-none"
                  style={{ ...mono, background: "#FFFFFF", border: `1px solid ${palette.paperLine}`, color: palette.paperText }}
                  onKeyDown={(e) => e.key === "Enter" && amount && addDebt()}
                />
              </div>
              <div className="flex gap-3">
                <GhostButton onClick={() => setStage("who")} style={{ color: palette.paperText, borderColor: palette.paperLine }}>
                  <ArrowLeft size={14} /> Atrás
                </GhostButton>
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
            <div className="flex items-center justify-between px-4 pt-2">
              <span className="text-xs" style={{ ...sans, color: palette.ash }}>Total hasta ahora</span>
              <span className="text-sm" style={{ ...mono, color: palette.inkText }}>${total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <GhostButton onClick={onPauseForToday} style={{ flex: 1, color: palette.inkText, borderColor: palette.ash }}>
            <Pause size={14} /> Ya terminé por hoy
          </GhostButton>
          {debts.length > 0 && (
            <PrimaryButton onClick={onDone} style={{ flex: 1 }}>Terminar <ArrowRight size={16} /></PrimaryButton>
          )}
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
      <p className="text-sm max-w-xs leading-relaxed mb-2" style={{ ...sans, color: palette.ash }}>
        Llevas {debts.length} registros por ${total.toLocaleString()}.
      </p>
      <p className="text-sm max-w-xs leading-relaxed mb-8" style={{ ...sans, color: palette.ash }}>Puedes continuar cuando quieras, incluso mañana.</p>
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
// PANEL DE VERDAD
// =============================================================================
function TruthPanel({ debts, streak, onGoRadar }) {
  const total = debts.reduce((s, d) => s + d.remaining, 0);
  const weeklyAvailable = 1450;
  const smallest = debts.filter((d) => d.remaining > 0).sort((a, b) => a.remaining - b.remaining)[0];

  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Panel de Verdad</p>
      <h2 className="text-2xl mb-6" style={{ ...serif, color: palette.paperText }}>Hoy, esto es lo que importa.</h2>

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

      <button
        onClick={onGoRadar}
        className="w-full rounded-xl p-5 mb-2 text-left flex items-center justify-between transition-all duration-200 hover:opacity-90"
        style={{ background: palette.ink }}
      >
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

// =============================================================================
// RADAR DE DEUDAS
// =============================================================================
function CelebrationModal({ debtName, onClose }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 z-50" style={{ background: "rgba(20,23,31,0.7)" }}>
      <div className="rounded-2xl p-8 max-w-xs w-full text-center" style={{ background: palette.paper, border: `1px solid ${palette.paperLine}` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: palette.pineSoft }}>
          <Check size={26} color={palette.pine} />
        </div>
        <p className="text-xs tracking-widest uppercase mb-2" style={{ ...sans, color: palette.pine }}>Liquidada</p>
        <h3 className="text-lg mb-3" style={{ ...serif, color: palette.paperText }}>{debtName}</h3>
        <p className="text-sm leading-relaxed mb-6" style={{ ...sans, color: palette.ashPaper }}>
          No necesitas más celebración que esta. Lo que pagabas aquí ahora empuja tu siguiente batalla.
        </p>
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
          {isTarget && !liquidated && (
            <p className="text-xs mb-1 flex items-center gap-1" style={{ ...sans, color: palette.pine }}><Sparkles size={12} /> Foco actual</p>
          )}
          <p className="text-sm" style={{ ...sans, color: palette.paperText }}>{debt.name}</p>
        </div>
        {liquidated ? (
          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ background: palette.pineSoft, color: palette.pineDeep, ...sans }}>
            <Check size={12} /> Liquidada
          </span>
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
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ ...mono, background: palette.paper, border: `1px solid ${palette.paperLine}`, color: palette.paperText }} />
            <button onClick={() => { const val = parseFloat(amount) || 0; if (val > 0) onPay(debt.id, val); setAmount(""); setOpen(false); }}
              className="text-xs px-3 py-2.5 rounded-lg" style={{ ...sans, background: palette.pine, color: "#fff" }}>Guardar</button>
          </div>
        )
      )}
    </div>
  );
}

function DebtRadar({ debts, onPay }) {
  const active = [...debts].filter((d) => d.remaining > 0).sort((a, b) => a.remaining - b.remaining);
  const done = debts.filter((d) => d.remaining <= 0);
  const targetId = active[0]?.id;
  const totalRemaining = debts.reduce((s, d) => s + d.remaining, 0);

  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1" style={{ ...sans, color: palette.pine }}>Radar de Deudas</p>
      <h2 className="text-2xl mb-2" style={{ ...serif, color: palette.paperText }}>De la más pequeña a la más grande.</h2>
      <p className="text-sm leading-relaxed mb-5" style={{ ...sans, color: palette.ashPaper }}>
        Cada abono va primero a tu foco actual. Al liquidarla, ese pago se suma a la siguiente.
      </p>
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
      {active.length === 0 && (
        <div className="rounded-xl p-6 text-center" style={{ background: palette.pineSoft }}>
          <Sun size={24} color={palette.pine} className="mx-auto mb-3" />
          <p style={{ ...serif, color: palette.pineDeep }}>Liquidaste todas tus deudas registradas.</p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// DIARIO FINANCIERO
// =============================================================================
function DiaryScreen({ entries, onAddEntry }) {
  const [mood, setMood] = useState(null);
  const [text, setText] = useState("");

  const save = () => {
    if (!mood) return;
    onAddEntry({ id: Date.now(), mood, text, date: "Hoy" });
    setMood(null);
    setText("");
  };

  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Diario Financiero</p>
      <h2 className="text-2xl mb-2" style={{ ...serif, color: palette.paperText }}>¿Cómo te sentiste con el dinero esta semana?</h2>
      <p className="text-sm leading-relaxed mb-5" style={{ ...sans, color: palette.ashPaper }}>
        Nombrar con precisión es el primer acto de sanidad. No hay respuesta incorrecta.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {moods.map((m) => (
          <button
            key={m.key}
            onClick={() => setMood(m.key)}
            className="rounded-xl p-4 text-sm transition-all duration-200"
            style={{
              ...sans,
              background: mood === m.key ? m.color : palette.paperCard,
              color: mood === m.key ? "#FFFFFF" : palette.paperText,
              border: `1px solid ${mood === m.key ? m.color : palette.paperLine}`,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Si quieres, cuenta un poco más (opcional)..."
        rows={3}
        className="w-full px-4 py-3 rounded-lg text-sm mb-4 outline-none resize-none"
        style={{ ...sans, background: palette.paperCard, border: `1px solid ${palette.paperLine}`, color: palette.paperText }}
      />

      <PrimaryButton onClick={save} disabled={!mood} style={{ width: "100%" }}>Guardar entrada <Check size={16} /></PrimaryButton>

      {entries.length > 0 && (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ ...sans, color: palette.ashPaper }}>Entradas anteriores</p>
          {entries.map((e) => {
            const m = moods.find((mm) => mm.key === e.mood);
            return (
              <div key={e.id} className="rounded-xl p-4 mb-2" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ ...sans, background: m.color, color: "#fff" }}>{m.label}</span>
                  <span className="text-xs" style={{ ...sans, color: palette.ashPaper }}>{e.date}</span>
                </div>
                {e.text && <p className="text-sm mt-2" style={{ ...sans, color: palette.paperText }}>{e.text}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// REVISIÓN SEMANAL ("el ritual de los tres minutos")
// =============================================================================
function WeeklyReview({ onComplete, completed }) {
  const questions = [
    "¿Fui honesto esta semana, incluso cuando era incómodo?",
    "¿Estuve presente con las personas que más me importan?",
    "¿Tomé decisiones desde la calma o desde el miedo?",
  ];
  const [answers, setAnswers] = useState([null, null, null]);

  const setAnswer = (i, val) => {
    const copy = [...answers];
    copy[i] = val;
    setAnswers(copy);
  };

  const allAnswered = answers.every((a) => a !== null);

  return (
    <div className="p-6">
      <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>Revisión semanal</p>
      <h2 className="text-2xl mb-6" style={{ ...serif, color: palette.paperText }}>El ritual de los tres minutos.</h2>

      {completed ? (
        <div className="rounded-xl p-6 text-center" style={{ background: palette.pineSoft }}>
          <Check size={24} color={palette.pine} className="mx-auto mb-3" />
          <p style={{ ...serif, color: palette.pineDeep }}>Ya hiciste tu revisión esta semana. Nos vemos la próxima.</p>
        </div>
      ) : (
        <>
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl p-5 mb-3" style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}>
              <p className="text-sm mb-3" style={{ ...serif, color: palette.paperText }}>{q}</p>
              <div className="flex gap-2">
                {["Sí", "A veces", "No"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswer(i, opt)}
                    className="flex-1 py-2 rounded-lg text-xs transition-all duration-200"
                    style={{
                      ...sans,
                      background: answers[i] === opt ? palette.pine : "transparent",
                      color: answers[i] === opt ? "#fff" : palette.paperText,
                      border: `1px solid ${answers[i] === opt ? palette.pine : palette.paperLine}`,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <PrimaryButton onClick={onComplete} disabled={!allAnswered} style={{ width: "100%", marginTop: 8 }}>
            Terminar revisión <ArrowRight size={16} />
          </PrimaryButton>
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
    { key: "diary", label: "Diario", icon: BookOpen },
    { key: "review", label: "Revisión", icon: Calendar },
  ];
  return (
    <div className="flex items-center justify-around py-3 px-2" style={{ background: palette.paperCard, borderTop: `1px solid ${palette.paperLine}` }}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.key;
        return (
          <button key={it.key} onClick={() => setTab(it.key)} className="flex flex-col items-center gap-1 px-3 py-1">
            <Icon size={18} color={active ? palette.pine : palette.ash} />
            <span className="text-[10px]" style={{ ...sans, color: active ? palette.pine : palette.ash }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// CONTENEDOR PRINCIPAL
// =============================================================================
export default function AnclaApp() {
  const [phase, setPhase] = useState("welcome"); // welcome -> wait -> intro -> capture -> paused -> reveal -> app
  const [tab, setTab] = useState("home");
  const [debts, setDebts] = useState([]);
  const [celebrate, setCelebrate] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [reviewDone, setReviewDone] = useState(false);
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

  // --- Fase de onboarding (fuera de la app principal) ---
  if (phase !== "app") {
    return (
      <div className="w-full mx-auto rounded-3xl overflow-hidden" style={{ maxWidth: 420, minHeight: 720, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)" }}>
        {phase === "welcome" && <Welcome onReady={() => setPhase("intro")} onWait={() => setPhase("wait")} />}
        {phase === "wait" && <WaitScreen onBack={() => setPhase("welcome")} />}
        {phase === "intro" && <InventoryIntro onStart={() => setPhase("capture")} />}
        {phase === "capture" && (
          <DebtCapture debts={debts} setDebts={setDebts} onDone={() => setPhase("reveal")} onPauseForToday={() => setPhase("paused")} />
        )}
        {phase === "paused" && <PausedScreen debts={debts} onResume={() => setPhase("capture")} />}
        {phase === "reveal" && (
          <RealityReveal
            debts={debts.length ? debts : initialDebts}
            onContinue={() => {
              setDebts(debts.length ? debts : initialDebts);
              setPhase("app");
            }}
          />
        )}
      </div>
    );
  }

  // --- App principal con navegación inferior ---
  return (
    <div className="w-full mx-auto rounded-3xl overflow-hidden flex flex-col relative" style={{ maxWidth: 420, minHeight: 720, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)", background: palette.paper }}>
      <div className="flex-1 overflow-y-auto">
        {tab === "home" && <TruthPanel debts={debts} streak={streak} onGoRadar={() => setTab("radar")} />}
        {tab === "radar" && <DebtRadar debts={debts} onPay={handlePay} />}
        {tab === "diary" && <DiaryScreen entries={diaryEntries} onAddEntry={(e) => setDiaryEntries([e, ...diaryEntries])} />}
        {tab === "review" && <WeeklyReview completed={reviewDone} onComplete={() => setReviewDone(true)} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
      {celebrate && <CelebrationModal debtName={celebrate} onClose={() => setCelebrate(null)} />}
    </div>
  );
}
