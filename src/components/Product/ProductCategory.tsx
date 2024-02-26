import { Product } from "@/interfaces/Product";
import { ProductCard } from "./ProductCard";
import { limit, orderBy, where } from "firebase/firestore";
import { useQuery } from "react-query";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchStoreDataByField } from "@/services/firebase/firestore";

interface ProductCardProps {
  category: string;
}

export const ProductCategory = ({ category }: ProductCardProps) => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery(
    category,
    () =>
      fetchStoreDataByField("products", "productCategory", category, [
        where("productCategory", "==", category),
        orderBy("createdAt", "desc"),
        limit(4),
      ]),
    {
      enabled: !!category,
    }
  );

  if (isLoading) {
    return (
      <div className="w-full h-[460px] border-b p-6 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <MoreHorizontal />
        </div>
      </div>
    );
  }

  return (
    <section
      className="w-full h-[460px] border-b hover:bg-slate-100 overflow-scroll cursor-pointer p-4 py-8 relative"
      onClick={() => navigate(`/category/${category}`)}
    >
      <h4 className="text-xl font-semibold tracking-tight absolute flex gap-4 items-center left-6 top-6">
        {category} <ChevronRight color="#757575" />
      </h4>
      <div className="w-full flex p-5 h-fit gap-3 overflow-scroll mt-6">
        {data?.map((product, i) => (
          <ProductCard product={product as Product} key={i}></ProductCard>
        ))}
      </div>
    </section>
  );
};
