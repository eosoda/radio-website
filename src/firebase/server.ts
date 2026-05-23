import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore/lite";
import { firebaseConfig } from "./config";

// Initialize Firebase App for Server-Side Use
// getApps() ensures we don't initialize the app multiple times in development (HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use firestore/lite which is optimized for server-side single fetches (no WebSockets)
export const dbLite = getFirestore(app);

// Helper function to fetch the main config document
export async function getServerConfig() {
  try {
    const docRef = doc(dbLite, "config", "main");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Error fetching config on server:", error);
  }
  return null;
}

// Helper function to fetch programs collection
export async function getServerPrograms() {
  try {
    const q = query(collection(dbLite, "programs"), orderBy("horario", "asc"));
    const querySnapshot = await getDocs(q);
    const programs: any[] = [];
    querySnapshot.forEach((doc) => {
      programs.push({ id: doc.id, ...doc.data() });
    });
    return programs;
  } catch (error) {
    console.error("Error fetching programs on server:", error);
  }
  return [];
}
