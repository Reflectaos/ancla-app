import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

// ---------------------------------------------------------------------------
// Este archivo reemplaza al mock de autenticación de los prototipos
// anteriores. La forma de usarlo desde los componentes NO cambia:
// useAuth() sigue devolviendo { currentUser, login, signup, logout,
// authError, setAuthError }. Solo cambió lo que hay adentro.
// ---------------------------------------------------------------------------

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function mapFirebaseError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Ese correo no es válido.";
    case "auth/user-not-found":
      return "No encontramos una cuenta con ese correo.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con ese correo.";
    case "auth/weak-password":
      return "La contraseña necesita al menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento y vuelve a intentar.";
    case "auth/missing-email":
      return "Escribe tu correo primero.";
    default:
      return "Algo salió mal. Intenta de nuevo.";
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    // onAuthStateChanged mantiene la sesión activa entre recargas: si el
    // usuario ya inició sesión antes, no tiene que volver a hacerlo.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (e) {
      setAuthError(mapFirebaseError(e.code));
      return false;
    }
  };

  const signup = async (name, email, password) => {
    setAuthError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() || "Tú" });
      // Documento de usuario en Firestore — aquí también viven luego
      // el estado de pareja y de revisión semanal (ver useUserDoc).
      await setDoc(doc(db, "users", cred.user.uid), {
        name: name.trim() || "Tú",
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
      });
      // No bloqueamos el registro si el envío del correo falla (p. ej. sin
      // internet un instante) — el usuario puede pedirlo de nuevo desde
      // la pantalla de "Verifica tu correo".
      try { await sendEmailVerification(cred.user); } catch (e) { /* no crítico */ }
      return true;
    } catch (e) {
      setAuthError(mapFirebaseError(e.code));
      return false;
    }
  };

  const logout = () => signOut(auth);

  const resendVerification = async () => {
    if (!auth.currentUser) return false;
    try { await sendEmailVerification(auth.currentUser); return true; } catch (e) { setAuthError(mapFirebaseError(e.code)); return false; }
  };

  const resetPassword = async (email) => {
    setAuthError("");
    try { await sendPasswordResetEmail(auth, email.trim()); return true; } catch (e) { setAuthError(mapFirebaseError(e.code)); return false; }
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    // reload() no dispara onAuthStateChanged por sí solo — forzamos el
    // refresco del estado local para que emailVerified se actualice en UI,
    // y devolvemos el valor fresco directamente (no depender de que el
    // componente vuelva a renderizar antes de leerlo sería una condición
    // de carrera de UI).
    const fresh = auth.currentUser;
    setCurrentUser({ ...fresh });
    return fresh.emailVerified;
  };

  return (
    <AuthContext.Provider value={{ currentUser, authLoading, login, signup, logout, authError, setAuthError, resendVerification, resetPassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
