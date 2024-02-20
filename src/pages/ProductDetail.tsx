import { ChangeEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/AuthContext";

import { db } from "@/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import * as yup from "yup";

import CartContainer from "@/components/Cart/CartContainer";
import Modal from "@/components/Common/Modal";
import NavBar from "@/components/Common/NavBar";
import { ProductCard } from "@/components/Product/ProductCard";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import Autoplay from "embla-carousel-autoplay";

import { useDataLoad } from "@/hooks/useDataLoad";
import { useDataUpload } from "@/hooks/useDataUpload";
import { RequestPayParams, RequestPayResponse } from "@/types/portone";
import { OrderStatus } from "@/interfaces/Order";
import { Cart } from "@/interfaces/Cart";
import { Product } from "@/interfaces/Product";
import { TempInventory } from "@/interfaces/TempInventory";
import MetaTag from "@/components/Common/SEOMetaTag";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormData = {
  name: string;
  tel: string;
  email: string;
  address: string;
  zipcode: string;
};

const ProductDetail = () => {
  const { user } = useAuth() || {};
  const { pid } = useParams();
  const navigate = useNavigate();
  const { fetchData: fetchProducts } = useDataLoad<Product>();
  const { fetchData: fetchCart } = useDataLoad<Cart>();
  const { uploadData: addCart } = useDataUpload();
  const [errorMsg, setErrorMsg] = useState("");

  const [oid, setOid] = useState<string>();
  const { uploadData } = useDataUpload();
  const [inputValues, setInputValues] = useState<FormData>({
    name: "",
    tel: "",
    email: "",
    address: "",
    zipcode: "",
  });
  const queryClient = useQueryClient();

  const [showAlert, setShowAlert] = useState<string>("");

  // 상품 문서 가져오기
  const fetchProduct = async (pid: string | undefined) => {
    if (pid) {
      const docRef = doc(db, "products", pid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Product;
      }
    }
  };

  const { data: product } = useQuery([`productDetail`, pid], () => fetchProduct(pid), {
    enabled: !!pid,
  });

  // 같은 카테고리 최근 상품 불러오기
  const { data: anotherProduct } = useQuery(
    ["productDetailAnother", product?.productCategory],
    () =>
      fetchProducts(
        query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(5),
          where("productCategory", "==", product?.productCategory)
        ),
        null
      ),
    {
      enabled: !!product?.productCategory,
      select: (data: { data: any[] }) => {
        const tmp = data?.data.filter((i) => i.id !== pid);
        return tmp?.length ? tmp.slice(0, 4) : [];
      },
    }
  );

  // 현재 유저의 장바구니에 현재 상품 데이터 가져오기
  const { data: cartData } = useQuery(
    ["cartproduct", pid, user?.userId],
    () =>
      fetchCart(
        query(
          collection(db, "cart"),
          where("userId", "==", user?.userId),
          where("productId", "==", pid)
        ),
        null
      ),
    { enabled: !!pid && !!user?.userId }
  );

  type UploadDataType = {
    userId: string;
    productId: string;
    productQuantity: number;
  };

  // 카트에 상품 담기
  const mutation = useMutation<UploadDataType, unknown, UploadDataType, { previousItems: any }>(
    (data) => addCart("cart", data),
    {
      onSuccess: () => {
        // 성공 시 카트 정보 다시 가져오기
        queryClient.invalidateQueries("cartproduct");
        queryClient.invalidateQueries("allcartproduct");
      },
    }
  );

  // 장바구니 추가 버튼 클릭
  const addToCart = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    try {
      if (pid) {
        // 로그인 여부 확인
        if (!user) {
          setShowAlert("로그인 후 이용할 수 있습니다.");
          return;
        }

        if (user) {
          if (!cartData?.data.length) {
            // 카트에 상품 추가
            const newData = {
              userId: user.userId,
              productId: pid,
              productQuantity: 1,
            };
            mutation.mutate(newData);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  // form input onChange
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, id: inputName } = event.target;
    setErrorMsg("");
    setInputValues((prev) => ({ ...prev, [inputName]: value }));
  };

  // schema for validation
  const requiredSchema = yup.object().shape({
    email: yup.string().required("Email is required"),
    tel: yup.string().required("Phone number is required"),
    name: yup.string().required("name is required"),
    address: yup.string().required("Address is required"),
    zipcode: yup.string().required("Zipcode is required"),
  });

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
    event.preventDefault();
    if (!requiredSchema.isValidSync({ ...inputValues })) {
      setErrorMsg("모든 정보를 입력해주세요.");
      return;
    }
    const flag = confirm("결제하시겠습니까?");
    if (!flag) return;

    if (product) {
      if (!window.IMP) return;

      /* 1. 가맹점 식별하기 */
      const { IMP } = window;
      IMP.init(import.meta.env.VITE_APP_IMP_CODE); // 가맹점 식별 코드

      /* 2. 결제 데이터 정의하기 */
      const data: RequestPayParams = {
        pg: "html5_inicis", // PG사
        pay_method: "card", // 결제수단
        merchant_uid: `mid_${oid}`, // 주문번호
        amount: product.productPrice, // 결제금액
        name: product.productName + "상품", // 주문명
        buyer_name: inputValues.name, // 구매자 이름
        buyer_tel: inputValues.tel, // 구매자 전화번호
        buyer_email: inputValues.email, // 구매자 이메일
        buyer_addr: inputValues.address, // 구매자 주소
        buyer_postcode: inputValues.zipcode, // 구매자 우편번호
      };

      /* 3. 콜백 함수 정의하기 */
      const callback = async (response: RequestPayResponse) => {
        try {
          const { success } = response;
          if (success) {
            alert("결제가 완료되었습니다.");

            const newData = {
              orderGroupId: oid,
              sellerId: product.sellerId,
              buyerId: user?.userId,
              productId: pid,
              productQuantity: 1,
              productPrice: product.productPrice,
              status: OrderStatus.OrderCompleted,
            };
            await uploadData("order", newData);

            // 주문 완료 페이지로 이동
            navigate(`/orderdetail/${user?.userId}/${oid}`);
          } else {
            // 결제 실패 시 재고 복구 & 임시 재고 삭제
            alert("결제 실패 : 다시 시도해 주세요.");
            if (oid) await restoreTempInventory(oid);
            window.location.reload();
          }
        } catch (error) {
          console.error(error);
          // 결제 실패 시 재고 복구 & 임시 재고 삭제
          alert("결제 실패 : 다시 시도해 주세요.");
          if (oid) await restoreTempInventory(oid);
          window.location.reload();
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

  async function startOrder(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    event.preventDefault();

    if (!user) {
      setShowAlert("로그인 후 이용할 수 있습니다.");
      return;
    }

    if (product) {
      const newOid = new Date().getTime().toString();
      await saveItemsToTempInventory(String(newOid)); // 임시 재고에 상품 저장
      setOid(newOid);
    }
  }

  const saveItemsToTempInventory = async (oid: string) => {
    try {
      // 상품 수량 변경
      if (pid) {
        await updateProductQuantity(pid, -1);

        const tempInventoryRef = collection(db, "tempInventory");

        // 임시 재고에 상품 정보 저장
        await addDoc(tempInventoryRef, {
          orderGroupId: oid,
          productId: pid,
          tempQuantity: 1, // 임시 재고 수량
          timestamp: serverTimestamp(), // 현재 시간
        });
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <MetaTag
        title="상세 페이지"
        description="당신은 세상 제일 귀여운 친구를 만났습니다! 입양을 기다리고 있어요! 서둘러 주세요!"
        url={`/productdetail/${pid}`}
      />
      <NavBar />
      <Modal>
        <main className="w-full flex flex-col items-center mt-16">
          {showAlert.length > 0 && (
            <div
              onClick={() => setShowAlert("")}
              className="w-screen h-screen absolute top-0 left-0 z-50 bg-black opacity-30"
            ></div>
          )}
          <div className="flex gap-5">
            {/* 이미지 */}
            <Carousel
              plugins={[
                Autoplay({
                  delay: 2000,
                }),
              ]}
              className="w-96 h-96 rounded-xl overflow-hidden"
            >
              <CarouselContent>
                {product?.productImage?.map((img: string, idx: number) => (
                  <CarouselItem
                    key={idx}
                    className="flex items-center justify-center bg-gray-100 h-96"
                  >
                    <img
                      src={img}
                      className="h-full object-contain"
                      alt={`${product.productName} image ${idx}`}
                    ></img>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="w-96 flex flex-col justify-between p-4">
              <div className="flex flex-col gap-2 w-96">
                <h4 className="border-b pb-2 text-2xl font-semibold tracking-tight">
                  {product?.productName}
                </h4>
                <p className="text-sm text-muted-foreground">{product?.productCategory}</p>
                <div className="border-2 my-4 p-2 w-full min-h-20 rounded-lg">
                  <p className="w-full break-words">{product?.productDescription}</p>
                </div>
                {product?.productQuantity && product?.productQuantity > 0 ? (
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-right w-full">
                    {product?.productPrice}원
                  </h4>
                ) : (
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-right w-full text-red-500">
                    SOLD OUT
                  </h4>
                )}
              </div>
              <div className="w-fit">
                {!user?.isSeller && product?.productQuantity && product?.productQuantity > 0 ? (
                  <div className="flex justify-center gap-3">
                    <Sheet>
                      <div onClick={addToCart}>
                        {user ? (
                          <SheetTrigger asChild>
                            <Button className="w-[185px]">
                              {cartData?.data.length ? "장바구니 보기" : "장바구니 추가"}
                            </Button>
                          </SheetTrigger>
                        ) : (
                          <Button className="w-[185px]">장바구니 추가</Button>
                        )}
                      </div>
                      <CartContainer />
                    </Sheet>
                    {user ? (
                      <Modal.Open>
                        <Button variant="outline" className="w-[185px]" onClick={startOrder}>
                          바로 구매하기
                        </Button>
                      </Modal.Open>
                    ) : (
                      <Button variant="outline" className="w-[185px]" onClick={startOrder}>
                        바로 구매하기
                      </Button>
                    )}
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>
          {/* 동일 카테고리 제품 추천 */}
          <h3 className="mt-24 scroll-m-20 text-xl font-semibold tracking-tight w-full pl-6">
            {anotherProduct?.length ? "다른 친구들 구경하기" : ""}
          </h3>
          <div className="w-full overflow-scroll flex pt-5 gap-3 px-4 justify-between">
            {anotherProduct?.map((pro, i) => (
              <ProductCard product={pro} key={i}></ProductCard>
            ))}
          </div>
        </main>
        {/* 바로 구매 Modal */}
        <Modal.Container>
          <Modal.Header>
            <Modal.Close />
          </Modal.Header>
          <Modal.Body>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">
              주문자 정보 입력
            </h4>
            <form className="flex flex-col gap-3 w-full">
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
            <h4 className="scroll-m-20 text-sm font-semibold tracking-tight text-center p-4 text-red-400">
              {errorMsg}
            </h4>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={orderPayment} className="w-full">
              결제하기
            </Button>
          </Modal.Footer>
        </Modal.Container>
      </Modal>
      {showAlert.length > 0 && (
        <Alert className="z-50 bg-slate-50 fixed left-1/4 w-1/2 -translate-x-1/2 top-16 animate-bounce">
          <AlertTitle>Wait!</AlertTitle>
          <AlertDescription>{showAlert}</AlertDescription>
          <AlertDescription className="text-right">
            <Button
              onClick={() => {
                setShowAlert("");
                navigate("/signin");
              }}
            >
              확인
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ProductDetail;
