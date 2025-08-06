// firebaseConfig.ts (ou .js)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA1jDzLZSa53vvTncr-NwS3uZKhBC3hk0Q",
  authDomain: "unicontrol-e4fa0.firebaseapp.com",
  projectId: "unicontrol-e4fa0",
  storageBucket: "unicontrol-e4fa0.firebasestorage.app",
  messagingSenderId: "885085618285",
  appId: "1:885085618285:web:d39ce5cff56d9ace1cbf64",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
