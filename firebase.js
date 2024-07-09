// Import the functions you need from the SDKs you need
//import * as firebase from "firebase
//import * as firebase from "firebase/app";
import firebase from "firebase/compat/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// cada produto do firebase deve ser importad separadamente
//por exemplo auth de autenticação
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhNLt4oNhIWE6Nh6Sl9_-0hj5p4tgZZx8",

  authDomain: "bancolegal-bcd45.firebaseapp.com",

  projectId: "bancolegal-bcd45",

  storageBucket: "bancolegal-bcd45.appspot.com",

  messagingSenderId: "236193125558",

  appId: "1:236193125558:web:3a202661d192735a274217",

  measurementId: "G-E88PYSXR6S",
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();
export { auth, firestore, storage };
