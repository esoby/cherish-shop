import { db } from "@/services/firebase/firebaseConfig";
import {
  DocumentData,
  DocumentReference,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export const fetchStoreData = async <T>(col: string, id: string): Promise<T> => {
  const docRef = doc(db, col, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    let id = docSnap.id;
    let data = docSnap.data();
    return {
      id: id,
      ...data,
    } as T;
  }
  return {} as T;
};

export const fetchStoreDataByField = async <T>(
  col: string,
  field: string,
  value: any,
  extra?: any[]
): Promise<T[]> => {
  let q = query(collection(db, col), where(field, "==", value));
  if (extra) {
    extra.forEach((ex) => (q = query(q, ex)));
  }

  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return (docs as T[]) || ([] as T[]);
};

export const uploadStoreData = async (
  col: string,
  data: any
): Promise<DocumentReference<DocumentData>> => {
  const newData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const collectionRef = collection(db, col);
  const docRef = addDoc(collectionRef, newData);
  return docRef;
};

export const updateStoreData = async (col: string, id: string, data: any): Promise<void> => {
  const newData = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  const docRef = doc(db, col, id);
  return await updateDoc(docRef, newData);
};

export const deleteStoreData = async (col: string, id: string): Promise<void> => {
  const docRef = doc(db, col, id);
  return await deleteDoc(docRef);
};
