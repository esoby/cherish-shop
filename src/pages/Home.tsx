import { useAuth } from "@/AuthContext";
import { ProductCard } from "@/components/Product/ProductCard";
import { ProductCategory } from "@/components/Product/ProductCategory";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Product } from "@/interfaces/Product";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { useInfiniteQuery } from "react-query";
import { Link } from "react-router-dom";

const Home = () => {
  const user = useAuth();
  redirectIfNotAuthorized(user);

  const { fetchData } = useDataLoad<Product>();
  const category = ["Category1", "Category2", "Category3", "Category4", "Category5"];

  const q = query(collection(db, "products"), orderBy("updatedAt", "desc"), limit(6));

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    "home",
    (context) => fetchData(q, context.pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.lastDoc || undefined,
    }
  );

  const lastElementRef = useIntersectionObserver(isFetchingNextPage, hasNextPage, fetchNextPage);

  return (
    <div className="w-full flex flex-col items-center p-20">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Home
      </h2>
      {user ? (
        <p>
          <Link to={`/mypage/${user?.userId}`}>👉🏻 마이페이지</Link>
        </p>
      ) : (
        <p>
          <Link to={`/signin`}>👉🏻 로그인</Link>
        </p>
      )}
      {category.map((cat, i) => (
        <ProductCategory category={cat} key={i} />
      ))}
      <h1 className="m-10">* (임시) 전체 상품 *</h1>
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
  );
};

export default Home;
