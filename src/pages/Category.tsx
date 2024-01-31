import { useAuth } from "@/AuthContext";
import { ProductCard } from "@/components/Product/ProductCard";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Product } from "@/interfaces/Product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { query, collection, orderBy, where, limit, Query } from "firebase/firestore";
import { useInfiniteQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Category = () => {
  const user = useAuth();
  const { cid } = useParams();
  const { fetchData } = useDataLoad<Product>();
  const navigate = useNavigate();
  const [orderFilter, setOrderFilter] = useState("createdAt/desc");

  // initial query
  let q = query(collection(db, "products"), where("productCategory", "==", cid), limit(3));

  const [stateQ, setStateQ] = useState<Query>(query(q, orderBy("createdAt", "desc")));

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    [cid + "total", stateQ], // 의존 값
    // cid + "total",
    (context) => fetchData(stateQ, context.pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.lastDoc || undefined,
    }
  );

  const lastElementRef = useIntersectionObserver(isFetchingNextPage, hasNextPage, fetchNextPage);

  useEffect(() => {
    const [orderKey, orderOption] = orderFilter.split("/");

    if (orderKey && orderOption) {
      setStateQ(query(q, orderBy(orderKey, orderOption as "asc" | "desc")));
    }
  }, [orderFilter]);

  return (
    <>
      <button onClick={() => navigate(-1)}>👉🏻 뒤로가기</button>
      <div className="w-full flex flex-col items-center p-20">
        <h2 className="scroll-m-20 border-b pb-10 text-3xl font-semibold tracking-tight first:mt-0">
          {cid}
        </h2>
        <div className="mb-3">
          <Select value={orderFilter} onValueChange={(value) => setOrderFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt/desc">최신순</SelectItem>
              <SelectItem value="productPrice/desc">높은 가격순</SelectItem>
              <SelectItem value="productPrice/asc">낮은 가격순</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* product list */}
        <div className="flex flex-wrap w-5/6 pl-4">
          {data?.pages.flatMap((pageData, i) => {
            return pageData.data.map((product, j) => {
              if (i === data.pages.length - 1 && j === pageData.data.length - 1) {
                // 마지막 요소 lastElementRef 추가
                return (
                  <div ref={lastElementRef} key={product.id}>
                    <ProductCard product={product}></ProductCard>
                  </div>
                );
              } else {
                return (
                  <div key={product.id}>
                    <ProductCard product={product}></ProductCard>
                  </div>
                );
              }
            });
          })}
        </div>
      </div>
    </>
  );
};

export default Category;
