/*
Source:
https://www.youtube.com/watch?v=zQyrwxMPm88
we could implement userIDs if we want it to be a social site
security features are completely forgone for now
*/

import React from "react";
import { useState } from "react";
import { useRef } from "react";
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

const auth = firebase.auth(); // refers to user authentication info
const firestore = firebase.firestore(); // refers to the database being used

function App() {
  // if logged in, useAuthState() returns an object with userID, email, e.t.c
  // otherwise, user is null
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <SignOut />
      </header>
      <section>
        {user ? <MainWebsite /> : <SignIn />}
      </section>
    </div>
  );
}


// the sign in page
function SignIn() {
  // signInWithGoogle stores an instance of GoogleAuthProvider in "provider", then initiates the signup process through a pop-up window
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  // this is done through a button
  return (
    <>
      <h1>WAKE UP IT'S JOURNALIN' TIME</h1>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  );
}


// the sign out page
function SignOut() {
  // only renders the signOut button if auth.currentUser is true (not null, AKA signed in)
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}


// the main website (where the journaling happens)
function MainWebsite() {
  // this value persists between renders
  // it is only used to scroll to the bottom of journal entries
  const dummy = useRef();
  // reference the firestore collection of journal entries
  const journalsRef = firestore.collection("journal-entries");
  // make a query for a subset of documents and order it as needed
  const query = journalsRef.orderBy("createdAt");
  // listens to any updates in real time with a hook
  // returns an array of Objects, where each object is a journal entry in the database
  // the fields in the {} brackets will be included as properties for each object
  const [journals] = useCollectionData(query, {idField: "id"});
  // updates text, title, and mood with hooks
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [mood, setMood] = useState(3);
  // this hook is used to toggle between the "Create New Journal Entry" button and the text fields
  const [create, setCreate] = useState(false);
  const toggleCreate = () => {
    setCreate(!create);
  }


  // sends a journal entry to the Firebase database
  const sendJournalEntry = async(e) => {
    toggleCreate();
    // prevent the page from refreshing
    e.preventDefault();
    // write a new document to the database
    // takes a JS object as an argument
    await journalsRef.add({
      title: title,
      text: text,
      mood: mood,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    // reset the attributes back to their original states
    setTitle("");
    setText("");
    setMood(3);
    // scrolls the window down if the journal is out of view
    dummy.current.scrollIntoView({ behavior: "smooth" });
  }

  // then, render the journal entries if the "journals" array is not null or undefined
  // for each entry in "journals", the JournalEntry component is rendered
  // the key attribute ensures that React can update and re-render the list if needed
  // the "entry" attribute (an object) is passed to the JournalEntry component (it becomes props)
  return (
    <>
      <main>
        {journals && journals.map(entry => <PrintJournalEntry key={entry.id} entry={entry} />)}
        <div ref={dummy}> </div>
      </main>
      <div>
        {create ? (
          <form onSubmit={sendJournalEntry}>
            <div>
              <p>Enter Journal Title:</p>
              <textarea
                value={title}
                style={{ width:"500px" }}
                onChange={(e) => setTitle(e.target.value)}>
              </textarea>
              <p>Enter Journal Text:</p>
              <textarea
                value={text}
                style={{ width:"500px", height:"300px" }}
                onChange={(e) => setText(e.target.value)}>
              </textarea>
              <div>
                <p>How are you feeling?</p>
                <button type="button" onClick={(e) => setMood(1)}>{"1 (depressed)"}</button>
                <button type="button" onClick={(e) => setMood(2)}>{"2 (Sad)"}</button>
                <button type="button" onClick={(e) => setMood(3)}>{"3 (Alright)"}</button>
                <button type="button" onClick={(e) => setMood(4)}>{"4 (Good)"}</button>
                <button type="button" onClick={(e) => setMood(5)}>{"5 (ECSTATIC)"}</button>
                <p>Your mood is a {mood}</p>
              </div>
            </div>
            <button type="submit" onClick={sendJournalEntry}>Submit!</button>
          </form>
        ) : (
          <button onClick={toggleCreate}>Create New Journal Entry</button>
          )}
      </div>
    </>
  )
}

function PrintJournalEntry(props) {
  // props contains the "entry" object (a journal entry, so it has the attributes defined in the Firebase console)
  // "entry" is then destructured to extract its properties
  const { text, title, mood } = props.entry;
  return (
  <>
    <p>----------------------------------------------------------------------------------------------</p>
    <h1>{title}</h1>
    <p>{text}</p>
    <p>I'm feeling a solid {mood} today.</p>
  </>
  )
}

export default App;