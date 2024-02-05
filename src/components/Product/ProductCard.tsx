import { Link, useLocation } from "react-router-dom";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Product } from "@/interfaces/Product";
import { useAuth } from "@/AuthContext";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth() || {};
  const { pathname } = useLocation();

  return (
    <Card className="w-56 flex flex-col p-5 h-fit gap-2 mr-4">
      {/* image carousel */}
      <div className="flex justify-center">
        <Carousel
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
          className="w-56 h-44"
        >
          <CarouselContent>
            {product.productImage.map((img: string, idx: number) => (
              <CarouselItem key={idx} className="flex items-center justify-center bg-gray-100 h-44">
                <img src={img} className=""></img>{" "}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <Link
        to={
          pathname.split("/")[1] == "products"
            ? `/productupdate/${user?.userId}/${product.id}`
            : `/productdetail/${product.id}`
        }
      >
        <CardTitle className="pt-3">{product.productName}</CardTitle>
        <CardDescription className="">{product.productCategory}</CardDescription>
        <p className="flex justify-between pb-1 mb-1">
          <small className="text-sm font-medium text-gray-500">{product.productPrice}원</small>
          {pathname.split("/")[1] == "products" && (
            <small className="text-sm font-medium text-red-500">{product.productQuantity}</small>
          )}
        </p>
        {pathname.split("/")[1] == "products" && (
          <p className="text-sm border-t pt-1 break-words">{product.productDescription}</p>
        )}
      </Link>
    </Card>
  );
};
