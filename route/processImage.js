const express = require("express");
const router = express.Router();
const { auth } = require("../firebase");
const { processMedicationImage } = require("../utils/processMedicationImage");
const { saveMedicationToFirestoreFromText } = require("../utils/saveMedicationToFirestore");

// Main Router untuk scan gambar label obat menggunakan Google Vision OCR + Gemini AI
router.post("/scan-medication", async (req, res) => {
  try {
    const { imageData, language }  = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    // const idToken = authHeader.split(" ")[1];
    // const decodedToken = await auth.verifyIdToken(idToken);
    // const userId = decodedToken.uid;

    if (!imageData) {
      return res.status(400).json({ error: "No image data provided" });
    }

    const base64String = imageData.split(",")[1];

    const { structured, data, rawText } = await processMedicationImage(base64String, language);

    if (!structured) {
      return res.json({ success: true, structured: false, rawText });
    }

    // // // Save the medication data to Firestore
    // const { firestoreId, medicationData } = await saveMedicationToFirestoreFromText(userId, data);

    return res.json({
      success: true,
      structured: true,
      data
      // data: medicationData, -> this is used kalo emg mau ngesave otomatis ke firebase setiap scanning
      // firestoreId, -> buat nge-GET langsung id firebase dari data yang udah dibuat
    });

  } catch (err) {
    console.error("Medication scan error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
module.exports = router;
