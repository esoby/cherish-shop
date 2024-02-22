import { ImagePlus, X } from "lucide-react";
import { Input } from "../ui/input";

import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { deleteStorageImage } from "@/services/firebase/storage";
import { useMutation } from "react-query";

interface ProductImageInputProps {
  imageURLs: string[];
  setImageURLs: Dispatch<SetStateAction<string[]>>;
  uploadImages: (selectedFiles: File[]) => Promise<void>;
}

const ProductImageInput = ({ imageURLs, setImageURLs, uploadImages }: ProductImageInputProps) => {
  // file input 값 저장
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const imageFileRef = useRef<HTMLInputElement>(null);

  // file input 값 변경 시 selectedFiles 저장
  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      event.target.value = "";
    }
  };

  const imageUploadMutation = useMutation(uploadImages, {
    onSuccess: () => {
      setSelectedFiles([]);
    },
  });

  // selectedFiles 변경 시 이미지 업로드 후 비우기
  useEffect(() => {
    if (selectedFiles.length > 0) {
      imageUploadMutation.mutate(selectedFiles);
    }
  }, [selectedFiles]);

  // 이미지 개별 삭제 버튼 핸들러
  const handleImageDelete = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    url: string,
    idx: number
  ) => {
    event.preventDefault();

    setImageURLs((prev) => [...prev.slice(0, idx), ...prev.slice(idx + 1)]);
    await deleteStorageImage(url);
  };

  return (
    <>
      <div className="w-full h-fit relative">
        <div className="flex gap-4 bg-slate-200 w-full h-80 scrollbar-hide p-6 mt-5 border-none box-border rounded-md overflow-y-hidden overflow-x-scroll">
          {imageURLs.length > 0 ? (
            imageURLs.map((img, idx) => (
              <div className="flex-shrink-0 relative h-full" key={idx}>
                <img className="w-full h-full" src={img}></img>
                {/* 이미지별 삭제 버튼 */}
                <button onClick={(e) => handleImageDelete(e, img, idx)}>
                  <div
                    className="w-4 h-4 p-0.5 bg-slate-700
                      rounded-full absolute -right-1 -top-1 flex justify-center items-center"
                  >
                    <X size={16} color="#ffffff" />
                  </div>
                </button>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <small className="text-sm font-medium text-white">이미지를 추가해주세요.</small>
            </div>
          )}
        </div>
        {/* 이미지 추가 아이콘 */}
        <div
          className="absolute right-3 bottom-3 w-fit h-fit p-2 bg-slate-500 rounded-full cursor-pointer"
          onClick={() => imageFileRef.current?.click()}
        >
          <ImagePlus color="#ffffff" strokeWidth={1.5} />
        </div>
      </div>
      {/* 이미지 파일 input */}
      <Input
        type="file"
        name="productImage"
        multiple
        className="hidden"
        ref={imageFileRef}
        onChange={handleFileInputChange}
      />
    </>
  );
};

export default ProductImageInput;
