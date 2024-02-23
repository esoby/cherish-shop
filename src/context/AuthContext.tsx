import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/services/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, getDocs, where, onSnapshot } from "firebase/firestore";
import { User } from "@/interfaces/User";
import Loading from "@/components/Common/Loading";

interface Props {
  children: ReactNode;
}

interface AuthContextValue {
  user: User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: Props) => {
  const [currUser, setCurrUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrUser(null);
    } catch (error) {
      console.error(error);
    }
  };
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

  useEffect(() => {
    if (currUser) {
      const q = query(collection(db, "users"), where("userId", "==", currUser?.userId));

      const unsubscribe = onSnapshot(q, (snap) => {
        const item = snap.docs[0].data() as User;
        setCurrUser(item);
      });

      return () => unsubscribe();
    }
  }, []);

  if (loading) return <Loading />;

  return <AuthContext.Provider value={{ user: currUser, logout }}>{children}</AuthContext.Provider>;
};
