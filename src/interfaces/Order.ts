import { Timestamp } from "firebase/firestore";

export interface Order {
  id: string;
  orderGroupId: string;
  sellerId: string;
  buyerId: string;
  productId: string;
  productQuantity: number;
  Status: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
