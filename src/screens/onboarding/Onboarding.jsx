import React, { useState } from "react";
import { Moon, Sun, Plus, Trash2, ArrowRight, Pause, Coffee, Check, ArrowLeft } from "lucide-react";

// ---------------------------------------------------------------------------
// ANCLA — Prototipo: Onboarding + Inventario de Realidad
//
// Paleta ("De la noche al amanecer"):
//   ink      #14171F  fondo nocturno — el momento de honestidad forzada
//   inkSoft  #1E2330  tarjetas sobre fondo nocturno
//   paper    #F5F1E7  papel — donde se escribe el inventario
//   paperDim #EAE3D3  bordes / divisores sobre papel
//   pine     #2F6F63  acento ancla — calma, control
//   dawn     #C9973F  acento amanecer — usado SOLO para logros/avance
//   ash      #6B7280  texto secundario
// Tipografía: "Source Serif 4" (voz narrativa) + "Inter" (UI) + "IBM Plex Mono" (cifras)
// ---------------------------------------------------------------------------

const palette = {
  ink: "#14171F",
  inkSoft: "#1E2330",
  inkLine: "#2A2F3D",
  paper: "#F5F1E7",
  paperDim: "#E4DCC8",
  paperLine: "#D8CFB8",
  pine: "#2F6F63",
  pineDeep: "#234F46",
  dawn: "#C9973F",
  dawnSoft: "#E6C889",
  ash: "#8A8F9C",
  inkText: "#EDEBE4",
  paperText: "#22261F",
};

const serif = { fontFamily: '"Source Serif 4", Georgia, serif' };
const sans = { fontFamily: '"Inter", system-ui, sans-serif' };
const mono = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };

