'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { useUser, type UserHookResult } from '@/firebase/auth/use-user';
import { initializeFirebase } from '@/firebase';
import { Auth, User } from 'firebase/auth';

// Create a context for the user state
const UserContext = React.createContext<UserHookResult | undefined>(undefined);

/**
 * A provider that specifically handles the user authentication state.
 * It uses the useUser hook internally and provides the result to its children.
 * This component must be a child of FirebaseProvider.
 */
function UserProvider({ children }: { children: ReactNode }) {
  const userState = useUser(); // This now correctly uses the auth instance from the parent FirebaseProvider
  return (
    <UserContext.Provider value={userState}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * A hook to consume the user context.
 * Throws an error if used outside of UserProvider.
 */
export const useUserContext = (): UserHookResult => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider, which is part of FirebaseClientProvider.');
  }
  return context;
};

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * The main client-side provider.
 * It initializes Firebase services and wraps children with both the
 * FirebaseProvider (for services) and UserProvider (for auth state).
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <UserProvider>
        {children}
      </UserProvider>
    </FirebaseProvider>
  );
}
