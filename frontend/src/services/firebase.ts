import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB8AhUEewIrdTiEtvwHsgsiMmCjt9Jpcyg",
  authDomain: "realnotes-75c1d.firebaseapp.com",
  databaseURL: "https://realnotes-75c1d-default-rtdb.firebaseio.com",
  projectId: "realnotes-75c1d",
  storageBucket: "realnotes-75c1d.appspot.com",
  messagingSenderId: "948568520133",
  appId: "1:948568520133:web:2e9e8c96cea87b632ec7ac",
  measurementId: "G-8C65Q109TH"
};

const app = initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const firestore = getFirestore(app);
