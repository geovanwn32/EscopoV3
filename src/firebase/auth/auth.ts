
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '../config';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (auth: Auth) => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error;
  }
};

export const signUpWithEmail = async (auth: Auth, email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (auth: Auth, email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const sendPasswordResetEmail = async (auth: Auth, email: string) => {
    return firebaseSendPasswordResetEmail(auth, email);
};
