import { ImagePlus } from "lucide-react";
import { Input } from "../ui/input";
import { ChangeEvent, RefObject, useEffect, useState } from "react";
import { deleteObject, getStorage, ref } from "firebase/storage";

interface ProductImageInputProps {
  imageURLs: string[];
  uploadImages: (selectedFile: FileList) => Promise<void>;
  imageFileRef: RefObject<HTMLInputElement>;
}

const ProductImageInput = ({ imageURLs, uploadImages, imageFileRef }: ProductImageInputProps) => {
  // input file type list

  const [selectedFile, setSelectedFile] = useState<FileList | null>();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setSelectedFile(event.target.files);
  };

  // Upload image to storage as selectedFile change
  useEffect(() => {
    if (selectedFile) {
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
      uploadImages(selectedFile);
    }
  }, [selectedFile]);

  return (
    <>
      <div className="w-4/5 h-fit relative">
        <div className=" flex gap-4 bg-slate-200 w-full h-80 overflow-scroll scrollbar-hide p-4 mt-5 border-none box-border">
          {imageURLs.length > 0 ? (
            imageURLs.map((img, idx) => (
              <img className="w-72 object-contain" src={img} key={idx}></img>
            ))
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <small className="text-sm font-medium text-white">이미지를 추가해주세요.</small>
            </div>
          )}
        </div>
        <div
          className="absolute right-3 bottom-3 w-fit h-fit p-2 bg-slate-500 rounded-full cursor-pointer"
          onClick={() => imageFileRef.current?.click()}
        >
          <ImagePlus color="#ffffff" strokeWidth={1.5} />
        </div>
      </div>
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
