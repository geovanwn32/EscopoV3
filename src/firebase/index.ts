'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANTE: NÃO MODIFIQUE ESTA FUNÇÃO
// Esta função é otimizada para o Firebase App Hosting.
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // A inicialização automática com App Hosting pode falhar no desenvolvimento.
  // O fallback para o objeto de configuração é o comportamento esperado.
  try {
    const app = initializeApp();
    return getSdks(app);
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      console.warn('A inicialização automática falhou. Recorrendo ao objeto de configuração do firebase.', e);
    }
    const app = initializeApp(firebaseConfig);
    return getSdks(app);
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export { useUserContext as useUser } from '@/firebase/client-provider';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';