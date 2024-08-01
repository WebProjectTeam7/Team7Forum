import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDkOrQCDPyDUmsULm-BwTtpbfHFOSLBKTU",
  authDomain: "forum-eebfb.firebaseapp.com",
  projectId: "forum-eebfb",
  storageBucket: "forum-eebfb.appspot.com",
  messagingSenderId: "1083613280640",
  appId: "1:1083613280640:web:f21a7f4ea3821a0e48a965",
  databaseURL:
    "https://forum-eebfb-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// the Firebase authentication handler
export const auth = getAuth(app);
// the Realtime Database handler
export const db = getDatabase(app);
