import { useAuth } from "@/context/AuthContext";
import MainContainer from "@/components/Common/MainContainer";
import MetaTag from "@/components/Common/SEOMetaTag";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/interfaces/Order";
import { Product } from "@/interfaces/Product";
import {
  deleteStoreData,
  fetchStoreDataByField,
  uploadStoreData,
} from "@/services/firebase/firestore";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "@/context/AlertContext";
import { Cart } from "@/interfaces/Cart";
import { deleteTempStock, restoreTempStock } from "@/services/order/handleStock";
import OrderForm from "@/components/Order/OrderForm";
import { SubmitHandler } from "react-hook-form";
import { OrderFormFields } from "@/types/OrderFormFields";
import OrderItem from "@/components/Order/OrderItem";
import * as PortOne from "@portone/browser-sdk/v2";
import { createPaymentData } from "@/services/order/payment";

const Order = () => {
  const { user } = useAuth() || {};
  if (user) redirectIfNotAuthorized(user);
  const { uid, oid } = useParams();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const [orderCartItems, setOrderCartItems] = useState<Cart[]>();
  const [orderProducts, setOrderProducts] = useState<Product[]>();
  const [totalPrice, setTotalPrice] = useState(0);

  const chkOrder = async () => {
    const data = await fetchStoreDataByField("tempStock", "orderGroupId", oid);
    if (!data[0] || user?.userId !== uid) {
      setAlert(true, "Warning", "잘못된 접근입니다");
      navigate("/");
    }
  };
  useEffect(() => {
    chkOrder();
  }, []);

  // 주문 상품 정보 불러오기
  useEffect(() => {
    let localStorageChk = localStorage.getItem("orderCartItems");
    if (localStorageChk) setOrderCartItems(JSON.parse(localStorageChk));
    localStorageChk = localStorage.getItem("orderProducts");
    if (localStorageChk) setOrderProducts(JSON.parse(localStorageChk));
  }, []);

  useEffect(() => {
    if (orderCartItems && orderProducts) {
      const tmp = orderCartItems.reduce(
        (acc, curr, idx) => acc + orderProducts[idx].productPrice * curr.cartQuantity,
        0
      );
      setTotalPrice(tmp);
    }
  }, [orderCartItems, orderProducts]);

  const handleOrderPayment: SubmitHandler<OrderFormFields> = async (_) => {
    if (orderCartItems && orderProducts && oid) {
      const orderName = `${orderProducts[0].productName} 외 ${orderProducts.length - 1} 상품`;
      const response = await PortOne.requestPayment(
        createPaymentData({ oid, orderName, orderPrice: totalPrice })
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
    if (orderCartItems && orderProducts && oid) {
      // order 주문 데이터 저장
      await Promise.all(
        orderCartItems.map((item, i) => {
          const newData = {
            orderGroupId: oid,
            sellerId: item.sellerId,
            buyerId: user?.userId,
            productId: item.productId,
            productQuantity: item.cartQuantity,
            productPrice: orderProducts[i].productPrice,
            status: OrderStatus.OrderCompleted,
          };
          return uploadStoreData("order", newData);
        })
      );
      // 장바구니 비우기
      await Promise.all(orderCartItems.map(async (item) => await deleteStoreData("cart", item.id)));

      localStorage.setItem("orderCartItems", "");
      localStorage.setItem("orderProducts", "");

      await deleteTempStock(oid);

      navigate(`/orderdetail/${user?.userId}/${oid}`);
    }
  };

  const handleOrderCancelled = async () => {
    setAlert(true, "", "구매가 취소되었습니다.");
    if (oid) await restoreTempStock(oid);
    navigate("/");
  };

  return (
    <>
      <MetaTag title="상품 주문서" description="상품 주문서를 작성하는 페이지입니다." />
      <MainContainer>
        <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">Order</h2>
        <div className="w-2/3 flex flex-col gap-2 pb-10 border-b">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">상품 목록</h4>
          {orderProducts &&
            orderCartItems?.map((item, idx) => (
              <OrderItem key={idx} order={item} product={orderProducts[idx]} />
            ))}
        </div>

        <div className="w-2/3 flex flex-col gap-2 pb-10 border-b">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">결제 금액</h4>
          <h5 className="scroll-m-20 text-xl font-semibold tracking-tight text-right">
            Total : {totalPrice}원
          </h5>
        </div>
        <div className="w-2/3 flex flex-col gap-4 pb-10">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3">
            주문자 정보 입력
          </h4>
          <OrderForm onSubmit={handleOrderPayment} />
          <Button
            variant="outline"
            onClick={async () => handleOrderCancelled()}
            className="flex-grow"
          >
            취소하기
          </Button>
        </div>
      </MainContainer>
    </>
  );
};

export default Order;
