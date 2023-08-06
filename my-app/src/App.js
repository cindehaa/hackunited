import React from "react";
import "./App.css";

import firebase from "firebase/compat/app"; // Firebase SDK
import "firebase/compat/firestore"; // for the database
import "firebase/compat/auth"; // for user authentication

// import hooks (makes it easier to work with Firebase in React)
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// identifies the Firebase project with a JS object
const firebaseConfig = {
  apiKey: "AIzaSyDipF16jp_3rLYT72nSf1o9-C73UHaZcgA",
  authDomain: "react-journaling.firebaseapp.com",
  projectId: "react-journaling",
  storageBucket: "react-journaling.appspot.com",
  messagingSenderId: "68794103502",
  appId: "1:68794103502:web:747b46448f98e89705029f",
  measurementId: "G-CSMVV0G28C"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  // if logged in, useAuthState() returns an object with userID, email, e.t.c
  // otherwise, user is null
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>
        {user ? <MainWebsite /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

function SignOut() {
  // only renders the signOut button if auth.currentUser is true (not null AKA signed in)
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function MainWebsite() {
  return (
  // where we put the code for the journals
    <>
      <h1>Hello</h1>
      <h2>It's journalin' time</h2>
      <header> <SignOut /> </header>
    </>
  );
}

export default App;