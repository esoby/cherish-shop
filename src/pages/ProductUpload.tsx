import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

import { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { useDataUpload } from "@/hooks/useDataUpload";
import { useImageUpload } from "@/hooks/useImageUpload";
import ProductInfoInput from "@/components/Product/ProductInfoInput";
import ProductImageInput from "@/components/Product/ProductImageInput";
import NavBar from "@/components/Common/NavBar";

const ProductUpload = () => {
  const { user } = useAuth() || {};
  redirectIfNotAuthorized(user);

  const initialInputVal = {
    productName: "",
    productCategory: "",
    productPrice: 0,
    productQuantity: 0,
    productDescription: "",
  };

  const { toast } = useToast();
  // 사용자 입력 값
  const [inputValues, setInputValues] = useState(initialInputVal);
  // upload image and get storage url list
  const { imageURLs, setImageURLs, uploadImages, resetImageURLs } = useImageUpload();
  // input file ref
  const imageFileRef = useRef<HTMLInputElement>(null);
  // 상품 등록 버튼 disabled
  const [btnDisabled, setBtnDisabled] = useState(true);
  // 상품 등록 실패 메세지
  const [errorMsg, setErrorMsg] = useState("");
  // 데이터 업로드 함수 불러오기
  const { uploadData } = useDataUpload();

  // schema for validation
  const requiredSchema = yup.object().shape({
    productName: yup.string().required(),
    productCategory: yup.string().required(),
    productPrice: yup.string().required(),
    productQuantity: yup.string().required(),
    productDescription: yup.string().required(),
  });

  // schema for number field validation
  const numberSchema = yup.number().integer().min(1);

  const chkAllValid = () => {
    return (
      requiredSchema.isValidSync({ ...inputValues }) &&
      numberSchema.isValidSync(inputValues.productPrice) &&
      numberSchema.isValidSync(inputValues.productQuantity) &&
      imageURLs.length > 0
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
        productPrice: parseInt(inputValues.productPrice.toString()),
        productQuantity: parseInt(inputValues.productQuantity.toString()),
        productImage: imageURLs,
      };
      await uploadData("products", newProduct);
      toast({
        description: "상품이 등록되었습니다!",
      });

      // input 초기화
      resetImageURLs();
      setInputValues(initialInputVal);
      if (imageFileRef.current) imageFileRef.current.value = "";
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        description: "상품 등록에 실패했습니다.",
      });
    }
  };

  return (
    <>
      <NavBar />
      <div className="w-full p-20 mt-16">
        <form className="flex flex-col w-full items-center gap-5">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            상품 등록
          </h2>
          {/* product image input */}
          <ProductImageInput
            imageURLs={imageURLs}
            setImageURLs={setImageURLs}
            uploadImages={uploadImages}
            imageFileRef={imageFileRef}
          />
          {/* product info input list */}
          <ProductInfoInput inputValues={inputValues} setInputValues={setInputValues} />
          <small className="text-sm font-medium text-red-400">{errorMsg}</small>
          <Button className="w-96" onClick={uploadProduct} disabled={btnDisabled}>
            상품 등록
          </Button>
          <Toaster />
        </form>
      </div>
    </>
  );
};

export default ProductUpload;
