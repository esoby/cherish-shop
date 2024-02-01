import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

import { db } from "@/firebase";
import { Product } from "@/interfaces/Product";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { useImageUpload } from "@/hooks/useImageUpload";
import ProductImageInput from "@/components/Product/ProductImageInput";
import ProductInfoInput from "@/components/Product/ProductInfoInput";

const ProductUpdate = () => {
  const user = useAuth();
  redirectIfNotAuthorized(user);

  const { pid } = useParams();
  const navigate = useNavigate();

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
  const { imageURLs, setImageURLs, uploadImages } = useImageUpload();

  // input file ref
  const imageFileRef = useRef<HTMLInputElement>(null);

  // 상품 수정 버튼 disabled
  const [btnDisabled, setBtnDisabled] = useState(true);
  // 상품 수정 실패 메세지
  const [errorMsg, setErrorMsg] = useState("");

  // schema for validation
  const requiredSchema = yup.object().shape({
    productName: yup.string().required(),
    productPrice: yup.string().required(),
    productQuantity: yup.string().required(),
    productDescription: yup.string().required(),
    productCategory: yup.string().required(),
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

  // fetch current product data
  useEffect(() => {
    const fetchData = async () => {
      if (pid) {
        const docRef = doc(db, "products", pid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setInputValues({
            ...data,
          });
          setImageURLs(data.productImage);
        }
      }
    };
    fetchData();
  }, [pid]);

  // 상품 수정
  const updateProduct = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    if (!chkAllValid()) {
      setErrorMsg("입력하지 않은 정보가 존재합니다.");
      return;
    }
    try {
      const newProduct = {
        sellerId: user?.userId,
        ...inputValues,
        productPrice: parseInt(String(inputValues.productPrice)),
        productQuantity: parseInt(String(inputValues.productQuantity)),
        productImage: imageURLs,
        updatedAt: serverTimestamp(),
      };
      if (pid) {
        const docRef = doc(db, "products", pid);
        await updateDoc(docRef, newProduct);
        toast({
          description: "상품 정보가 수정되었습니다!",
        });
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        description: "상품 정보 수정에 실패했습니다.",
      });
    }
  };

  // 상품 삭제
  const deleteProduct = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    if (pid) {
      const docRef = doc(db, "products", pid);
      await deleteDoc(docRef);
      toast({
        variant: "destructive",
        description: "상품 정보가 삭제되었습니다.",
      });
      setTimeout(() => navigate(`/products/${user?.userId}`), 1500);
    }
  };

  return (
    <div>
      <Link to={`/products/${user?.userId}`}>👉🏻 뒤로가기</Link>
      <form className="flex flex-col w-full items-center gap-5 p-20">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          상품 수정
        </h2>
        {/* product image input */}
        <ProductImageInput
          imageURLs={imageURLs}
          uploadImages={uploadImages}
          imageFileRef={imageFileRef}
        />
        {/* product info input list */}
        <ProductInfoInput inputValues={inputValues} setInputValues={setInputValues} />
        <small className="text-sm font-medium text-red-400">{errorMsg}</small>
        <div className="flex gap-2">
          <Button className="w-48" onClick={updateProduct} disabled={btnDisabled}>
            상품 수정
          </Button>
          <Button variant="destructive" className="w-48" onClick={deleteProduct}>
            상품 삭제
          </Button>
        </div>
        <Toaster />
      </form>
    </div>
  );
};

export default ProductUpdate;
