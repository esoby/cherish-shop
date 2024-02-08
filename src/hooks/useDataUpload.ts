import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export const useDataUpload = () => {
  const uploadData = async (collectionName: string, data: any): Promise<any> => {
    const newData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const collectionRef = collection(db, collectionName);
    return await addDoc(collectionRef, newData);
  };

  return { uploadData };
};
