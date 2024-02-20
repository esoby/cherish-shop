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

import { query, collection, where, orderBy, doc, updateDoc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import MetaTag from "@/components/Common/SEOMetaTag";
import MainContainer from "@/components/Common/MainContainer";
import { Product } from "@/interfaces/Product";
import { Link } from "react-router-dom";

const SalesManagement = () => {
  const { user } = useAuth() || {};
  if (user) redirectIfNotAuthorized(user);
  const { fetchData: fetchOrder } = useDataLoad<Order>();
  const [saleStatusList, setSaleStatusList] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: salesList } = useQuery(["orderlist"], () =>
    fetchOrder(
      query(
        collection(db, "order"),
        where("sellerId", "==", user?.userId),
        orderBy("createdAt", "desc")
      ),
      null
    )
  );

  const [productInOrderList, setProductInOrderList] = useState<Product[]>();

  useEffect(() => {
    if (salesList) {
      const productPromises = Array.from(salesList.data).map(async (sale) => {
        const docRef = doc(db, "products", sale.productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap;
      });

      Promise.all(productPromises).then((datas) => {
        const newList = datas.map(
          (v) =>
            ({
              id: v?.id,
              ...v?.data(),
            } as Product)
        );
        setProductInOrderList(newList);
      });
    }
  }, [salesList]);

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
      <MetaTag
        title="판매 내역 관리"
        description="판매 내역을 관리하는 페이지입니다. 주문 정보를 조회하고 상태를 수정할 수 있습니다."
      />
      <NavBar />
      <MainContainer>
        <h2 className="border-b pb-2 text-3xl font-semibold tracking-tight">판매 관리</h2>
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
                    {productInOrderList && (
                      <CardDescription className="text-base text-gray-700 font-semibold hover:text-gray-400">
                        <Link to={`/productdetail/${sale.productId}`}>
                          [ {productInOrderList[idx].productName} ]
                        </Link>
                      </CardDescription>
                    )}
                    <CardDescription className="text-gray-700 font-semibold">
                      수량 : {sale.productQuantity}
                    </CardDescription>
                    <CardDescription className="text-gray-700 font-semibold">
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
                      variant="outline"
                      onClick={() => mutation.mutate({ id: sale.id, val: saleStatusList[idx] })}
                    >
                      변경
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
        </div>
      </MainContainer>
    </>
  );
};

export default SalesManagement;
