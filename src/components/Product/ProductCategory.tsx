import { Product } from "@/interfaces/Product";
import { ProductCard } from "./ProductCard";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { useQuery } from "react-query";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  category: string;
}

export const ProductCategory = ({ category }: ProductCardProps) => {
  const { fetchData } = useDataLoad<Product>();

  const q = query(
    collection(db, "products"),
    orderBy("updatedAt", "desc"),
    where("productCategory", "==", category),
    limit(4)
  );

  const { data } = useQuery(category, () => fetchData(q, null));

  return (
    <div className="w-full border-b p-6 hover:bg-slate-100">
      <Link className="cursor-pointer" to={`/category/${category}`}>
        <div className="flex items-center">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mr-4">{category}</h4>
          <ChevronRight color="#757575" />
        </div>
        <div className="w-56 flex p-5 h-fit gap-2 mr-4">
          {data?.data.map((product, i) => (
            <ProductCard product={product} key={i}></ProductCard>
          ))}
        </div>
      </Link>
    </div>
  );
};
