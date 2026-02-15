
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    
    // Verifica se temos as chaves mínimas no config antes de tentar inicializar
    const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

    try {
      // Tenta inicialização automática do Firebase App Hosting primeiro
      firebaseApp = initializeApp();
    } catch (e) {
      if (hasConfig) {
        // Se falhar e tivermos config manual (env), usamos ela
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        // Se não tivermos nada, lançamos o erro explicativo
        console.error('Firebase: Variáveis de ambiente ausentes e inicialização automática falhou.');
        throw e;
      }
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
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
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
