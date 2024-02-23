import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/interfaces/Order";
import { Product } from "@/interfaces/Product";
import { serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "@/components/Common/NavBar";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import MetaTag from "@/components/Common/SEOMetaTag";
import MainContainer from "@/components/Common/MainContainer";
import Loading from "@/components/Common/Loading";
import {
  fetchStoreData,
  fetchStoreDataByField,
  updateStoreData,
} from "@/services/firebase/firestore";
import { updateProductQuantity } from "@/services/order/handleStock";
import OrderItem from "@/components/Order/OrderItem";

const OrderDetail = () => {
  const { user } = useAuth() || {};
  redirectIfNotAuthorized(user);
  const { oid } = useParams();
  const navigate = useNavigate();
  const [cancelled, setCancelled] = useState(false);
  const [orderItems, setOrderItems] = useState<Order[]>();
  const [productItems, setProductItems] = useState<Product[]>();

  // 주문 내역, 상품 정보 불러오기
  const fetchContent = async () => {
    const data = await fetchStoreDataByField<Order>("order", "orderGroupId", oid);
    setOrderItems(data);

    const promises = data.map(
      async (order) => await fetchStoreData<Product>("products", order.productId)
    );

    if (data) setCancelled(data[0].status === OrderStatus.Cancelled);
    const newArr = await Promise.all(promises);
    setProductItems(newArr.filter((v): v is Product => v !== undefined));
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // 주문 취소
  const cancelOrder = async () => {
    if (oid) {
      const orders = await fetchStoreDataByField<Order>("order", "orderGroupId", oid);

      orders.map(async (order) => {
        await updateStoreData("order", order.id, {
          status: OrderStatus.Cancelled,
          updatedAt: serverTimestamp(),
        });
        await updateProductQuantity(order.productId, order.productQuantity);
      });
      setCancelled(true);
    }
  };

  if (!orderItems || !productItems) return <Loading />;

  return (
    <>
      <MetaTag title="주문 상세 내역" description="주문 상세 내역을 확인할 수 있는 페이지입니다." />
      <NavBar />
      <MainContainer>
        <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight"> 주문 상세 내역</h2>
        <div className="w-2/3 flex flex-col gap-4">
          {orderItems?.map((item, idx) => (
            <OrderItem key={idx} order={item} product={productItems[idx]} />
          ))}
          <div>
            {cancelled && (
              <h4 className="text-sm font-semibold tracking-tight text-red-400 text-right">
                취소된 주문 내역입니다.
              </h4>
            )}
            <h5
              className={`scroll-m-20 text-lg font-semibold tracking-tight text-right ${
                cancelled ? "text-gray-400 line-through" : ""
              }`}
            >
              총 결제 금액 :{" "}
              {orderItems?.reduce((a, c) => a + c.productPrice * c.productQuantity, 0)}원
            </h5>
          </div>
          {!cancelled && <Button onClick={() => cancelOrder()}>주문 취소</Button>}
          <Button variant="outline" onClick={() => navigate(`/orderhistory/${user?.userId}`)}>
            목록 보기
          </Button>
        </div>
      </MainContainer>
    </>
  );
};

export default OrderDetail;
