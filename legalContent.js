import React, { useState } from "react";
import {
  Sun,
  ArrowRight,
  ArrowLeft,
  Check,
  PiggyBank,
  Flame,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";

// ---------------------------------------------------------------------------
// ANCLA — Prototipo: Panel de Verdad + Radar de Deudas (bola de nieve)
// Misma paleta "de la noche al amanecer" del módulo de Onboarding.
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

// --- Panel de Verdad (home) --------------------------------------------------
function TruthPanel({ debts, onOpenRadar, streak }) {
  const total = debts.reduce((s, d) => s + d.remaining, 0);
  const weeklyAvailable = 1450; // simulado: ingresos - gastos imprescindibles
  const smallest = debts
    .filter((d) => d.remaining > 0)
    .sort((a, b) => a.remaining - b.remaining)[0];

  return (
    <div className="min-h-full p-6" style={{ background: palette.paper }}>
      <div className="max-w-md mx-auto">
        <p className="text-xs tracking-widest uppercase mb-1 mt-2" style={{ ...sans, color: palette.pine }}>
          Panel de Verdad
        </p>
        <h2 className="text-2xl mb-6" style={{ ...serif, color: palette.paperText }}>
          Hoy, esto es lo que importa.
        </h2>

        <div className="grid grid-cols-1 gap-3 mb-5">
          <div
            className="rounded-xl p-5"
            style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}
          >
            <p className="text-xs mb-1" style={{ ...sans, color: palette.ashPaper }}>Esto debes hoy</p>
            <p className="text-2xl" style={{ ...mono, color: palette.paperText }}>
              ${total.toLocaleString()}
            </p>
          </div>

          <div
            className="rounded-xl p-5"
            style={{ background: palette.paperCard, border: `1px solid ${palette.paperLine}` }}
          >
            <p className="text-xs mb-1" style={{ ...sans, color: palette.ashPaper }}>
              Disponible esta semana
            </p>
            <p className="text-2xl" style={{ ...mono, color: palette.paperText }}>
              ${weeklyAvailable.toLocaleString()}
            </p>
            <p className="text-xs mt-1" style={{ ...sans, color: palette.ashPaper }}>
              Después de ingresos reales y gastos imprescindibles
            </p>
          </div>

          <div
            className="rounded-xl p-5 flex items-center justify-between"
            style={{ background: palette.pine }}
          >
            <div>
              <p className="text-xs mb-1" style={{ ...sans, color: "#DCEAE6" }}>Racha de honestidad</p>
              <p className="text-2xl" style={{ ...mono, color: "#FFFFFF" }}>Día {streak}</p>
              <p className="text-xs mt-1" style={{ ...sans, color: "#CFE3DE" }}>
                Se rompe solo si fallan dos veces seguidas
              </p>
            </div>
            <Flame size={30} color={palette.dawn} />
          </div>
        </div>

        <button
          onClick={onOpenRadar}
          className="w-full rounded-xl p-5 mb-4 text-left flex items-center justify-between transition-all duration-200 hover:opacity-90"
          style={{ background: palette.ink }}
        >
          <div>
            <p className="text-xs mb-1" style={{ ...sans, color: palette.ash }}>Tu primera batalla</p>
            <p className="text-lg" style={{ ...serif, color: palette.inkText }}>
              {smallest ? smallest.name : "Ya liquidaste todo"}
            </p>
            {smallest && (
              <p className="text-sm mt-1" style={{ ...mono, color: palette.dawnSoft }}>
                ${smallest.remaining.toLocaleString()} restantes
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <PiggyBank size={22} color={palette.dawnSoft} />
            <ArrowRight size={14} color={palette.ash} />
          </div>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <GhostButton style={{ padding: "12px" }}>
            <Calendar size={14} /> Revisión semanal
          </GhostButton>
          <GhostButton onClick={onOpenRadar} style={{ padding: "12px" }}>
            Ver Radar de Deudas
          </GhostButton>
        </div>
      </div>
    </div>
  );
}

// --- Modal de celebración (mínima, sin fanfarria) ---------------------------
function CelebrationModal({ debtName, onClose }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{ background: "rgba(20,23,31,0.7)" }}
    >
      <div
        className="rounded-2xl p-8 max-w-xs w-full text-center"
        style={{ background: palette.paper, border: `1px solid ${palette.paperLine}` }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: palette.pineSoft }}
        >
          <Check size={26} color={palette.pine} />
        </div>
        <p className="text-xs tracking-widest uppercase mb-2" style={{ ...sans, color: palette.pine }}>
          Liquidada
        </p>
        <h3 className="text-lg mb-3" style={{ ...serif, color: palette.paperText }}>
          {debtName}
        </h3>
        <p className="text-sm leading-relaxed mb-6" style={{ ...sans, color: palette.ashPaper }}>
          No necesitas más celebración que esta. Lo que pagabas aquí ahora empuja tu siguiente
          batalla.
        </p>
        <PrimaryButton onClick={onClose} style={{ width: "100%" }}>
          Seguir <ArrowRight size={16} />
        </PrimaryButton>
      </div>
    </div>
  );
}

