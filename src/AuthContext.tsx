import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, getDocs, where } from "firebase/firestore";
import { User } from "@/interfaces/User";

interface Props {
  children: ReactNode;
}

const AuthContext = createContext<User | null>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: Props) => {
  const [currUser, setCurrUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;

        const q = query(collection(db, "users"), where("userId", "==", uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          setCurrUser({
            userId: data.userId,
            email: data.email,
            isSeller: data.isSeller,
            nickname: data.nickname,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return <AuthContext.Provider value={currUser}>{children}</AuthContext.Provider>;
};
