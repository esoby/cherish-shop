import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/AuthContext";
import { Product } from "@/interfaces/Product";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { db } from "@/firebase";
import {
  DocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { useInView } from "react-intersection-observer";

const ProductsManagement = () => {
  const user = useAuth();
  redirectIfNotAuthorized(user);

  // 상품 목록
  const [products, setProducts] = useState<Product[]>([]);

  // 마지막 문서를 저장하는 상태
  const [lastDoc, setLastDoc] = useState<null | DocumentSnapshot>(null);

  // data fetching flag
  const [fetching, setFetching] = useState(false);

  // 상품 목록 조회
  const fetchProducts = async () => {
    setFetching(true);

    let q = query(
      collection(db, "products"),
      where("sellerId", "==", user?.userId),
      orderBy("updatedAt", "desc"),
      limit(6)
    );

    // startAfter 설정
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data: Product[] = [];
    querySnapshot.forEach((doc) => {
      const productData = doc.data() as Product;
      data.push({
        ...productData,
        id: doc.id,
      });
    });

    // 마지막 문서 저장
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

    setProducts((prev) => [...prev, ...data]);

    if (data.length !== 0) setFetching(false);
  };

  // 스크롤이 하단에 도달했는지 감지
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && !fetching) fetchProducts();
  }, [inView]);

  return (
    <div className="w-full flex flex-col items-center p-20 gap-5">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        상품 관리 센터
      </h2>
      <div>{user?.nickname}님 안녕하세요 :)</div>
      <Link to={`/productupload/${user?.userId}`}>
        <Button>상품 추가</Button>
      </Link>
      <Link to={`/`}>
        <Button variant="outline">HOME</Button>
      </Link>
      {/* product list */}
      <div className="flex flex-wrap w-5/6 pl-4">
        {products.map((product) => (
          <Card className="mt-10 w-56 flex flex-col p-5 h-fit gap-2 mr-4" key={product.id}>
            {/* image carousel */}
            <div className="flex justify-center">
              <Carousel
                plugins={[
                  Autoplay({
                    delay: 2000,
                  }),
                ]}
                className="w-56 h-44"
              >
                <CarouselContent>
                  {product.productImage.map((img, idx) => (
                    <CarouselItem
                      key={idx}
                      className="flex items-center justify-center bg-gray-100 h-44"
                    >
                      <img src={img} className=""></img>{" "}
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <Link to={`/productupdate/${user?.userId}/${product.id}`}>
              <CardTitle className="pt-3">{product.productName}</CardTitle>
              <CardDescription className="">{product.productCategory}</CardDescription>
              <p className="flex justify-between border-b pb-1 mb-1">
                <small className="text-sm font-medium text-gray-500">
                  {product.productPrice}원
                </small>
                <small className="text-sm font-medium text-red-500">
                  {product.productQuantity}
                </small>
              </p>
              <p className="text-sm">{product.productDescription}</p>
            </Link>
          </Card>
        ))}
      </div>
      <div ref={ref}></div>
    </div>
  );
};

export default ProductsManagement;
