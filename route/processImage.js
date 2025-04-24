const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Medication Label Reader API
router.post('/scan-medication', express.json({ limit: '25mb' }), async (req, res) => {
  console.log('=== SCAN MEDICATION ROUTE ACCESSED ===');
  console.log('Request received at:', new Date().toISOString());

  try {
    const hasImageData = !!req.body.imageData;
    console.log('Request body contains:', {
      hasImageData: hasImageData,
      imageDataLength: hasImageData ? req.body.imageData.length : 0,
      otherFields: Object.keys(req.body).filter(key => key !== 'imageData')
    });

    // Check for API key
    
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not defined in environment variables');
    }

    // Check if we have image data
    if (!req.body.imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Initialize the Gemini model
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Extract base64 data
    const parts = req.body.imageData.split(',');
    const base64String = parts[1];
    const mimeType = parts[0].split(':')[1].split(';')[0];
    
    // Prompt Template
    const EnglishPromptTemplate = `
    You are a medication label analyzer. Analyze this medication label image and extract the following information in a structured format:
    
    1. Medication Name
    2. Active Ingredients
    3. Dosage Form (tablet, capsule, liquid, etc.)
    4. Strength/Concentration
    5. Expiration Date
    6. Storage Instructions
    7. Administration Instructions
    8. Warnings/Precautions
    9. Manufacturer
    10. Batch/Lot Number
    
    If any information is not visible or cannot be determined, indicate with "Not found".
    Provide your response in JSON format with these fields.`;
    
    
    // Indonesian prompt
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
    
    const prompt = req.body.customPrompt || 
                  (req.body.language === 'id' ? indonesianPromptTemplate : promptTemplate);
    
    // const prompt = req.body.customPrompt || promptTemplate;

    console.log('Calling Gemini API for medication label analysis...');
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
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
    // console.log('Gemini API call successful');

    // Get the response text
    const response = result.response;
    const text = response.text();
    
    // Try to parse as JSON if possible
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json|``` /g, '').trim();
      const parsedData = JSON.parse(cleanText);
      return res.json({ 
        success: true,
        structured: true,
        data: parsedData,
        // rawText: text
      });
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      console.log('Could not parse response as JSON, returning raw text');
      return res.json({ 
        success: true,
        structured: false,
        data: null,
        // rawText: text
      });
    }

  } catch (error) {
    console.error('Error in medication label scan:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
  }
});

module.exports = router;


// router.post('/image', async (req, res) => {
//   try {
//     const { base64Image, analysisType = 'general', extractionCriteria = null } = req.body;
    
//     if (!base64Image) {
//       return res.status(400).json({ error: 'No image data provided' });
//     }

//     // Create a unique filename
//     const timestamp = Date.now();
//     const randomString = Math.random().toString(36).substring(2, 12);
//     const filename = `image_${timestamp}_${randomString}.jpg`;
//     const imagePath = path.join(uploadDir, filename);
    
//     // Remove data:image/jpeg;base64, prefix if present
//     const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
//     // Save the base64 image to a file
//     await fs.promises.writeFile(imagePath, base64Data, { encoding: 'base64' });
    
//     // Extract text from image using Google Vision
//     const [result] = await visionClient.textDetection(imagePath);
    
//     if (!result.textAnnotations || result.textAnnotations.length === 0) {
//       // Clean up the file if no text was detected
//       await fs.promises.unlink(imagePath);
//       return res.status(422).json({ error: 'No text detected in the image' });
//     }
    
//     // Get the detected text
//     const extractedText = result.textAnnotations[0].description;
    
//     // Process with Gemini if text was extracted
//     let enhancedResult = null;
    
//     if (extractedText && extractedText.trim() !== '') {
//       // Determine the prompt based on analysisType
//       let prompt = '';
      
//       switch (analysisType.toLowerCase()) {
//         case 'summary':
//           prompt = `Summarize the following text extracted from an image using OCR:\n\n${extractedText}\n\nProvide a concise summary of the main points.`;
//           break;
          
//         case 'structure':
//           prompt = `Analyze the structure of the following text extracted from an image using OCR:\n\n${extractedText}\n\nIdentify sections, headings, paragraphs, and lists.`;
//           break;
          
//         case 'form':
//           prompt = `Extract form fields and values from the following text obtained via OCR:\n\n${extractedText}\n\nIdentify form fields and their values.`;
//           break;
          
//         // Medical document specific analysis types
//         case 'medication_label':
//           prompt = `Analyze this text extracted from a medication label or packaging:
          
//           ${extractedText}
          
//           Please identify and organize the following information:
//           1. Medication name
//           2. Active ingredients and amounts
//           3. Dosage instructions
//           4. Expiration date
//           5. Side effects/warnings
//           6. Storage instructions
//           7. Manufacturer information
          
//           Format the information clearly and note if any crucial information appears to be missing.`;
//           break;
          
//         case 'medication_schedule':
//           prompt = `Extract medication scheduling information from this text:
          
//           ${extractedText}
          
//           Please identify:
//           1. Medication name
//           2. Dosage amount
//           3. Frequency (how many times per day)
//           4. Duration (number of days/weeks)
//           5. Special instructions (with food, before/after meals, etc.)
//           6. Start date (if mentioned)
          
//           Format this as structured information for setting up a medication reminder.`;
//           break;
          
//         case 'medical_report':
//           prompt = `Analyze this medical document (likely a lab report or doctor's notes):
          
//           ${extractedText}
          
//           Please:
//           1. Identify the type of document
//           2. Extract patient information (name, ID, date)
//           3. Extract key measurements/results
//           4. Highlight any abnormal values
//           5. Explain any medical terminology in simple language
//           6. Summarize the overall findings in patient-friendly terms
//           7. List any follow-up recommendations
          
//           Aim to make this information easily understandable to a patient.`;
//           break;
          
//         case 'prescription':
//           prompt = `Analyze this prescription:
          
//           ${extractedText}
          
//           Please extract:
//           1. Doctor's name and contact information
//           2. Patient's name
//           3. Date of prescription
//           4. All prescribed medications with:
//              - Name
//              - Dosage
//              - Frequency
//              - Duration
//           5. Special instructions
//           6. Refill information
          
//           Present this in a structured format that could be used to set up medication reminders.`;
//           break;
          
//         default: // general
//           prompt = `Analyze and enhance the following text extracted from an image using OCR:\n\n${extractedText}\n\n1. Correct any obvious OCR errors\n2. Fix formatting issues\n3. Provide a clean, well-structured version of the text\n4. Identify the type of document this appears to be`;
//           break;
//       }
      
//       // Process with Gemini
//       const geminiResult = await model.generateContent(prompt);
//       enhancedResult = geminiResult.response.text();
      
//       // If extraction criteria was provided, extract specific information
//       if (extractionCriteria && Array.isArray(extractionCriteria) && extractionCriteria.length > 0) {
//         // Create a specialized prompt based on what we're extracting
//         let criteriaPrompt = '';
        
//         // Detect if this is a medication-related extraction
//         const isMedicationRelated = extractionCriteria.some(
//           criteria => criteria.toLowerCase().includes('medication') || 
//                      criteria.toLowerCase().includes('dosage') ||
//                      criteria.toLowerCase().includes('ingredient') ||
//                      criteria.toLowerCase().includes('expiration')
//         );
        
//         const isLabRelated = extractionCriteria.some(
//           criteria => criteria.toLowerCase().includes('test') || 
//                      criteria.toLowerCase().includes('result') ||
//                      criteria.toLowerCase().includes('level') ||
//                      criteria.toLowerCase().includes('range')
//         );
        
//         if (isMedicationRelated) {
//           criteriaPrompt = `From this medication label or prescription text, please extract the following specific information:
          
//           ${extractionCriteria.map(c => `- ${c}`).join('\n')}
          
//           Text from image:
//           ${extractedText}
          
//           For each item, provide the extracted information in a clear format. If any item cannot be found, indicate "Not found" and suggest where the patient might look for this information.
          
//           Return the results in a patient-friendly format.`;
//         } else if (isLabRelated) {
//           criteriaPrompt = `From this medical report or lab result, please extract the following specific information:
          
//           ${extractionCriteria.map(c => `- ${c}`).join('\n')}
          
//           Text from image:
//           ${extractedText}
          
//           For each item:
//           1. Provide the extracted value/information
//           2. Indicate if the value is normal, high, or low (if applicable)
//           3. Explain in simple terms what this value means
          
//           Make the explanation patient-friendly and easy to understand.`;
//         } else {
//           criteriaPrompt = `From the following text extracted via OCR, extract only these specific pieces of information:
          
//           ${extractionCriteria.map(c => `- ${c}`).join('\n')}
          
//           Text:
//           ${extractedText}
          
//           For each item, provide the extracted information. If any item cannot be found, indicate "Not found".`;
//         }
        
//         const extractionResult = await model.generateContent(criteriaPrompt);
//         const extractedInfo = extractionResult.response.text();
        
//         // Return complete result
//         return res.json({
//           success: true,
//           originalText: extractedText,
//           enhancedText: enhancedResult,
//           extractedInfo: extractedInfo,
//           imagePath: filename,
//           documentType: analysisType
//         });
//       }
//     }
    
//     // Return results
//     res.json({
//       success: true,
//       originalText: extractedText,
//       enhancedText: enhancedResult,
//       imagePath: filename,
//       documentType: analysisType
//     });
    
//   } catch (error) {
//     console.error('Error processing image:', error);
//     res.status(500).json({ 
//       error: 'Failed to process image', 
//       details: error.message 
//     });
//   }
// });


// router.post('/read-aloud', async (req, res) => {
//   try {
//     const { text, category } = req.body;
    
//     if (!text) {
//       return res.status(400).json({ error: 'No text provided' });
//     }
    
//     // Create a more conversational, easy-to-understand version of the text
//     // that would be appropriate for text-to-speech
//     let prompt = '';
    
//     if (category) {
//       // Format based on the specific category
//       switch (category.toLowerCase()) {
//         case 'expiration_date':
//           prompt = `Rewrite this medication expiration information in a clear, conversational way that would sound natural when read aloud:
          
//           ${text}
          
//           Focus only on the expiration date information.`;
//           break;
          
//         case 'ingredients':
//           prompt = `Rewrite this medication ingredients information in a clear, conversational way that would sound natural when read aloud:
          
//           ${text}
          
//           Make it easy to understand with proper pauses and pronunciation guidance for technical terms.`;
//           break;
          
//         case 'usage_instructions':
//           prompt = `Rewrite these medication usage instructions in a clear, conversational way that would sound natural when read aloud:
          
//           ${text}
          
//           Make sure to emphasize important warnings or precautions.`;
//           break;
          
//         case 'side_effects':
//           prompt = `Rewrite these medication side effects in a clear, conversational way that would sound natural when read aloud:
          
//           ${text}
          
//           Distinguish between common side effects and those requiring medical attention.`;
//           break;
          
//         default:
//           prompt = `Rewrite this medication information in a clear, conversational way that would sound natural when read aloud:
          
//           ${text}`;
//           break;
//       }
//     } else {
//       prompt = `Rewrite this text in a clear, conversational way that would sound natural when read aloud:
      
//       ${text}
      
//       Simplify any complex terms and structure it with natural pauses.`;
//     }
    
//     // Process with Gemini
//     const geminiResult = await model.generateContent(prompt);
//     const ttsText = geminiResult.response.text();
    
//     res.json({
//       success: true,
//       originalText: text,
//       ttsText: ttsText,
//       category: category || 'general'
//     });
    
//   } catch (error) {
//     console.error('Error creating TTS text:', error);
//     res.status(500).json({ 
//       error: 'Failed to process text for speech', 
//       details: error.message 
//     });
//   }
// });

module.exports = router;