// --- Fila de deuda individual ------------------------------------------------
function DebtRow({ debt, isTarget, onPay }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const pct = Math.max(0, Math.min(100, ((debt.original - debt.remaining) / debt.original) * 100));
  const liquidated = debt.remaining <= 0;

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{
        background: palette.paperCard,
        border: `1px solid ${isTarget ? palette.pine : palette.paperLine}`,
        borderWidth: isTarget ? 2 : 1,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          {isTarget && !liquidated && (
            <p className="text-xs mb-1 flex items-center gap-1" style={{ ...sans, color: palette.pine }}>
              <Sparkles size={12} /> Foco actual — bola de nieve
            </p>
          )}
          <p className="text-sm" style={{ ...sans, color: palette.paperText }}>{debt.name}</p>
        </div>
        {liquidated ? (
          <span
            className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
            style={{ background: palette.pineSoft, color: palette.pineDeep, ...sans }}
          >
            <Check size={12} /> Liquidada
          </span>
        ) : (
          <span className="text-sm" style={{ ...mono, color: palette.paperText }}>
            ${debt.remaining.toLocaleString()}
          </span>
        )}
      </div>

      <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: palette.paperDim }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: liquidated ? palette.pine : `linear-gradient(90deg, ${palette.pineDeep}, ${palette.pine})` }}
        />
      </div>

      {!liquidated && (
        <>
          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="text-xs px-3 py-2 rounded-lg"
              style={{ ...sans, color: palette.pine, border: `1px solid ${palette.pine}` }}
            >
              Abonar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span style={{ ...mono, color: palette.paperText }} className="text-sm">$</span>
              <input
                autoFocus
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ ...mono, background: palette.paper, border: `1px solid ${palette.paperLine}`, color: palette.paperText }}
              />
              <button
                onClick={() => {
                  const val = parseFloat(amount) || 0;
                  if (val > 0) onPay(debt.id, val);
                  setAmount("");
                  setOpen(false);
                }}
                className="text-xs px-3 py-2.5 rounded-lg"
                style={{ ...sans, background: palette.pine, color: "#fff" }}
              >
                Guardar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- Radar de Deudas ---------------------------------------------------------
function DebtRadar({ debts, onPay, onBack }) {
  const active = [...debts].filter((d) => d.remaining > 0).sort((a, b) => a.remaining - b.remaining);
  const done = debts.filter((d) => d.remaining <= 0);
  const targetId = active[0]?.id;
  const totalRemaining = debts.reduce((s, d) => s + d.remaining, 0);

  return (
    <div className="min-h-full p-6" style={{ background: palette.paper }}>
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-4" style={{ ...sans, color: palette.ashPaper }}>
          <ArrowLeft size={14} /> <span className="text-sm">Panel de Verdad</span>
        </button>

        <p className="text-xs tracking-widest uppercase mb-1" style={{ ...sans, color: palette.pine }}>
          Radar de Deudas
        </p>
        <h2 className="text-2xl mb-2" style={{ ...serif, color: palette.paperText }}>
          De la más pequeña a la más grande.
        </h2>
        <p className="text-sm leading-relaxed mb-5" style={{ ...sans, color: palette.ashPaper }}>
          Cada abono va primero a tu foco actual. Cuando la liquidas, ese pago se suma a la
          siguiente — así crece la bola de nieve.
        </p>

        <div
          className="rounded-xl p-4 mb-5 flex items-center justify-between"
          style={{ background: palette.ink }}
        >
          <span className="text-xs" style={{ ...sans, color: palette.ash }}>Total restante</span>
          <span className="text-lg" style={{ ...mono, color: palette.inkText }}>
            ${totalRemaining.toLocaleString()}
          </span>
        </div>

        {active.map((d) => (
          <DebtRow key={d.id} debt={d} isTarget={d.id === targetId} onPay={onPay} />
        ))}

        {done.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-widest mt-6 mb-3" style={{ ...sans, color: palette.ashPaper }}>
              Ya liquidadas
            </p>
            {done.map((d) => (
              <DebtRow key={d.id} debt={d} isTarget={false} onPay={onPay} />
            ))}
          </>
        )}

        {active.length === 0 && (
          <div className="rounded-xl p-6 text-center" style={{ background: palette.pineSoft }}>
            <Sun size={24} color={palette.pine} className="mx-auto mb-3" />
            <p style={{ ...serif, color: palette.pineDeep }}>Liquidaste todas tus deudas registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Contenedor principal ----------------------------------------------------
export default function AnclaPanelRadar() {
  const [screen, setScreen] = useState("home");
  const [debts, setDebts] = useState(initialDebts);
  const [celebrate, setCelebrate] = useState(null);
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

      // efecto bola de nieve: el sobrante empuja a la siguiente deuda activa
      if (overflow > 0) {
        const nextIdx = updated.findIndex((d, i) => i > idx && d.remaining > 0);
        if (nextIdx !== -1) {
          updated[nextIdx] = { ...updated[nextIdx], remaining: Math.max(0, updated[nextIdx].remaining - overflow) };
        }
      }

      const justLiquidated = updated.find((d, i) => i === idx && d.remaining <= 0 && sorted[idx].remaining > 0);
      if (justLiquidated) setCelebrate(justLiquidated.name);

      return updated;
    });
  };

  return (
    <div
      className="w-full mx-auto rounded-3xl overflow-hidden relative"
      style={{ maxWidth: 420, minHeight: 720, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)" }}
    >
      {screen === "home" && (
        <TruthPanel debts={debts} onOpenRadar={() => setScreen("radar")} streak={streak} />
      )}
      {screen === "radar" && (
        <DebtRadar debts={debts} onPay={handlePay} onBack={() => setScreen("home")} />
      )}
      {celebrate && <CelebrationModal debtName={celebrate} onClose={() => setCelebrate(null)} />}
    </div>
  );
}
