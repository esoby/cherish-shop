import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Product } from "@/interfaces/Product";
import { useAuth } from "@/AuthContext";
import { useState } from "react";
import LazyImage from "../Common/LazyImage";
import { MoreHorizontal } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth() || {};
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="w-56 flex flex-col p-5 h-fit gap-2 mr-4 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        navigate(
          pathname.split("/")[1] == "products"
            ? `/productupdate/${user?.userId}/${product.id}`
            : `/productdetail/${product.id}`
        );
      }}
    >
      <div
        className="flex items-center justify-center bg-gray-100 h-44 w-44 relative"
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
                delay: 1500,
              }),
            ]}
            className="w-56 h-44"
          >
            <CarouselContent>
              {product.productImage.map((img: string, idx: number) => (
                <CarouselItem key={idx} className="flex items-center justify-center h-44">
                  <LazyImage
                    className="w-full h-full object-cover"
                    src={img}
                    alt={`${product.productName} image ${idx}`}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>

      <CardTitle className="pt-3">{product.productName}</CardTitle>
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
