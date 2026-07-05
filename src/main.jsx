import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AnclaAppFirebase from "./screens/firebase-connected/AnclaAppFirebase.jsx";

// Version activa: CONECTADA A FIREBASE de verdad.
// Auth real (Firebase Authentication) + datos persistentes por usuario
// (Firestore): deudas, metas, diario, pareja y racha ya no se pierden
// al recargar la pagina.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AnclaAppFirebase />
  </React.StrictMode>
);
