import { useAuth } from "@/AuthContext";
import NavBar from "@/components/Common/NavBar";
import { ProductCard } from "@/components/Product/ProductCard";
import { ProductCategory } from "@/components/Product/ProductCategory";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Product } from "@/interfaces/Product";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { useInfiniteQuery } from "react-query";

const Home = () => {
  const { user } = useAuth() || {};
  redirectIfNotAuthorized(user);

  // const { fetchData } = useDataLoad<Product>();
  const category = ["Category1", "Category2", "Category3", "Category4", "Category5"];

  // const q = query(collection(db, "products"), orderBy("updatedAt", "desc"), limit(6));

  // const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
  //   "home",
  //   (context) => fetchData(q, context.pageParam),
  //   {
  //     getNextPageParam: (lastPage) => lastPage.lastDoc || undefined,
  //   }
  // );

  // const lastElementRef = useIntersectionObserver(isFetchingNextPage, hasNextPage, fetchNextPage);

  return (
    <>
      <NavBar />
      <div className="w-full flex flex-col items-center p-20 mt-16">
        {category.map((cat, i) => (
          <ProductCategory category={cat} key={i} />
        ))}
        {/* <h1 className="m-10">* (임시) 전체 상품 *</h1> */}
        {/* product list */}
        {/* <div className="flex flex-wrap w-5/6 pl-4">
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
        </div> */}
      </div>
    </>
  );
};

export default Home;
