import { useAuth } from "@/AuthContext";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";

const MyPage = () => {
  const user = useAuth();
  const logOut = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    await signOut(auth);
  };

  return (
    <div>
      <h1>MyPage</h1>

      {user?.isSeller ? <div>판매내역</div> : <div>구매내역</div>}
      <button onClick={logOut}>로그아웃</button>
    </div>
  );
};

export default MyPage;
