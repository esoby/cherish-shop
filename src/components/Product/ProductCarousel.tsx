import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from "@/interfaces/Product";

export const ProductCarousel = ({ product }: { product: Product }) => {
  return (
    <Carousel className="w-96 h-96">
      <CarouselContent>
        {product?.productImage?.map((img: string, idx: number) => (
          <CarouselItem key={idx} className="flex items-center justify-center h-96 w-96">
            <img
              src={img}
              className="w-full h-full object-cover rounded-xl"
              alt={`${product.productName} image ${idx}`}
            ></img>
          </CarouselItem>
        ))}
      </CarouselContent>
      {product?.productImage.length > 1 && (
        <>
          <CarouselPrevious className="m-1" />
          <CarouselNext className="m-1" />
        </>
      )}
    </Carousel>
  );
};
