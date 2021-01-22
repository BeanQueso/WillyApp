import firebase from 'firebase';
require('@firebase/firestore');
/*import firebase from "firebase/app";
import "firebase/auth";
const auth = firebase.auth()*/
var firebaseConfig = {
    apiKey: "AIzaSyCf23iXzzDduHgAfoxFN1cw1d-ZaqGQKxA",
    authDomain: "willyapp-e842d.firebaseapp.com",
    projectId: "willyapp-e842d",
    storageBucket: "willyapp-e842d.appspot.com",
    messagingSenderId: "31561903345",
    appId: "1:31561903345:web:082610b44469f871b00d50"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();
