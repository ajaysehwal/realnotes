import * as admin from "firebase-admin";
import * as path from "path";
import dotenv from "dotenv";
dotenv.config();
const serviceAccountPath = path.resolve(__dirname, "../../firebase.json");

let firebaseApp: admin.app.App;
try {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
} catch (error) {
  if (admin.apps.length) {
    firebaseApp = admin.app();
    console.log("Firebase Admin SDK already initialized");
  } else {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
}

export const db = firebaseApp.database();
export const auth = firebaseApp.auth();
