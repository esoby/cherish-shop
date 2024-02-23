import { User } from "@/interfaces/User";
import { fetchStoreDataByField } from "../firebase/firestore";

export const fetchSellerData = async (sellerId: string) => {
  const data = await fetchStoreDataByField<User>("users", "userId", sellerId);
  if (data[0]) return data[0];
};
