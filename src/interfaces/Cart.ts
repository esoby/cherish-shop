import { Timestamp } from "firebase/firestore";

export interface Cart {
  id: string;
  userId: string;
  sellerId: string;
  productId: string;
  productQuantity: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
