const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountPath = path.resolve(
  __dirname,
  "./serviceAccountKey.json"
);

let db = null;

if (!admin.apps.length) {
  if (!fs.existsSync(serviceAccountPath)) {
    console.warn(
      "serviceAccountKey.json not found. Firebase-backed features will be unavailable."
    );
  } else {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase initialized");
  }
}

if (admin.apps.length) {
  db = admin.firestore();
}

module.exports = {
  admin,
  db,
};
