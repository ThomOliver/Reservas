import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRwnU3INgnFhosjLzwWlgKEFj0McoyAXg",
  authDomain: "reservas-a553f.firebaseapp.com",
  projectId: "reservas-a553f",
  storageBucket: "reservas-a553f.appspot.com",
  messagingSenderId: "5867691418",
  appId: "1:5867691418:web:cc83e91c66d93ea5112e23",
  measurementId: "G-1WHX6YZG4D",
};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
