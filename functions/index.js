const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

// ---------------------------------------------------------------------------
// Reinicia `reviewCompletedThisWeek` a false para todos los usuarios, una
// vez por semana. Resuelve la deuda técnica documentada desde v1.0 en
// ESPECIFICACION_TECNICA.md, sección 9, punto 2.
//
// Corre cada lunes 00:05 hora de Ciudad de México. Ajusta `timeZone` si tu
// base de usuarios está en otra zona horaria predominante.
// ---------------------------------------------------------------------------
exports.resetWeeklyReview = onSchedule(
  { schedule: "5 0 * * 1", timeZone: "America/Mexico_City" },
  async () => {
    const db = getFirestore();
    const snapshot = await db
      .collection("users")
      .where("reviewCompletedThisWeek", "==", true)
      .get();

    if (snapshot.empty) {
      console.log("Nadie tenía la revisión marcada como completada. Nada que hacer.");
      return;
    }

    // Firestore permite hasta 500 escrituras por batch.
    const batches = [];
    let batch = db.batch();
    let count = 0;

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { reviewCompletedThisWeek: false });
      count++;
      if (count % 500 === 0) {
        batches.push(batch.commit());
        batch = db.batch();
      }
    });
    batches.push(batch.commit());

    await Promise.all(batches);
    console.log(`Revisión semanal reiniciada para ${snapshot.size} usuarios.`);
  }
);
