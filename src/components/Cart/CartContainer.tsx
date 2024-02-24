import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Product } from "@/interfaces/Product";
import { orderBy } from "firebase/firestore";
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Cart } from "@/interfaces/Cart";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "../ui/toaster";
import { saveItemsToTempStock } from "@/services/order/handleStock";
import { fetchStoreData, fetchStoreDataByField } from "@/services/firebase/firestore";
import { updateCart, deleteCheckedCartItems } from "@/services/cart";
import CartTableRow from "./CartTableRow";

const CartContainer = () => {
  const { user } = useAuth() || {};
  const { pid } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [productsInCart, setProductsInCart] = useState<Product[]>();

  const queryClient = useQueryClient();

  // 유저별 카트 데이터 불러오기
  const { data: cartData } = useQuery(["cartproduct", user, pid], () =>
    fetchStoreDataByField<Cart>("cart", "userId", user?.userId, [orderBy("createdAt", "desc")])
  );

  const [checkedItems, setCheckedItems] = useState(new Array(cartData?.length).fill(false));
  const [quantities, setQuantities] = useState(cartData?.map(() => 1));

  const fetchAllData = async () => {
    const newProductsInCart: Product[] = [];
    const newQuantities: number[] = [];

    if (cartData) {
      for (const lst of cartData) {
        const data = await fetchStoreData<Product>("products", lst.productId);
        if (data) {
          newProductsInCart.push(data);
          newQuantities.push(data.productQuantity < 1 ? 0 : lst.cartQuantity);
        }
      }
    }
    setProductsInCart(newProductsInCart);
    setQuantities(newQuantities);
    setCheckedItems(new Array(cartData?.length).fill(false));
  };

  useEffect(() => {
    fetchAllData();
  }, [cartData]);

  // 장바구니 수량 변경
  const updateCartMutation = useMutation(updateCart, {
    onSuccess: () => {
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
    if (cartData && productsInCart) {
      const c = cartData.filter((v, i) => checkedItems[i] && v.cartQuantity > 0);
      const p = productsInCart.filter((_, i) => checkedItems[i] && cartData[i].cartQuantity > 0);
      localStorage.setItem("orderCartItems", JSON.stringify(c));
      localStorage.setItem("orderProducts", JSON.stringify(p));
    }
  }, [checkedItems, quantities]);

  // 장바구니 선택 삭제
  const DeleteCartMutation = useMutation(deleteCheckedCartItems, {
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries("cartproduct");
        queryClient.invalidateQueries("allcartproduct");
      } else {
        setErrorMsg("선택한 상품이 없습니다.");
      }
    },
  });

  // 주문 버튼
  const handleItemsOrder = async (
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
      productsInCart &&
      !productsInCart.filter((_, idx) => checkedItems[idx]).filter((v) => v.productQuantity > 0)
        .length
    ) {
      setErrorMsg("주문 가능한 상품을 선택해 주세요.");
      return;
    }

    // 재고보다 장바구니 수량이 높은 경우 체크
    const promises = cartData?.map(async (cart, idx) => {
      if (checkedItems[idx] && productsInCart) {
        const product = productsInCart[idx];

        if (cart.cartQuantity > product.productQuantity) {
          toast({
            variant: "destructive",
            title: `[${product.productName}] 상품의 재고가 부족합니다.`,
            description: "장바구니 수량을 변경합니다.",
          });
          updateCartMutation.mutate({
            cartId: cart.id,
            newQuantity: product.productQuantity,
            cart,
            product: productsInCart[idx],
          });
          throw new Error(product.productName);
        }
      }
    });
    if (promises) await Promise.all(promises);
    const oid = new Date().getTime();
    if (cartData) await saveItemsToTempStock(String(oid), cartData, checkedItems); // 임시 재고에 상품 저장
    navigate(`/order/${user?.userId}/${oid}`);
  };

  if (!productsInCart) return <div></div>;

  return (
    <>
      <SheetContent className="overflow-scroll animate-slide-in-from-right">
        <SheetHeader>
          <SheetTitle>장바구니</SheetTitle>
          <SheetDescription>장바구니에 담은 상품 목록입니다.</SheetDescription>
        </SheetHeader>
        <Table className="mt-10">
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/12">상품 </TableHead>
              <TableHead className="w-4/12">이름</TableHead>
              <TableHead className="w-2/12">수량</TableHead>
              <TableHead className="text-right 3/12">가격</TableHead>
              <TableHead className="w-1/12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsInCart[0] &&
              cartData?.map((cart, idx) => (
                <CartTableRow
                  key={idx}
                  idx={idx}
                  cart={cart}
                  product={productsInCart[idx]}
                  quantity={quantities ? quantities[idx] : 0}
                  updateCartMutate={updateCartMutation.mutate}
                >
                  <Checkbox
                    id={`chk-${idx}`}
                    checked={checkedItems[idx]}
                    onCheckedChange={() => handleCheckChange(idx)}
                    tabIndex={-1}
                    className="mr-1"
                  />
                </CartTableRow>
              ))}
          </TableBody>
        </Table>
        {/* 선택 상품 총 금액 */}
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-right py-4">
          Total :{" "}
          {cartData?.reduce(
            (a, c, idx) =>
              checkedItems[idx] && productsInCart[idx].productQuantity > 0
                ? a + productsInCart[idx]?.productPrice * c.cartQuantity
                : a + 0,
            0
          )}
          원
        </h4>
        <h4 className="scroll-m-20 text-sm font-semibold tracking-tight text-center pb-5 text-red-400">
          {errorMsg}
        </h4>
        {/* 버튼 */}
        <SheetFooter className="flex items-center focus:outline-none">
          <Button
            variant="outline"
            className="w-1/2 h-12 focus:outline-none"
            onClick={() => DeleteCartMutation.mutate({ cartData, checkedItems })}
            tabIndex={-1}
          >
            선택 상품 삭제하기
          </Button>
          <Button
            className="h-12 w-1/2 mb-2 focus:outline-none"
            tabIndex={-1}
            onClick={handleItemsOrder}
          >
            선택 상품 주문하기
          </Button>
        </SheetFooter>
        <Toaster />
      </SheetContent>
    </>
  );
};

export default CartContainer;
