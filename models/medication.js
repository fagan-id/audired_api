const { db } = require("../firebase");

// Medication Model Example Output : 
// {
//     "Nama Obat": "Counterpain",
//     "Bahan Aktif": "Methyl Salicylate, Menthol, Eugenol",
//     "Bentuk Sediaan": "Krim/Salep",
//     "Kekuatan/Konsentrasi": "Methyl Salicylate 102 mg, Menthol 54.4 mg, Eugenol 13.6 mg per gram",
//     "Tanggal Kadaluarsa": "Tidak ditemukan",
//     "Petunjuk Penyimpanan": "Simpan di tempat sejuk dan kering, jauh dari jangkauan anak-anak.",
//     "Petunjuk Penggunaan": "Oleskan Counterpain pada area yang sakit dan gosokkan secara merata. Gunakan 1-3 kali sehari sesuai kebutuhan.",
//     "Peringatan/Perhatian": "Hanya untuk pemakaian luar. Hindari kontak dengan mata dan selaput lendir. Jangan gunakan pada luka terbuka atau kulit yang teriritasi. Hentikan penggunaan jika terjadi iritasi. Konsultasikan dengan dokter jika kondisi memburuk atau berlangsung lebih dari 7 hari.",
//     "Produsen": "Tidak ditemukan",
//     "Nomor Batch/Lot": "Tidak ditemukan",
//     "Deskripsi Penggunaan Obat": "Obat ini adalah analgesik topikal yang digunakan untuk meredakan nyeri otot dan sendi, seperti nyeri akibat keseleo, memar, atau arthritis. Gunakan pada area yang sakit 1-3 kali sehari sesuai kebutuhan."
// }

class Medication {
  /**
   * Constructor untuk Medication model
   * @param {Object} data - Data obat
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.namaObat = data.namaObat || '';
    this.bahanAktif = data.bahanAktif || '';
    this.bentukSediaan = data.bentukSediaan || '';
    this.kekuatanKonsentrasi = data.kekuatanKonsentrasi || '';
    this.tanggalKadaluarsa = data.tanggalKadaluarsa || '';
    this.petunjukPenyimpanan = data.petunjukPenyimpanan || '';
    this.petunjukPenggunaan = data.petunjukPenggunaan || '';
    this.peringatanPerhatian = data.peringatanPerhatian || '';
    this.produsen = data.produsen || '';
    this.nomorBatchLot = data.nomorBatchLot || '';
    this.deskripsiPenggunaanObat = data.deskripsiPenggunaanObat || '';
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

    static async saveMedication(medicationData) {
        const medication = new Medication(medicationData);
        await medication.save();
        return medication;
    }
}
