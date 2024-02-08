import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase";
import { useDataUpload } from "@/hooks/useDataUpload";
import { Product } from "@/interfaces/Product";
import { RequestPayParams, RequestPayResponse } from "@/types/portone";
import { Label } from "@radix-ui/react-label";
import { collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ProductsInCart = {
  productId: string;
  cartId: string;
  productName: string;
  productImage: string[];
  productPrice: number;
  cartQuantity: number;
};

type FormData = {
  name: string;
  tel: string;
  email: string;
  address: string;
  zipcode: string;
};

const Order = () => {
  const { user } = useAuth() || {};
  const { oid } = useParams();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<ProductsInCart[]>();
  const [errorMsg, setErrorMsg] = useState("");
  const { uploadData } = useDataUpload();

  const [inputValues, setInputValues] = useState<FormData>({
    name: "",
    tel: "",
    email: "",
    address: "",
    zipcode: "",
  });

  useEffect(() => {
    const localStorageChk = localStorage.getItem("checkedCartItems");
    if (localStorageChk) setOrderItems(JSON.parse(localStorageChk));
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 포트원 연동 및 결제
  const orderPayment = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const flag = confirm("결제하시겠습니까?");
    if (!flag) return;
    if (orderItems) {
      if (!window.IMP) return;
      /* 1. 가맹점 식별하기 */
      const { IMP } = window;
      IMP.init(import.meta.env.VITE_APP_IMP_CODE); // 가맹점 식별 코드

      /* 2. 결제 데이터 정의하기 */
      const data: RequestPayParams = {
        pg: "html5_inicis", // PG사
        pay_method: "card", // 결제수단
        merchant_uid: `mid_${oid}`, // 주문번호
        amount: orderItems.reduce((a, c) => a + c.productPrice * c.cartQuantity, 0), // 결제금액
        name: `${orderItems[0].productName} 외 ${orderItems.length} 상품`, // 주문명
        buyer_name: inputValues.name, // 구매자 이름
        buyer_tel: inputValues.tel, // 구매자 전화번호
        buyer_email: inputValues.email, // 구매자 이메일
        buyer_addr: inputValues.address, // 구매자 주소
        buyer_postcode: inputValues.zipcode, // 구매자 우편번호
      };

      /* 3. 콜백 함수 정의하기 */
      const callback = async (response: RequestPayResponse) => {
        try {
          const { success, error_msg } = response;
          if (success) {
            alert("결제가 완료되었습니다.");

            // order에 주문 데이터 저장
            await Promise.all(
              orderItems.map((item) => {
                const newData = {
                  orderGroupId: oid,
                  sellerId: "",
                  buyerId: user?.userId,
                  productId: item.productId,
                  productQuantity: item.cartQuantity,
                  Status: 0,
                };
                return uploadData("order", newData);
              })
            );

            // 상품별 재고 관리
            await Promise.all(
              orderItems.map((item) => updateProductQuantity(item.productId, item.cartQuantity))
            );

            // 장바구니 비우기
            await Promise.all(orderItems.map((item) => deleteCart(item.cartId)));

            localStorage.setItem("checkedCartItems", "");

            // 주문 완료 페이지로 이동
            navigate(`/order-detail/${oid}`);
          } else {
            alert(`결제 실패`);
          }
        } catch (error) {
          console.error(error);
        }
      };
      /* 4. 결제 창 호출하기 */
      IMP.request_pay(data, callback);
    }
  };

  const updateProductQuantity = async (pid: string, num: number) => {
    try {
      const collectionRef = collection(db, "products");
      const docRef = doc(collectionRef, pid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Product;
        await updateDoc(docRef, { productQuantity: data.productQuantity - num });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const deleteCart = async (cid: string) => {
    try {
      const collectionRef = collection(db, "cart");
      const docRef = doc(collectionRef, cid);
      await deleteDoc(docRef);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, id: inputName } = event.target;
    setErrorMsg("");
    setInputValues((prev) => ({ ...prev, [inputName]: value }));
  };

  return (
    <div>
      <h2>상품 목록</h2>
      {orderItems?.map((item, idx) => (
        <div key={idx}>
          <p>{item.productId}</p>
          <p>{item.productName}</p>
          {/* <p>{item.productImage}</p> */}
          <p>{item.productPrice}</p>
          <p>{item.cartQuantity}</p>
        </div>
      ))}
      <h2>정보 입력</h2>
      <form>
        <Label>이름</Label>
        <Input type="text" id="name" value={inputValues?.name} onChange={onChange}></Input>
        <Label>전화번호</Label>
        <Input type="tel" id="tel" value={inputValues?.tel} onChange={onChange}></Input>
        <Label>이메일</Label>
        <Input type="email" id="email" value={inputValues?.email} onChange={onChange}></Input>
        <Label>주소</Label>
        <Input type="address" id="address" value={inputValues?.address} onChange={onChange}></Input>
        <Label>우편번호</Label>
        <Input type="text" id="zipcode" value={inputValues?.zipcode} onChange={onChange}></Input>
      </form>
      <h4 className="scroll-m-20 text-sm font-semibold tracking-tight text-center pb-5 text-red-400">
        {errorMsg}
      </h4>
      <Button onClick={orderPayment}>결제하기</Button>
    </div>
  );
};

export default Order;
