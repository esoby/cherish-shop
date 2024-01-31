import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus } from "lucide-react";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { useDataUpload } from "@/hooks/useDataUpload";
import { useImageUpload } from "@/hooks/useImageUpload";

const ProductUpload = () => {
  const user = useAuth();
  redirectIfNotAuthorized(user);

  const { toast } = useToast();

  const initialInputVal = {
    productName: "",
    productPrice: 0,
    productQuantity: 0,
    productDescription: "",
  };

  // 사용자 입력 값
  const [inputValues, setInputValues] = useState(initialInputVal);
  const { productName, productPrice, productQuantity, productDescription } = inputValues;
  const [productCategory, setProductCategory] = useState("");

  // input file list
  const [selectedFile, setSelectedFile] = useState<FileList | null>();

  // upload image and get storage url list
  const { imageURLs, uploadImages, resetImageURLs } = useImageUpload();

  // input file ref
  const fileInput = useRef<HTMLInputElement>(null);

  // 상품 등록 버튼 disabled
  const [btnDisabled, setBtnDisabled] = useState(true);

  // 상품 등록 실패 메세지
  const [errorMsg, setErrorMsg] = useState("");

  const { uploadData } = useDataUpload();

  // schema for validation
  const requiredSchema = yup.object().shape({
    productName: yup.string().required(),
    productPrice: yup.string().required(),
    productQuantity: yup.string().required(),
    productDescription: yup.string().required(),
  });

  const categorySchema = yup.string().required();

  // schema for number field validation
  const numberSchema = yup.number().integer().min(1);

  const chkAllValid = () => {
    return (
      requiredSchema.isValidSync({ ...inputValues }) &&
      imageURLs.length > 0 &&
      numberSchema.isValidSync(inputValues.productPrice) &&
      numberSchema.isValidSync(inputValues.productQuantity) &&
      categorySchema.isValidSync(productCategory)
    );
  };

  // Enable / Disabled button
  useEffect(() => {
    if (chkAllValid()) {
      setErrorMsg("");
      setBtnDisabled(false);
    } else {
      setBtnDisabled(true);
    }
  }, [imageURLs, inputValues]);

  // text input onChange
  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value, id: inputName } = event.target;

    // Filtering non-numeric values from the number field
    let tmp = value;
    if (inputName === "productPrice" || inputName === "productQuantity") {
      if (parseInt(tmp) < 0) tmp = "0";
      if (isNaN(parseInt(tmp))) {
        tmp = tmp
          .split("")
          .filter((v) => "0123456789".includes(v))
          .join("");
      } else {
        tmp = String(parseInt(String(tmp)));
      }
      if (!tmp) tmp = "0";
    }
    setInputValues({ ...inputValues, [inputName]: tmp });
  };

  // image storage upload func
  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    setSelectedFile(fileList);
  };

  // Upload image to storage as selectedFile change
  useEffect(() => {
    if (selectedFile) {
      uploadImages(selectedFile);
    }
  }, [selectedFile]);

  // product upload
  const uploadProduct = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!chkAllValid()) {
      setErrorMsg("입력하지 않은 정보가 존재합니다.");
      return;
    }
    try {
      const newProduct = {
        sellerId: user?.userId,
        ...inputValues,
        productPrice: parseInt(String(productPrice)),
        productQuantity: parseInt(String(productQuantity)),
        productCategory: productCategory,
        productImage: imageURLs,
      };
      await uploadData("products", newProduct);
      toast({
        description: "상품이 등록되었습니다!",
      });

      // input 초기화
      setInputValues(initialInputVal);
      setSelectedFile(null);
      resetImageURLs();
      setProductCategory("");
      if (fileInput.current) fileInput.current.value = "";
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        description: "상품 등록에 실패했습니다.",
      });
    }
  };

  return (
    <div>
      <Link to={`/products/${user?.userId}`}>👉🏻 뒤로가기</Link>
      <form className="flex flex-col items-center gap-5 p-20">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          상품 등록
        </h2>
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
            onClick={() => fileInput.current?.click()}
          >
            <ImagePlus color="#ffffff" strokeWidth={1.5} />
          </div>
        </div>
        <Input
          className="hidden"
          type="file"
          multiple
          name="productImage"
          ref={fileInput}
          onChange={uploadImage}
        />
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="productName">상품 이름</Label>
          <Input
            type="text"
            id="productName"
            placeholder="product name"
            value={productName}
            onChange={onChange}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <p>상품 카테고리</p>
          <Select value={productCategory} onValueChange={(value) => setProductCategory(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Category1">Category1</SelectItem>
              <SelectItem value="Category2">Category2</SelectItem>
              <SelectItem value="Category3">Category3</SelectItem>
              <SelectItem value="Category4">Category4</SelectItem>
              <SelectItem value="Category5">Category5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="productPrice">상품 가격</Label>
          <Input
            type="number"
            id="productPrice"
            placeholder="product price"
            value={productPrice}
            onChange={onChange}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="productQuantity">상품 수량</Label>
          <Input
            type="number"
            id="productQuantity"
            placeholder="product quantity"
            value={productQuantity}
            onChange={onChange}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="productDescription">상품 상세 설명</Label>
          <Textarea
            id="productDescription"
            placeholder="상품에 대한 상세한 설명을 입력해 주세요."
            value={productDescription}
            onChange={onChange}
          />
        </div>
        <small className="text-sm font-medium text-red-400">{errorMsg}</small>
        <Button className="w-96" onClick={uploadProduct} disabled={btnDisabled}>
          상품 등록
        </Button>
        <Toaster />
      </form>
    </div>
  );
};

export default ProductUpload;
