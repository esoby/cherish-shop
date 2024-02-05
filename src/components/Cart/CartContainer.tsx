import { useAuth } from "@/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { db } from "@/firebase";
import { Product } from "@/interfaces/Product";
import {
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

type ProductsInCart = {
  productId: string;
  cartId: string;
  productName: string;
  productImage: string[];
  productPrice: number;
  cartQuantity: number;
};

const CartContainer = () => {
  const { user } = useAuth() || {};
  const { pid } = useParams();
  const { fetchData: fetchCart } = useDataLoad<Cart>();

  const queryClient = useQueryClient();

  const defaultPIC = {
    cartId: "0",
    productId: "default",
    productName: "default",
    productImage: [],
    productPrice: 0,
    cartQuantity: 0,
  };

  const [productsInCart, setProductsInCart] = useState<ProductsInCart[]>([defaultPIC]);

  const [checkedItems, setCheckedItems] = useState(new Array(productsInCart.length).fill(false));

  // 유저별 카트 데이터 뽑아오기
  const { data: cartData } = useQuery(["cartproduct", user, pid], () =>
    fetchCart(query(collection(db, "cart"), where("userId", "==", user?.userId)), null)
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
              productName: data.productName,
              productImage: data.productImage,
              productPrice: data.productPrice,
              cartQuantity: lst.productQuantity,
            };
            newProductsInCart.push(newData);
            newQuantities.push(lst.productQuantity);
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

  const onChange = (idx: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    const newValue = filterNumericInput(value);
    if (numberSchema.isValidSync(parseInt(newValue))) {
      if (quantities) {
        const newQ = [...quantities];
        newQ[idx] = parseInt(value);
        setQuantities(newQ);
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
        userId: user?.userId,
        productId: productId,
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

  const handleCheckChange = (idx: number): void => {
    setCheckedItems((prev) => {
      const newItems = [...prev];
      newItems[idx] = !newItems[idx];
      return newItems;
    });
  };

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
    const checkedItemlst = productsInCart.filter((_, index) => checkedItems[index]);

    for (const item of checkedItemlst) {
      await mutationDel.mutateAsync(item.cartId);
    }
  };

  return (
    <SheetContent className="overflow-scroll">
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
            val.cartQuantity && quantities ? (
              <TableRow key={idx}>
                <TableCell className="font-medium">{val.productName}</TableCell>
                <TableCell className="flex gap-1">
                  <Input
                    className="w-10 h-9 appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    type="number"
                    value={quantities[idx]}
                    onChange={onChange(idx)}
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
                <TableCell className="text-right">
                  {val.productPrice * val.cartQuantity}원
                </TableCell>
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
        Total : {productsInCart.reduce((a, c) => a + c.productPrice * c.cartQuantity, 0)}원
      </h4>
      <SheetFooter className="flex items-center">
        <Button variant="outline" className="w-1/2 text-lg h-12" onClick={deleteCheckedItems}>
          선택 상품 삭제하기
        </Button>
        <button className="w-1/2" onClick={() => {}}>
          <Button className="text-lg h-12 w-full">선택 상품 주문하기</Button>
        </button>
      </SheetFooter>
    </SheetContent>
  );
};

export default CartContainer;
