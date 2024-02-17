import { useAuth } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase";
import { useDataUpload } from "@/hooks/useDataUpload";
import { OrderStatus } from "@/interfaces/Order";
import { Product } from "@/interfaces/Product";
import { TempInventory } from "@/interfaces/TempInventory";
import { RequestPayParams, RequestPayResponse } from "@/types/portone";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { Label } from "@radix-ui/react-label";
import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";

type ProductsInCart = {
  productId: string;
  cartId: string;
  sellerId: string;
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
  if (user) redirectIfNotAuthorized(user);
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

  // schema for validation
  const requiredSchema = yup.object().shape({
    email: yup.string().required("Email is required"),
    tel: yup.string().required("Phone number is required"),
    name: yup.string().required("name is required"),
    address: yup.string().required("Address is required"),
    zipcode: yup.string().required("Zipcode is required"),
  });

  // 포트원 연동 및 결제
  const orderPayment = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (!requiredSchema.isValidSync({ ...inputValues })) {
      setErrorMsg("모든 정보를 입력해주세요.");
      return;
    }
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
                  sellerId: item.sellerId,
                  buyerId: user?.userId,
                  productId: item.productId,
                  productQuantity: item.cartQuantity,
                  productPrice: item.productPrice,
                  status: OrderStatus.OrderCompleted,
                };
                return uploadData("order", newData);
              })
            );

            // 장바구니 비우기
            await Promise.all(orderItems.map((item) => deleteCart(item.cartId)));

            localStorage.setItem("checkedCartItems", "");

            // 주문 완료 페이지로 이동
            navigate(`/orderdetail/${user?.userId}/${oid}`);
          } else {
            console.log(error_msg);
            // 결제 실패 시 재고 복구 & 임시 재고 삭제
            alert("결제 실패 : 다시 시도해 주세요.");
            if (oid) await restoreTempInventory(oid);
            navigate("/");
          }
        } catch (error) {
          console.error(error);
          // 결제 실패 시 재고 복구 & 임시 재고 삭제
          alert("결제 실패 : 다시 시도해 주세요.");
          if (oid) await restoreTempInventory(oid);
          navigate("/");
        }
      };
      /* 4. 결제 창 호출하기 */
      IMP.request_pay(data, callback);
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

  // 재고 복구
  const restoreTempInventory = async (oid: string) => {
    try {
      const collectionRef = collection(db, "tempInventory");
      const querySnapshot = await getDocs(collectionRef);
      const docs = querySnapshot.docs;

      for (let doc of docs) {
        const data = doc.data() as TempInventory;
        if (data.orderGroupId === oid) {
          // 본래 상품 재고에 다시 복구
          await updateProductQuantity(data.productId, data.tempQuantity);
          // 임시 재고 데이터 삭제
          await deleteDoc(doc.ref);
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // 장바구니 삭제
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

  // form input onChange
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, id: inputName } = event.target;
    setErrorMsg("");
    setInputValues((prev) => ({ ...prev, [inputName]: value }));
  };

  return (
    <>
      <div className="w-full flex flex-col items-center p-20 gap-5">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Order
        </h2>
        <div className="w-2/3 flex flex-col gap-4">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">상품 목록</h4>
          {orderItems?.map((item, idx) => (
            <Card key={idx} className="flex items-center p-3 pl-4">
              <img src={item.productImage[0]} className="w-20 h-20 object-cover" />
              <div className="ml-4">
                <CardTitle className="text-lg m-0">{item.productName}</CardTitle>
                <CardDescription className="m-0 ">{item.sellerId}</CardDescription>
                <CardDescription className="text-gray-700">
                  가격 : {item.productPrice}
                </CardDescription>
                <CardDescription className="text-gray-700">
                  수량 : {item.cartQuantity}
                </CardDescription>
              </div>
            </Card>
          ))}
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-10">
            주문자 정보 입력
          </h4>
          <form className="flex flex-col gap-2">
            <Label>이름</Label>
            <Input type="text" id="name" value={inputValues?.name} onChange={onChange}></Input>
            <Label>전화번호</Label>
            <Input type="tel" id="tel" value={inputValues?.tel} onChange={onChange}></Input>
            <Label>이메일</Label>
            <Input type="email" id="email" value={inputValues?.email} onChange={onChange}></Input>
            <Label>주소</Label>
            <Input
              type="address"
              id="address"
              value={inputValues?.address}
              onChange={onChange}
            ></Input>
            <Label>우편번호</Label>
            <Input
              type="text"
              id="zipcode"
              value={inputValues?.zipcode}
              onChange={onChange}
            ></Input>
          </form>
          <h4 className="scroll-m-20 text-sm font-semibold tracking-tight text-center p-2 text-red-400">
            {errorMsg}
          </h4>
          <div className="w-full flex gap-3">
            <Button onClick={orderPayment} className="flex-grow">
              결제하기
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (oid) await restoreTempInventory(oid);
                navigate(-1);
              }}
              className="flex-grow"
            >
              취소하기
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Order;
