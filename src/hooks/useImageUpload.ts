import { useAuth } from "@/AuthContext";
import { storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";

export const useImageUpload = () => {
  const { user } = useAuth() || {};
  const [imageURLs, setImageURLs] = useState<string[]>([]);

  // 이미지 파일 스토리지에 업로드
  const uploadImages = async (selectedFiles: File[]) => {
    const uploadPromises = Array.from(selectedFiles).map((file) => {
      // 파일 이름 설정 - 원본 이름 + 타임스탬프
      let fileName = file.name.split(".")[0] + new Date().getTime();
      const imageRef = ref(storage, `${user?.userId}/${fileName}`);
      return uploadBytes(imageRef, file).then(() => getDownloadURL(imageRef));
    });
    const urls = await Promise.all(uploadPromises);
    // storage에 업로드된 이미지 url list를 상태로 저장
    setImageURLs(urls);
  };

  const resetImageURLs = () => setImageURLs([]); // 초기화 함수

  return { imageURLs, setImageURLs, uploadImages, resetImageURLs };
};
