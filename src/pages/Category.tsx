import { ProductCard } from "@/components/Product/ProductCard";
import { db } from "@/services/firebase/firebaseConfig";
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
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavBar from "@/components/Common/NavBar";
import MetaTag from "@/components/Common/SEOMetaTag";
import MainContainer from "@/components/Common/MainContainer";

const Category = () => {
  const { cid } = useParams();
  const { fetchData } = useDataLoad<Product>();
  const [orderFilter, setOrderFilter] = useState("createdAt/desc");

  // 기본 쿼리
  let q = query(collection(db, "products"), where("productCategory", "==", cid), limit(8));

  const [stateQ, setStateQ] = useState<Query>(query(q, orderBy("createdAt", "desc")));

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    [cid + "total", stateQ],
    (context) => fetchData(stateQ, context.pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.lastDoc || undefined,
    }
  );

  const lastElementRef = useIntersectionObserver(isFetchingNextPage, hasNextPage, fetchNextPage);

  // 정렬 방식별 쿼리 세팅
  useEffect(() => {
    const [orderKey, orderOption] = orderFilter.split("/");

    if (orderKey && orderOption) {
      setStateQ(query(q, orderBy(orderKey, orderOption as "asc" | "desc")));
    }
  }, [orderFilter]);

  return (
    <>
      <MetaTag
        title={`카테고리별 상품 살펴보기`}
        description="Cherish의 카테고리별 친구들을 모아모아 살펴볼 수 있는 페이지입니다. 취향에 맞는 세상 최고 귀여운 친구를 발견해보세요!"
        url={`/category/${cid}`}
      />
      <NavBar />
      <MainContainer>
        <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">{cid}</h2>
        <Select
          value={orderFilter}
          onValueChange={(value) => setOrderFilter(value)}
          name="정렬방식선택"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue id="sort" placeholder="선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt/desc">최신순</SelectItem>
            <SelectItem value="productPrice/desc">높은 가격순</SelectItem>
            <SelectItem value="productPrice/asc">낮은 가격순</SelectItem>
          </SelectContent>
        </Select>
        {/* product list */}
        <div className="grid grid-cols-4 gap-4 justify-center">
          {data?.pages.flatMap((pageData, i) => {
            return pageData.data.map((product, j) => {
              if (i === data.pages.length - 1 && j === pageData.data.length - 1) {
                // 마지막 요소 lastElementRef
                return (
                  <div ref={lastElementRef} key={product.id} className="mb-4">
                    <ProductCard product={product}></ProductCard>
                  </div>
                );
              } else {
                return (
                  <div key={product.id} className="mb-4">
                    <ProductCard product={product}></ProductCard>
                  </div>
                );
              }
            });
          })}
        </div>
      </MainContainer>
    </>
  );
};

export default Category;
