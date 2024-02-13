import { useAuth } from "@/AuthContext";
import CartContainer from "@/components/Cart/CartContainer";
import NavBar from "@/components/Common/NavBar";
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
import { collection, doc, getDoc, limit, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";

const ProductDetail = () => {
  const { user } = useAuth() || {};
  const { pid } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const { fetchData: fetchProducts } = useDataLoad<Product>();
  const { fetchData: fetchCart } = useDataLoad<Cart>();
  const { uploadData: addCart } = useDataUpload();

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

  // 같은 카테고리 최근 상품 불러오기
  const { data: anotherProduct } = useQuery(
    ["productDetail", product?.productCategory],
    () =>
      fetchProducts(
        query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(5),
          where("productCategory", "==", product?.productCategory)
        ),
        null
      ),
    {
      enabled: !!product?.productCategory,
      select: (data: { data: any[] }) => {
        const tmp = data?.data.filter((i) => i.id !== pid);
        return tmp?.length ? tmp.slice(0, 4) : [];
      },
    }
  );

  // 현재 유저의 장바구니에 현재 상품 데이터 가져오기
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

  type UploadDataType = {
    userId: string;
    productId: string;
    productQuantity: number;
  };

  // 카트에 상품 담기
  const mutation = useMutation<UploadDataType, unknown, UploadDataType, { previousItems: any }>(
    (data) => addCart("cart", data),
    {
      onSuccess: () => {
        // 성공 시 카트 정보 다시 가져오기
        queryClient.invalidateQueries("cartproduct");
        queryClient.invalidateQueries("allcartproduct");
      },
    }
  );

  // 장바구니 추가 버튼 클릭
  const addToCart = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
    <>
      <NavBar />
      <div className="relative w-full p-20 mt-16">
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-center">
            <Carousel
              plugins={[
                Autoplay({
                  delay: 2000,
                }),
              ]}
              className="w-96 h-96 rounded-2xl overflow-hidden"
            >
              <CarouselContent>
                {product?.productImage?.map((img: string, idx: number) => (
                  <CarouselItem
                    key={idx}
                    className="flex items-center justify-center bg-gray-100 h-96"
                  >
                    <img src={img} className="h-full object-contain"></img>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          <div className="my-5 flex flex-col items-start w-80">
            <h4 className="scroll-m-20 border-b mb-2 text-2xl font-semibold tracking-tight first:mt-0">
              {product?.productName}
            </h4>
            <p className="text-sm text-muted-foreground">{product?.productCategory}</p>
            <div className="border-2 my-4 p-2 w-full min-h-20 rounded-lg">
              <p className="w-full break-words">{product?.productDescription}</p>
            </div>
            {product?.productQuantity && product?.productQuantity > 0 ? (
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-right w-full">
                {product?.productPrice}원
              </h4>
            ) : (
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-right w-full text-red-500">
                SOLD OUT
              </h4>
            )}
          </div>
          <Sheet>
            {product?.productQuantity && product?.productQuantity > 0 ? (
              <div className="flex gap-2">
                <div onClick={addToCart}>
                  <SheetTrigger asChild>
                    <Button className="w-44">
                      {cartData?.data.length ? "장바구니 보기" : "장바구니 추가"}
                    </Button>
                  </SheetTrigger>
                </div>
                <Button variant="outline" className="w-44">
                  바로 구매하기
                </Button>
              </div>
            ) : (
              ""
            )}
            <CartContainer />
          </Sheet>
        </div>
        {/* 동일 카테고리 제품 추천 */}
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-32 ml-8">
          {anotherProduct?.length ? "이런 상품은 어때요?" : ""}
        </h3>
        <div className="w-56 flex p-5 h-fit gap-2">
          {anotherProduct?.map((pro, i) => (
            <ProductCard product={pro} key={i}></ProductCard>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
