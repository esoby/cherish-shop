import { useEffect, useState } from "react";
import { Product } from "@/interfaces/Product";
import { fetchSellerData } from "@/services/order/fetchRelatedData";

export const ProductInfo = ({ product }: { product: Product }) => {
  const [sellerName, setSellerName] = useState("");

  // 판매자 이름 불러오기
  useEffect(() => {
    if (product?.sellerId)
      fetchSellerData(product?.sellerId).then((data) => {
        if (data) setSellerName(data.nickname);
      });
  }, [product]);

  return (
    <section className="flex flex-col gap-2 w-96 overflow-clip">
      <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
        {product?.productName}
      </h2>
      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground">판매자 : {sellerName}</p>
        <p className="text-sm text-muted-foreground">{product?.productCategory}</p>
      </div>
      <div className="border-2 my-4 p-2 w-full min-h-20 rounded-lg">
        <p className="w-full break-words">{product?.productDescription}</p>
      </div>
      {product?.productQuantity && product?.productQuantity > 0 ? (
        <p className="scroll-m-20 text-xl font-semibold tracking-tight text-right w-full">
          {product?.productPrice}원
        </p>
      ) : (
        <p className="scroll-m-20 text-xl font-semibold tracking-tight text-right w-full text-red-500">
          SOLD OUT
        </p>
      )}
    </section>
  );
};
