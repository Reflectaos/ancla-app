import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AnclaAppCompleto from "./screens/nivel2-completo/AnclaAppCompleto.jsx";

// Version activa: Nivel 2 completo -> login + onboarding + panel de verdad +
// radar de deudas + conversaciones pendientes + proposito + score de salud
// financiera + modo compartido con pareja + diario + revision semanal.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AnclaAppCompleto />
  </React.StrictMode>
);
