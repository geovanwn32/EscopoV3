'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * Hook para acessar especificamente o estado do usuário autenticado.
 * Fornece o objeto User, o status de carregamento e quaisquer erros de autenticação.
 * @returns {UserHookResult} Objeto com usuário, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const auth = useAuth();
  const [state, setState] = useState<UserHookResult>({
    user: auth.currentUser, // Inicia com o usuário atual, se houver
    isUserLoading: auth.currentUser === null, // Carregando apenas se não houver usuário síncrono
    userError: null,
  });

  useEffect(() => {
    // Apenas redefine o estado se a instância de autenticação realmente mudar
    // e o usuário atual síncrono for diferente.
    if (auth.currentUser !== state.user) {
        setState({ user: auth.currentUser, isUserLoading: auth.currentUser === null, userError: null });
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("useUser: onAuthStateChanged error:", error);
        setState({ user: null, isUserLoading: false, userError: error });
      }
    );

    return () => unsubscribe();
  }, [auth]); // Depende apenas da instância de autenticação

  return state;
};
