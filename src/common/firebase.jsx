import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxIjx51rxWtr70qYIK2sH9jNXso-nEYUs",
  authDomain: "web-mastery-blog-website.firebaseapp.com",
  projectId: "web-mastery-blog-website",
  storageBucket: "web-mastery-blog-website.appspot.com",
  messagingSenderId: "282026780848",
  appId: "1:282026780848:web:49c0e5ec4dda555b4b7375",
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);

// google auth

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;

  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => console.log(err));

  return user;
};
