import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { useDataLoad } from "@/hooks/useDataLoad";
import { Order, OrderStatus } from "@/interfaces/Order";
import { Product } from "@/interfaces/Product";
import {
  collection,
  doc,
  getDoc,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "@/components/Common/NavBar";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type ProductsInOrder = {
  productName: string;
  sellerId: string;
  productImage: string[];
  productPrice: number;
  orderQuantity: number;
  orderStatus: string;
};

const OrderDetail = () => {
  const { user } = useAuth() || {};
  const { oid } = useParams();
  const navigate = useNavigate();
  const [canceled, setCanceled] = useState(false);
  const [orderItems, setOrderItems] = useState<ProductsInOrder[]>();

  const { fetchData } = useDataLoad<Order>();

  useEffect(() => {
    const fetchProductData = async (pid: string) => {
      if (pid) {
        const docRef = doc(db, "products", pid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          return data;
        }
        return null;
      }
    };

    // 주문 내역 불러오기
    const fetch = async () => {
      const q = query(collection(db, "order"), where("orderGroupId", "==", oid));
      const { data } = await fetchData(q, null);

      const promises = data.map(async (v) => {
        const p = await fetchProductData(v.productId);
        if (p) {
          return {
            productName: p.productName,
            productImage: p.productImage,
            productPrice: p.productPrice,
            sellerId: v.sellerId,
            orderQuantity: v.productQuantity,
            orderStatus: v.status,
          } as ProductsInOrder;
        }
      });

      if (data) setCanceled(data[0].status === OrderStatus.Cancelled);
      const newArr = await Promise.all(promises);
      setOrderItems(newArr.filter(Boolean) as ProductsInOrder[]);

      return data;
    };

    fetch();
  }, []);

  // 주문 취소
  const cancelOrder = async () => {
    try {
      if (oid) {
        const q = query(collection(db, "order"), where("orderGroupId", "==", oid));
        const { data } = await fetchData(q, null);

        data.map(async (d) => {
          const newData = {
            ...d,
            status: OrderStatus.Cancelled,
            updatedAt: serverTimestamp(),
          };
          const docRef = doc(db, "order", d.id);
          await updateDoc(docRef, newData);
          await updateProductQuantity(d.productId, d.productQuantity);
        });
        setCanceled(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 상품 재고 변동
  const updateProductQuantity = async (pid: string, num: number) => {
    try {
      const collectionRef = collection(db, "products");
      const docRef = doc(collectionRef, pid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Product;
        await updateDoc(docRef, { productQuantity: data.productQuantity + num });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <>
      <NavBar />
      <div className="w-full flex flex-col items-center p-20 mt-16 gap-5">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          주문 상세 내역
        </h2>
        <div className="w-2/3 flex flex-col gap-4">
          {orderItems?.map((item, idx) => (
            <Card key={idx} className="flex items-center p-3 pl-4">
              <img src={item.productImage[0]} className="w-20 h-20 object-cover" />
              <div className="ml-4">
                <CardTitle className="text-lg m-0">{item.productName}</CardTitle>
                <CardDescription className="m-0">{item.sellerId}</CardDescription>
                <CardDescription className="text-gray-700">
                  가격 : {item.productPrice}
                </CardDescription>
                <CardDescription className="text-gray-700">
                  주문 수량 : {item.orderQuantity}
                </CardDescription>
              </div>
            </Card>
          ))}

          {canceled ? (
            <div>
              <h4 className="text-sm font-semibold tracking-tight p-2 text-red-400 text-right">
                취소된 주문 내역입니다.
              </h4>
              <h5 className="scroll-m-20 text-lg font-semibold tracking-tight text-right line-through">
                총 결제 금액 :{" "}
                {orderItems?.reduce((a, c) => a + c.productPrice * c.orderQuantity, 0)}원
              </h5>
            </div>
          ) : (
            <h5 className="scroll-m-20 text-lg font-semibold tracking-tight text-right">
              총 결제 금액 : {orderItems?.reduce((a, c) => a + c.productPrice * c.orderQuantity, 0)}
              원
            </h5>
          )}
          {canceled ? "" : <Button onClick={() => cancelOrder()}>주문 취소</Button>}
          <Button variant="outline" onClick={() => navigate(-1)}>
            목록 보기
          </Button>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
