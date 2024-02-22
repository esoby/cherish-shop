import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, getDocs, where } from "firebase/firestore";
import { User } from "@/interfaces/User";
import { Loader2 } from "lucide-react";

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

  if (loading)
    return (
      <div className="animate-spin flex w-screen justify-center mt-60">
        <Loader2 size={40} color="#5c5c5c" />
      </div>
    );

  return <AuthContext.Provider value={{ user: currUser, logout }}>{children}</AuthContext.Provider>;
};
