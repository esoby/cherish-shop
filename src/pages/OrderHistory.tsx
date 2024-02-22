import { useAuth } from "@/AuthContext";
import MainContainer from "@/components/Common/MainContainer";
import NavBar from "@/components/Common/NavBar";
import MetaTag from "@/components/Common/SEOMetaTag";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { Order, OrderStatus } from "@/interfaces/Order";
import { Product } from "@/interfaces/Product";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { Timestamp, collection, doc, getDoc, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type History = {
  orderGroupId: string;
  mainImageSrc: string;
  mainProductName: string;
  orderCreatedAt: Timestamp;
  orderStatus: OrderStatus;
  orderLength: number;
};

const OrderHistory = () => {
  const { fetchData } = useDataLoad<Order>();
  const { user } = useAuth() || {};
  if (user) redirectIfNotAuthorized(user);
  const [history, setHistory] = useState<History[]>([]);

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "order"),
        where("buyerId", "==", user?.userId),
        orderBy("createdAt", "desc")
      );
      const { data } = await fetchData(q, null);

      if (data) {
        const groupedData = Object.values(
          (data as Order[]).reduce((acc, cur) => {
            (acc[cur.orderGroupId] = acc[cur.orderGroupId] || []).push(cur);
            return acc;
          }, {} as Record<string, Order[]>)
        );

        const historyPromises = groupedData.map(async (group) => {
          const firstOrder = group[0];

          const collectionRef = collection(db, "products");
          const docRef = doc(collectionRef, firstOrder.productId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const product = docSnap.data() as Product;
            return {
              orderGroupId: firstOrder.orderGroupId,
              mainImageSrc: product.productImage[0],
              mainProductName: product.productName,
              orderCreatedAt: firstOrder.createdAt,
              orderStatus: firstOrder.status,
              orderLength: group.length,
            } as History;
          }
          return null;
        });

        const historyData = (await Promise.all(historyPromises)).filter(Boolean) as History[];
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
          {history?.map((lst, idx) => (
            <Link to={`/orderdetail/${user?.userId}/${lst.orderGroupId}`} key={idx}>
              <Card key={idx} className="flex items-center p-3 pl-4 hover:bg-slate-50">
                <img src={lst.mainImageSrc} className="w-20 h-20 object-cover" />
                <div className="ml-4">
                  <CardTitle className="text-lg m-0">주문 번호 : {lst.orderGroupId}</CardTitle>
                  <CardDescription className="text-gray-700 font-semibold">
                    {lst.mainProductName}
                    {lst.orderLength - 1 > 0 ? ` 외 ${lst.orderLength - 1}` : ""}
                  </CardDescription>
                  <CardDescription className="text-gray-400">
                    {lst.orderCreatedAt.toDate().toString().split(" ").slice(0, 5).join(" ")}
                  </CardDescription>
                  <CardDescription className="text-gray-500">{lst.orderStatus}</CardDescription>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </MainContainer>
    </>
  );
};

export default OrderHistory;
