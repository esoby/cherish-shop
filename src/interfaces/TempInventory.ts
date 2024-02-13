import { Timestamp } from "firebase/firestore";

export interface TempInventory {
  id: string;
  orderGroupId: string;
  productId: string;
  tempQuantity: number;
  timestamp: Timestamp;
}