function ProgressArc({ pct }) {
  // Barra "noche a amanecer": el relleno pasa de tinta a ámbar según el progreso.
  return (
    <div
      className="w-full h-1.5 rounded-full overflow-hidden"
      style={{ background: palette.paperDim }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${palette.pine}, ${palette.dawn})`,
        }}
      />
    </div>
  );
}

function GhostButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-3 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
      style={{
        ...sans,
        border: `1px solid ${palette.ash}`,
        color: palette.inkText,
        background: "transparent",
        ...style,
      }}
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
      className="px-6 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
      style={{
        ...sans,
        background: disabled ? palette.ash : palette.pine,
        color: palette.paper,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = palette.pineDeep;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = palette.pine;
      }}
    >
      {children}
    </button>
  );
}

// --- Pantalla 1: Antes de Empezar (fondo nocturno) --------------------------
function Welcome({ onReady, onWait }) {
  return (
    <div
      className="min-h-full flex flex-col justify-between p-8"
      style={{ background: palette.ink }}
    >
      <div className="flex items-center gap-2 pt-2">
        <Moon size={16} color={palette.ash} />
        <span className="text-xs tracking-widest uppercase" style={{ ...sans, color: palette.ash }}>
          Ancla
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto text-center">
        <p className="text-xs tracking-widest uppercase mb-6" style={{ ...sans, color: palette.dawnSoft }}>
          Antes de empezar
        </p>
        <h1
          className="text-3xl leading-snug mb-6"
          style={{ ...serif, color: palette.inkText }}
        >
          Hay noches que no se olvidan.
        </h1>
        <p className="text-base leading-relaxed mb-2" style={{ ...sans, color: "#C7CAD4" }}>
          No vamos a pedirte que arregles nada todavía. Solo que mires tus números de frente,
          sin suavizarlos, sin el "pero ya va a mejorar".
        </p>
        <p className="text-sm leading-relaxed" style={{ ...sans, color: palette.ash }}>
          Esto toma diez minutos. Puedes pausar cuando quieras.
        </p>
      </div>

      <div className="max-w-md mx-auto w-full flex flex-col gap-3 pb-4">
        <PrimaryButton onClick={onReady}>
          Estoy listo para mirar <ArrowRight size={16} />
        </PrimaryButton>
        <GhostButton onClick={onWait}>Necesito un momento</GhostButton>
      </div>
    </div>
  );
}

function WaitScreen({ onBack }) {
  return (
    <div
      className="min-h-full flex flex-col items-center justify-center p-8 text-center"
      style={{ background: palette.ink }}
    >
      <Coffee size={28} color={palette.dawnSoft} className="mb-6" />
      <h2 className="text-xl mb-3 max-w-xs" style={{ ...serif, color: palette.inkText }}>
        Está bien. No hay prisa.
      </h2>
      <p className="text-sm max-w-xs leading-relaxed mb-8" style={{ ...sans, color: palette.ash }}>
        Vuelve cuando estés listo. Esto va a seguir aquí, sin juzgarte por el tiempo que tomes.
      </p>
      <GhostButton onClick={onBack}>Volver</GhostButton>
    </div>
  );
}

// --- Tarjeta de "papel" para el inventario ----------------------------------
function PaperCard({ children }) {
  return (
    <div
      className="rounded-2xl p-6 relative"
      style={{
        background: palette.paper,
        border: `1px solid ${palette.paperLine}`,
        boxShadow: "0 20px 40px -20px rgba(20,23,31,0.35)",
      }}
    >
      {/* borde superior "rasgado" sutil */}
      <div
        className="absolute -top-1 left-4 right-4 h-2 opacity-60"
        style={{
          background: `repeating-linear-gradient(110deg, ${palette.paper} 0 6px, transparent 6px 9px)`,
        }}
      />
      {children}
    </div>
  );
}

// --- Pantalla 2: intro al inventario ----------------------------------------
function InventoryIntro({ onStart }) {
  return (
    <div
      className="min-h-full flex flex-col justify-center p-6"
      style={{ background: palette.ink }}
    >
      <div className="max-w-md mx-auto w-full">
        <PaperCard>
          <p className="text-xs tracking-widest uppercase mb-3" style={{ ...sans, color: palette.pine }}>
            Inventario de Realidad
          </p>
          <h2 className="text-2xl mb-4" style={{ ...serif, color: palette.paperText }}>
            Lo que es verdad hoy.
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ ...sans, color: "#4B4F42" }}>
            Vamos a escribir, una cosa a la vez, cada deuda con su nombre y su monto exacto.
            No el que recuerdas vagamente — el real. Nadie más ve esto todavía.
          </p>
          <PrimaryButton onClick={onStart} style={{ width: "100%" }}>
            Empezar <ArrowRight size={16} />
          </PrimaryButton>
        </PaperCard>
      </div>
    </div>
  );
}

// --- Pantalla 3: captura de deudas (una pregunta a la vez) ------------------
function DebtCapture({ debts, setDebts, onDone, onPauseForToday }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState("who"); // who -> amount -> added

  const total = debts.reduce((s, d) => s + d.amount, 0);

  const addDebt = () => {
    if (!name || !amount) return;
    setDebts([...debts, { name, amount: parseFloat(amount) || 0, id: Date.now() }]);
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
            {debts.length === 0
              ? "Empecemos por lo primero que te venga a la mente."
              : `${debts.length} ${debts.length === 1 ? "registro" : "registros"} — puedes seguir o hacer una pausa.`}
          </p>
        </div>

        <PaperCard>
          {stage === "who" && (
            <>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ ...sans, color: palette.pine }}>
                Pregunta {debts.length + 1}
              </p>
              <h3 className="text-xl mb-5" style={{ ...serif, color: palette.paperText }}>
                ¿A quién le debes?
              </h3>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Tarjeta BBVA, mi hermano, préstamo personal..."
                className="w-full px-4 py-3 rounded-lg text-sm mb-5 outline-none"
                style={{
                  ...sans,
                  background: "#FFFFFF",
                  border: `1px solid ${palette.paperLine}`,
                  color: palette.paperText,
                }}
                onKeyDown={(e) => e.key === "Enter" && name && setStage("amount")}
              />
              <div className="flex gap-3">
                <PrimaryButton onClick={() => name && setStage("amount")} disabled={!name} style={{ flex: 1 }}>
                  Siguiente <ArrowRight size={16} />
                </PrimaryButton>
              </div>
            </>
          )}

          {stage === "amount" && (
            <>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ ...sans, color: palette.pine }}>
                {name}
              </p>
              <h3 className="text-xl mb-2" style={{ ...serif, color: palette.paperText }}>
                ¿Cuánto exactamente?
              </h3>
              <p className="text-xs mb-5" style={{ ...sans, color: "#6B6F5F" }}>
                No redondees hacia abajo. El número real, aunque incomode.
              </p>
              <div className="flex items-center gap-2 mb-5">
                <span style={{ ...mono, color: palette.paperText }} className="text-lg">$</span>
                <input
                  autoFocus
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg text-lg outline-none"
                  style={{
                    ...mono,
                    background: "#FFFFFF",
                    border: `1px solid ${palette.paperLine}`,
                    color: palette.paperText,
                  }}
                  onKeyDown={(e) => e.key === "Enter" && amount && addDebt()}
                />
              </div>
              <div className="flex gap-3">
                <GhostButton
                  onClick={() => setStage("who")}
                  style={{ color: palette.paperText, borderColor: palette.paperLine }}
                >
                  <ArrowLeft size={14} className="inline mr-1" /> Atrás
                </GhostButton>
                <PrimaryButton onClick={addDebt} disabled={!amount} style={{ flex: 1 }}>
                  Guardar <Check size={16} />
                </PrimaryButton>
              </div>
            </>
          )}
        </PaperCard>

        {debts.length > 0 && (
          <div className="mt-4 space-y-2">
            {debts.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                style={{ background: palette.inkSoft, border: `1px solid ${palette.inkLine}` }}
              >
                <span className="text-sm" style={{ ...sans, color: palette.inkText }}>{d.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ ...mono, color: palette.dawnSoft }}>
                    ${d.amount.toLocaleString()}
                  </span>
                  <button onClick={() => removeDebt(d.id)}>
                    <Trash2 size={14} color={palette.ash} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 pt-2">
              <span className="text-xs" style={{ ...sans, color: palette.ash }}>Total hasta ahora</span>
              <span className="text-sm" style={{ ...mono, color: palette.inkText }}>
                ${total.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <GhostButton onClick={onPauseForToday} style={{ flex: 1 }}>
            <Pause size={14} className="inline mr-2" /> Ya terminé por hoy
          </GhostButton>
          {debts.length > 0 && (
            <PrimaryButton onClick={onDone} style={{ flex: 1 }}>
              Terminar inventario <ArrowRight size={16} />
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

function PausedScreen({ debts, onResume }) {
  const total = debts.reduce((s, d) => s + d.amount, 0);
  return (
    <div
      className="min-h-full flex flex-col items-center justify-center p-8 text-center"
      style={{ background: palette.ink }}
    >
      <Moon size={26} color={palette.dawnSoft} className="mb-6" />
      <h2 className="text-xl mb-3 max-w-xs" style={{ ...serif, color: palette.inkText }}>
        Guardado. Nada se pierde.
      </h2>
      <p className="text-sm max-w-xs leading-relaxed mb-2" style={{ ...sans, color: palette.ash }}>
        Llevas {debts.length} {debts.length === 1 ? "registro" : "registros"} por
        {" "}${total.toLocaleString()}.
      </p>
      <p className="text-sm max-w-xs leading-relaxed mb-8" style={{ ...sans, color: palette.ash }}>
        Puedes continuar cuando quieras, incluso mañana.
      </p>
      <PrimaryButton onClick={onResume}>Continuar ahora <ArrowRight size={16} /></PrimaryButton>
    </div>
  );
}

// --- Pantalla final: revelación del total, con dignidad, sin alarma --------
function RealityReveal({ debts, onContinue }) {
  const total = debts.reduce((s, d) => s + d.amount, 0);
  return (
    <div className="min-h-full flex flex-col justify-center p-6" style={{ background: palette.ink }}>
      <div className="max-w-md mx-auto w-full text-center">
        <p className="text-xs tracking-widest uppercase mb-6" style={{ ...sans, color: palette.dawnSoft }}>
          Esto es lo que hay
        </p>
        <div
          className="rounded-2xl px-8 py-10 mb-6"
          style={{ background: palette.inkSoft, border: `1px solid ${palette.inkLine}` }}
        >
          <p className="text-xs mb-3" style={{ ...sans, color: palette.ash }}>
            Total de tu inventario
          </p>
          <p className="text-4xl mb-1" style={{ ...mono, color: palette.inkText }}>
            ${total.toLocaleString()}
          </p>
          <p className="text-xs" style={{ ...sans, color: palette.ash }}>
            {debts.length} {debts.length === 1 ? "deuda registrada" : "deudas registradas"}
          </p>
        </div>
        <p className="text-base leading-relaxed mb-8" style={{ ...serif, color: palette.inkText }}>
          "Y estoy dispuesto a mirarlo de frente."
        </p>
        <p className="text-sm leading-relaxed mb-8" style={{ ...sans, color: palette.ash }}>
          Ya lo puedes ver. Y lo que se puede ver, se puede enfrentar. El siguiente paso no es
          resolverlo todo hoy — es elegir un solo hábito para empezar.
        </p>
        <PrimaryButton onClick={onContinue} style={{ width: "100%" }}>
          Ver mi Panel de Verdad <ArrowRight size={16} />
        </PrimaryButton>
      </div>
    </div>
  );
}

// --- Teaser del Panel de Verdad (home) --------------------------------------
function TruthPanelTeaser({ debts, onRestart }) {
  const total = debts.reduce((s, d) => s + d.amount, 0);
  const smallest = debts.length
    ? debts.reduce((a, b) => (a.amount < b.amount ? a : b))
    : null;

  return (
    <div className="min-h-full flex flex-col p-6" style={{ background: palette.paper }}>
      <div className="max-w-md mx-auto w-full flex-1">
        <p className="text-xs tracking-widest uppercase mb-1 mt-4" style={{ ...sans, color: palette.pine }}>
          Panel de Verdad
        </p>
        <h2 className="text-2xl mb-6" style={{ ...serif, color: palette.paperText }}>
          Hoy, esto es lo que importa.
        </h2>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="rounded-xl p-5" style={{ background: "#FFFFFF", border: `1px solid ${palette.paperLine}` }}>
            <p className="text-xs mb-1" style={{ ...sans, color: "#6B6F5F" }}>Esto debes hoy</p>
            <p className="text-2xl" style={{ ...mono, color: palette.paperText }}>${total.toLocaleString()}</p>
          </div>
          <div className="rounded-xl p-5" style={{ background: "#FFFFFF", border: `1px solid ${palette.paperLine}` }}>
            <p className="text-xs mb-1" style={{ ...sans, color: "#6B6F5F" }}>Tu primera batalla</p>
            <p className="text-lg" style={{ ...serif, color: palette.paperText }}>
              {smallest ? smallest.name : "Sin registros"}
            </p>
            {smallest && (
              <p className="text-sm" style={{ ...mono, color: palette.pine }}>${smallest.amount.toLocaleString()}</p>
            )}
          </div>
          <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: palette.pine }}>
            <div>
              <p className="text-xs mb-1" style={{ ...sans, color: "#DCEAE6" }}>Racha de honestidad</p>
              <p className="text-2xl" style={{ ...mono, color: "#FFFFFF" }}>Día 1</p>
            </div>
            <Sun size={28} color={palette.dawn} />
          </div>
        </div>

        <p className="text-xs leading-relaxed mb-6 text-center" style={{ ...sans, color: "#6B6F5F" }}>
          No estás empezando desde cero. Estás empezando desde todo lo que ahora sabes.
        </p>
      </div>

      <GhostButton
        onClick={onRestart}
        style={{ color: palette.paperText, borderColor: palette.paperLine, alignSelf: "center" }}
      >
        Reiniciar prototipo
      </GhostButton>
    </div>
  );
}

// --- Contenedor principal ----------------------------------------------------
export default function AnclaPrototype() {
  const [screen, setScreen] = useState("welcome");
  const [debts, setDebts] = useState([]);

  const reset = () => {
    setDebts([]);
    setScreen("welcome");
  };

  return (
    <div
      className="w-full mx-auto rounded-3xl overflow-hidden"
      style={{ maxWidth: 420, minHeight: 720, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)" }}
    >
      {screen === "welcome" && (
        <Welcome onReady={() => setScreen("intro")} onWait={() => setScreen("wait")} />
      )}
      {screen === "wait" && <WaitScreen onBack={() => setScreen("welcome")} />}
      {screen === "intro" && <InventoryIntro onStart={() => setScreen("capture")} />}
      {screen === "capture" && (
        <DebtCapture
          debts={debts}
          setDebts={setDebts}
          onDone={() => setScreen("reveal")}
          onPauseForToday={() => setScreen("paused")}
        />
      )}
      {screen === "paused" && <PausedScreen debts={debts} onResume={() => setScreen("capture")} />}
      {screen === "reveal" && <RealityReveal debts={debts} onContinue={() => setScreen("home")} />}
      {screen === "home" && <TruthPanelTeaser debts={debts} onRestart={reset} />}
    </div>
  );
}
