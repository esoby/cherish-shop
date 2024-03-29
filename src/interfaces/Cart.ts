import { Timestamp } from "firebase/firestore";

export interface Cart {
  id: string;
  userId: string;
  sellerId: string;
  productId: string;
  cartQuantity: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
