import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth } from 'firebase/auth';
import { app } from '../config';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
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
