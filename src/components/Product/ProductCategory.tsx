import { Product } from "@/interfaces/Product";
import { ProductCard } from "./ProductCard";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { DocumentData, Query, collection, limit, orderBy, query, where } from "firebase/firestore";
import { useQuery } from "react-query";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProductCardProps {
  category: string;
}

export const ProductCategory = ({ category }: ProductCardProps) => {
  const { fetchData } = useDataLoad<Product>();
  const navigate = useNavigate();
  const [q, setQ] = useState<Query<unknown, DocumentData>>();

  useEffect(() => {
    if (category) {
      setQ(
        query(
          collection(db, "products"),
          orderBy("updatedAt", "desc"),
          where("productCategory", "==", category),
          limit(4)
        )
      );
    }
  }, [category]);

  const { data, isLoading } = useQuery(category, () => (q ? fetchData(q, null) : undefined), {
    enabled: !!q,
  });

  if (isLoading) {
    return (
      <div
        className="w-full h-[445px] border-b p-6 hover:bg-slate-100 overflow-scroll cursor-pointer relative"
        onClick={() => navigate(`/category/${category}`)}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <MoreHorizontal />
        </div>
      </div>
    );
  }

  return (
    <section
      className="w-full h-fit border-b hover:bg-slate-100 overflow-scroll cursor-pointer p-4 py-8 relative"
      onClick={() => navigate(`/category/${category}`)}
    >
      <h4 className="text-xl font-semibold tracking-tight absolute flex gap-4 items-center left-6 top-6">
        {category} <ChevronRight color="#757575" />
      </h4>
      <div className="w-full flex p-5 h-fit gap-3 overflow-scroll mt-6">
        {data?.data.map((product, i) => (
          <ProductCard product={product} key={i}></ProductCard>
        ))}
      </div>
    </section>
  );
};
