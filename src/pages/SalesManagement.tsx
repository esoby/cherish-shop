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
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";

const SalesManagement = () => {
  const { user } = useAuth() || {};
  if (user) redirectIfNotAuthorized(user);
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

  // 주문 상태 변경
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

  return (
    <>
      <NavBar />
      <div className="w-full flex flex-col items-center p-20 mt-16 gap-5">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          판매 관리
        </h2>
        <div className="w-4/5 flex flex-col gap-4">
          {salesList &&
            salesList.data &&
            salesList?.data.map((sale: Order, idx: number) => (
              <div key={idx} className="hover:bg-slate-100">
                <Card key={idx} className="flex justify-between items-center p-4">
                  <div className="ml-4">
                    <CardTitle className="text-lg m-0">주문 번호 : {sale.orderGroupId}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {sale.createdAt.toDate().toString().split(" ").slice(0, 5).join(" ")}
                    </CardDescription>
                    <CardDescription className="text-gray-700 font-semibold">
                      {sale.productId}
                    </CardDescription>
                    <CardDescription className="text-gray-700 font-semibold">
                      수량 : {sale.productQuantity}
                    </CardDescription>
                    <CardDescription className="text-gray-700 font-semibold text-base">
                      결제 금액 : {sale.productPrice * sale.productQuantity}
                    </CardDescription>
                  </div>

                  <div className="p-4 flex gap-2">
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
                    <Button
                      onClick={() => mutation.mutate({ id: sale.id, val: saleStatusList[idx] })}
                    >
                      변경
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default SalesManagement;
