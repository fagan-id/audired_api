// firebase-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./keys/firebaseAccountKey.json');
const { getFirestore } = require('firebase-admin/firestore'); //


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { auth, db };
