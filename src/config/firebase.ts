import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpnE2w32levmkDgKicxjYzg7W5nBeu_Po",
  authDomain: "axon-website-254.firebaseapp.com",
  projectId: "axon-website-254",
  storageBucket: "axon-website-254.firebasestorage.app",
  messagingSenderId: "747492700765",
  appId: "1:747492700765:web:023408ef90bcb67da913b4",
  measurementId: "G-2EL2302K7D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
