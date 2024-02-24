import { Cart } from "@/interfaces/Cart";
import { TempStock } from "@/interfaces/TempStock";
import {
  deleteStoreData,
  fetchStoreDataByField,
  updateStoreData,
  uploadStoreData,
} from "@/services/firebase/firestore";
import { increment } from "firebase/firestore";

// 상품 재고 변동
export const updateProductQuantity = async (pid: string, num: number) => {
  try {
    await updateStoreData("products", pid, { productQuantity: increment(num) });
  } catch (error) {
    throw error;
  }
};

// 재고 감소 및 임시 재고 데이터 저장
export const saveItemToTempStock = async (oid: string, pid: string) => {
  // 상품 수량 변경
  await updateProductQuantity(pid, -1);
  // 임시 재고에 상품 저장
  await uploadStoreData("tempStock", {
    orderGroupId: oid,
    productId: pid,
    tempQuantity: 1,
  });
};

// 주문 시 상품 재고 변동
export const saveItemsToTempStock = async (
  oid: string,
  cartData: Cart[],
  checkedItems: boolean[]
) => {
  if (cartData && checkedItems) {
    // 체크된 상품만 임시 재고에 추가
    const checkedList = cartData.filter((_, idx) => checkedItems[idx]);

    console.log(checkedList);
    // 상품 수량 변경
    await Promise.all(
      checkedList.map((item) => updateProductQuantity(item.productId, -1 * item.cartQuantity))
    );

    const promises = checkedList.map(async (cart) => {
      // 임시 재고에 상품 정보 저장
      return await saveItemToTempStock(oid, cart.productId);
    });

    if (promises) await Promise.all(promises);
  }
};

// 임시 재고 삭제
export const deleteTempStock = async (oid: string) => {
  try {
    const docs = await fetchStoreDataByField<TempStock>("tempStock", "orderGroupId", oid);
    for (let doc of docs) {
      await deleteStoreData("tempStock", doc.id);
    }
  } catch (e) {}
};

// 재고 복구 및 임시 재고 삭제
export const restoreTempStock = async (oid: string) => {
  try {
    const docs = await fetchStoreDataByField<TempStock>("tempStock", "orderGroupId", oid);
    for (let doc of docs) {
      // 본래 상품 재고에 다시 복구
      await updateProductQuantity(doc.productId, doc.tempQuantity);
      // 임시 재고 데이터 삭제
      await deleteStoreData("tempStock", doc.id);
    }
  } catch (e) {}
};
