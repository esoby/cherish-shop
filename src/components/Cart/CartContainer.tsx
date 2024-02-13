import { useAuth } from "@/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { db } from "@/firebase";
import { Product } from "@/interfaces/Product";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useDataLoad } from "@/hooks/useDataLoad";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Cart } from "@/interfaces/Cart";
import { useMutation, useQuery, useQueryClient } from "react-query";

import * as yup from "yup";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "../ui/toaster";

type ProductsInCart = {
  productId: string;
  cartId: string;
  sellerId: string;
  productName: string;
  productImage: string[];
  productPrice: number;
  cartQuantity: number;
};

const CartContainer = () => {
  const { user } = useAuth() || {};
  const { pid } = useParams();
  const { fetchData: fetchCart } = useDataLoad<Cart>();
  const [errorMsg, setErrorMsg] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const defaultPIC = {
    cartId: "0",
    productId: "default",
    sellerId: "default",
    productName: "default",
    productImage: [],
    productPrice: 0,
    cartQuantity: 0,
  };

  const [productsInCart, setProductsInCart] = useState<ProductsInCart[]>([defaultPIC]);

  const [checkedItems, setCheckedItems] = useState(new Array(productsInCart.length).fill(false));

  // 유저별 카트 데이터 불러오기
  const { data: cartData } = useQuery(["cartproduct", user, pid], () =>
    fetchCart(
      query(
        collection(db, "cart"),
        where("userId", "==", user?.userId),
        orderBy("createdAt", "desc")
      ),
      null
    )
  );
  const [quantities, setQuantities] = useState(cartData?.data.map(() => 1));

  const fetchAllData = async () => {
    const newProductsInCart: ProductsInCart[] = [];
    const newQuantities: number[] = [];

    if (cartData?.data) {
      for (const lst of cartData.data) {
        const pid = lst.productId;
        if (pid) {
          const docRef = doc(db, "products", pid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as Product;
            const newData = {
              cartId: lst.id,
              productId: docSnap.id,
              sellerId: data.sellerId,
              productName: data.productName,
              productImage: data.productImage,
              productPrice: data.productPrice,
              cartQuantity: data.productQuantity < 1 ? 0 : lst.productQuantity,
            };
            newProductsInCart.push(newData);
            newQuantities.push(data.productQuantity < 1 ? 0 : lst.productQuantity);
          }
        }
      }
    }
    setProductsInCart(newProductsInCart);
    setQuantities(newQuantities);
    setCheckedItems(new Array(productsInCart.length).fill(false));
  };

  useEffect(() => {
    fetchAllData();
  }, [cartData]);

  // Filtering non-numeric values
  const filterNumericInput = (value: string) => {
    let num = parseInt(value);
    if (isNaN(num) || num < 0) num = 0;
    return String(num);
  };

  // field validation
  const numberSchema = yup.number().integer().min(1);

  // 수량 변경 input onChange
  const onChange =
    (pid: string, idx: number) => async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      // 재고 체크
      if (pid) {
        const docRef = doc(db, "products", pid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Product;

          const newValue = filterNumericInput(value);
          if (numberSchema.isValidSync(parseInt(newValue))) {
            if (quantities) {
              const newQ = [...quantities];
              newQ[idx] =
                parseInt(value) > data.productQuantity ? data.productQuantity : parseInt(value);
              setQuantities(newQ);
            }
          }
        }
      }
    };

  // 수량 변경
  const updateCart = async ({
    cartId,
    productId,
    cartQuantity,
  }: {
    cartId: string;
    productId: string;
    cartQuantity: number;
  }) => {
    try {
      const newData = {
        productQuantity: cartQuantity,
        updatedAt: serverTimestamp(),
      };
      const docRef = doc(db, "cart", cartId);
      await updateDoc(docRef, newData);
    } catch (error) {
      console.log(error);
    }
  };

  const updateCartMutation = useMutation(updateCart, {
    onSuccess: () => {
      fetchAllData();
      queryClient.invalidateQueries("cartproduct");
    },
  });

  // 체크박스 체크 여부 관리
  const handleCheckChange = (idx: number): void => {
    setCheckedItems((prev) => {
      const newItems = [...prev];
      newItems[idx] = !newItems[idx];
      return newItems;
    });
    setErrorMsg("");
  };

  // 체크된 항목 로컬 스토리지에 저장
  useEffect(() => {
    const checkedItemlst = productsInCart
      .filter((_, index) => checkedItems[index])
      .filter((v) => v.cartQuantity > 0);
    localStorage.setItem("checkedCartItems", JSON.stringify(checkedItemlst));
  }, [checkedItems]);

  // 장바구니 선택 삭제
  const deleteCartItem = async (id: string) => {
    const docRef = doc(db, "cart", id);
    await deleteDoc(docRef);
  };

  const mutationDel = useMutation(deleteCartItem, {
    onSuccess: () => {
      queryClient.invalidateQueries("cartproduct");
    },
  });

  const deleteCheckedItems = async () => {
    if (!checkedItems.filter((v) => v).length) setErrorMsg("선택한 상품이 없습니다.");
    const checkedItemlst = productsInCart.filter((_, index) => checkedItems[index]);

    for (const item of checkedItemlst) {
      await mutationDel.mutateAsync(item.cartId);
    }
  };

  // 주문 버튼
  const orderItems = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> => {
    event.preventDefault();

    // 체크한 상품이 없을 경우
    if (!checkedItems.filter((v) => v).length) {
      setErrorMsg("선택한 상품이 없습니다.");
      return;
    }

    // 체크한 상품은 있지만 품절된 상품들만 존재할 경우
    if (
      !productsInCart.filter((v, idx) => checkedItems[idx]).filter((v) => v.cartQuantity > 0).length
    ) {
      setErrorMsg("주문 가능한 상품을 선택해 주세요.");
      return;
    }

    // 상품 재고 체크
    const promises = productsInCart.map(async (product, idx) => {
      if (checkedItems[idx]) {
        const docRef = doc(db, "products", product.productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Product;

          if (product.cartQuantity > data.productQuantity) {
            toast({
              variant: "destructive",
              title: `[${product.productName}] 상품의 재고가 부족합니다.`,
              description: "장바구니 수량을 변경합니다.",
            });
            if (quantities) {
              const newQ = [...quantities];
              newQ[idx] = data.productQuantity;
              setQuantities(newQ);

              const newData = {
                productQuantity: data.productQuantity,
                updatedAt: serverTimestamp(),
              };
              const docRef = doc(db, "cart", product.cartId);
              await updateDoc(docRef, newData);
              throw new Error(product.productName);
            }
          }
        }
      }
    });

    try {
      await Promise.all(promises);
      const oid = new Date().getTime();
      await saveItemsToTempInventory(String(oid)); // 임시 재고에 상품 저장
      navigate("/order/" + oid);
    } catch (error) {}
  };

  // 주문 시 상품 재고 변동
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

  const saveItemsToTempInventory = async (oid: string) => {
    // 체크된 상품만 임시 재고에 추가
    const checkedProducts = productsInCart.filter((_, idx) => checkedItems[idx]);

    // 상품 수량 변경
    await Promise.all(
      checkedProducts.map((item) => updateProductQuantity(item.productId, -1 * item.cartQuantity))
    );

    const promises = checkedProducts.map(async (product) => {
      const tempInventoryRef = collection(db, "tempInventory");

      // 임시 재고에 상품 정보 저장
      await addDoc(tempInventoryRef, {
        orderGroupId: oid,
        productId: product.productId,
        tempQuantity: product.cartQuantity, // 임시 재고 수량
        timestamp: serverTimestamp(), // 현재 시간
      });
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SheetContent className="overflow-scroll animate-slide-in-from-right">
      <SheetHeader>
        <SheetTitle>장바구니</SheetTitle>
        <SheetDescription>장바구니에 담은 상품 목록입니다.</SheetDescription>
      </SheetHeader>
      <Table className="mt-10">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">이름</TableHead>
            <TableHead className="">수량</TableHead>
            <TableHead className="text-right w-1/3">가격</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productsInCart.map((val, idx) =>
            quantities ? (
              <TableRow key={idx}>
                {/* <TableCell className="font-medium">{val.productImage}</TableCell> */}
                <TableCell className="font-medium">{val.productName}</TableCell>
                <TableCell className="flex gap-1">
                  <Input
                    className="w-10 h-9 appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    type="number"
                    id={`quantity${idx}`}
                    value={quantities[idx]}
                    onChange={onChange(val.productId, idx)}
                    tabIndex={-1}
                  />
                  <Button
                    variant="secondary"
                    className="w-14 h-9"
                    onClick={() =>
                      updateCartMutation.mutate({
                        cartId: val.cartId,
                        productId: val.productId,
                        cartQuantity: quantities[idx],
                      })
                    }
                    tabIndex={-1}
                  >
                    변경
                  </Button>
                </TableCell>
                {val.cartQuantity ? (
                  <TableCell className="text-right">
                    {val.productPrice * val.cartQuantity}원
                  </TableCell>
                ) : (
                  <TableCell className="text-right text-red-500">품절된 상품입니다.</TableCell>
                )}
                <TableCell>
                  <Checkbox
                    id={`chk-${idx}`}
                    checked={checkedItems[idx]}
                    onCheckedChange={() => handleCheckChange(idx)}
                    tabIndex={-1}
                  />
                </TableCell>
              </TableRow>
            ) : (
              ""
            )
          )}
        </TableBody>
      </Table>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-right py-4">
        Total :{" "}
        {productsInCart.reduce(
          (a, c, idx) => (checkedItems[idx] ? a + c.productPrice * c.cartQuantity : a + 0),
          0
        )}
        원
      </h4>
      <h4 className="scroll-m-20 text-sm font-semibold tracking-tight text-center pb-5 text-red-400">
        {errorMsg}
      </h4>
      <SheetFooter className="flex items-center focus:outline-none">
        <Button
          variant="outline"
          className="w-1/2 h-12 focus:outline-none"
          onClick={deleteCheckedItems}
          tabIndex={-1}
        >
          선택 상품 삭제하기
        </Button>
        <Button className="h-12 w-1/2 focus:outline-none" tabIndex={-1} onClick={orderItems}>
          선택 상품 주문하기
        </Button>
      </SheetFooter>
      <Toaster />
    </SheetContent>
  );
};

export default CartContainer;
