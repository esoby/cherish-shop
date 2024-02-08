import { useAuth } from "@/AuthContext";
import NavBar from "@/components/Common/NavBar";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { Order } from "@/interfaces/Order";
import { collection, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

const OrderHistory = () => {
  const { fetchData } = useDataLoad();
  const { user } = useAuth() || {};
  const [orderList, setOrderList] = useState<Order[]>();

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, "order"), where("buyerId", "==", user?.userId));

      const { data } = await fetchData(q, null);

      if (data) setOrderList(data as Order[]);
    };
    load();
  }, []);
  return (
    <>
      <NavBar />
      <div>
        {orderList?.map((order, idx) => (
          <div key={idx}>
            <p>{order.createdAt.toString()}</p>
            <p>{order.buyerId}</p>
            <p>{order.productId}</p>
            <p>{order.productQuantity}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default OrderHistory;
