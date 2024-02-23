import NavBar from "@/components/Common/NavBar";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import MetaTag from "@/components/Common/SEOMetaTag";
import MainContainer from "@/components/Common/MainContainer";
import ProductForm from "@/components/Product/ProductForm";
import { uploadStoreData } from "@/services/firebase/firestore";
import { ProductFormFields } from "@/types/ProductFormFields";
import { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const ProductUpload = () => {
  const { user } = useAuth() || {};
  redirectIfNotAuthorized(user);
  const navigate = useNavigate();
  const { toast } = useToast();

  // 상품 등록
  const handleProductUpload: SubmitHandler<ProductFormFields> = async (data) => {
    const newProduct = {
      sellerId: user?.userId,
      ...data,
      productPrice: parseInt(data.productPrice.toString()),
      productQuantity: parseInt(data.productQuantity.toString()),
    };
    await uploadStoreData("products", newProduct);
    toast({
      description: "상품이 등록되었습니다!",
    });
    setTimeout(() => navigate(`/products/${user?.userId}`), 1200);
  };

  return (
    <>
      <MetaTag title="판매 상품 등록" description="판매할 상품을 등록하는 페이지입니다." />
      <NavBar />
      <MainContainer>
        <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">상품 등록</h2>
        <div className="w-2/3 min-w-72">
          <ProductForm onSubmit={handleProductUpload} />
        </div>
        <Toaster />
      </MainContainer>
    </>
  );
};

export default ProductUpload;
