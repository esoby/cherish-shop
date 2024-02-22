import { useAuth } from "@/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "@/components/Common/NavBar";
import MetaTag from "@/components/Common/SEOMetaTag";
import MainContainer from "@/components/Common/MainContainer";
import { deleteStorageImage } from "@/services/firebase/storage";
import { deleteStoreData, fetchStoreData, updateStoreData } from "@/services/firebase/firestore";
import ProductForm from "@/components/Sign/ProductForm";
import { SubmitHandler } from "react-hook-form";
import { ProductFormFields } from "@/types/ProductFormFields";
import { Product } from "@/interfaces/Product";

const ProductUpdate = () => {
  const { user } = useAuth() || {};
  redirectIfNotAuthorized(user);
  const { pid } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currValue, setCurrValue] = useState<ProductFormFields>();

  // 기존 데이터 불러오기
  const fetchCurrValue = async () => {
    if (pid) {
      const data = await fetchStoreData<Product>("products", pid);
      if (data) {
        setCurrValue({
          productName: data.productName,
          productCategory: data.productCategory,
          productPrice: data.productPrice,
          productQuantity: data.productQuantity,
          productDescription: data.productDescription,
          productImage: data.productImage,
        });
      }
    }
  };

  useEffect(() => {
    fetchCurrValue();
  }, []);

  // 상품 수정
  const handleProductUpdate: SubmitHandler<ProductFormFields> = async (data) => {
    const modifiedProduct = {
      ...data,
      productPrice: parseInt(String(data.productPrice)),
      productQuantity: parseInt(String(data.productQuantity)),
    };
    if (pid) {
      await updateStoreData("products", pid, modifiedProduct);
      toast({
        description: "상품 정보가 수정되었습니다!",
      });
    }
  };

  // 상품 삭제
  const handleProductDelete = async (urls: string[]) => {
    if (pid) {
      await Promise.all(urls.map((url) => deleteStorageImage(url)));
      await deleteStoreData("products", pid);
      toast({
        variant: "destructive",
        description: "상품 정보가 삭제되었습니다.",
      });
      setTimeout(() => navigate(`/products/${user?.userId}`), 1000);
    }
  };

  return (
    <>
      <MetaTag title="판매 상품 수정" description="판매 상품 정보를 수정하는 페이지입니다." />
      <NavBar />
      <MainContainer>
        <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">상품 수정</h2>
        <div className="w-2/3 min-w-72">
          {currValue && (
            <ProductForm
              onSubmit={handleProductUpdate}
              data={currValue}
              onImageDelete={handleProductDelete}
            />
          )}
        </div>
        <Toaster />
      </MainContainer>
    </>
  );
};

export default ProductUpdate;
