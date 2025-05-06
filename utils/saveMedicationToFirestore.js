const { db } = require("../firebase");

/**
 * Simpan Data Medication yang sudah di scan dalam bentuk Json STRING ke Firestore
 */
async function saveMedicationToFirestoreFromText(userId, parsedData) {
  const timestamp = new Date();

  const medicationData = {
    userId,
    namaObat: parsedData["Nama Obat"] || "",
    bahanAktif: parsedData["Bahan Aktif"] || "",
    jenisObat: parsedData["Jenis Obat"] || "",
    kekuatanKonsentrasi: parsedData["Kekuatan/Konsentrasi"] || "",
    tanggalKadaluarsa: parsedData["Tanggal Kadaluarsa"] || "",
    petunjukPenyimpanan: parsedData["Petunjuk Penyimpanan"] || "",
    aturanPakai: parsedData["Aturan Pakai"] || "",
    peringatanPerhatian: parsedData["Peringatan/Perhatian"] || "",
    produsen: parsedData["Produsen"] || "",
    deskripsiPenggunaanObat: parsedData["Deskripsi Penggunaan Obat"] || "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const docRef = await db
    .collection("users")
    .doc(userId)
    .collection("medications")
    .add(medicationData);

  return { firestoreId: docRef.id, medicationData };
}

/**
 * Simpan Data Medication yang sudah di scan dalam bentuk StructuredObject ke Firestore
 */
async function saveMedicationToFirestoreFromJSON(userId, parsedData) {
  const timestamp = new Date();

  const medicationData = {
    userId,
    namaObat: parsedData.namaObat || "",
    bahanAktif: parsedData.bahanAktif || [],
    jenisObat: parsedData.jenisObat || "",
    kekuatanKonsentrasi: parsedData.kekuatanKonsentrasi || "",
    tanggalKadaluarsa: parsedData.tanggalKadaluarsa || "",
    petunjukPenyimpanan: parsedData.petunjukPenyimpanan || "",
    aturanPakai: parsedData.aturanPakai || "",
    peringatanPerhatian: parsedData.peringatanPerhatian || "",
    produsen: parsedData.produsen || "",
    deskripsiPenggunaanObat: parsedData.deskripsiPenggunaanObat || "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const docRef = await db
    .collection("users")
    .doc(userId)
    .collection("medications")
    .add(medicationData);

  return { firestoreId: docRef.id, medicationData };
}


module.exports = { saveMedicationToFirestoreFromText, saveMedicationToFirestoreFromJSON };
