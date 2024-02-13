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

type ProductsInOrder = {
  productName: string;
  productImage: string[];
  productPrice: number;
  orderQuantity: number;
  orderStatus: string;
};

const OrderDetail = () => {
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
    <div className="pt-20">
      <NavBar />
      <h2>주문 내역</h2>
      {canceled ? <div>주문 취소됨!</div> : ""}
      {orderItems?.map((item, idx) => (
        <div key={idx}>
          <p>{item.productName}</p>
          {/* <p>{item.productImage}</p> */}
          <p>{item.productPrice}</p>
          <p>{item.orderQuantity}</p>
        </div>
      ))}
      {canceled ? "" : <Button onClick={() => cancelOrder()}>주문 취소</Button>}
    </div>
  );
};

export default OrderDetail;
