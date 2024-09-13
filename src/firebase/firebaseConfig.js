// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  //main
  // apiKey: "AIzaSyC4IICM-BTOhbcbRteWnyZIqc8b61zvmpY",
  // authDomain: "aquarizz-9687c.firebaseapp.com",
  // projectId: "aquarizz-9687c",
  // storageBucket: "aquarizz-9687c.appspot.com",
  // messagingSenderId: "876015324611",
  // appId: "1:876015324611:web:5475e022b55d50feea0176"
  //demo
  // apiKey: "AIzaSyAch9jfDjzNNOAZtRl4GytrBftFmSjI-7I",
  // authDomain: "aquarizzdemo.firebaseapp.com",
  // projectId: "aquarizzdemo",
  // storageBucket: "aquarizzdemo.appspot.com",
  // messagingSenderId: "722399183052",
  // appId: "1:722399183052:web:9fcfaf474d7762c414c269",

  // new db
  apiKey: "AIzaSyAZUMKuIPiUMDB2vi-bijvSZ9W0ABPbjeU",
  authDomain: "aquarizz-social.firebaseapp.com",
  projectId: "aquarizz-social",
  storageBucket: "aquarizz-social.appspot.com",
  messagingSenderId: "195824797217",
  appId: "1:195824797217:web:a79d2db6a25585df114560",
  measurementId: "G-V5P0PRJ7XK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
