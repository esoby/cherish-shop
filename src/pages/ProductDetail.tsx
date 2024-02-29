import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

import * as PortOne from "@portone/browser-sdk/v2";
import { DocumentData, DocumentReference, limit, orderBy, where } from "firebase/firestore";
import CartContainer from "@/components/Cart/CartContainer";
import Modal from "@/components/Common/Modal";
import NavBar from "@/components/Common/NavBar";
import { ProductCard } from "@/components/Product/ProductCard";

import { OrderStatus } from "@/interfaces/Order";
import { Product } from "@/interfaces/Product";
import MetaTag from "@/components/Common/SEOMetaTag";
import {
  fetchStoreData,
  fetchStoreDataByField,
  uploadStoreData,
} from "@/services/firebase/firestore";
import { SubmitHandler } from "react-hook-form";
import { OrderFormFields } from "@/types/OrderFormFields";
import OrderForm from "@/components/Order/OrderForm";
import { restoreTempStock, saveItemToTempStock } from "@/services/order/handleStock";
import { createPaymentData } from "@/services/order/payment";
import { ProductCarousel } from "@/components/Product/ProductCarousel";
import { ProductInfo } from "@/components/Product/ProductInfo";

const ProductDetail = () => {
  const { user } = useAuth() || {};
  const { pid } = useParams();
  const navigate = useNavigate();
  const [oid, setOid] = useState<string>();
  const queryClient = useQueryClient();
  const { setAlert } = useAlert();

  // 상품 문서 가져오기
  const { data: product } = useQuery(
    [`productDetail`, pid],
    async () => {
      if (pid) return (await fetchStoreData("products", pid)) as Product;
    },
    { enabled: !!pid }
  );

  // 같은 카테고리 최근 상품 불러오기
  const { data: anotherProduct } = useQuery(
    ["productDetailAnother", product?.productCategory],
    () =>
      fetchStoreDataByField<Product>("products", "productCategory", product?.productCategory, [
        orderBy("createdAt", "desc"),
        limit(5),
      ]),
    {
      enabled: !!product?.productCategory,
      select: (data: Product[]) => {
        const tmp = data?.filter((i) => i.id !== pid);
        return tmp?.length ? tmp.slice(0, 4) : [];
      },
    }
  );
  // 현재 유저의 장바구니에 현재 상품 데이터 가져오기
  const { data: cartData } = useQuery(
    ["cartproduct", pid, user?.userId],
    () => fetchStoreDataByField("cart", "userId", user?.userId, [where("productId", "==", pid)]),
    { enabled: !!pid && !!user?.userId }
  );

  // 카트에 상품 담기
  const cartUpdatemutation = useMutation<
    DocumentReference<DocumentData, DocumentData>,
    Error,
    {
      userId: string;
      sellerId: string;
      productId: string;
      cartQuantity: number;
    }
  >((data) => uploadStoreData("cart", data), {
    onSuccess: () => {
      queryClient.invalidateQueries("cartproduct");
      queryClient.invalidateQueries("allcartproduct");
    },
  });

  // 장바구니 추가 버튼 클릭
  const addToCart = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    if (pid) {
      if (!user) {
        setAlert(true, "Wait!", "로그인 후 이용할 수 있습니다.");
        return;
      }
      if (user && product) {
        cartUpdatemutation.mutate({
          userId: user.userId,
          sellerId: product.sellerId,
          productId: pid,
          cartQuantity: 1,
        });
      }
    }
  };

  // 바로 구매 버튼 클릭
  const handleOrderStart = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!user) {
      setAlert(true, "Wait!", "로그인 후 이용할 수 있습니다.");
      return;
    }
    if (product) {
      const newOid = new Date().getTime().toString();
      try {
        await saveItemToTempStock(String(newOid), product.id); // 임시 재고에 상품 저장
        setOid(newOid);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // 결제하기 버튼 클릭
  const handleOrderPayment: SubmitHandler<OrderFormFields> = async (_) => {
    const flag = confirm("결제하시겠습니까?");
    if (!flag) return;

    if (oid && product) {
      const orderPrice = product.productPrice;
      const orderName = `${product.productName} 상품`;
      const response = await PortOne.requestPayment(
        createPaymentData({ oid, orderName, orderPrice })
      );
      if (!response || response?.code != null) {
        setAlert(true, "결제 실패", "다시 시도해 주세요.");
        await handleOrderCancelled();
        return;
      }
      setAlert(true, "Complete!", "결제가 완료되었습니다.");
      await handleSuccessPayment();
    }
  };

  const handleSuccessPayment = async () => {
    if (product) {
      await uploadStoreData("order", {
        orderGroupId: oid,
        sellerId: product?.sellerId,
        buyerId: user?.userId,
        productId: pid,
        productQuantity: 1,
        productPrice: product?.productPrice,
        status: OrderStatus.OrderCompleted,
      });
      navigate(`/orderdetail/${user?.userId}/${oid}`);
    }
  };

  const handleOrderCancelled = async () => {
    setAlert(true, "", "구매가 취소되었습니다.");
    if (oid) await restoreTempStock(oid);
  };

  return (
    <>
      <MetaTag
        title="상세 페이지"
        description="당신은 세상 제일 귀여운 친구를 만났습니다! 입양을 기다리고 있어요! 서둘러 주세요!"
        url={`/productdetail/${pid}`}
      />
      <NavBar />
      <Modal>
        <main className="w-full flex flex-col items-center mt-16 p-6">
          <div className="flex gap-10">
            {/* 이미지 */}
            {product && <ProductCarousel product={product} />}
            {/* 상품 내용 */}
            <div className="w-96 flex flex-col justify-between p-4">
              {product && <ProductInfo product={product} />}
              <div className="w-fit mt-4">
                {!user?.isSeller && product?.productQuantity && product?.productQuantity > 0 ? (
                  <div className="flex justify-center gap-3">
                    <Sheet>
                      <div onClick={addToCart}>
                        {user ? (
                          <SheetTrigger asChild>
                            <Button className="w-[185px]">
                              {cartData?.length ? "장바구니 보기" : "장바구니 추가"}
                            </Button>
                          </SheetTrigger>
                        ) : (
                          <Button className="w-[185px]">장바구니 추가</Button>
                        )}
                      </div>
                      <CartContainer />
                    </Sheet>
                    {user ? (
                      <Modal.Open>
                        <Button variant="outline" className="w-[185px]" onClick={handleOrderStart}>
                          바로 구매하기
                        </Button>
                      </Modal.Open>
                    ) : (
                      <Button variant="outline" className="w-[185px]" onClick={handleOrderStart}>
                        바로 구매하기
                      </Button>
                    )}
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>
          {/* 동일 카테고리 제품 추천 */}
          <h3 className="mt-24 scroll-m-20 text-xl font-semibold tracking-tight w-full pl-3 mb-4">
            {anotherProduct?.length ? "다른 친구들 구경하기" : ""}
          </h3>
          <div className="w-full overflow-scroll flex gap-4">
            {anotherProduct?.map((pro, i) => (
              <ProductCard product={pro} key={i}></ProductCard>
            ))}
          </div>
        </main>
        {/* 바로 구매 Modal */}
        <Modal.Container>
          <Modal.Header>
            <button onClick={() => handleOrderCancelled()}>
              <Modal.Close />
            </button>
          </Modal.Header>
          <Modal.Body>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">주문서 입력</h4>
            <OrderForm onSubmit={handleOrderPayment} />
          </Modal.Body>
        </Modal.Container>
      </Modal>
    </>
  );
};

export default ProductDetail;
