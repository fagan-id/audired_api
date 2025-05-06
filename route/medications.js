const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const verifyToken = require("../utils/verifyToken");
const { saveMedicationToFirestoreFromJSON, saveMedicationToFirestoreFromText } = require("../utils/saveMedicationToFirestore");


const COLLECTION_NAME = 'medications';

// Get all medications
router.get('/my',verifyToken, async (req, res) => {
    try{
        const userId = req.user?.uid;
        if(!userId){
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const medicationList = await db.collection("users").doc(userId).collection(COLLECTION_NAME).get();

        const medications = medicationList.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.json({
            success: true,
            data: medications
        });
    }
    catch(error){
        console.error('Error fetching medications:', error);
        res.status(500).json({ error: 'Failed to fetch medications' });
    }
});
// Get a medication by id
router.get('/my/:id',verifyToken, async (req, res) => {
    try{
        const userId = req.user?.uid;
        if(!userId){
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const medicationId = req.params.id;
        const medicationDoc = await db.collection("users").doc(userId).collection(COLLECTION_NAME).doc(medicationId).get();

        if(!medicationDoc.exists){
            return res.status(404).json({ error: 'Medication not found' });
        }
        
        return res.json({
            success: true,
            data: medicationDoc.data()
        });
    }
    catch(error){
        console.error('Error fetching medication:', error);
        res.status(500).json({ error: 'Failed to fetch medication' });
    }
});

// Create Medication
router.post("/my/create", verifyToken, async (req, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      const medicationData = req.body;
      const {firestoreId, data} = await saveMedicationToFirestoreFromText(userId, medicationData);
  
      return res.json({
        success: true,
        structured: true,
        data: data,
        firestoreId,
      });
    } catch (error) {
      console.error("Error creating medication:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

// Update Medication

// Delete Medication
router.delete("/my/:id",verifyToken, async (req, res) => {
    try{
        const userId = req.user?.uid;
        if(!userId){
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const medicationId = req.params.id;
        const medicationDoc = await db.collection("users").doc(userId).collection(COLLECTION_NAME).doc(medicationId).get();

        if(!medicationDoc.exists){
            return res.status(404).json({ error: 'Medication not found' });
        }

        await db.collection("users").doc(userId).collection(COLLECTION_NAME).doc(medicationId).delete();

        return res.json({
            success: true,
            message: 'Medication deleted successfully'
        });
    }
    catch(error){
        console.error('Error deleting medication:', error);
        res.status(500).json({ error: 'Failed to delete medication' });
    }
});

module.exports = router;