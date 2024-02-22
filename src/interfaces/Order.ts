import { Timestamp } from "firebase/firestore";

export enum OrderStatus {
  OrderCompleted = "주문 완료",
  ReadyForDelivery = "배송 대기",
  DeliveryStarted = "배송 시작",
  Cancelled = "주문 취소",
  SaleCompleted = "판매 완료",
}

export interface Order {
  id: string;
  orderGroupId: string;
  sellerId: string;
  buyerId: string;
  productId: string;
  productQuantity: number;
  productPrice: number;
  status: OrderStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
