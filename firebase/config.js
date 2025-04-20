import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore'; // 👈 Agregado

const firebaseConfig = {
  apiKey: "AIzaSyDBWnXK0cN7Dx0qR7BJRspwZA-cJD9pTWs",
  authDomain: "m3reporteapp.firebaseapp.com",
  databaseURL: "https://m3reporteapp-default-rtdb.firebaseio.com",
  projectId: "m3reporteapp",
  storageBucket: "m3reporteapp.firebasestorage.app",
  messagingSenderId: "861392573364",
  appId: "1:861392573364:web:26dd200958376a172258e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app); // 👈 Agregado

export { auth, database, firestore }; // 👈 Agregado firestore
