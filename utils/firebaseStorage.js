const { storage } = require('../firebase');
const { ref, uploadString, getDownloadURL } = require('firebase/storage');

/**
 * Upload a base64 image to Firebase Storage
 * @param {string} userId - The user ID to associate with the image
 * @param {string} base64Image - The base64 image data to upload
 * @param {string} medicationName - The name of the medication (for filename)
 * @returns {Promise<Object>} - Object containing download URL and storage path
 */
async function uploadMedicationImage(userId, base64Image, medicationName) {
  try {
    // Create a safe filename
    const timestamp = Date.now();
    const safeFilename = medicationName
      ? `${medicationName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}`
      : `medication_${timestamp}`;
    
    // Storage path: users/{userId}/medications/{filename}
    const storagePath = `users/${userId}/medications/${safeFilename}.jpg`;
    
    // Create a reference to the storage location
    const storageRef = ref(storage, storagePath);
    
    // Remove the data URL prefix if present (data:image/jpeg;base64,)
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;
    
    // Upload the image
    await uploadString(storageRef, base64Data, 'base64');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      downloadURL,
      storagePath
    };
  } catch (error) {
    console.error('Error uploading medication image to Firebase:', error);
    throw error;
  }
}

module.exports = {
  uploadMedicationImage
}; 