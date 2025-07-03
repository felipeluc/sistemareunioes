import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA82SCTdpkMEAnir63lwuEf0A2Wu2dAhAQ",
  authDomain: "sistemareuniao.firebaseapp.com",
  projectId: "sistemareuniao",
  storageBucket: "sistemareuniao.appspot.com",
  messagingSenderId: "509650784087",
  appId: "1:509650784087:web:140e26fd7dcc2ef89df812"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
