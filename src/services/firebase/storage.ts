import { deleteObject, getStorage, ref } from "firebase/storage";

export const deleteStorageImage = async (url: string) => {
  try {
    const storage = getStorage();
    let decodedFilePath = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
    let fileRef = ref(storage, decodedFilePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Failed to delete file", error);
  }
};
