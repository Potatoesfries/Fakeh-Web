import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD28wJK7_cBzKSLQ_llgSa_FmR_lQmHur0",
  authDomain: "lostandfoundapp-aba62.firebaseapp.com",
  databaseURL: "https://lostandfoundapp-aba62-default-rtdb.firebaseio.com", // Updated with the correct URL
  projectId: "lostandfoundapp-aba62",
  storageBucket: "lostandfoundapp-aba62.appspot.com",
  messagingSenderId: "1046779342647",
  appId: "1:1046779342647:web:a2cab430e4bb56d74c34b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);