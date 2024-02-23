import { useAuth } from "@/context/AuthContext";
import { storage } from "@/services/firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import imageCompression from "browser-image-compression";

export const useImageUpload = () => {
  const { user } = useAuth() || {};
  const [imageURLs, setImageURLs] = useState<string[]>([]);

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 384,
    useWebWorker: true,
  };

  // 이미지 파일 스토리지에 업로드
  const uploadImages = async (selectedFiles: File[]) => {
    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        // 파일 이름 설정 - 원본 이름 + 타임스탬프
        let fileName = file.name.split(".")[0] + new Date().getTime();
        const imageRef = ref(storage, `${user?.userId}/${fileName}`);

        const compressedFile = await imageCompression(file, options);
        return uploadBytes(imageRef, compressedFile).then(() => getDownloadURL(imageRef));
      });
      const urls = await Promise.all(uploadPromises);
      // storage에 업로드된 이미지 url list를 상태로 저장
      setImageURLs((prev) => [...prev, ...urls]);
    } catch (e) {
      console.log(e);
    }
  };

  const resetImageURLs = () => setImageURLs([]); // 초기화 함수

  return { imageURLs, setImageURLs, uploadImages, resetImageURLs };
};
