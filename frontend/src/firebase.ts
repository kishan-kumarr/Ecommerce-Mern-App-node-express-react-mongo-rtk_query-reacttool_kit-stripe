import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration

// console.log(import.meta.env);

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_KEY,
//   authDomain: import.meta.env.VITE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_APP_ID
// };



const firebaseConfig = {
  apiKey: "AIzaSyBblX-blv-MZCW27lKoznAZEBfH-yT1blI",
  authDomain: "mern-eccomerce-1st.firebaseapp.com",
  projectId: "mern-eccomerce-1st",
  storageBucket: "mern-eccomerce-1st.appspot.com",
  messagingSenderId: "25763635238",
  appId: "1:25763635238:web:9df058152030d45216c6e7"
};



// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);