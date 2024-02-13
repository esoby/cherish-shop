import { useAuth } from "@/AuthContext";
import NavBar from "@/components/Common/NavBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { Order, OrderStatus } from "@/interfaces/Order";

import { query, collection, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button } from "@/components/ui/button";

const SalesManagement = () => {
  const { user } = useAuth() || {};
  const { fetchData } = useDataLoad<Order>();

  const [saleStatusList, setSaleStatusList] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data: salesList } = useQuery(["orderlist"], () =>
    fetchData(
      query(
        collection(db, "order"),
        where("sellerId", "==", user?.userId),
        orderBy("createdAt", "desc")
      ),
      null
    )
  );

  const updateOrderStatus = async ({ id, val }: { id: string; val: string }) => {
    try {
      const collectionRef = collection(db, "order");
      const docRef = doc(collectionRef, id);
      await updateDoc(docRef, { status: val });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const mutation = useMutation(updateOrderStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries("orderlist");
    },
  });

  useEffect(() => {
    if (salesList) {
      const newSaleStatusList = salesList.data.map((sale: Order) => sale.status);
      setSaleStatusList(newSaleStatusList);
    }
  }, [salesList]);

  useEffect(() => {
    console.log(saleStatusList);
  }, [salesList]);

  return (
    <>
      <NavBar />
      <div className="pt-32">
        {salesList &&
          salesList.data &&
          salesList?.data.map((sale: Order, idx: number) => (
            <div key={idx} className="hover:bg-slate-100">
              <Link to={`/orderdetail/${user?.userId}/${sale.orderGroupId}`}>
                <p>{sale.createdAt.toDate().toLocaleString()}</p>
                <p>{sale.buyerId}</p>
                <p>{sale.productId}</p>
                <p>{sale.productQuantity}</p>
                <p>{sale.productPrice}</p>
                <p>결제 금액 : {sale.productPrice * sale.productQuantity}</p>
              </Link>
              <div className="p-4 flex">
                <Select
                  value={saleStatusList[idx]}
                  onValueChange={(value) =>
                    setSaleStatusList((prev) => {
                      const newItems = [...prev];
                      newItems[idx] = value;
                      return newItems;
                    })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrderStatus.OrderCompleted}>주문 완료</SelectItem>
                    <SelectItem value={OrderStatus.ReadyForDelivery}>배송 대기</SelectItem>
                    <SelectItem value={OrderStatus.DeliveryStarted}>배송 시작</SelectItem>
                    <SelectItem value={OrderStatus.Cancelled}>주문 취소</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => mutation.mutate({ id: sale.id, val: saleStatusList[idx] })}>
                  변경
                </Button>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default SalesManagement;
