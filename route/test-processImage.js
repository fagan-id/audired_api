// test-imageProcess.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

// Load an example image
function loadTestImage() {
  try {
    // Path to your test image - adjust this path
    const imagePath = path.join(__dirname, 'test-Image.jpg');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error('Error loading test image:', error);
    return null;
  }
}

// This function simulates what happens in your route handler
async function testMedicationScan() {
  console.log('=== TEST MEDICATION SCAN STARTED ===');
  console.log('Test started at:', new Date().toISOString());

  try {
    // Check for API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not defined in environment variables');
    }

    // Get test image data
    const imageData = loadTestImage();
    if (!imageData) {
      throw new Error('Failed to load test image');
    }

    // Initialize the Gemini model
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Extract base64 data
    const parts = imageData.split(',');
    const base64String = parts[1];
    const mimeType = parts[0].split(':')[1].split(';')[0];
    
    // Prompt Template (same as in your router)
    const promptTemplate = `
    Anda adalah alat analisis label obat dan seorang ahli kesehatan. Analisis gambar label obat ini dan ekstrak informasi berikut dalam format terstruktur:

    1. Nama Obat
    2. Bahan Aktif
    3. Bentuk Sediaan (tablet, kapsul, sirup, dll)
    4. Kekuatan/Konsentrasi
    5. Tanggal Kadaluarsa
    6. Petunjuk Penyimpanan
    7. Petunjuk Penggunaan
    8. Peringatan/Perhatian
    9. Produsen
    10. Nomor Batch/Lot
    11. Deskripsi(Buatlah Deskripsi Penggunaan Obat Yang Jelas dan Mudah Dipahami, Contoh : "Obat Diatas adalah... Gunakan Obat ini Untuk .... dipakai ... kali sehari, setelah/sebelum makan ...") 

    Jika ada informasi yang tidak terlihat atau tidak dapat ditentukan, tunjukkan dengan "Tidak ditemukan".
    Berikan respons Anda dalam format JSON dengan bidang-bidang ini.`;
    
    console.log('Calling Gemini API for medication label analysis...');
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: promptTemplate },
            {
              inlineData: {
                data: base64String,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      }
    });
    console.log('Gemini API call successful');

    // Get the response text
    const response = result.response;
    const text = response.text();
    
    // Log the raw response text
    console.log('\n=== RAW RESPONSE TEXT ===');
    console.log(text);
    console.log('=== END RAW RESPONSE TEXT ===\n');
    
    // Try to parse as JSON if possible
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json|```/g, '').trim();
      console.log('\n=== CLEANED TEXT (AFTER REMOVING MARKDOWN) ===');
      console.log(cleanText);
      console.log('=== END CLEANED TEXT ===\n');
      
      const parsedData = JSON.parse(cleanText);
      console.log('\n=== SUCCESSFULLY PARSED JSON ===');
      console.log(JSON.stringify(parsedData, null, 2));
      console.log('=== END PARSED JSON ===\n');
      
      return { 
        success: true,
        structured: true,
        data: parsedData,
        rawText: text
      };
    } catch (parseError) {
      // If JSON parsing fails, log the error
      console.log('\n=== JSON PARSING ERROR ===');
      console.log('Error type:', parseError.name);
      console.log('Error message:', parseError.message);
      console.log('Error at position:', parseError.position);
      console.log('=== END JSON PARSING ERROR ===\n');
      
      return { 
        success: true,
        structured: false,
        data: null,
        rawText: text
      };
    }

  } catch (error) {
    console.error('\n=== ERROR IN TEST ===');
    console.error(error);
    console.error('=== END ERROR ===\n');
    
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

// Run the test
testMedicationScan()
  .then(result => {
    console.log('\n=== FINAL RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('=== END FINAL RESULT ===\n');
  })
  .catch(error => {
    console.error('Test failed:', error);
  });