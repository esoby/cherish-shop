import { useAuth } from "@/AuthContext";
import CartContainer from "@/components/Cart/CartContainer";
import { ProductCard } from "@/components/Product/ProductCard";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { useDataUpload } from "@/hooks/useDataUpload";
import { Cart } from "@/interfaces/Cart";
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
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";

const ProductDetail = () => {
  const user = useAuth();
  const { pid } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  // const { setCartItems } = useCart();

  const [q, setQ] = useState<Query<DocumentData> | null>(
    query(collection(db, "products"), orderBy("createdAt", "desc"), limit(5))
  );
  const { fetchData: fetchProducts } = useDataLoad<Product>();
  const { fetchData: fetchCart } = useDataLoad<Cart>();
  const { uploadData } = useDataUpload();

  const queryClient = useQueryClient();
  // 상품 문서 가져오기
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

  // 현재 페이지 상품 정보 불러오기
  useEffect(() => {
    fetchProduct();
  }, [pid]);

  // 추천용 같은 카테고리 최근 상품 불러오기
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
    () => (q ? fetchProducts(q, null) : null),
    {
      enabled: !!product,
      select: (data) => {
        const tmp = data?.data.filter((i) => i.id !== pid);
        return tmp?.length ? tmp.slice(0, 4) : [];
      },
    }
  );

  const { data: cartData } = useQuery(["cartproduct"], () =>
    fetchCart(
      query(
        collection(db, "cart"),
        where("userId", "==", user?.userId),
        where("productId", "==", pid)
      ),
      null
    )
  );
  const { data: cartDatas } = useQuery(["allcartproduct"], () =>
    fetchCart(query(collection(db, "cart"), where("userId", "==", user?.userId)), null)
  );
  type UploadDataType = {
    userId: string;
    productId: string;
    productQuantity: number;
  };
  const mutation = useMutation<UploadDataType, unknown, UploadDataType, { previousItems: any }>(
    (data) => uploadData("cart", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("cartproduct");
        queryClient.invalidateQueries("allcartproduct");
      },
    }
  );

  // 장바구니 추가 버튼 클릭
  const addToCart = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      if (pid) {
        // 로그인 여부 확인
        if (!user) {
          alert("로그인 후 이용할 수 있습니다.");
          navigate("/signin");
        }

        if (user) {
          if (!cartData?.data.length) {
            // 카트에 상품 추가
            const newData = {
              userId: user.userId,
              productId: pid,
              productQuantity: 1,
            };
            mutation.mutate(newData);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative">
      <Sheet>
        <SheetTrigger asChild>
          <p className="cursor-pointer font-semibold text-red-600">
            👉🏻 장바구니({cartDatas?.data.length})
          </p>
        </SheetTrigger>
        <CartContainer />
      </Sheet>
      <button onClick={() => navigate(-1)}>👉🏻 뒤로가기</button>
      <div className="flex flex-col items-center w-full">
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
        <Sheet>
          <button onClick={addToCart}>
            <SheetTrigger asChild>
              {cartData?.data.length ? (
                <Button>장바구니 보기</Button>
              ) : (
                <Button>장바구니 추가</Button>
              )}
            </SheetTrigger>
          </button>
          <CartContainer />
        </Sheet>
      </div>
      {/* 동일 카테고리 제품 추천 */}
      <div className="w-56 flex p-5 h-fit gap-2 mr-4">
        {data?.map((product, i) => (
          <ProductCard product={product} key={i}></ProductCard>
        ))}
      </div>
    </div>
  );
};

export default ProductDetail;
