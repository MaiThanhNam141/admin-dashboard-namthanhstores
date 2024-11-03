import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlYmoqbIkEjR0eGUIYWHrZU9Pv7GLALxU",
  authDomain: "namthanhstores.firebaseapp.com",
  projectId: "namthanhstores",
  storageBucket: "namthanhstores.appspot.com",
  messagingSenderId: "140469949329",
  appId: "1:140469949329:web:23d5ad3c53fd1c079ec030",
  measurementId: "G-KJCE6QXGY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics }