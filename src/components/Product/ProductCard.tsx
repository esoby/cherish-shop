import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Product } from "@/interfaces/Product";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import LazyImage from "../Common/LazyImage";
import { MoreHorizontal } from "lucide-react";
import { useQueryClient } from "react-query";
import { fetchStoreData } from "@/services/firebase/firestore";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth() || {};
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);

  const queryClient = useQueryClient();

  // 상품 상세 데이터 prefetching
  const prefetchProductData = () => {
    queryClient.prefetchQuery(["productDetail", product.id], () =>
      fetchStoreData<Product>("products", product.id)
    );
  };

  return (
    <Card
      className="w-60 flex flex-col p-5 h-fit gap-1 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105"
      onClick={(e) => {
        e.stopPropagation();
        navigate(
          pathname.split("/")[1] == "products"
            ? `/productupdate/${user?.userId}/${product.id}`
            : `/productdetail/${product.id}`
        );
      }}
      onMouseOver={prefetchProductData}
    >
      <div
        className="flex items-center justify-center bg-gray-100 h-[200px] w-[200px] relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isHovered && (
          <LazyImage
            className="w-full h-full object-cover"
            src={product.productImage[0]}
            alt={`${product.productName} main image`}
          />
        )}
        {!isHovered && product.productImage.length > 1 && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
            <MoreHorizontal color="#dddddd" />
          </div>
        )}

        {/* image carousel */}
        {isHovered && (
          <Carousel
            opts={{ loop: true }}
            plugins={[
              Autoplay({
                delay: 1200,
              }),
            ]}
          >
            <CarouselContent>
              {product.productImage.map((img: string, idx: number) => (
                <CarouselItem key={idx} className="flex items-center justify-center">
                  <LazyImage
                    className="object-cover h-[220px] w-[220px]"
                    src={img}
                    alt={`${product.productName} image ${idx}`}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>

      <CardTitle className="pt-2 text-xl">{product.productName}</CardTitle>
      <CardDescription className="">{product.productCategory}</CardDescription>
      <div className="flex justify-between">
        {product.productQuantity > 0 ? (
          <small className="text-sm font-medium text-gray-600">{product.productPrice}원</small>
        ) : (
          <small className="text-sm font-medium text-gray-600">SOLD OUT</small>
        )}
        {pathname.split("/")[1] == "products" && (
          <small className="text-sm font-medium text-red-700">{product.productQuantity}</small>
        )}
      </div>
      {pathname.split("/")[1] == "products" && (
        <p className="text-sm border-t pt-2 break-words text-gray-600">
          {product.productDescription}
        </p>
      )}
    </Card>
  );
};
