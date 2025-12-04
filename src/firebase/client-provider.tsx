'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { useUser, type UserHookResult } from '@/firebase/auth/use-user';
import { initializeFirebase } from '@/firebase';

// Cria um contexto para o estado do usuário
const UserContext = React.createContext<UserHookResult | undefined>(undefined);

/**
 * Um provedor que lida especificamente com o estado de autenticação do usuário.
 * Ele usa o hook useUser internamente e fornece o resultado para seus filhos.
 * Este componente deve ser um filho do FirebaseProvider.
 */
function UserProvider({ children }: { children: ReactNode }) {
  const userState = useUser(); // Isso agora usa corretamente a instância de autenticação do FirebaseProvider pai
  return (
    <UserContext.Provider value={userState}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Um hook para consumir o contexto do usuário.
 * Lança um erro se usado fora do UserProvider.
 */
export const useUserContext = (): UserHookResult => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext deve ser usado dentro de um UserProvider, que faz parte do FirebaseClientProvider.');
  }
  return context;
};

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * O principal provedor do lado do cliente.
 * Ele inicializa os serviços do Firebase e envolve os filhos com o
 * FirebaseProvider (para serviços) e o UserProvider (para o estado de autenticação).
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Inicializa o Firebase no lado do cliente, uma vez por montagem de componente.
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
