import { Button } from "@/components/ui/button";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/AuthContext";
import { db } from "@/firebase";
import { collection, limit, orderBy, query, where } from "firebase/firestore";
import { Product } from "@/interfaces/Product";
import { ProductCard } from "@/components/Product/ProductCard";
import { useInfiniteQuery } from "react-query";
import { useDataLoad } from "@/hooks/useDataLoad";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import NavBar from "@/components/Common/NavBar";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import MetaTag from "@/components/Common/SEOMetaTag";
import MainContainer from "@/components/Common/MainContainer";

const ProductsManagement = () => {
  const { user } = useAuth() || {};
  const navigate = useNavigate();
  if (user) redirectIfNotAuthorized(user);

  const { fetchData: fetchProduct } = useDataLoad<Product>();

  let q = query(
    collection(db, "products"),
    where("sellerId", "==", user?.userId),
    orderBy("updatedAt", "desc"),
    limit(4)
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    "productsmanagement",
    (context) => fetchProduct(q, context.pageParam),
    {
      getNextPageParam: (page) => page.lastDoc || undefined,
    }
  );

  const lastElementRef = useIntersectionObserver(isFetchingNextPage, hasNextPage, fetchNextPage);

  return (
    <>
      <MetaTag
        title="판매 상품 관리"
        description="판매 상품을 관리하는 페이지입니다. 판매 중인 상품을 조회할 수 있습니다."
      />
      <NavBar />
      <MainContainer>
        <div className="w-full flex justify-between">
          <div>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
              판매 상품 관리
            </h2>
          </div>
          <Link to={`/productupload/${user?.userId}`}>
            <Button variant="outline" onClick={() => navigate(`/productupload/${user?.userId}`)}>
              상품 추가
            </Button>
          </Link>
        </div>
        {/* product list */}
        <div className="grid grid-cols-4 gap-4 justify-center">
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
      </MainContainer>
    </>
  );
};

export default ProductsManagement;
