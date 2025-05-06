// utils/processMedicationImage.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const vision = require("@google-cloud/vision");
const { cleanJsonResponse } = require("./cleanJsonResponse");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 * Proses Gambar Label Obat pake Google Vision OCR + Gemini AI untuk nge extract data
 */
async function processMedicationImage(base64String, language = "id", customPrompt = null) {
  const [visionResult] = await visionClient.annotateImage({
    image: { content: base64String },
    features: [{ type: "TEXT_DETECTION" }],
  });

  if (!visionResult.fullTextAnnotation) {
    throw new Error("No text detected in the image");
  }

  const extractedText = visionResult.fullTextAnnotation.text;

  // Build the prompt
  const prompt = customPrompt || (language === "id"
    ? getIndonesianPrompt(extractedText)
    : getEnglishPrompt(extractedText));

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  });

  const rawText = result.response.text();
  const cleaned = cleanJsonResponse(rawText);
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : cleaned;

  try {
    return { structured: true, data: JSON.parse(jsonText), rawText };
  } catch (err) {
    return { structured: false, data: null, rawText };
  }
}

function getEnglishPrompt(text) {
  return `You are a drug label analysis tool and a smart, proactive healthcare professional. Analyze the following text extracted from drug labels using OCR:
        
        OCR TEXT:
        ${text}
        
        Please extract the following information in a structured format:
        1. Drug Name
        2. Active Ingredient
        3. Dosage Form (tablet, capsule, syrup, etc.)
        4. Strength/Concentration
        5. Expiration Date
        6. Storage Instructions
        7. Directions for Use
        8. Warnings/Cautions
        9. Manufacturer
        10. Batch/Lot Number
        11. Description of Drug Use

        Important rules when filling:
        - If information is visible in the OCR text, take it from there.
        - If information is not visible/found, search and use your knowledge of the drug to reasonably estimate the information.
        - If you have low confidence or no information at all, fill in “Not found”.

        For the Description of Drug Use, make a short, clear, and easy-to-understand description based on the type of drug and its active ingredient. Use a format like the following example:  
        *"This medicine is [type of medicine] used for [intended use]. Use [number of doses] times a day, after/before meals as directed by your doctor. “*

        Responses are only in neat JSON format with those fields.`;
}

function getIndonesianPrompt(text) {
  return `Anda adalah alat analisis label obat dan seorang ahli kesehatan yang cerdas dan proaktif. Analisis teks berikut yang diekstrak dari label obat menggunakan OCR:
      
      TEKS OCR:
      ${text}
      
      Harap ekstrak informasi berikut dalam format terstruktur:
      1. Nama Obat
      2. Bahan Aktif
      3. Jenis Obat (tablet, kapsul, sirup, dll)
      4. Kekuatan/Konsentrasi
      5. Tanggal Kadaluarsa
      6. Petunjuk Penyimpanan
      7. Aturan Pakai
      9. Produsen
      10.Peringatan/Perhatian
      11. Deskripsi Penggunaan Obat

      Aturan penting saat mengisi:
      - Jika informasi terlihat di teks OCR, ambil dari sana.
      - Jika informasi tidak terlihat/ditemukan, carilah dan gunakan pengetahuan anda!! tentang obat tersebut untuk memperkirakan informasi secara wajar.
      - Jika Anda memiliki keyakinan rendah atau tidak ada informasi sama sekali, isi dengan "Tidak ditemukan".
      - Untuk Kolom "Aturan Pakai" memiliki template dengan contoh seperti : 3-4 Kali Sehari, Sesudah Makan

      Untuk Deskripsi Penggunaan Obat, buatlah deskripsi singkat, jelas, dan mudah dipahami berdasarkan jenis obat dan bahan aktifnya. Gunakan format seperti contoh berikut:  
      *"Obat ini adalah [jenis obat] yang digunakan untuk [tujuan penggunaan]. Gunakan [jumlah dosis] kali sehari, setelah/sebelum makan sesuai petunjuk dokter."*

      Respons hanya dalam format JSON rapi dengan bidang-bidang tersebut.`;
}

module.exports = { processMedicationImage };
