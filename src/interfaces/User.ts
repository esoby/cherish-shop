import { Timestamp } from "firebase/firestore";

export interface User {
  userId: string;
  email: string;
  isSeller: boolean;
  nickname: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
