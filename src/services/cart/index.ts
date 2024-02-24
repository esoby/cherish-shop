import { Cart } from "@/interfaces/Cart";
import { Product } from "@/interfaces/Product";
import { deleteStoreData, updateStoreData } from "../firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

// 장바구니 수량 변경
export const updateCart = async ({
  cartId,
  newQuantity,
  cart,
  product,
}: {
  cartId: string;
  newQuantity: number;
  cart: Cart;
  product: Product;
}) => {
  if (product && cart) {
    const max = product.productQuantity;
    if (newQuantity > max && newQuantity > cart.cartQuantity) return;
    if (newQuantity <= 0) return;

    await updateStoreData("cart", cartId, {
      cartQuantity: newQuantity,
      updatedAt: serverTimestamp(),
    });
  }
};

// 장바구니 삭제
export const deleteCheckedCartItems = async ({
  cartData,
  checkedItems,
}: {
  cartData: Cart[] | undefined;
  checkedItems: boolean[];
}) => {
  if (cartData) {
    try {
      if (!checkedItems.filter((v) => v).length) return false;
      const checkedItemlst = cartData.filter((_, index) => checkedItems[index]);

      for (const item of checkedItemlst) {
        await deleteStoreData("cart", item.id);
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
};
