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
import { LEGAL_VERSION } from "../legal/legalContent";

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
        // Evidencia de consentimiento: el checkbox de Aviso de Privacidad y
        // Términos de Servicio es obligatorio en el registro (SignupScreen),
        // así que si llegamos aquí, ya se aceptó. Se guarda versión y fecha
        // por si el documento legal cambia más adelante.
        legalAcceptedVersion: LEGAL_VERSION,
        legalAcceptedAt: serverTimestamp(),
      });
      // Correo de verificación — no bloquea el registro, solo se envía.
      // La app decide más adelante (VerifyEmailScreen) si lo recuerda o no.
      await sendEmailVerification(cred.user);
      return true;
    } catch (e) {
      setAuthError(mapFirebaseError(e.code));
      return false;
    }
  };

  // Reenvía el correo de verificación al usuario actual. Útil si el primer
  // correo se fue a spam o expiró.
  const resendVerification = async () => {
    setAuthError("");
    try {
      if (!auth.currentUser) return false;
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (e) {
      setAuthError(mapFirebaseError(e.code));
      return false;
    }
  };

  // Recarga el usuario desde Firebase para reflejar si ya verificó su correo
  // (emailVerified no se actualiza solo en el objeto local hasta que se
  // recarga explícitamente). Se reasigna como objeto plano nuevo para que
  // React detecte el cambio de referencia y vuelva a renderizar.
  const refreshUser = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setCurrentUser({ ...auth.currentUser });
  };

  // Envía el correo de "restablecer contraseña" de Firebase. No revela si
  // el correo existe o no en la respuesta visible al usuario, por seguridad.
  const resetPassword = async (email) => {
    setAuthError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (e) {
      setAuthError(mapFirebaseError(e.code));
      return false;
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        login,
        signup,
        logout,
        authError,
        setAuthError,
        resendVerification,
        refreshUser,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
