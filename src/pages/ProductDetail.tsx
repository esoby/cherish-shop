import { ProductCard } from "@/components/Product/ProductCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { Product } from "@/interfaces/Product";
import Autoplay from "embla-carousel-autoplay";
import {
  DocumentData,
  Query,
  collection,
  doc,
  getDoc,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";

const ProductDetail = () => {
  const { pid } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [q, setQ] = useState<Query<DocumentData> | null>(
    query(collection(db, "products"), orderBy("createdAt", "desc"), limit(5))
  );

  const fetchProduct = async () => {
    if (pid) {
      const docRef = doc(db, "products", pid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Product;
        setProduct({ ...data });
      }
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [pid]);

  const { fetchData } = useDataLoad<Product>();
  useEffect(() => {
    if (product?.productCategory) {
      setQ(
        query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(5),
          where("productCategory", "==", product.productCategory)
        )
      );
    }
  }, [product]);

  const { data } = useQuery(
    ["productDetail", product?.productCategory],
    () => (q ? fetchData(q, null) : null),
    {
      enabled: !!product,
      select: (data) => {
        const tmp = data?.data.filter((i) => i.id !== pid);
        return tmp?.length ? tmp.slice(0, 4) : [];
      },
    }
  );

  return (
    <>
      <button onClick={() => navigate(-1)}>👉🏻 뒤로가기</button>
      <div className="flex flex-col items-center pt-20">
        <div className="flex justify-center">
          <Carousel
            plugins={[
              Autoplay({
                delay: 2000,
              }),
            ]}
            className="w-96 h-96"
          >
            <CarouselContent>
              {product?.productImage?.map((img: string, idx: number) => (
                <CarouselItem
                  key={idx}
                  className="flex items-center justify-center bg-gray-100 h-96"
                >
                  <img src={img} className=""></img>{" "}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        <div>
          <div>{product?.productName}</div>
          <div>{product?.productPrice}</div>
          <div>{product?.productQuantity}</div>
          <div>{product?.productDescription}</div>
        </div>
      </div>

      {/* 동일 카테고리 제품 추천 */}
      <div className="w-56 flex p-5 h-fit gap-2 mr-4">
        {data?.map((product, i) => (
          <ProductCard product={product} key={i}></ProductCard>
        ))}
      </div>
    </>
  );
};

export default ProductDetail;
