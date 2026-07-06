import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

// ---------------------------------------------------------------------------
// Hook reutilizable para cualquier subcolección bajo users/{uid}/<nombre>.
// Se usa para debts, goals y diaryEntries. Cada usuario solo puede leer y
// escribir su propia subcolección — eso lo garantizan las reglas de
// Firestore (firestore.rules), no este hook.
//
// onSnapshot mantiene los datos sincronizados en tiempo real: si cambias
// algo en un dispositivo, se refleja en otro sin recargar.
// ---------------------------------------------------------------------------
export function useUserCollection(subcollectionName) {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const colRef = collection(db, "users", currentUser.uid, subcollectionName);
    const q = query(colRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error(`Error leyendo ${subcollectionName}:`, error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [currentUser, subcollectionName]);

  const add = async (data) => {
    if (!currentUser) return null;
    const colRef = collection(db, "users", currentUser.uid, subcollectionName);
    const ref = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
    return ref.id;
  };

  const update = async (id, data) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "users", currentUser.uid, subcollectionName, id), data);
  };

  const remove = async (id) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, "users", currentUser.uid, subcollectionName, id));
  };

  return { items, loading, add, update, remove };
}
