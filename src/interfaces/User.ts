import { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  userId: string;
  email: string;
  isSeller: boolean;
  nickname: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
