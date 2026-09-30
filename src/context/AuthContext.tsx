import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testFirestoreConnection } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Upsert user profile to Firestore
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0],
              photoURL: user.photoURL || '',
              role: 'Human Capital Officer',
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn('Could not sync user profile to Firestore:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  // Google Login / Sign Up via Popup (Pre-configured by Firebase)
  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setError(err.message || 'Google authentication failed.');
      throw err;
    }
  };

  // Email / Password Login
  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email Sign In failed:', err);
      let msg = err.message || 'Failed to sign in.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password provider is not yet enabled in Firebase Console. Please use "Sign in with Google" or enable it in Console.';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  // Email / Password Sign Up
  const signupWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
    } catch (err: any) {
      console.error('Email Sign Up failed:', err);
      let msg = err.message || 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password provider is not yet enabled in Firebase Console. Please use "Sign in with Google".';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  // Logout
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
