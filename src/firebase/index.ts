
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
  // No ambiente da Cloudflare ou em qualquer outro ambiente que não seja o Firebase App Hosting,
  // é necessário fornecer o objeto de configuração explicitamente.
  return getSdks(initializeApp(firebaseConfig));
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
