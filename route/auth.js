const express = require('express');
const router = express.Router();
const { auth,db } = require('../firebase');

// RUTE AUTENTIKASI GOOGLE
router.post('/google-login', async (req, res) => {
    const { idToken } = req.body;
  
    try {
      const decoded = await auth.verifyIdToken(idToken);
      const { uid, name, email, picture } = decoded;
  
    
      const userRef = db.collection('users').doc(uid);
      const doc = await userRef.get();
      if (!doc.exists) {
        await userRef.set({
          name,
          email,
          picture,
          // TBA
          createdAt: new Date()
        });
      }
  
      res.status(200).json({ message: 'Login successful', uid, email, name });
    } catch (error) {
      res.status(401).json({ error: 'Invalid ID token', details: error.message });
    }
  });

module.exports = router;