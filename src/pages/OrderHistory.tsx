import { useAuth } from "@/context/AuthContext";
import MainContainer from "@/components/Common/MainContainer";
import NavBar from "@/components/Common/NavBar";
import MetaTag from "@/components/Common/SEOMetaTag";
import { Order, OrderGroup } from "@/interfaces/Order";
import { Product } from "@/interfaces/Product";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrderGroupItem from "@/components/Order/OrderGroupItem";
import { fetchStoreData, fetchStoreDataByField } from "@/services/firebase/firestore";

const OrderHistory = () => {
  const { user } = useAuth() || {};
  if (user) redirectIfNotAuthorized(user);
  const [history, setHistory] = useState<OrderGroup[]>([]);

  // 주문 내역 그룹화
  useEffect(() => {
    const load = async () => {
      const data = await fetchStoreDataByField<Order>("order", "buyerId", user?.userId, [
        orderBy("createdAt", "desc"),
      ]);

      if (data) {
        const groupedData = Object.values(
          data.reduce((acc, cur) => {
            (acc[cur.orderGroupId] = acc[cur.orderGroupId] || []).push(cur);
            return acc;
          }, {} as Record<string, Order[]>)
        );

        const historyPromises = groupedData.map(async (group) => {
          const firstOrder = group[0];
          const data = await fetchStoreData<Product>("products", firstOrder.productId);

          if (data) {
            return {
              orderGroupId: firstOrder.orderGroupId,
              mainImageSrc: data.productImage[0],
              mainProductName: data.productName,
              orderCreatedAt: firstOrder.createdAt,
              orderStatus: firstOrder.status,
              orderLength: group.length,
            } as OrderGroup;
          }
          return null;
        });

        const historyData = (await Promise.all(historyPromises)).filter(Boolean) as OrderGroup[];
        setHistory(historyData);
      }
    };
    load();
  }, []);

  return (
    <>
      <MetaTag title="주문 내역" description="주문 내역을 확인할 수 있는 페이지입니다." />
      <NavBar />
      <MainContainer>
        <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">주문 내역</h2>
        <div className="w-2/3 flex flex-col gap-4">
          {history?.map((item, idx) => (
            <Link to={`/orderdetail/${user?.userId}/${item.orderGroupId}`} key={idx}>
              <OrderGroupItem item={item} />
            </Link>
          ))}
        </div>
      </MainContainer>
    </>
  );
};

export default OrderHistory;
