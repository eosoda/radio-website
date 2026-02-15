
'use client';
import { initializeFirebase } from '@/firebase';

// Este arquivo redireciona para a inicialização padronizada do projeto
// para evitar erros de chaves ausentes ou inválidas.
const { auth, firestore: db } = initializeFirebase();

export { auth, db };
