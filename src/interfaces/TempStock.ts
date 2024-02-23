import { Timestamp } from "firebase/firestore";

export interface TempStock {
  id: string;
  orderGroupId: string;
  productId: string;
  tempQuantity: number;
  createdAt: Timestamp;
}
