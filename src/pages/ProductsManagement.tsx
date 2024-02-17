import { Button } from "@/components/ui/button";

import { Link } from "react-router-dom";
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

const ProductsManagement = () => {
  const { user } = useAuth() || {};
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
      <NavBar />
      <div className="w-full flex flex-col items-center p-20 mt-16 gap-5">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Product Management
        </h2>
        <Link to={`/productupload/${user?.userId}`}>
          <Button>상품 추가</Button>
        </Link>
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

export default ProductsManagement;
