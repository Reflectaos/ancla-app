import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AnclaAppCompleto from "./screens/partner/AnclaAppCompleto.jsx";

// Version activa: login/registro + onboarding + panel de verdad + radar de
// deudas + proposito + MODO COMPARTIDO CON PAREJA + diario + revision semanal.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AnclaAppCompleto />
  </React.StrictMode>
);
