import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

// ---------------------------------------------------------------------------
// Hook para el documento users/{uid} — datos que no son una lista, sino
// un solo objeto por usuario: nombre, correo, estado de Modo Compartido,
// racha, y si ya completó su revisión semanal.
// ---------------------------------------------------------------------------
const defaultPartner = { status: "none", name: "", email: "", sharing: { debts: false, purpose: false, panel: false, diary: false } };

export function useUserDoc() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setData(null);
      setLoading(false);
      return;
    }
    const ref = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      const raw = snap.data() || {};
      setData({
        partner: raw.partner || defaultPartner,
        streak: typeof raw.streak === "number" ? raw.streak : 1,
        reviewCompletedThisWeek: !!raw.reviewCompletedThisWeek,
        ...raw,
      });
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  const update = async (partial) => {
    if (!currentUser) return;
    await setDoc(doc(db, "users", currentUser.uid), { ...partial, updatedAt: serverTimestamp() }, { merge: true });
  };

  return { data, loading, update };
}
