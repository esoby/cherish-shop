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
export const saveItemToTempStock = async (pid: string, oid: string) => {
  try {
    // 상품 수량 변경
    await updateProductQuantity(pid, -1);
    // 임시 재고에 상품 저장
    await uploadStoreData("tempStock", {
      orderGroupId: oid,
      productId: pid,
      tempQuantity: 1,
    });
  } catch (error) {
    console.error(error);
  }
};

// 재고 복구
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
