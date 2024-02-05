import { ImagePlus, X } from "lucide-react";
import { Input } from "../ui/input";
import { ChangeEvent, RefObject, useEffect, useState } from "react";
import { deleteObject, getStorage, ref } from "firebase/storage";

interface ProductImageInputProps {
  imageURLs: string[];
  uploadImages: (selectedFiles: File[]) => Promise<void>;
  imageFileRef: RefObject<HTMLInputElement>;
}

const ProductImageInput = ({ imageURLs, uploadImages, imageFileRef }: ProductImageInputProps) => {
  // input file type list
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // input 내용 -> selectedFile
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      event.target.value = "";
    }
  };

  const onFileDelete = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, idx: number) => {
    event.preventDefault();
    setSelectedFiles((prev) => [...prev.slice(0, idx), ...prev.slice(idx + 1)]);
  };

  // Upload image to storage as selectedFile change
  useEffect(() => {
    if (selectedFiles.length > 0) {
      if (imageURLs.length) {
        // 기존 이미지 파일 삭제
        const storage = getStorage();
        imageURLs.forEach((imgUrl) => {
          let decodedFilePath = decodeURIComponent(imgUrl.split("/o/")[1].split("?")[0]);
          let fileRef = ref(storage, decodedFilePath);
          deleteObject(fileRef)
            .then(() => {})
            .catch((error) => {});
        });
      }
      uploadImages(selectedFiles);
    }
  }, [selectedFiles]);

  return (
    <>
      <div className="w-4/5 h-fit relative">
        <div className="flex gap-4 bg-slate-200 w-full h-72 overflow-scroll scrollbar-hide p-4 mt-5 border-none box-border">
          {imageURLs.length > 0 ? (
            imageURLs.map((img, idx) => (
              <div className="flex-shrink-0 relative" key={idx}>
                <img className="w-full h-full" src={img}></img>
                <button onClick={(e) => onFileDelete(e, idx)}>
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
        className="hidden"
        type="file"
        multiple
        name="productImage"
        ref={imageFileRef}
        onChange={onChange}
      />
    </>
  );
};

export default ProductImageInput;
