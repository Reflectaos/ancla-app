import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración del proyecto ANCLA en Firebase.
// Esta información NO es secreta: la config web de Firebase queda visible
// de todos modos en el código del navegador. La seguridad real vive en las
// reglas de Firestore (ver firestore.rules) y en las reglas de Authentication,
// no en ocultar este objeto.
const firebaseConfig = {
  apiKey: "AIzaSyAsmsXz7FXSwOnCwScU54P283kY7scLo18",
  authDomain: "ancla-app-d4c10.firebaseapp.com",
  projectId: "ancla-app-d4c10",
  storageBucket: "ancla-app-d4c10.firebasestorage.app",
  messagingSenderId: "218992539680",
  appId: "1:218992539680:web:159ea8eeecab474ec26445",
  measurementId: "G-205NGQNDR5",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
