const { db } = require("../firebase");

/**
 * Simpan Data Medication yang sudah di scan ke Firestore
 */
async function saveMedicationToFirestore(userId, parsedData) {
  const timestamp = new Date();

  const medicationData = {
    userId,
    namaObat: parsedData["Nama Obat"] || "",
    bahanAktif: parsedData["Bahan Aktif"] || "",
    bentukSediaan: parsedData["Bentuk Sediaan"] || "",
    kekuatanKonsentrasi: parsedData["Kekuatan/Konsentrasi"] || "",
    tanggalKadaluarsa: parsedData["Tanggal Kadaluarsa"] || "",
    petunjukPenyimpanan: parsedData["Petunjuk Penyimpanan"] || "",
    petunjukPenggunaan: parsedData["Petunjuk Penggunaan"] || "",
    peringatanPerhatian: parsedData["Peringatan/Perhatian"] || "",
    produsen: parsedData["Produsen"] || "",
    nomorBatchLot: parsedData["Nomor Batch/Lot"] || "",
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

module.exports = { saveMedicationToFirestore };
