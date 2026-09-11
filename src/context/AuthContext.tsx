import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, isUserAdmin, ADMIN_EMAIL } from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  adminEmail: string;
  signInWithGoogle: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        const isAdmin = isUserAdmin(fbUser.email);
        const mappedUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          photoURL: fbUser.photoURL,
          isAdmin
        };
        setUser(mappedUser);

        // Sync user profile to Firestore
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          await setDoc(userDocRef, {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || 'User',
            photoURL: fbUser.photoURL || '',
            role: isAdmin ? 'admin' : 'user',
            lastLoginAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn('Could not sync user to Firestore:', e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<AuthUser | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const isAdmin = isUserAdmin(fbUser.email);
      const mappedUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        photoURL: fbUser.photoURL,
        isAdmin
      };
      setUser(mappedUser);
      return mappedUser;
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        console.info('Google sign-in popup was closed by user');
        return null;
      }
      console.error('Google OAuth sign-in error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fbSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: !!user?.isAdmin,
        adminEmail: ADMIN_EMAIL,
        signInWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
